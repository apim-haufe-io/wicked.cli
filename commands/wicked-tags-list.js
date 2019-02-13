#!/usr/bin/env node

'use strict';

const program = require('commander');
const tags = require('../impl/tags-impl');

let didAction = false;

program
    .action(() => {
        didAction = true;
        tags.listTags((err) => {
            if (err)
                console.error(err);
        });
    })
    .parse(process.argv);

if (!didAction) {
    program.help();
}
