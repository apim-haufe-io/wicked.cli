#!/usr/bin/env node

'use strict';

const program = require('commander');
const utils = require('./utils');
const postgres = require('../impl/postgres-impl');

let didAction = false;

program
    .option('--volume <volume>', 'specify where to store the Postgres data; leave empty to not write to host storage.')
    .option('-p, --port <port>', 'specify the port to expose to the localhost', 5432)
    .option('-t, --tag <tag>', 'specify which Postgres docker image tag to use', '11-alpine')
    .option('--no-pull', 'do not attempt to pull the image')
    .action(() => {
        didAction = true;
        postgres.start(program.tag, program.pull, program.port, program.volume, (err) => {
            if (err)
                console.error(err);
        });
    })
    .parse(process.argv);

if (!didAction) {
    program.help();
}
