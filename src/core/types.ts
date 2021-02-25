export enum HookName {
  ON_INITIALIZED = 'onInitialized',
  ON_PROCESS_CHUNK = 'onProcessChunk',
  ON_DOWNLOADED = 'onDownloaded',
}

export type PromiseOrNot<T> = Promise<T> | T
export type Hook<T> = (arg: T) => PromiseOrNot<T>

export type OnInitializedHook = Hook<MugyuContext>
export type OnProcessChunkHook = Hook<ProcessChunkOptions>
export type OnDownloadedHook = Hook<MugyuContext>

export interface Plugin {
  name: string
  onInitialized?: OnInitializedHook
  onProcessChunk?: OnProcessChunkHook
  onDownloaded?: OnDownloadedHook
}

export interface DownloadStatus {
  totalSize: number
  segments: Array<SegmentInfo>
}

export interface SegmentInfo {
  firstByte: number
  lastByte: number
  completedBytes: number
}

export interface MugyuContext {
  url: string
  headers: Headers
  blockSize: number
  downloadStatus: DownloadStatus
}

export interface ProcessChunkOptions {
  chunk: Uint8Array
  currentSegmentInfo: SegmentInfo
  context: MugyuContext
}
