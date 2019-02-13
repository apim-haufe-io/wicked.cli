'use strict';

const Docker = require('dockerode');
const docker = new Docker();
const axios = require('axios');

const utils = require('../commands/utils');
const settings = require('./settings');

const implUtils = {};

implUtils.getContainerByName = async (name) => {
    const containers = await docker.listContainers();
    for (let i = 0; i < containers.length; ++i) {
        const c = containers[i];
        if (c.Names.find(cn => { return cn.indexOf(name) >= 0; }))
            return c;
    }
    return null;
};

implUtils.pull = async (imageName) => {
    return new Promise(function (resolve, reject) {
        docker.pull(imageName, {}, function (err, stream) {
            if (err)
                return reject(err);
            docker.modem.followProgress(stream, onFinished, onProgress);

            function onFinished(err, output) {
                if (err)
                    return reject(err);
                // console.log(output);
                for (let s of output)
                    console.log(s.status);
                resolve();
            }
            function onProgress(event) {
                // console.log(event);
            }
        });
    });
};

implUtils.checkForLatest = async () => {
    let lastCheck = settings.get('lastCheck');
    if (!lastCheck)
        lastCheck = 0;
    const now = new Date().getTime();
    if (now - lastCheck > 24 * 60 * 60 * 1000) {
        console.error('Checking for a new version of wicked-cli...');
        settings.set('lastCheck', now);
        const versions = await axios('https://registry.npmjs.org/wicked-cli');
        const latestVersion = versions.data['dist-tags'].latest;
        if (latestVersion !== utils.getVersion()) {
            console.error();
            console.error(`There is a new version available: ${latestVersion}`);
            console.error(`You are currently using:          ${utils.getVersion()}`);
            console.error();
            console.error('Update with:');
            console.error('  npm install -g wicked-cli');
            console.error();
        }
    }
    return;
};

module.exports = implUtils;