/**
 * 上报函数
 */
export function report (url, data) {
    let params = [];
    for(let key in data) {
        params.push(`${key}=${data[key]}`);
    }
    let urlStr = `${url}?${params.join('&')}`;
    if(urlStr.length < 2083) {
        reportByImg(url, data);
    } else if(navigator.sendBeacon) {
        reportBySendBeacon(url, data);
    } else {
        reportByXhr(url, data);
    }
}
function reportByImg(url, data) {
    // let img = document.createElement('img');
    let img = new Image;
    let params = [];
    for(let key in data) {
        params.push(`${key}=${encodeURIComponent(data[key])}`);
    }
    img.onload = () => img = null;
    img.src = `${url}?${params.join('&')}`;
}
function reportByXhr(url, data, headers={}) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, false);
    // 跨域是否带cookie
    xhr.withCredentials = true;
    Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key]);
    });
    xhr.send(JSON.stringify(data));
}
function reportBySendBeacon(url, data) {
    let headers = {
        type: 'application/x-www-form-urlencoded'
    };
    let blob = new Blob([JSON.stringify(data)], headers);
    navigator.sendBeacon(url, blob);
}