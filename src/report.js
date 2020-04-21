/**
 * 上报函数
 */
import config from '../probe.config.js';

export function report(data) {
    let { url, alias, common } = config;
    let result = {};
    for (let key in alias) {
        if (data[key]) {
            result[alias[key]] = data[key];
        }
    }
    if (!url) {
        console.log(result);
        return;
    }
    if (result) {
        result = Object.assign(result, common);
    }
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