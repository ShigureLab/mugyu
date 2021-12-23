import { assertEquals } from '../deps.ts'
import { mugyu } from '../src/mugyu.ts'
import { hashFile, hashBuffer } from '../src/utils.ts'

Deno.test('End to end test', async () => {
  // TODO: 文件服务器也在这里开
  const filePath = './testFile.bin'
  const downloadToPath = './testFileReDownloaded.bin'
  const testData = Uint8Array.from([0, 3, 56, 4, 4, 1])
  const md5HashHex = await hashBuffer(testData)
  Deno.writeFileSync(filePath, testData)

  await mugyu({
    url: 'http://localhost:5000/testFile.bin',
    path: downloadToPath,
    blockSize: 10 * 1024 * 1024,
  })
  const reDownloadedData = Deno.readFileSync(downloadToPath)
  const downloadedMd5HashHex = await hashFile(downloadToPath)
  assertEquals(downloadedMd5HashHex, md5HashHex)
})
