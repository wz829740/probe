/**
 * 上报函数
 */
import config from '../probe.config';

export function report(data) {
    let { url, alias, common } = config;
    if (!url) {
        console.log(data)
        return;
    }
    for (let key in alias) {
        if (data[key]) {
            data[alias[key]] = data[key];
            delete data[key];
        }
    }
    if (data) {
        data = Object.assign(data, common);
    }
    reportByImg(url, data);
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