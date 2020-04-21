var probe = (function () {
    'use strict';

    var config = {
      // 上报地址
      url: '',
      perf: true,
      // 上报perf
      err: true,
      // 上报error
      // 其他参数
      common: {
        // 非必须自定义参数
        task: 'taskname',
        app: 'appname',
        t: new Date().getTime() // 上报时间戳

      },
      // 上报指标字段名映射
      alias: {
        tcp: 'tcp',
        // tcp耗时
        dns: 'xxx',
        // dns耗时
        timeToFirstRequest: 'net',
        // network ready 开始发送请求
        timeToFirstByte: 'rd',
        // ttfb
        firstPaint: 'ht',
        // 白屏
        firstMeaningfulPaint: 'fs',
        // 首屏
        domInteractive: 'drt',
        // dom可交互
        domTime: 'dom',
        // dom加载时间
        srcTime: 'src',
        // 资源加载时间
        complete: 'dt',
        // 完全加载时间
        frontEndTime: 'fe',
        // 前端耗时
        resolutionWidth: 'w',
        // 分辨率
        resolutionHeight: 'h'
      }
    };

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }

    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }

    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }

    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(n);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

      return arr2;
    }

    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    /**
     * 上报函数
     */
    function report(data) {
      var alias = config.alias;
      var result = {};

      for (var key in alias) {
        if (data[key]) {
          result[alias[key]] = data[key];
        }
      }

      {
        console.log(result);
        return;
      }
    } // img标签上报

    /**
     * 判断dom元素是否在可视区内
     */
    function isEleVisible(element) {
      var elRect = element.getBoundingClientRect();
      var intersect = false;
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
    } // 获取首屏元素


    function getVisibleRects() {
      var elements = document.getElementsByTagName('*'); // 避免递归

      var useless = ['META', 'HEAD', 'HTML', 'SCRIPT', 'STYLE'];
      elements = _toConsumableArray(elements).filter(function (_ref) {
        var tagName = _ref.tagName;
        return !useless.includes(tagName);
      });
      var visibleRects = [];

      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var area = isEleVisible(el); // 在可视区域内

        if (area) {
          var style = window.getComputedStyle(el);

          if (el.tagName === 'IMG') {
            visibleRects.push(el.src);
          }

          var imgStr = style && (style['background-image'] || style['background']);

          if (imgStr) {
            var re = /http[^'"\)]+/g;
            var matches = imgStr.match(re);

            if (matches && matches.length > 0) {
              var address = matches[0];
              visibleRects.push(address);
            }
          }

          if (el.tagName === 'IFRAME' && area) {
            visibleRects.push(el.src);
          }
        }
      }

      return visibleRects;
    }
    /**
     * 
     * 分辨率算法：pc直接取宽高，移动端*dpr
     */

    function getResolution(metrics) {
      var screen = window && window.screen;
      var width = screen.width,
          height = screen.height;
      return {
        width: width,
        height: height
      };
    }

    var Errors = /*#__PURE__*/function () {
      function Errors() {
        _classCallCheck(this, Errors);

        var _getResolution = getResolution(),
            width = _getResolution.width,
            height = _getResolution.height;

        this.w = width;
        this.h = height; // 劫持请求错误

        this.watchReqErr();
      }

      _createClass(Errors, [{
        key: "watchReqErr",
        value: function watchReqErr() {
          this.proxyFetch();
          this.proxyAjax();
        }
      }, {
        key: "watchJsErr",
        value: function watchJsErr(event) {
          var srcElement = event.srcElement;

          if (srcElement === window && !/^script error/i.test(event.message)) {
            // js运行错误,过滤跨域
            var newMsg = event.message;

            if (event.error && event.error.stack) {
              newMsg = this.processStackMsg(event.error);
            }

            if (this.isOBJByType(newMsg, "Event")) {
              newMsg += newMsg.type ? "--" + newMsg.type + "--" + (newMsg.target ? newMsg.target.tagName + "::" + newMsg.target.src : "") : "";
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
          }
        }
      }, {
        key: "proxyAjax",
        value: function proxyAjax() {
          if (!window.XMLHttpRequest) return;
          var xmlhttp = window.XMLHttpRequest;

          var handleAjax = function handleAjax(event) {
            if (event && event.currentTarget && event.currentTarget.status !== 200) {
              report({
                url: event.currentTarget.responseURL,
                code: event.currentTarget.status,
                res: event.target.response,
                statusText: event.target.statusText,
                type: 2
              });
            }
          };

          var originSend = xmlhttp.prototype.send;

          xmlhttp.prototype.send = function () {
            if (this.addEventListener) {
              this.addEventListener('error', handleAjax);
              this.addEventListener('load', handleAjax);
              this.addEventListener('abort', handleAjax);
            } else {
              var originStateChange = this.onreadystatechange;

              this.onreadystatechange = function (event) {
                if (this.readyState === 4) {
                  handleAjax(event);
                }

                originStateChange && originStateChange.apply(this, arguments);
              };
            }

            return originSend.apply(this, arguments);
          };
        }
      }, {
        key: "unhandledRej",
        value: function unhandledRej(err) {
          if (err) {
            var reason = err.reason;
            report({
              type: 3,
              msg: reason
            });
          }
        }
      }, {
        key: "proxyFetch",
        value: function proxyFetch() {
          if (!window.fetch) {
            return;
          }

          var originFetch = window.fetch;

          window.fetch = function () {
            return originFetch.apply(this, arguments).then(function (res) {
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
            })["catch"](function (error) {
              throw error;
            });
          };
        }
      }, {
        key: "processStackMsg",

        /**
         * 处理错误栈信息
         */
        value: function processStackMsg(error) {
          var stack = error.stack.replace(/\n/gi, "").split(/\bat\b/).slice(0, 9).join("@").replace(/\?[^:]+/gi, "");
          var msg = error.toString();

          if (stack.indexOf(msg) < 0) {
            stack = msg + "@" + stack;
          }

          return stack;
        }
      }, {
        key: "isOBJByType",
        value: function isOBJByType(o, type) {
          return Object.prototype.toString.call(o) === "[object " + (type || "Object") + "]";
        }
      }]);

      return Errors;
    }();

    var metrics = {
      // rafFp: 0, // raf算白屏
      firstPaint: 0,
      // performance算白屏*
      firstMeaningfulPaint: 0,
      // performance算首屏*
      tcp: 0,
      dns: 0,
      timeToFirstRequest: 0,
      // 网络请求时间
      domInteractive: 0,
      // 首次可交互时间*
      // fcp: 0, // 首次内容绘制
      timeToFirstByte: 0,
      // 后端耗时
      frontEndTime: 0,
      // 前端耗时
      complete: 0,
      // 完全加载时间*
      domTime: 0,
      // DOM解析
      srcTime: 0 // 资源加载
      // ren: 0 // 页面渲染
      // tti: 0, // 持续可交互时间,TTI 度量代表页面的初始 JavaScript 加载完成并且主线程处于空闲状态。
      // psi: 0 // perceptual speed index 速度感官指标,值越小代表感官性能越好，积分计算，最好小于1000

    };

    var Perf = /*#__PURE__*/function () {
      function Perf() {
        _classCallCheck(this, Perf);

        this.done = false; // 性能上报完成

        this.isFull = true; // 指标计算完整

        this.clientType = '';
        this.isSupport = true; // 是否支持计算白屏首屏

        this.deadline = 0; // 等待终点时间
      }

      _createClass(Perf, [{
        key: "perfMonitor",
        value: function perfMonitor() {
          var _this = this;

          var types = ['paint', 'navigation'];
          this.deadline = performance.timing.navigationStart + 60000; // 最长等待1min

          try {
            this.perfObserver = new PerformanceObserver(function (list) {
              var entries = list.getEntries();
              entries.forEach(function (item) {
                var startTime = item.startTime,
                    duration = item.duration,
                    entryType = item.entryType;

                if (item.name === 'first-paint') {
                  metrics.firstPaint = startTime;
                }

                if (item.name === 'first-contentful-paint') {
                  metrics.firstMeaningfulPaing = startTime;
                }

                if (entryType === 'navigation') {
                  !_this.done && _this.getResult();
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
      }, {
        key: "getFirstScreenImg",
        value: function getFirstScreenImg() {
          // iphone上uc等浏览器不支持
          try {
            var rss = performance.getEntriesByType('resource');
            var rects = getVisibleRects();
            rss.forEach(function (_ref) {
              var initiatorType = _ref.initiatorType,
                  responseEnd = _ref.responseEnd,
                  name = _ref.name;

              if (rects.includes(name) && responseEnd > metrics.firstMeaningfulPaint) {
                metrics.firstMeaningfulPaint = responseEnd;
              }
            });
          } catch (e) {
            this.isSupport = false;
            return;
          }
        }
      }, {
        key: "afterOnLoad",
        value: function afterOnLoad() {
          // 可以计算首屏图片时间
          this.getFirstScreenImg();
        }
      }, {
        key: "clearListener",
        value: function clearListener() {
          window.removeEventListener('load', this.afterOnLoad);
        }
      }, {
        key: "disconnect",
        value: function disconnect(observer) {
          // 页面卸载时执行
          try {
            observer && observer.disconnect();
          } catch (error) {}
        }
      }, {
        key: "getResult",
        value: function getResult() {
          this.getMetrics();
          this.disconnect(this.perfObserver);
          this.clearListener();
        }
      }, {
        key: "getMetrics",
        value: function getMetrics() {
          var _performance$timing = performance.timing,
              domComplete = _performance$timing.domComplete,
              connectStart = _performance$timing.connectStart,
              domLoading = _performance$timing.domLoading,
              domainLookupStart = _performance$timing.domainLookupStart,
              responseEnd = _performance$timing.responseEnd,
              requestStart = _performance$timing.requestStart,
              loadEventEnd = _performance$timing.loadEventEnd,
              domInteractive = _performance$timing.domInteractive,
              navigationStart = _performance$timing.navigationStart,
              responseStart = _performance$timing.responseStart,
              domContentLoadedEventEnd = _performance$timing.domContentLoadedEventEnd;

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

          var _getResolution = getResolution(),
              width = _getResolution.width,
              height = _getResolution.height;

          metrics.resolutionWidth = width;
          metrics.resolutionHeight = height;
          this.formatMetrics(metrics);
          this.done = true;
        } // beforeUnload() {
        //     if (!this.done) {
        //         // 未正常上报，1.秒关页面 2.等到一半放弃 上报可能不全的性能数据
        //         if (+new Date() - performance.timing.navigationStart > 1000) {
        //             this.getResult();
        //         }
        //     }
        // }

      }, {
        key: "waitUntilEnd",
        value: function waitUntilEnd() {
          var waiting = +new Date() < this.deadline;

          if (performance.timing.loadEventEnd === 0 || waiting) {
            this.timer = setTimeout(this.waitUntilEnd.bind(this), 300);
          } else {
            clearTimeout(this.timer);

            if (!waiting) {
              !this.done && this.getResult();
            }
          }
        }
      }, {
        key: "formatMetrics",
        value: function formatMetrics() {
          if (metrics.firstPaint === 0 && this.isSupport) {
            // 比如页面无内容时，始终拿不到fp
            metrics.firstPaint = performance.timing.domLoading - performance.timing.navigationStart;
          }

          if (metrics.firstMeaningfulPaint <= metrics.firstPaint) {
            // 首屏白屏时间差不多
            metrics.firstMeaningfulPaint = metrics.firstPaint;
          }

          for (var item in metrics) {
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
      }]);

      return Perf;
    }();

    var index = {
      setConfig: function setConfig(sample, page) {
        if (Math.random() > sample) {
          return;
        }

        var isPhone = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
        var clientType = isPhone ? 'mobile' : 'web';
        config.common.page = page;
        config.common.clientType = clientType;
        config.sample = sample;
        var errors = new Errors();
        var perf = new Perf(); // perf.clientType = clientType;

        {
          perf.perfMonitor();
          window.addEventListener('load', perf.afterOnLoad.bind(perf));
        } // err


        {
          window.addEventListener('error', function (err) {
            return errors.watchJsErr(err);
          });
          window.addEventListener('unhandledrejection', function (err) {
            return errors.unhandledRej(err);
          });
        }
        /**
         * 监听页面卸载
         */
        // window.addEventListener('beforeunload', perf.beforeUnload.bind(perf), true);


        document.addEventListener('unload', function (event) {
          window.removeEventListener('error'); // window.removeEventListener('unhandledrejection')
        });
      }
    };

    return index;

}());
