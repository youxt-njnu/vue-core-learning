// 当前文件会打包 packages下的模块，打包出js文件

// node dev.js [要打包的名字] -f [打包的格式]

import minimist from 'minimist'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import esbuild from 'esbuild'

// node中的命令行参数通过process.argv 拿到 也就是[node, dev.js, [package name], -f, [pack format]]
const args = minimist(process.argv.slice(2))
const target = args._[0] || 'reactivity'
const format = args.f || 'esm'

// node中esm模块，没有__dirname和require，需要进行兼容性处理
const __filename = fileURLToPath(import.meta.url) // 获取文件绝对路径 E:\SourceCodeLearning\vue\vue3-lesson\scripts\dev.js
const __dirname = dirname(__filename) // 目录路径 E:\SourceCodeLearning\vue\vue3-lesson\scripts
const require = createRequire(import.meta.url)

// 入口文件，根据命令行给的路径进行解析
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`) // E:\SourceCodeLearning\vue\vue3-lesson\scripts
const pkg = require(`../packages/${target}/package.json`)

// esbuild主要是开发环境用的，生产环境一般用rollup，vite
esbuild
  .context({
    entryPoints: [entry], // 入口文件
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`), // 输出文件
    bundle: true, // reactivity --> shared 会打包在一个文件
    platform: 'browser', // 打包后运行在浏览器环境
    sourcemap: true, // 生成sourcemap文件，方便调试
    format, // esm / cjs / iife
    globalName: pkg.buildOptions?.name, // iife格式需要一个全局变量
  })
  .then((ctx) => {
    console.log('watch mode')
    return ctx.watch() // 监听入口文件的变化，持续进行打包
  })
