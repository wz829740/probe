// 性能
/**
 * metrics
 */
import metrics from './metrics';
import { report } from '../report';
import { getVisibleRects, getResolution } from '../utils';

export default class Perf {
    constructor() {
        this.done = false; // 性能上报完成
        this.isFull = true; // 指标计算完整
        this.clientType = '';
        this.isSupport = true; // 是否支持计算白屏首屏
        this.deadline = 0; // 等待终点时间
    }

    perfMonitor() {
        let types = ['paint', 'navigation'];
        this.deadline = performance.timing.navigationStart + 60000; // 最长等待1min
        try {
            this.perfObserver = new PerformanceObserver(list => {
                let entries = list.getEntries();
                entries.forEach(item => {
                    const { startTime, duration, entryType } = item;
                    if (item.name === 'first-paint') {
                        metrics.firstPaint = startTime;
                    }
                    if (item.name === 'first-contentful-paint') {
                        metrics.firstScreen = startTime;
                    }
                    if (entryType === 'navigation') {
                        !this.done && this.getResult();
                    }
                });
            }).observe({
                entryTypes: types
            });
        } catch (e) {
            this.isSupport = false;
            return;
        }
    }
    getFirstScreenImg() {
        // iphone上uc等浏览器不支持
        try {
            let rss = performance.getEntriesByType('resource');
            let rects = getVisibleRects();
            rss.forEach(({ initiatorType, responseEnd, name }) => {
                if (rects.includes(name) && responseEnd > metrics.firstScreen) {
                    metrics.firstScreen = responseEnd;
                }
            });
        } catch (e) {
            this.isSupport = false;
            return;
        }
    }

    afterOnLoad() {
        // 可以计算首屏图片时间
        this.getFirstScreenImg();
    }

    clearListener() {
        window.removeEventListener('load', this.afterOnLoad);
    }

    disconnect(observer) {
        // 页面卸载时执行
        try {
            observer && observer.disconnect();
        } catch (error) {}
    }

    getResult() {
        this.getMetrics();
        this.disconnect(this.perfObserver);
        this.clearListener();
    }

    getMetrics() {
        const { domComplete, connectStart, domLoading, domainLookupStart, responseEnd, requestStart, loadEventEnd, domInteractive, navigationStart, responseStart, domContentLoadedEventEnd } = performance.timing;
        if (loadEventEnd === 0 && +new Date() < this.deadline) {
            // safari等不支持观察navigation触发loadEventEnd，轮询，但最多等待1min
            this.waitUntilEnd();
            return;
        }
        metrics.tcp = connectStart - navigationStart;
        metrics.dns = domainLookupStart - navigationStart;
        metrics.timeToFirstRequest = requestStart - navigationStart;
        metrics.complete = loadEventEnd - navigationStart;
        metrics.domInteractive = domInteractive - navigationStart;
        metrics.timeToFirstByte = responseStart - requestStart; // TTFB 后端耗时
        metrics.frontEndTime = loadEventEnd - responseEnd; // 前端总共耗时
        metrics.domTime = domContentLoadedEventEnd - domLoading; // dom耗时
        metrics.srcTime = domComplete - domInteractive; // 资源耗时
        // metrics.ren = loadEventEnd - responseEnd;
        let {width, height} = getResolution();
        metrics.resolutionWidth = width;
        metrics.resolutionHeight = height;
        this.formatMetrics(metrics);
        this.done = true;
    }


    // beforeUnload() {
    //     if (!this.done) {
    //         // 未正常上报，1.秒关页面 2.等到一半放弃 上报可能不全的性能数据
    //         if (+new Date() - performance.timing.navigationStart > 1000) {
    //             this.getResult();
    //         }
    //     }
    // }

    waitUntilEnd() {
        let waiting = +new Date() < this.deadline;
        if (performance.timing.loadEventEnd === 0 || waiting) {
            this.timer = setTimeout(this.waitUntilEnd.bind(this), 300);
        } else {
            clearTimeout(this.timer);
            if (!waiting) {
                !this.done && this.getResult();
            }
        }
    }

    formatMetrics() {
        if (metrics.firstPaint === 0 && this.isSupport) {
            // 比如页面无内容时，始终拿不到fp
            metrics.firstPaint = performance.timing.domLoading - performance.timing.navigationStart;
        }
        if (metrics.firstScreen <= metrics.firstPaint) {
            // 首屏白屏时间差不多
            metrics.firstScreen = metrics.firstPaint;
        }
        for (let item in metrics) {
            if (item === 'page') {
                continue;
            }
            if (metrics[item] < 0) {
                // 未完成页面加载的情况,所以某些指标缺省
                // this.isFull = false;
                // delete metrics[item];
                return;
            } else {
                metrics[item] = Math.round(metrics[item]);
            }
        }
        if (!this.isFull) {
            // 未完成指标计算
            metrics.isFinish = 0;
        }
        metrics.type = 'perf';
        report(metrics);
    }
}