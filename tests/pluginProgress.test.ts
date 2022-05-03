import { path } from '../deps.ts'
import { Mugyu } from '../src/mugyu.ts'
import { createRandomFile } from './utils.ts'
import { existsSync } from '../src/utils.ts'
import createPluginProgress from '../src/plugins/pluginProgress.ts'

Deno.test('plugin progress test', async () => {
  const fileName = 'pluginProgress.origin.test.bin'
  const outName = 'pluginProgress.output.test.bin'
  const thisFileUrl = import.meta.url
  const fileUrl = path.join(path.dirname(path.dirname(thisFileUrl)), fileName)
  await createRandomFile(fileName)

  if (existsSync(outName)) {
    await Deno.remove(outName)
  }

  const fetcher = new Mugyu({
    url: fileUrl,
    blockSize: 64 * 1024 * 1024,
    plugins: [
      createPluginProgress({
        progressBarLength: 50,
      }),
    ],
  })

  await fetcher.prepare()
  await fetcher.download()

  if (existsSync(fileName)) {
    await Deno.remove(fileName)
  }
  if (existsSync(outName)) {
    await Deno.remove(outName)
  }
})
