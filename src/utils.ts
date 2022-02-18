// deno-lint-ignore-file no-explicit-any
import { crypto } from '../deps.ts'

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

export async function hashBuffer(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('MD5', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex
}

export async function hashFile(file: string): Promise<string> {
  return hashBuffer(await Deno.readFile(file))
}

/**
 * @see https://deno.land/std@0.119.0/fs/exists.ts
 */
export async function exists(filePath: string): Promise<boolean> {
  try {
    await Deno.lstat(filePath)
    return true
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false
    }

    throw err
  }
}

/**
 * @see https://deno.land/std@0.119.0/fs/exists.ts
 */
export function existsSync(filePath: string): boolean {
  try {
    Deno.lstatSync(filePath)
    return true
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false
    }
    throw err
  }
}
