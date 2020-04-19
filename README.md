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
```
### 运行
- npm run build
- 将dist目录下生成的probe.js引入到项目html的script标签最顶部
```
<script src="probe.js"></script>
<!-- 启动探测 -->
<script>
    <!-- params: sample、your page name -->
    probe.config(1, 'pb');
</script>
```

### 测试
- npm run dev
