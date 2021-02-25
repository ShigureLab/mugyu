import { createHash } from '../deps.ts'

export async function jsonDump(data: any, path: string, indent = 0): Promise<void> {
  await Deno.writeTextFile(path, JSON.stringify(data, null, indent))
}

export function jsonDumpSync(data: any, path: string, indent = 0): void {
  Deno.writeTextFileSync(path, JSON.stringify(data, null, indent))
}

export async function jsonLoad(path: string): Promise<any> {
  return JSON.parse(await Deno.readTextFile(path))
}

export function jsonLoadSync(path: string): any {
  return JSON.parse(Deno.readTextFileSync(path))
}

export function makeEmptyFile(path: string, size: number) {
  return Deno.writeFileSync(path, new Uint8Array(new ArrayBuffer(size)))
}

export function writeFileWithOffset(path: string, data: Uint8Array, offset = 0): void {
  const file = Deno.openSync(path, { write: true })
  Deno.seekSync(file.rid, offset, Deno.SeekMode.Start)
  Deno.writeSync(file.rid, data)
  Deno.close(file.rid)
}

export function print(...args: any[]): void {
  const output = args.map((arg) => arg.toString()).join(' ')
  const { rid } = Deno.stdout
  Deno.writeSync(rid, new TextEncoder().encode(output))
}

export function hashBuffer(data: Uint8Array): string {
  const hash = createHash('md5')
  hash.update(data)
  return hash.toString()
}

export function hashFile(file: string): string {
  return hashBuffer(Deno.readFileSync(file))
}
