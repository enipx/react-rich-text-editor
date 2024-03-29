import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import path from 'path';
import analyze from 'rollup-plugin-analyzer';
import cleaner from 'rollup-plugin-cleaner';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import { fileURLToPath } from 'url';

const customResolver = resolve({
  extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.sass', '.scss'],
});

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export default [
  {
    input: './src/index.tsx',
    output: [
      {
        file: './dist/commonjs/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: './dist/module/index.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      cleaner({
        targets: ['./dist'],
      }),
      alias({
        entries: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
        customResolver,
      }),
      postcss({
        plugins: [],
        minimize: true,
        // extract: true,
      }),
      resolve(),
      peerDepsExternal(),
      commonjs(),
      esbuild({
        minifyIdentifiers: true,
        minifyWhitespace: true,
        tsconfig: 'tsconfig.json', // default
        // Add extra loaders
        loaders: {
          // Add .json files support
          // require @rollup/plugin-commonjs
          '.json': 'json',
          // Enable JSX in .js files too
          '.js': 'jsx',
        },
      }),
      analyze({
        hideDeps: true,
        limit: 0,
        summaryOnly: true,
      }),
    ],
  },
  {
    input: './src/index.tsx',
    output: [
      {
        file: './dist/typescript/index.d.ts',
        format: 'es',
      },
    ],
    plugins: [
      dts(),
      postcss({
        plugins: [],
        minimize: true,
      }),
    ],
  },
];
