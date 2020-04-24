import config from '../probe.config.js';
import Errors from './errors';
import Perf from './perf';
import {report} from './report';

export default {
    setConfig(sample, page) {
        if (Math.random() > sample) {
            return;
        }
        let isPhone = (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i));
        let clientType = isPhone ? 'mobile' : 'web';
        config.common.page = page;
        config.common.clientType = clientType;
        config.sample = sample;
        let errors = new Errors();
        let perf = new Perf();
        perf.clientType = clientType;
        // perf
        if (config.perf) {
            perf.perfMonitor();
        }
        // err
        if (config.err) {
            window.addEventListener('error', err => errors.watchJsErr(err));
            window.addEventListener('unhandledrejection', err => errors.unhandledRej(err));
        }
        document.addEventListener('unload', () => {
            window.removeEventListener('error', errors.watchJsErr);
            window.removeEventListener('unhandledrejection', errors.unhandledRej);
        });
    },
    mark(name) {
        report({
            name,
            duration: +new Date() - performance.timing.navigationStart(),
            type: 'mark'
        });
    }
};