/**
 * 上报函数
 */
import config from '../probe.config.js';

export function report(data, clientType) {
    let { url, alias, common, isDev } = config;
    let result = {};
    if (isDev && clientType === 'isPhone') {
        result = Object.assign(data, common);
        setTimeout(() => {
            showRenderData(result);
        }, 500);
    } else {
        for (let key in alias) {
            if (data[key]) {
                result[alias[key]] = data[key];
            }
        }
        result = Object.assign(result, common);
        console.log(result);
        reportByImg(url, result);
    }
}


function showRenderData(result){
    let wrap = document.createElement('div');
    let content = '<div style="position: fixed; width: 100vw; height: 300px; bottom: 0; overflow: scroll; color: white; background: #333; padding: 20px">';
    for (let key in result) {
        content += `<div>${key}:${result[key]}</div>`;
    };
    content += '</div>';
    wrap.innerHTML = content;
    document.body.appendChild(wrap);
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