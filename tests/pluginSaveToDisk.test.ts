import { assertEquals } from '../deps.ts'
import { Mugyu } from '../src/mugyu.ts'
import createPluginSaveToDisk from '../src/plugins/pluginSaveToDisk.ts'

Deno.test('plugin save to disk test', async () => {
  const fetcher = new Mugyu({
    url: 'http://localhost:5000/serve/test.dmg',
    blockSize: 64 * 1024 * 1024,
    plugins: [
      createPluginSaveToDisk({
        path: 'test.dmg',
      }),
    ],
  })

  await fetcher.prepare()
  await fetcher.download()
})
