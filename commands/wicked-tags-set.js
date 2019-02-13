#!/usr/bin/env node

'use strict';

const program = require('commander');
const tags = require('../impl/tags-impl');

let didAction = false;

program
    .option('-f, --force', 'specify this to avoid checking whether a tag is available')
    .arguments('<tag>', 'the tag to set as the current tag')
    .action((tag) => {
        didAction = true;
        tags.setCurrentTag(tag, program.force, (err) => {
            if (err)
                console.error(err);
        });
    })
    .parse(process.argv);

if (!didAction) {
    program.help();
}
