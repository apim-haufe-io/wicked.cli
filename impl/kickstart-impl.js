'use strict';

const path = require('path');
const implUtils = require('./impl-utils');

const kickstart = {};

const Docker = require('dockerode');

// Default settings
const docker = new Docker();

kickstart.run = async (tag, pull, dir, newFlag, callback) => {
    const currentDir = process.cwd();
    let configDir = dir;
    if (!path.isAbsolute(configDir))
        configDir = path.resolve(path.join(currentDir, dir));

    console.log(`Running Kickstarter '${tag}' on '${configDir}' (mapped to /var/portal-api)...`);

    const createOptions = {
        name: 'wicked-kickstarter',
        Tty: true,
        ExposedPorts: { '3333/tcp': {} },
        HostConfig: {
            PortBindings: { '3333/tcp': [{ 'HostPort': '3333' }] },
            AutoRemove: true,
            Binds: [
                `${configDir}:/var/portal-api`
            ]
        }
    };

    const cmd = [];
    if (newFlag)
        cmd.push('--new');

    const kickstarterImage = `haufelexware/wicked.kickstarter:${tag}-alpine`;
    console.log(`Using image ${kickstarterImage}...`);

    if (pull) {
        console.log(`Pulling '${kickstarterImage}'...`);
        try {
            await implUtils.pull(kickstarterImage);
        } catch (err) {
            console.error(err.message);
            console.error('*** docker pull failed. Are you using the wrong --tag, or do you need to supply a --tag?');
            console.error('*** Call "wicked kickstart --help" for more options.');
            process.exit(1);
        }
    }

    docker.run(kickstarterImage, cmd, process.stdout, createOptions, (err, data, container) => {
        if (err)
            console.error(err);
        console.log(JSON.stringify(data));
    });
};

module.exports = kickstart;
