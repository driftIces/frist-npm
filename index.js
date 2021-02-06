#!/usr/bin/env node
// console.log('git-tool') // frist-npm
// console.log(process.argv) // frist-npm ss cd
const program = require('commander');
program.version('1.0.0')
program
 .command('codeLineNum')
 .description('统计git提交代码量')
 .option("--author [author]", "统计指定作者git提交代码量")
 .action(function (options) {
   console.log(options.author)
 })
program.parse(process.argv);