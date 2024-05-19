import * as path from '@std/path'
import { assertEquals } from '@std/assert'
import { Mugyu } from '../src/mugyu.ts'
import createPluginSaveToDisk from '../src/plugins/pluginSaveToDisk.ts'
import { createRandomFile } from './utils.ts'
import { existsSync, hashFile } from '../src/utils.ts'

Deno.test('plugin save to disk test', async () => {
  const fileName = 'pluginSaveToDisk.origin.test.bin'
  const outName = 'pluginSaveToDisk.output.test.bin'
  const thisFileUrl = import.meta.url
  const fileUrl = path.join(path.dirname(path.dirname(thisFileUrl)), fileName)
  const md5 = await createRandomFile(fileName)

  if (existsSync(outName)) {
    await Deno.remove(outName)
  }

  const fetcher = new Mugyu({
    url: fileUrl,
    blockSize: 64 * 1024 * 1024,
    plugins: [
      createPluginSaveToDisk({
        path: outName,
      }),
    ],
  })

  await fetcher.prepare()
  await fetcher.download()

  const md5Out = await hashFile(outName)
  assertEquals(md5, md5Out)

  if (existsSync(fileName)) {
    await Deno.remove(fileName)
  }
  if (existsSync(outName)) {
    await Deno.remove(outName)
  }
})
