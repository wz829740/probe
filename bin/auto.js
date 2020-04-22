const process = require('child_process');
const url  = require('url');
const http = require('http');
const fs = require('fs-extra');
const getLocalIp = require('../src/util/getIp');

const port = '10001';
const device = 'S2D0219129002696';
const browser = 'com.baidu.searchbox/com.baidu.searchbox.MainActivity';
const pkg = 'com.baidu.searchbox';
const page = getLocalIp() + `:${port}/test/index.html`;

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

async function run() {
    // startServer();
    forceStopBrowser();
    await sleep(100);
    openPage();
    await sleep(500);
    console.log('done!');
}

run();