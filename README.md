# probe（前端性能和异常探针sdk）

## Installation
```
npm install --save-dev fe-probe
```

## Usage
### 1.会在你的项目根目录下生成配置探针指标配置文件，编辑修改各项参数
```
probe config
```
- 配置文件说明

``` // options说明
    url: '', // 上报地址
    // 其他参数
    perf: true, // 上报perf
    err: true, // 上报error
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
        firstMeaningfulPaint: 'fs', // 首屏
        domInteractive: 'drt', // dom可交互
        domTime: 'dom', // dom加载时间
        srcTime: 'src', // 资源加载时间
        loadEventEnd: 'dt', // 完全加载时间
        frontEndTime: 'fe', // 前端耗时
        resolutionWidth: 'w', // 分辨率宽度
        resolutionHeight: 'h'  // 分辨率高度
    }
```

### 2.会在你项目的根目录下生成探针sdk
```
probe build
```
- 将生成的probe.min.js引入到项目html的script标签最顶部
```
<script src="probe.min.js"></script>
<!-- 启动探测 -->
<script>
    <!-- params: sample、your page name -->
    probe.config(1, 'pb');
</script>
```

### 其他

-  ```probe check // 可以对probe.config.js做合法校验```

## 开发
- 在probe.config.js中开启dev
```
git clone https://github.com/janewuwz/probe
npm i
npm run dev // 开发，pc或mobile打开查看上报数据
```

### Browser Support



