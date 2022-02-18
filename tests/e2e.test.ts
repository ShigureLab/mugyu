import { assertEquals, path } from '../deps.ts'
import { mugyu } from '../src/mugyu.ts'
import { existsSync, hashFile } from '../src/utils.ts'
import { createRandomFile } from './utils.ts'

Deno.test('End to end test', async () => {
  const fileName = 'e2e.origin.test.bin'
  const outName = 'e2e.output.test.bin'
  const thisFileUrl = import.meta.url
  const fileUrl = path.join(path.dirname(path.dirname(thisFileUrl)), fileName)
  const md5 = await createRandomFile(fileName)

  if (existsSync(outName)) {
    await Deno.remove(outName)
  }

  await mugyu({
    url: fileUrl,
    path: outName,
    blockSize: 10 * 1024 * 1024,
  })
  const md5Out = await hashFile(outName)
  assertEquals(md5, md5Out)

  if (existsSync(fileName)) {
    await Deno.remove(fileName)
  }
  if (existsSync(outName)) {
    await Deno.remove(outName)
  }
})
