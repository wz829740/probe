/**
 * 上报函数
 */
import config from '../probe.config.js';

export function report(data) {
    let { url, alias, common, isDev, dev } = config;
    let result = {};
    if (isDev) {
        result = Object.assign(data, common, dev);
        url = 'http://localhost:10002';
    } else {
        for (let key in alias) {
            if (data[key]) {
                result[alias[key]] = data[key];
            }
        }
        result = Object.assign(result, common);
    }
    console.log(result);
    reportByImg(url, result);
}

// img标签上报
function reportByImg(url, data) {
    let img = new Image;
    let params = [];
    for (let key in data) {
        params.push(`${key}=${encodeURIComponent(data[key])}`);
    }
    img.src = `${url}?${params.join('&')}`;
}
// xhr上报
function reportByXhr(url, data, headers = {}) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, false);
    // 跨域是否带cookie
    xhr.withCredentials = true;
    Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key]);
    });
    xhr.send(JSON.stringify(data));
}
// sendBeacon上报
function reportBySendBeacon(url, data) {
    let headers = {
        type: 'application/x-www-form-urlencoded'
    };
    let blob = new Blob([JSON.stringify(data)], headers);
    navigator.sendBeacon(url, blob);
}