import { fakeUAHeaders } from './core/resolveHeader.ts'
import { donothingHook, combineHooks } from './core/resolveHooks.ts'
import { fetchRange } from './fetcher.ts'
import type {
  Plugin,
  DownloadStatus,
  Hook,
  MugyuContext,
  ProcessChunkOptions,
} from './core/types.ts'
import createPluginProgress from './plugins/pluginProgress.ts'
import createPluginSaveToDisk from './plugins/pluginSaveToDisk.ts'

export interface MugyuOptions {
  url: string
  headers?: Headers
  blockSize?: number
  plugins?: Array<Plugin>
}

export class Mugyu {
  private url: string
  private headers: Headers
  private plugins: Array<Plugin>
  private blockSize: number
  public status: DownloadStatus = {
    totalSize: 0,
    segments: [],
  }
  constructor({
    url,
    headers = fakeUAHeaders,
    blockSize = 10 * 1024 * 1024,
    plugins = [],
  }: MugyuOptions) {
    this.url = url
    this.headers = headers
    this.blockSize = blockSize
    this.plugins = plugins
  }

  private get context() {
    return {
      url: this.url,
      headers: this.headers,
      downloadStatus: this.status,
      blockSize: this.blockSize,
    }
  }

  async prepare() {
    const onInitializedHook = combineHooks<MugyuContext>(
      ...this.plugins
        .map((plugin) => plugin.onInitialized)
        .filter((hook): hook is Hook<MugyuContext> => !!hook)
    )
    await onInitializedHook(this.context)
  }

  async download() {
    const processChunkHook = combineHooks<ProcessChunkOptions>(
      ...this.plugins
        .map((plugin) => plugin.onProcessChunk)
        .filter((hook): hook is Hook<ProcessChunkOptions> => !!hook)
    )

    await Promise.all(
      this.status.segments.map((segment) => {
        const processChunk = async (chunk: Uint8Array) => {
          return await processChunkHook({
            chunk,
            currentSegmentInfo: segment,
            context: this.context,
          })
        }
        return fetchRange(
          this.url,
          this.headers,
          [segment.firstByte + segment.completedBytes, segment.lastByte],
          processChunk
        )
      })
    )

    const onDownloadedHook = combineHooks<MugyuContext>(
      ...this.plugins
        .map((plugin) => plugin.onDownloaded)
        .filter((hook): hook is Hook<MugyuContext> => !!hook)
    )
    await onDownloadedHook(this.context)
  }
}

export async function mugyu({
  url,
  path,
  blockSize,
}: {
  url: string
  path: string
  blockSize: number
}) {
  const fetcher = new Mugyu({
    url,
    blockSize,
    plugins: [
      createPluginSaveToDisk({
        path,
      }),
      createPluginProgress({
        progressBarLength: 50,
      }),
    ],
  })

  await fetcher.prepare()
  await fetcher.download()
}
