#!/usr/bin/env node

const commander = require('commander');
const packageJson = require('../package.json');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const check = require('./check');
const {exec} = require('child_process');
const program = new commander.Command();

program.command('config').action(() => {
    console.log('init a probe config...');
    let entry = path.join(__dirname, 'probe.config.template.js');
    let output = path.join(process.cwd(), 'probe.config.js');
    fs.copyFileSync(entry, output);
    console.log(chalk.green('done!'));
});

function checkCommand() {
    const checkCmd = new commander.Command('check');
    checkCmd.action(check);
    return checkCmd;
}

function buildCommand() {
    const buildCmd = new commander.Command('build');
    buildCmd.action(() => {
        let isValid = check();
        if (isValid) {
            let targetDir = path.resolve(__dirname, '..');
            let probeName = 'probe.min.js';
            let probe = path.join(targetDir, probeName);
            let outAddr = path.join(process.cwd(), probeName);
            exec('npm run build', {cwd: targetDir}, () => {
                fs.copyFileSync(probe, outAddr);
                console.log(chalk.green('build successfully!'));
            });
        }
    });
    return buildCmd;
}

function testCommand() {
    const testCmd = new commander.Command('test');
    testCmd.action(() => {
        console.log('build probe.js...');
        console.log(chalk.green('Open http://localhost:10001 and check the metrics in console!'));
        let targetDir = path.resolve(__dirname, '..');
        let probeName = 'probe.js';
        let probe = path.join(targetDir, probeName);
        let outAddr = path.join(process.cwd(), probeName);
        exec('npm run test', {cwd: targetDir}, () => {
            fs.copyFileSync(probe, outAddr);
            console.log(chalk.green('build successfully!'));
        });
    });
    return testCmd;
}

program.addCommand(checkCommand());
program.addCommand(buildCommand());
program.addCommand(testCommand());

program.parse(process.argv);

