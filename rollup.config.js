// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/main.js',
  format: 'umd',
  moduleName: "Canvas",
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],
  dest: 'dist/main.js',
  // sourceMap: true
};