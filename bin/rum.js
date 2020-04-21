const process = require('child_process');
const url  = require('url');
const http = require('http');
const fs = require('fs-extra');
const path = require('path');
const rollup = require('rollup');

let device;
let browser;
let pkg;
let page;

function startServer(){
    const server = new http.Server();
    server.on('request', (req, res) => {
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
        const query = url.parse(req.url, true).query;
        fs.appendFileSync('data.json', JSON.stringify(query, null, '\t'));
    });
    server.listen('10002');
}

async function getConfig() {
    let custom = path.join(__dirname, '../probe.config.js');
    const bundle = await rollup.rollup({
        input: custom
    });
    const res = await bundle.generate({
        format: 'cjs'
    });
    const configObj = eval(res.output[0].code).dev;
    device = configObj.device;
    browser = configObj.browser;
    pkg = configObj.pkg;
    page = configObj.page;
}

async function sleep(time) {
    await new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

function openPage() {
    let cmd = 'adb -s ${device} shell am start -n ${browser} -a android.intent.action.VIEW -d ${page}';
    process.exec(cmd, {env: {device, browser, page}}, () => {
        console.log('open browser done!');
    });
}

function forceStopBrowser() {
    let cmd = 'adb -s {device} shell am force-stop ${pkg}';
    process.exec(cmd, {env: {pkg, device}}, () => {
        console.log('open browser done!');
    });
}

module.exports = async function run(){
    await getConfig();
    startServer();
    await sleep(100);
    forceStopBrowser();
    await sleep(100);
    openPage();
    await sleep(500);
    console.log('done!');
}