/**
 * @file
 */

export default {
    rafFp: 0, // raf算白屏
    perfFp: 0, // performance算白屏*
    perfFmp: 0, // performance算首屏*
    tcp: 0,
    dns: 0,
    net: 0, // 网络请求时间
    comEnd: 0, // 完全加载时间*
    onload: 0, // onload
    domEnd: 0, // domcompleteloaded
    fcp: 0, // 首次内容绘制
    ftt: 0, // 首次可交互时间*
    tti: 0, // 持续可交互时间,TTI 度量代表页面的初始 JavaScript 加载完成并且主线程处于空闲状态。
    psi: 0 // perceptual speed index 速度感官指标,值越小代表感官性能越好，积分计算，最好小于1000
};
