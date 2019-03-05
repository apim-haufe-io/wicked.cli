#!/usr/bin/env node

'use strict';

const program = require('commander');
const box = require('../impl/box-impl');
const tags = require('../impl/tags-impl');

let didAction = false;

program
    .arguments('<configdir>', 'path to the static configuration')
    .option('-t, --tag <tag>', 'wicked Docker tag to use', tags.getCurrentTagSync())
    .option('-u, --ui-port <ui-port>', 'port to expose the portal UI on', 3000)
    .option('-g, --gateway-port <gateway-port>', 'port to expose Kong on (API Gateway)', 8000)
    .option('-a, --admin-port <admin-port>', 'port to expose Kong\'s Admin port on (defaults to off)')
    .option('-w, --api-port <api-port>', 'port to expose wicked\'s API port on (defaults to off)')
    .option('-e, --node-env <node-env>', 'the NODE_ENV (wicked environment) to use', 'box')
    .option('-l, --log-level <log-level>', 'log level to use in the wicked components (debug, info, warn, error)', 'info')
    .option('--docker-host <docker-host>', 'DNS name or IP address of the docker host', 'host.docker.internal')
    .option('--no-pull', 'do not attempt to pull the image')
    .option('--no-wait', 'do not wait (up 60 seconds) until environment has started')
    .option('--no-open', 'do not open the browser with the portal after it has finished; implied by --no-wait')
    .action((configDir) => {
        didAction = true;
        // console.log('box start!');
        box.start(program.tag, program.pull, configDir, program.nodeEnv, program.uiPort, program.apiPort, program.gatewayPort, program.adminPort, program.logLevel, program.dockerHost, program.wait, program.open, (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            process.exit(0);
        });
    })
    .parse(process.argv);

if (!program.args.length || !didAction) {
    program.help();
}
