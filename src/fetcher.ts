export async function fetchRange(
  url: string,
  headers: Headers,
  range: [number, number],
  processChunk: (chunk: Uint8Array) => void
) {
  headers = new Headers(headers)
  headers.set('Range', `bytes=${range[0]}-${range[1]}`)
  const response: Response = await fetch(url, {
    method: 'GET',
    headers: headers,
  })
  if (response.body) {
    for await (const chunk of streamGenerator(response.body)) {
      if (chunk) {
        processChunk(chunk)
      }
    }
  }
}

async function* streamGenerator(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader()
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }
      yield value
    }
  } finally {
    reader.releaseLock()
  }
}
