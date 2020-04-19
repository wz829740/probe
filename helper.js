const fs = require('fs-extra');
const chalk = require('chalk');

let contentBuffer = fs.readFileSync('./probe.config.js');
let contentStr = contentBuffer.toString();
let validAlias;
let aliasIndex = contentStr.indexOf('alias');
if (validAlias === -1) {
    console.log(chalk.red('invalid probe alias config! please check!'));
}
let alias = contentStr.slice(aliasIndex).match(/\{([\s\S]+)\}/)[0].replace(/[\{\}\n]/g, ' ');
let aliasKeys = alias.match(/[\w\d]+(?=\:\s\')/g);
let validPerfs = ['tcp', 'dns', 'timeToFirstRequest', 'timeToFirstByte', 'firstPaint', 'firstScreen', 'domInteractive', 'domTime', 'srcTime', 'complete', 'frontEndTime', 'resolutionWidth', 'resolutionHeight'];
validAlias = Object.values(aliasKeys).every(k => validPerfs.includes(k));
if (!validAlias) {
    console.log(chalk.red('invalid probe alias config! please check!'));
} else {
    console.log(chalk.green('alias config check successfully!'));
}
