#!/usr/bin/env node

'use strict';

const program = require('commander');
const utils = require('./utils');
const kickstart = require('../impl/kickstart-impl');
const tags = require('../impl/tags-impl');

let didAction = false;

program
    .option('-n, --new', 'create a new repository')
    .option('-t, --tag <tag>', `wicked Docker tag to use (defaults to ${tags.getCurrentTagSync()})`)
    .option('--no-pull', 'do not attempt to pull image')
    .arguments('<dir>', 'the static config directory')
    .action(function (directory) {
        didAction = true;
        let tag = program.tag;
        if (!tag)
            tag = tags.getCurrentTagSync();
        kickstart.run(tag, program.pull, directory, program.new, (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
    })
    .parse(process.argv);

if (!program.args.length || !didAction) {
    program.help();
}
