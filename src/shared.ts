export function inferFileName(url: string): string {
  const fileName = url.split('?')[0].split('/').slice(-1)[0]
  return fileName
}

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

export const isHeaders = (val: unknown): val is Headers => val instanceof Headers

export const isAsyncFunction = (val: unknown) =>
  Object.prototype.toString.call(val) === '[object AsyncFunction]'
