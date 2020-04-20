const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');

module.exports = function check(){
    let isValid = false;
    console.log('validating your probe config...');

    const config = path.join(process.cwd(), 'probe.config.js');
    
    let contentBuffer = fs.readFileSync(config);
    let contentStr = contentBuffer.toString();
    let validAlias;
    let aliasIndex = contentStr.indexOf('alias');
    if (validAlias === -1) {
        console.log(chalk.red('no alias been set'));
    }
    let alias = contentStr.slice(aliasIndex).match(/\{([\s\S]+)\}/)[0].replace(/[\{\}\n]/g, ' ');
    let aliasKeys = alias.match(/[\w\d]+(?=\:\s\')/g);

    let validPerfs = ['tcp', 'dns', 'timeToFirstRequest', 'timeToFirstByte', 'firstPaint', 'firstMeaningfulPaint', 'domInteractive', 'domTime', 'srcTime', 'complete', 'frontEndTime', 'resolutionWidth', 'resolutionHeight'];
    validAlias = Object.values(aliasKeys).every(k => {
        return validPerfs.includes(k);
    });

    if (!validAlias) {
        console.log(chalk.red('invalid probe alias config! please check!'));
    } else {
        isValid = true;
        console.log(chalk.green('alias config check successfully!'));
    }
    return isValid;
}
