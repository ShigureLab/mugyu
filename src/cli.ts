import { Command, resolve } from '../deps.ts'
import { existsSync } from './utils.ts'
import { mugyu } from './mugyu.ts'
import { inferFileName } from './shared.ts'

const program = new Command({
  app_name: 'Mugyu',
  app_description: 'A simple file downloader based on fetch API~',
  app_version: '0.0.2',
})

program
  .command('fetch', 'Multiply x and y options')
  .requiredOption('-i --url', '资源 url')
  .option('-o --filename', '文件名', undefined)
  .option('-d --dir', '存储目录', undefined, './')
  .option('-b --blockSize', '文件块大小', parseBlockSize, '64')
  .option('-w --overwrite', '强制重新下载', undefined, false)
  .action(() => {
    const fileName = program.filename || inferFileName(program.url)
    const filePath = resolve(program.dir, fileName)
    if (existsSync(filePath) && program.overwrite) {
      Deno.removeSync(filePath)
    }
    mugyu({ url: program.url as string, path: filePath, blockSize: program.blockSize })
  })
  .parse(Deno.args)

function parseBlockSize(option: string) {
  return parseInt(option) * 1024 * 1024
}

function parseBoolean(option: string) {
  return !!option
}
