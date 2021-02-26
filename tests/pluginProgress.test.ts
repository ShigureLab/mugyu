import { assertEquals } from '../deps.ts'
import { Mugyu } from '../src/mugyu.ts'
import createPluginProgress from '../src/plugins/pluginProgress.ts'

Deno.test('plugin progress test', async () => {
  const fetcher = new Mugyu({
    url: 'http://localhost:5000',
    blockSize: 64 * 1024 * 1024,
    plugins: [
      createPluginProgress({
        progressBarLength: 50,
      }),
    ],
  })

  await fetcher.prepare()
  await fetcher.download()
})
