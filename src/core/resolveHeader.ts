import { isHeaders } from '../shared.ts'

export const fakeUAHeaders = new Headers({
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
})

function headersToObject(headers: Headers): Record<string, string> {
  const obj = new Object(null) as Record<string, string>
  for (const [key, value] of headers.entries()) {
    obj[key] = value
  }
  return obj
}

export function assignHeaders(...headers: Array<Headers | Record<string, string>>): Headers {
  return new Headers(
    headers.reduce((prev, curr) => {
      if (isHeaders(prev)) {
        prev = headersToObject(prev)
      }
      if (isHeaders(curr)) {
        curr = headersToObject(curr)
      }
      return { ...prev, ...curr }
    })
  )
}
