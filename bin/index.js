#!/usr/bin/env node

const commander = require('commander');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const {exec} = require('child_process');
const program = new commander.Command();
const rollup = require('rollup');
const rum = require('./rum');

const probeConfig = 'probe.config.js';
const probeMin = 'probe.min.js';

program.command('config').action(() => {
    console.log('init a probe config...');
    let entry = path.join(__dirname, 'probe.config.template.js');
    let custom = path.join(process.cwd(), probeConfig);
    fs.copyFileSync(entry, custom);
    console.log(chalk.green('done!'));
});

async function validConfig() {
    const config = await getConfig();
    if (!config.alias) {
        console.log(chalk.red('no alias been set'));
        return;
    }
    let validPerfs = ['tcp', 'dns', 'timeToFirstRequest', 'timeToFirstByte', 'firstPaint', 'firstMeaningfulPaint', 'domInteractive', 'domTime', 'srcTime', 'loadEventEnd', 'frontEndTime', 'resolutionWidth', 'resolutionHeight'];
    let validAlias = Object.keys(config.alias).every(k => {
        return validPerfs.includes(k);
    });
    if (!validAlias) {
        console.log(chalk.red('invalid probe alias config! please check!'));
        return;
    } else {
        console.log(chalk.green('alias config check successfully!'));
    }
}

async function getConfig() {
    let custom = path.join(process.cwd(), probeConfig);
    const bundle = await rollup.rollup({
        input: custom
    });
    const res = await bundle.generate({
        format: 'cjs'
    });
    const configObj = eval(res.output[0].code);
    return configObj;
}

function reflect() {
    let targetDir = path.resolve(__dirname, '..');
    let reflect = path.join(targetDir, probeConfig);
    let custom = path.join(process.cwd(), probeConfig);
    // 在本项目运行
    if (custom !== reflect) {
        fs.copyFileSync(custom, reflect);
    }
    let res = {targetDir};
    res.input = path.join(targetDir, probeMin);
    res.output = path.join(process.cwd(), probeMin);
    return res;
}

function checkCommand() {
    const checkCmd = new commander.Command('check');
    checkCmd.action(validConfig);
    return checkCmd;
}

function buildCommand() {
    const buildCmd = new commander.Command('build');
    buildCmd.action(async () => {
        await validConfig();
        const {input, output, targetDir} = reflect();
        exec('npm run build', {cwd: targetDir}, () => {
            if (input !== output) {
                fs.copyFileSync(input, output);
            }
            console.log(chalk.green('build successfully!'));
        });
    });
    return buildCmd;
}

program.addCommand(checkCommand());
program.addCommand(buildCommand());

program.parse(process.argv);

