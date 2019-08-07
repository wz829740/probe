import config from '../probe.config';
import Errors from './errors';
import Perf from './perf';

export default {
    setConfig(sample, page) {
        if (Math.random() > sample) {
            return;
        }
        let isPhone = (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i));
        let clientType = isPhone ? 'mobile' : 'web';
        config.common.page = page;
        config.common.client_type = clientType;
        config.sample = sample;
        let errors = new Errors();
        let perf = new Perf();
        perf.clientType = clientType;
        /**
         * 页面发生错误
         */
        window.addEventListener('error', err => errors.watchJsErr(err));
        // perf相关
        perf.perfMonitor(); // 启动性能监听
        window.addEventListener('load', perf.afterOnLoad.bind(perf));
        /**
         * 监听promise被reject但未处理的错误
         */
        window.addEventListener('unhandledrejection', err => errors.unhandledRej(err));
        /**
         * 监听页面卸载
         */
        // window.addEventListener('beforeunload', perf.beforeUnload.bind(perf), true);

        document.addEventListener('unload', event => {
            window.removeEventListener('error');
            window.removeEventListener('load');
            // document.removeEventListener('DOMContentLoaded');
            // window.removeEventListener('unhandledrejection')
        });
    }
}