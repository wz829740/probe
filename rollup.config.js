import babel from "rollup-plugin-babel";
import resolve from 'rollup-plugin-node-resolve';
import { eslint } from 'rollup-plugin-eslint';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

export default {
    input: 'src/index.js',
    output: {
        file: 'probe.min.js',
        format: 'iife',
        name: 'probe'
    },
    plugins: [
        resolve(),
        commonjs(),
        eslint({
            exclude: 'node_modules/**'
        }),
        uglify(),
        babel({
            exclude: 'node_modules/**'
        })
    ]
};