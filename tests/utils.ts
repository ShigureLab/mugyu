import { hashFile, hashBuffer, existsSync } from '../src/utils.ts'

export async function createRandomFile(filePath: string): Promise<string> {
  if (existsSync(filePath)) {
    return await hashFile(filePath)
  } else {
    const testData = Uint8Array.from([0, 3, 56, 4, 4, 1])
    const md5HashHex = await hashBuffer(testData)
    Deno.writeFileSync(filePath, testData)
    return md5HashHex
  }
}
