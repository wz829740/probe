/**
 *  js运行和资源加载错误 1
 *  请求错误 2
 *  promise未处理异常 3
 */

import { report } from '../report';
import { getResolution } from '../util/utils';
export default class Errors {
    constructor() {
        let { width, height } = getResolution();
        this.w = width;
        this.h = height;
        // 劫持请求错误
        this.watchReqErr();
    }
    watchReqErr() {
        this.proxyFetch();
        this.proxyAjax();
    }
    watchJsErr(event) {
        const srcElement = event.srcElement;
        if (srcElement === window && !/^script error/i.test(event.message)) { // js运行错误,过滤跨域
            let newMsg = event.message;
            if (event.error && event.error.stack) {
                newMsg = this.processStackMsg(event.error);
            }
            if (this.isOBJByType(newMsg, "Event")) {
                newMsg += newMsg.type ?
                    ("--" + newMsg.type + "--" + (newMsg.target ?
                        (newMsg.target.tagName + "::" + newMsg.target.src) : "")) : "";
            }
            report({
                stack: newMsg,
                file: event.filename,
                rn: event.lineno,
                cn: event.colno,
                msg: event.message,
                w: this.w,
                h: this.h,
                type: 1
            });
        } else {
            // 静态资源加载错误
            report({
                path: event.path.reverse(),
                target: event.target,
                timeStamp: event.timeStamp,
                filename: event.srcElement.baseURI,
                src: event.srcElement.src,
                html: event.srcElement.outerHTML,
                type: 1
            });
        }
    }
    proxyAjax() {
        if (!window.XMLHttpRequest) return;
        let xmlhttp = window.XMLHttpRequest;
        let handleAjax = function(event) {
            if (event && event.currentTarget && event.currentTarget.status !== 200) {
                report({
                    url: event.currentTarget.responseURL,
                    code: event.currentTarget.status,
                    res: event.target.response,
                    statusText: event.target.statusText,
                    type: 2
                });
            }
        }
        var originSend = xmlhttp.prototype.send;
        xmlhttp.prototype.send = function() {
            if (this.addEventListener) {
                this.addEventListener('error', handleAjax);
                this.addEventListener('load', handleAjax);
                this.addEventListener('abort', handleAjax);
            } else {
                let originStateChange = this.onreadystatechange;
                this.onreadystatechange = function(event) {
                    if (this.readyState === 4) {
                        handleAjax(event);
                    }
                    originStateChange && originStateChange.apply(this, arguments);
                };
            }
            return originSend.apply(this, arguments);
        };
    }

    unhandledRej(err) {
        if (err) {
            let reason = err.reason;
            report({
                type: 3,
                msg: reason
            });
        }
    }

    proxyFetch() {
        if (!window.fetch) {
            return;
        }
        let originFetch = window.fetch;
        window.fetch = function() {
            return originFetch.apply(this, arguments)
                .then(res => {
                    if (!res.ok) {
                        report({
                            url: res.url,
                            res: JSON.stringify(res.body),
                            code: res.status,
                            statusText: res.statusText,
                            type: 2
                        });
                    }
                    return res;
                })
                .catch(error => {
                    throw error;
                });
        };
    };
    /**
     * 处理错误栈信息
     */
    processStackMsg(error) {
        var stack = error.stack
            .replace(/\n/gi, "")
            .split(/\bat\b/)
            .slice(0, 9)
            .join("@")
            .replace(/\?[^:]+/gi, "");
        var msg = error.toString();
        if (stack.indexOf(msg) < 0) {
            stack = msg + "@" + stack;
        }
        return stack;
    }
    isOBJByType(o, type) {
        return Object.prototype.toString.call(o) === "[object " + (type || "Object") + "]";
    }
}