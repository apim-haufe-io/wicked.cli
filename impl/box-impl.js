'use strict';

const Docker = require('dockerode');
const docker = new Docker();
const path = require('path');

const postgres = require('./postgres-impl');
const implUtils = require('./impl-utils');

const box = {};

const BOX_CONTAINER_NAME = 'wicked-box';
const BOX_IMAGE_NAME = 'haufelexware/wicked.box';

box.start = async (tag, pull, dir, nodeEnv, uiPort, apiPort, gatewayPort, adminPort, logLevel, dockerHost, callback) => {
    const currentDir = process.cwd();
    let configDir = dir;
    if (!path.isAbsolute(configDir))
        configDir = path.resolve(path.join(currentDir, dir));

    const pgContainer = await postgres.getPgContainer();
    if (!pgContainer) {
        console.error('*** Postgres is not running, cannot start "wicked-in-a-box".');
        console.error('*** Start a Postgres instance using "wicked box postgres start".');
        process.exit(1);
    }
    const pgPort = pgContainer.Ports[0].PublicPort;
    console.log(`Will use Postgres on port ${pgPort}.`);
    const imageName = `haufelexware/wicked.box:${tag}`;
    const createOptions = {
        name: BOX_CONTAINER_NAME,
        Image: imageName,
        Tty: false,
        ExposedPorts: {}, // Filled below, inline notation not possible
        Env: [
            `LOG_LEVEL=${logLevel}`,
            `NODE_ENV=${nodeEnv}`,
            'KONG_PG_USER=kong',
            'KONG_PG_PASSWORD=kong',
            `KONG_PG_HOST=${dockerHost}`,
            `DOCKER_HOST=${dockerHost}`,
            `PORTAL_NETWORK_APIHOST=localhost:${gatewayPort}`,
            `PORTAL_NETWORK_PORTALHOST=localhost:${uiPort}`
        ],
        HostConfig: {
            PortBindings: {
                '3000/tcp': [{ 'HostPort': uiPort.toString() }],
                '8000/tcp': [{ 'HostPort': gatewayPort.toString() }]
            },
            AutoRemove: true,
            Binds: [
                `${configDir}:/var/portal-api`
            ]
        }
    };

    if (adminPort) {
        console.log(`Exposing the Kong Admin API on http://localhost:${adminPort}`);
        createOptions.HostConfig.PortBindings['8001/tcp'] = [{ HostPort: adminPort.toString() }];
    }
    if (apiPort) {
        console.log(`Exposing the wicked API on http://localhost:${apiPort}`);
        createOptions.HostConfig.PortBindings['3001/tcp'] = [{ HostPort: apiPort.toString() }];
    }

    try {
        if (pull) {
            console.log(`Pulling '${imageName}'...`);
            await implUtils.pull(createOptions.Image);
        }
        const boxContainer = await docker.createContainer(createOptions);
        await boxContainer.start();
        console.log('wicked-in-a-box is running. Point your browser to:');
        console.log(`  --> http://localhost:${uiPort}`);
        console.log();
        console.log('You can follow the logs with the following command:');
        console.log(`  docker logs -f ${BOX_CONTAINER_NAME}`);
        console.log();
        console.log('Stop the wicked in a box container with the following command:');
        console.log(`  wicked box stop`);
        return callback(null);
    } catch (err) {
        console.error(err.message);
        console.error('*** Could not start wicked-in-a-box.');
        process.exit(1);
    }
};

box.stop = async (callback) => {
    const boxContainerInfo = await box.getBoxContainer();
    if (!boxContainerInfo) {
        console.log(`Container ${BOX_CONTAINER_NAME} is not running, cannot stop.`);
        process.exit(0);
        return callback(null);
    }
    try {
        const boxContainer = docker.getContainer(boxContainerInfo.Id);
        await boxContainer.stop();
        console.log(`Container ${BOX_CONTAINER_NAME} was stopped.`);
        return callback(null);
    } catch (err) {
        console.error(err.message);
        console.error('*** An error occurred while stopping the container.');
        process.exit(1);
    }
};

box.status = async (callback) => {
    const boxContainerInfo = await box.getBoxContainer();
    if (!boxContainerInfo) {
        console.log(`Container ${BOX_CONTAINER_NAME} is NOT running.`);
        process.exit(1);
    }
    console.log(`Container ${BOX_CONTAINER_NAME} is running.`);
    process.exit(0);
};

box.getBoxContainer = async () => {
    return implUtils.getContainerByName(BOX_CONTAINER_NAME);
};

box.getBoxImageName = () => {
    return BOX_IMAGE_NAME;
};

module.exports = box;
