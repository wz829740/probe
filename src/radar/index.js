import Errors from '../errors';
import {report} from '../report';
import config from '../config';
import Perf from '../perf';
import {getRourcePerf} from '../source';
import metrics from '../metrics';

export default {
    monitor() {
        let errors = new Errors();
        let perf = new Perf();

        /**
         * 页面发生错误
         */
        window.addEventListener('error', event => {
            errors.collect(event);
            console.log(errors.errorBuff);
            // 一次上传10条
            if(errors.errorBuff.length > 10) {
                // report(config.url, {
                //     data: errors.errorBuff.splice(0, 10)
                // });
            }
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
        document.addEventListener('beforeunload', event => {
            // report(config.url, {
            //     data: errors.errorBuff
            // });
            // report(config.url, {
            //     data: getRourcePerf()
            // });
        }, true);
    }
};


