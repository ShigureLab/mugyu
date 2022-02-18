import { DownloadStatus } from './types.ts'

export async function initialDownloadStatus(
  url: string,
  headers: Headers,
  blockSize: number,
  fileDownloadStatus: DownloadStatus
): Promise<void> {
  headers = new Headers(headers)
  headers.set('Range', 'bytes=0-4')
  try {
    const response: Response = await fetch(url, { method: 'HEAD', headers: headers })
    if (response.status === 206) {
      response.headers.get('Content-Range')?.match(/^bytes 0-4\/(\d+)$/)
      const totalSize = parseInt(RegExp.$1 ?? '0')
      fileDownloadStatus.totalSize = totalSize
      for (let i = 0; i * blockSize < totalSize; i++) {
        fileDownloadStatus.segments.push({
          firstByte: i * blockSize,
          lastByte: (i + 1) * blockSize > totalSize ? totalSize - 1 : (i + 1) * blockSize - 1,
          completedBytes: 0,
        })
      }
    } else if (response.status === 200) {
      const totalSize = parseInt(response.headers.get('Content-Length') ?? '0')
      fileDownloadStatus.totalSize = totalSize
      fileDownloadStatus.segments.push({
        firstByte: 0,
        lastByte: totalSize - 1,
        completedBytes: 0,
      })
    } else {
      const totalSize = 0
      fileDownloadStatus.totalSize = totalSize
      fileDownloadStatus.segments.push({
        firstByte: 0,
        lastByte: 0,
        completedBytes: 0,
      })
    }
    // Close Stream
    await response.arrayBuffer()
  } catch {
    const totalSize = 0
    fileDownloadStatus.totalSize = totalSize
    fileDownloadStatus.segments.push({
      firstByte: 0,
      lastByte: 0,
      completedBytes: 0,
    })
  }
}
