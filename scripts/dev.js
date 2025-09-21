// 当前文件会打包 packages下的模块，打包出js文件

// node dev.js [要打包的名字] -f [打包的格式]

import minimist from 'minimist'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

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

console.log(__filename, __dirname, entry)
