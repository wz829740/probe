import babel from "rollup-plugin-babel";
import resolve from 'rollup-plugin-node-resolve';
import {eslint} from 'rollup-plugin-eslint';
import commonjs from 'rollup-plugin-commonjs';
import {uglify} from 'rollup-plugin-uglify';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/radar.js',
        format: 'es'
    },
    plugins: [
        resolve(),
        commonjs(),
        eslint({
            exclude: 'node_modules/**'
        }),
        // uglify(),
        babel({
            exclude: 'node_modules/**' // 只编译我们的源代码
        })
    ]
};