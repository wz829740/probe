/* global chrome */
/* global PerformanceObserver */
/**
 * @file
 */
// 性能探针
/**
 * metrics
 */
import ttiPolyfill from 'tti-polyfill';
import metrics from '../metrics';

/**
 * TODO
 * 不止图片资源、ifram\video\字体等,还有gif判断等
 */
export default class Perf {
    constructor() {
        this.progress = [];
        this.resource = [];
        this.hasPaint = false; // observe/first paint是否已经执行
        this.hasOnload = false; // onload是否已经执行
    }

    getFpByObserver(list) {
        list.forEach(({name, startTime, duration}) => {
            let time = startTime + duration;
            if (name === 'first-paint') {
                this.hasPaint = true;
                metrics.perfFp = time;
            }
            if (name === 'first-contentful-paint') {
                metrics.fcp = time;
                if (!this.hasOnload) {
                    // 先执行paint 通常情况
                    metrics.perfFmp = time;
                } else {
                    // 先执行onload 页面资源极少或使用缓存时
                    metrics.perfFp = performance.timing.domLoading - performance.timing.navigationStart;
                    metrics.perfFmp = metrics.perfFp;
                    // onload执行太快，需要重新获取结果
                    this.getResult();
                }
            }
        });
    }

    getImgResource() {
        let rss = performance.getEntriesByType('resource');
        let imgs = rss.filter(item => item.initiatorType = 'img');
        let rects = this.getVisibleRects();
        if (imgs.length === 0) {
            metrics.perfFmp = metrics.perfFp;
            return;
        }
        imgs.forEach(({name, startTime, duration}) => {
            let time = startTime + duration;
            if (rects.includes(name) && time > metrics.perfFmp) {
                metrics.perfFmp = time;
            }
            this.resource.push({
                name,
                duration,
                startTime
            });
        });
    }
    getFpByRaf() {
        let fpt = Date.now() - performance.timing.navigationStart;
        metrics.rafFp = fpt;
        // console.log('raf计算白屏：', fpt);
    }

    // 判断dom元素是否在可视区内
    isEleVisible(element) {
        let elRect = element.getBoundingClientRect();
        let intersect = false;
        intersect = {
            top: Math.max(elRect.top, 0),
            left: Math.max(elRect.left, 0),
            bottom: Math.min(elRect.bottom, (window.innerHeight || document.documentElement.clientHeight)),
            right: Math.min(elRect.right, (window.innerWidth || document.documentElement.clientWidth))};
        if (intersect.bottom <= intersect.top || intersect.right <= intersect.left) {
            intersect = false;
        } else {
            intersect = (intersect.bottom - intersect.top) * (intersect.right - intersect.left);
        }
        return intersect;
    }

    getVisibleRects() {
        const elements = document.getElementsByTagName('*');
        let self = this;
        let re = /url\(.*(http.*)\)/ig;
        let visibleRects = [];
        for (let i = 0; i < elements.length; i++) {
            let el = elements[i];
            let style = window.getComputedStyle(el);
            let area = self.isEleVisible(el);
            if (el.tagName === 'IMG' && area) {
                // 可见图片
                visibleRects.push(el.src);
            }
            if (el.style && el.style['background-image'] && area) {
                let matches = re.exec(style['background-image']);
                if (matches && matches.length > 1) {
                    visibleRects.push(matches[1].replace('"', ''));
                }
            }
            if ((el.tagName === 'IMG' || el.style['background-image']) && area) {
                if (!self.progress.find(item => item.name === el.src)) {
                    self.progress.push({
                        name: el.src,
                        area: area
                    });
                }
            }
            if (el.tagName === 'IFRAME') {
                console.log(el)
            }
        }
        return visibleRects;
    }

    getDCL() {
        metrics.domEnd = Date.now() - performance.timing.navigationStart;
    }

    afterOnLoad() {
        this.hasOnload = true;
        let naviStart = performance.timing.navigationStart;
        metrics.onload = Date.now() - naviStart;
        // 确保firstpaint执行完再输出最终结果
        if (this.hasPaint) {
            this.getResult();
        }
    }

    getResult() {
        this.getTTI().then(() => {
            this.getImgResource();
            this.getSpeedIndex();
            this.getMetrics();
        });
    }

    getMetrics() {
        const perf = performance.timing;
        const naviStart = perf.navigationStart;
        metrics.tcp = perf.connectEnd - perf.connectStart;
        metrics.dns = perf.domainLookupEnd - perf.domainLookupStart;
        metrics.net = perf.responseEnd - perf.requestStart;
        metrics.comEnd = perf.loadEventEnd - naviStart;
        metrics.ftt = perf.domInteractive - naviStart;
        this.formatMetrics(metrics);
    }

    getTTI() {
        return ttiPolyfill.getFirstConsistentlyInteractive().then(tti => {
            metrics.tti = tti;
        });
    }

    // 跟踪输入延迟FID
    getFID() {
        const inputs = document.getElementsByTagName('input');
        [].forEach.call(inputs, function (input) {
            input.addEventListener('click', ev => {
                const lag = performance.now() - ev.timeStamp;
                if (lag > 100) {
                    console.log('输入延迟');
                }
            });
        });
    }

    formatMetrics() {
        for (let item in metrics) {
            metrics[item] = Math.round(metrics[item]);
        }
        console.log(metrics);
        let img = new Image;
        let params = [];
        for(let key in metrics) {
            params.push(`${key}=${encodeURIComponent(metrics[key])}`);
        }
        img.onload = () => img = null;
        img.src = `${"http://localhost:8080/perf"}?${params.join('&')}`;

    }

    getSpeedIndex() {
        let progress = this.progress;
        let resource = this.resource;
        let total = progress.reduce((accu, cur) => accu + cur.area, 0);
        let accumulated = 0;
        for (let j = 0; j < progress.length; j++) {
            accumulated += progress[j].area;
            progress[j].progress = accumulated / total;
        }
        let lastProgress = 0;
        let speedIndex = 0;
        progress.forEach(item => {
            let target = resource.find(re => re.name === item.name);
            if (target) {
                item.startTime = target.startTime || 0;
                item.duration = target.duration || 0;
            }
        });
        if (progress.length) {
            for (let i = 0; i < progress.length; i++) {
                if (lastProgress < 1 && progress[i].duration) {
                    speedIndex += (1 - lastProgress) * progress[i].duration;
                    lastProgress = progress[i].progress;
                }
            }
        } else {
            speedIndex = metrics.perfFp;
        }
        metrics.psi = speedIndex;
    }
    /**
     * TODO
     * 不止图片资源、ifram\video\字体等,还有gif判断等
     */
    // TODO 用户逗留时长
}
