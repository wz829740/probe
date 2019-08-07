# probe（前端性能和异常探针sdk）

## 用法
### 配置probe.config.js
``` // options说明
    url: '', // 上报地址
    // 其他参数
    common: {
        task: '任务名', // 非必须自定义参数
        app: 'app名', // 非必须自定义参数
        t: new Date().getTime() // 上报时间戳
    },
    // 上报指标字段名映射 key是指标名，value是自定义上报名
    alias: {
        tcp: 'tcp', // tcp耗时
        dns: 'dns', // dns耗时
        timeToFirstRequest: 'net', // network ready 开始发送请求
        timeToFirstByte: 'rd', // ttfb
        firstPaint: 'ht', // 白屏
        firstScreen: 'fs', // 首屏
        domInteractive: 'drt', // dom可交互
        domTime: 'dom', // dom加载时间
        srcTime: 'src', // 资源加载时间
        complete: 'dt', // 完全加载时间
        frontEndTime: 'fe', // 前端耗时
        resolutionWidth: 'w', // 分辨率宽度
        resolutionHeight: 'h'  // 分辨率高度
    }
总结上述关键指标的计算过程如下图：

![图片](https://agroup-bos.cdn.bcebos.com/79a366cd792dd398bfaa463a5f213183d2dfaf25)
### 其他时间的计算
-  事件监听类：
监听onload、DOMContentLoaded等事件获取这些事件发生的时间

- 通过`performance.timing`获取其他时间：
	```
    tcp = connectEnd - navigationStart
    dns = domainLookupEnd - navigationStart
    net = responseEnd - requestStart
    ttfb = responseStart - requestStart
    ```
    
##  关于SPA 
### 重新定义指标
  对于单页应用的性能，业内并没有统一的标准和指标，在首次加载后，就再无法拿到页面的可交互，domLoading等指标。

  此时，我们比较关注的其实是页面跳转间隔所耗的时间，如从列表页跳到详情页后，页面变化所用的时间。所以我们决定只追踪检测这一间隔时间。
  
### 计算方法
   我们会监听hashchange和popstate事件（即页面的跳转，单页应用的页面划分可以自定义传入）此时通过[MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)监听的页面dom的变化，记录每个mutation的时间，该API各浏览器支持程度如下：

   ![图片](http://agroup-bos.cdn.bcebos.com/841f60b4d4f4c412814783abdd22243466d42499)
   
而对于每次的mutation，也需要在mutation稳定后评估其变化的大小程度，给一个评分衡量，到**一定程度**时才可作为首屏时间。

*关于mutation稳定，可以简单粗暴地setTimeout或setInterval，也可以通过监听请求时间大致估算，毕竟是先请求后渲染*

评分可以考虑以下因素：

- 变化的dom在首屏所占大小 area（当然，dom不可见则为0）
- dom的重要程度（比如图片，视频等通常考虑作为此页面的hero element）因此会给一个比较高的权重weight
- 每次mutation的dom增量
- 记录每次mutation时间的长短，注意遇到mutation中首屏有图片等资源，还是以图片的加载时间作为mutation时间，

如果不考虑太复杂的情况，伪代码如下：
```javascript
new MutationObserver(list => {
        for (let mutation of list) {
	        console.log(mutation)
            mutation.mark = performance.now();
            let score = 0;
            let resources = [];
            mutation.addedNodes.forEach(node => {
                self.recurNodes(node, resources)
                let area = self.isEleVisible(node);
                let weight = WEIGHT_MAP[node.nodeName] || 1;
                score += (weight * area);
            });
            self.records.push({
                score,
                extent: mutation.addedNodes.length,
                time: mutation.mark,
                resources
            });
        }
    });
```
mutation信息：

![图片](https://agroup-bos.cdn.bcebos.com/98c8e72916535d872ad29955ed8f7191ff001b7e)

综上计算评分，提取score较高的mutation时间。

注：

- 此过程我们可要深度遍历检测有图片的dom，拿到图片加载时间作为此次mutation的时间，算法复杂度也会被dom的嵌套情况影响
- 对于复杂的请求和超时的dom变化也许还要做特殊处理
- 还需要结合实际项目做很多准确性的测试，然后做适当调整

## 其他：
### 问题和解决

- 当由于其他各种原因如：页面加载过慢，还未得到性能结果、或用户点进来后又立即关闭页面等情况，种种可能导致我们未上报数据，从而造成数据丢失。

	解决：在页面设置一定时长的定时器（暂定2min），若发生以上情况没有上报数据，则在定时器结束后强制上报一次，值为当前时间戳与进入页面的时间差或统计的最长时间（即几乎可以认为此次页面加载失败

	```
	    timer = setTimeout(() => {
	         if (!hasGet) {
	             sendResult();
	             clearTimeout(timer)
	         }
	     }, 120000);
	```


- safari等不支持上述api的浏览器:

	解决：safari内核的浏览器目前不支持PerformanceObserver的observer传paint参数，故无法获取到白屏时间，目前按照听云的数据先暂取domLoading时间。

- 图片加载方式，按照目前的算法，对于顺序压缩的图片（网页看到是逐条加载的）可能会得到较差的性能数据，此时可能无法拿到准确的首屏时间，PJPEG则要好很多，（因此对于首屏线以下的图像，可以采用延迟加载，但对于首屏上的关键资源，使用标准的 img元素来加载速度会快得多。）

	![图片](https://agroup-bos.cdn.bcebos.com/3f44d1b787a7613d7a7c6ea8207241c55dc24297)
![图片](https://agroup-bos.cdn.bcebos.com/23f52d96d3a05aef7e32213171b7e1abbb38c3e9)

	![图片](https://agroup-bos.cdn.bcebos.com/b432e0768e1cf68c256edb7c1e752d6073c4dfe3)
- 其他需要注意的点：

	- 探针在最顶部引入（更好地全面监控），提供可传参数。

	- 图片上报采用1px*1px大小的透明gif图
> 前端监控使用GIF进行上报主要是因为：没有跨域问题；不会阻塞页面加载，影响用户体验；在所有图片中体积最小，相较BMP/PNG，可以节约41%/35%的网络资源。

	
	- 性能数据命名尽可能短
	
	- 为不影响接入的页面，注意探针的错误和异步捕获
	
	- 探针监听了页面的load、DOMContentLoaded、popstate、hashchange等事件以及PerformanceObserver、MutationObserver等多个observer，记得在合适的时机remove或disconnect.

- Tradeoff

	不可否认，我们为了拿到各种性能数据，付出了一定的代价，其中影响比较大的：getBoundingClientRect、observer、定时器、算法消耗等。
## 更多指标：
以上指标较通俗，更多为了兼容原有dp，从用户体验角度， 后期可加入更多以用户感受为中心的性能指标[以用户为中心的性能指标](https://developers.google.com/web/fundamentals/performance/user-centric-performance-metrics?hl=zh-cn) 如：

- 速度感官指标
- 持续可交互时间
- 首次输入延迟等
- [更多指标](https://github.com/csabapalfi/awesome-web-performance-metrics)
