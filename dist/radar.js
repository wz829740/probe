class Errors {
  constructor() {
    this.errorBuff = [];
  }

  collect(event) {
    const srcElement = event.srcElement;

    if (srcElement === window) {
      // js运行错误
      let newMsg = event.message;

      if (event.error && event.error.stack) {
        newMsg = this.processStackMsg(event.error);
      }

      if (this.isOBJByType(newMsg, "Event")) {
        newMsg += newMsg.type ? "--" + newMsg.type + "--" + (newMsg.target ? newMsg.target.tagName + "::" + newMsg.target.src : "") : "";
      }

      this.errorBuff.push({
        msg: newMsg,
        target: event.filename,
        rowNum: event.lineno,
        colNum: event.colno,
        _orgMsg: event.message,
        timeStamp: event.timeStamp
      });
    } else {
      // 静态资源加载错误
      this.errorBuff.push({
        path: event.path.reverse(),
        target: event.target,
        timeStamp: event.timeStamp,
        filename: event.srcElement.baseURI,
        src: event.srcElement.src,
        html: event.srcElement.outerHTML
      });
    }
  }
  /**
   * 处理错误栈信息
   */


  processStackMsg(error) {
    var stack = error.stack.replace(/\n/gi, "").split(/\bat\b/).slice(0, 9).join("@").replace(/\?[^:]+/gi, "");
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

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var ttiPolyfill = createCommonjsModule(function (module) {
(function(){var h="undefined"!=typeof window&&window===this?this:"undefined"!=typeof commonjsGlobal&&null!=commonjsGlobal?commonjsGlobal:this,k="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value);};function l(){l=function(){};h.Symbol||(h.Symbol=m);}var n=0;function m(a){return "jscomp_symbol_"+(a||"")+n++}
function p(){l();var a=h.Symbol.iterator;a||(a=h.Symbol.iterator=h.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&k(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return q(this)}});p=function(){};}function q(a){var b=0;return r(function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}})}function r(a){p();a={next:a};a[h.Symbol.iterator]=function(){return this};return a}function t(a){p();var b=a[Symbol.iterator];return b?b.call(a):q(a)}
function u(a){if(!(a instanceof Array)){a=t(a);for(var b,c=[];!(b=a.next()).done;)c.push(b.value);a=c;}return a}var v=0;function w(a,b){var c=XMLHttpRequest.prototype.send,d=v++;XMLHttpRequest.prototype.send=function(f){for(var e=[],g=0;g<arguments.length;++g)e[g-0]=arguments[g];var E=this;a(d);this.addEventListener("readystatechange",function(){4===E.readyState&&b(d);});return c.apply(this,e)};}
function x(a,b){var c=fetch;fetch=function(d){for(var f=[],e=0;e<arguments.length;++e)f[e-0]=arguments[e];return new Promise(function(d,e){var g=v++;a(g);c.apply(null,[].concat(u(f))).then(function(a){b(g);d(a);},function(a){b(a);e(a);});})};}var y="img script iframe link audio video source".split(" ");function z(a,b){a=t(a);for(var c=a.next();!c.done;c=a.next())if(c=c.value,b.includes(c.nodeName.toLowerCase())||z(c.children,b))return !0;return !1}
function A(a){var b=new MutationObserver(function(c){c=t(c);for(var b=c.next();!b.done;b=c.next())b=b.value,"childList"==b.type&&z(b.addedNodes,y)?a(b):"attributes"==b.type&&y.includes(b.target.tagName.toLowerCase())&&a(b);});b.observe(document,{attributes:!0,childList:!0,subtree:!0,attributeFilter:["href","src"]});return b}
function B(a,b){if(2<a.length)return performance.now();var c=[];b=t(b);for(var d=b.next();!d.done;d=b.next())d=d.value,c.push({timestamp:d.start,type:"requestStart"}),c.push({timestamp:d.end,type:"requestEnd"});b=t(a);for(d=b.next();!d.done;d=b.next())c.push({timestamp:d.value,type:"requestStart"});c.sort(function(a,b){return a.timestamp-b.timestamp});a=a.length;for(b=c.length-1;0<=b;b--)switch(d=c[b],d.type){case "requestStart":a--;break;case "requestEnd":a++;if(2<a)return d.timestamp;break;default:throw Error("Internal Error: This should never happen");
}return 0}function C(a){a=a?a:{};this.w=!!a.useMutationObserver;this.u=a.minValue||null;a=window.__tti&&window.__tti.e;var b=window.__tti&&window.__tti.o;this.a=a?a.map(function(a){return {start:a.startTime,end:a.startTime+a.duration}}):[];b&&b.disconnect();this.b=[];this.f=new Map;this.j=null;this.v=-Infinity;this.i=!1;this.h=this.c=this.s=null;w(this.m.bind(this),this.l.bind(this));x(this.m.bind(this),this.l.bind(this));D(this);this.w&&(this.h=A(this.B.bind(this)));}
C.prototype.getFirstConsistentlyInteractive=function(){var a=this;return new Promise(function(b){a.s=b;"complete"==document.readyState?F(a):window.addEventListener("load",function(){F(a);});})};function F(a){a.i=!0;var b=0<a.a.length?a.a[a.a.length-1].end:0,c=B(a.g,a.b);G(a,Math.max(c+5E3,b));}
function G(a,b){!a.i||a.v>b||(clearTimeout(a.j),a.j=setTimeout(function(){var b=performance.timing.navigationStart,d=B(a.g,a.b),b=(window.a&&window.a.A?1E3*window.a.A().C-b:0)||performance.timing.domContentLoadedEventEnd-b;if(a.u)var f=a.u;else performance.timing.domContentLoadedEventEnd?(f=performance.timing,f=f.domContentLoadedEventEnd-f.navigationStart):f=null;var e=performance.now();null===f&&G(a,Math.max(d+5E3,e+1E3));var g=a.a;5E3>e-d?d=null:(d=g.length?g[g.length-1].end:b,d=5E3>e-d?null:Math.max(d,
f));d&&(a.s(d),clearTimeout(a.j),a.i=!1,a.c&&a.c.disconnect(),a.h&&a.h.disconnect());G(a,performance.now()+1E3);},b-performance.now()),a.v=b);}
function D(a){a.c=new PerformanceObserver(function(b){b=t(b.getEntries());for(var c=b.next();!c.done;c=b.next())if(c=c.value,"resource"===c.entryType&&(a.b.push({start:c.fetchStart,end:c.responseEnd}),G(a,B(a.g,a.b)+5E3)),"longtask"===c.entryType){var d=c.startTime+c.duration;a.a.push({start:c.startTime,end:d});G(a,d+5E3);}});a.c.observe({entryTypes:["longtask","resource"]});}C.prototype.m=function(a){this.f.set(a,performance.now());};C.prototype.l=function(a){this.f.delete(a);};
C.prototype.B=function(){G(this,performance.now()+5E3);};h.Object.defineProperties(C.prototype,{g:{configurable:!0,enumerable:!0,get:function(){return [].concat(u(this.f.values()))}}});var H={getFirstConsistentlyInteractive:function(a){a=a?a:{};return "PerformanceLongTaskTiming"in window?(new C(a)).getFirstConsistentlyInteractive():Promise.resolve(null)}};
module.exports?module.exports=H:window.ttiPolyfill=H;})();

});

/**
 * @file
 */
var metrics = {
  rafFp: 0,
  // raf算白屏
  perfFp: 0,
  // performance算白屏*
  perfFmp: 0,
  // performance算首屏*
  tcp: 0,
  dns: 0,
  net: 0,
  // 网络请求时间
  comEnd: 0,
  // 完全加载时间*
  onload: 0,
  // onload
  domEnd: 0,
  // domcompleteloaded
  fcp: 0,
  // 首次内容绘制
  ftt: 0,
  // 首次可交互时间*
  tti: 0,
  // 持续可交互时间,TTI 度量代表页面的初始 JavaScript 加载完成并且主线程处于空闲状态。
  psi: 0 // perceptual speed index 速度感官指标,值越小代表感官性能越好，积分计算，最好小于1000

};

/* global chrome */
/**
 * TODO
 * 不止图片资源、ifram\video\字体等,还有gif判断等
 */

class Perf {
  constructor() {
    this.progress = [];
    this.resource = [];
    this.hasPaint = false; // observe/first paint是否已经执行

    this.hasOnload = false; // onload是否已经执行
  }

  getFpByObserver(list) {
    list.forEach(({
      name,
      startTime,
      duration
    }) => {
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
          metrics.perfFmp = metrics.perfFp; // onload执行太快，需要重新获取结果

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

    imgs.forEach(({
      name,
      startTime,
      duration
    }) => {
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
    metrics.rafFp = fpt; // console.log('raf计算白屏：', fpt);
  } // 判断dom元素是否在可视区内


  isEleVisible(element) {
    let elRect = element.getBoundingClientRect();
    let intersect = false;
    intersect = {
      top: Math.max(elRect.top, 0),
      left: Math.max(elRect.left, 0),
      bottom: Math.min(elRect.bottom, window.innerHeight || document.documentElement.clientHeight),
      right: Math.min(elRect.right, window.innerWidth || document.documentElement.clientWidth)
    };

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
        console.log(el);
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
    metrics.onload = Date.now() - naviStart; // 确保firstpaint执行完再输出最终结果

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
  } // 跟踪输入延迟FID


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
    let img = new Image();
    let params = [];

    for (let key in metrics) {
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

var radar = {
  monitor() {
    let errors = new Errors();
    let perf = new Perf();
    /**
     * 页面发生错误
     */

    window.addEventListener('error', event => {
      errors.collect(event);
      console.log(errors.errorBuff); // 一次上传10条

      if (errors.errorBuff.length > 10) ;
    }, true);
    /*
     * 页面加载完成
     */

    window.addEventListener('load', () => {
      perf.afterOnLoad();
    });
    /**
     * dom加载完成
     */

    document.addEventListener('DOMContentLoaded', perf.getDCL);
    /**
     * 监听performance
     */

    new PerformanceObserver(list => {
      perf.getFpByObserver(list.getEntries());
    }).observe({
      entryTypes: ['paint', 'longtask']
    });
    /**
     * raf
     */

    requestAnimationFrame(function () {
      perf.getFpByRaf();
    });
    /**
     * 监听页面卸载
     */

    document.addEventListener('beforeunload', event => {// report(config.url, {
      //     data: errors.errorBuff
      // });
      // report(config.url, {
      //     data: getRourcePerf()
      // });
    }, true);
  }

};

radar.monitor();
