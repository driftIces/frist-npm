#!/usr/bin/env node
const fs = require("fs")
const path = require("path")
const shell = require('shelljs')
const utils = require(path.resolve(__dirname, './src/utils'))

// 运行项目路径读取, 这里需要注意当安装依赖时, 当前路径为xxx/node_module/xxx, 所以需要回退两层
const PRESET_PATH = path.resolve(__dirname, '../../')
const PACKAGE_PATH = path.resolve(PRESET_PATH, './package.json')

// 当前运行环境变量与运行命令, getRunPresetExec是我封装的方法, 可以获取当前对应的运行命令
// 例如 development|mp-weixin 则对应 -> npx cross-env NODE_ENV=development UNI_PLATFORM=mp-weixin vue-cli-service uni-build --watch --color=always
const NODE_ENV = process.env.NODE_ENV
const UNI_PLATFORM = process.env.UNI_PLATFORM
const EXEC_CODE = utils.getRunPresetExec(NODE_ENV, UNI_PLATFORM)

// 微信项目源码路径, 这里对于项目中的小程序源码路径
const EXEC_CODE_TYPE = NODE_ENV === 'development' ? 'dev' : 'build'
const WEIXIN_PRESET_PATH = path.resolve(PRESET_PATH, `dist/${EXEC_CODE_TYPE}/mp-weixin`)

// 获取开发者工具目录(pageage.json)
const PACKAGE_CONFIG = JSON.parse(fs.readFileSync(PACKAGE_PATH).toString())
const DEVTOOLS_CONFIG = PACKAGE_CONFIG.devtoolsConfig || {}
const WEIXIN_DEVTOOLS_PATH = DEVTOOLS_CONFIG.weixin

// 如果调用环境是微信
if (UNI_PLATFORM === 'mp-weixin') {
  // 先递归写入, 防止无内容导致调试工具报错
  // 这里需要注意, 不能直接写入文件, 需要先创建好完整的目录
  // 不然会直接报错, 这里的mkdirsSync是我封装的递归创建目录的方法
  utils.mkdirsSync(WEIXIN_PRESET_PATH)
  const writeFileStr = JSON.stringify({ appid: 'touristappid', projectname: 'open-devtools' }, null, "\t")
  fs.writeFileSync(path.resolve(WEIXIN_PRESET_PATH, './project.config.json'), writeFileStr, { flag: 'w' })
  // 打开小程序项目
  const openDevToolsShell = `cli open --project ${WEIXIN_PRESET_PATH} --color=always`
  shell.cd(WEIXIN_DEVTOOLS_PATH)
  // 打开完毕后, 运行编译工具
  shell.exec(openDevToolsShell, () => {
    shell.cd(PRESET_PATH)
    shell.exec(EXEC_CODE)
  })
  // 返回当前条件, 阻止代码运行
  return false;
}

// 如上方代码没有执行, 则直接执行运行项目命令
shell.cd(PRESET_PATH)
shell.exec(EXEC_CODE)