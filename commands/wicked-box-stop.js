#!/usr/bin/env node

'use strict';

const program = require('commander');
const utils = require('./utils');
const box = require('../impl/box-impl');

let didAction = false;

program
    .action(() => {
        didAction = true;
        // console.log('box start!');
        box.stop((err) => {
            if (err)
                console.error(err);
        });
    })
    .parse(process.argv);

if (!didAction) {
    program.help();
}
