#!/usr/bin/env node

'use strict';

const program = require('commander');
const utils = require('./utils');
const postgres = require('../impl/postgres-impl');

let didAction = false;

program
    .action(() => {
        didAction = true;
        postgres.stop((err) => {
            if (err)
                console.error(err);
        });
    })
    .parse(process.argv);

if (!didAction) {
    program.help();
}
