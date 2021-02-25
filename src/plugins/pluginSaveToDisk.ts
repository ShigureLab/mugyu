import type { DownloadStatus, MugyuContext, Plugin, ProcessChunkOptions } from '../core/types.ts'
import { initialDownloadStatus } from '../core/initialDownloadStatus.ts'
import { jsonDumpSync, jsonLoadSync, makeEmptyFile, writeFileWithOffset } from '../utils.ts'
import { exists } from '../../deps.ts'

export interface PluginSaveToDiskOptions {
  path: string
}

export default function createPluginSaveToDisk({ path }: PluginSaveToDiskOptions): Plugin {
  const statusFilePath = path + '.status.json'
  return {
    name: 'PluginSaveToDisk',

    async onInitialized({ url, headers, downloadStatus, blockSize }: MugyuContext) {
      if ((await Promise.all([exists(path), exists(statusFilePath)])).every((el) => el)) {
        const loadedDownloadStatus = jsonLoadSync(statusFilePath) as DownloadStatus
        Object.assign(downloadStatus, loadedDownloadStatus)
      } else {
        makeEmptyFile(path, downloadStatus.totalSize)
        await initialDownloadStatus(url, headers, blockSize, downloadStatus)
      }
      return { url, headers, downloadStatus, blockSize }
    },

    onProcessChunk({ chunk, currentSegmentInfo, context }: ProcessChunkOptions) {
      writeFileWithOffset(
        path,
        chunk,
        currentSegmentInfo.firstByte + currentSegmentInfo.completedBytes
      )
      currentSegmentInfo.completedBytes += chunk.length
      jsonDumpSync(context.downloadStatus, statusFilePath, 2)
      return { chunk, currentSegmentInfo, context }
    },

    async onDownloaded({ url, headers, downloadStatus, blockSize }: MugyuContext) {
      await Deno.remove(statusFilePath)
      return { url, headers, downloadStatus, blockSize }
    },
  }
}
