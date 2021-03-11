import type { Plugin, ProcessChunkOptions } from '../core/types.ts'
import { print } from '../utils.ts'
import { green, bgWhite, sprintf } from '../../deps.ts'

export interface PluginProgressOptions {
  progressBarLength?: number
  symbols?: Array<string> | string
  fps?: number
  template?: ({
    progressBar,
    progressPercentage,
    speed,
  }: {
    progressBar: string
    progressPercentage: string
    speed: string
  }) => string
}

export default function createPluginProgress({
  progressBarLength,
  symbols = ' ▏▎▍▌▋▊▉█',
  fps = 3,
  template = ({ progressBar, progressPercentage, speed }) =>
    `${progressBar} ${progressPercentage} ${speed}`,
}: PluginProgressOptions): Plugin {
  let lastRecordTime = Date.now()
  let lastCompletedBytes = 0
  let speed = 0
  return {
    name: 'PluginProgress',

    onProcessChunk({ chunk, currentSegmentInfo, context }: ProcessChunkOptions) {
      const completedBytes = context.downloadStatus.segments
        .map((segment) => segment.completedBytes)
        .reduce((prev, curr) => prev + curr)

      if (Date.now() - lastRecordTime > 1000 / fps) {
        speed = ((completedBytes - lastCompletedBytes) / (Date.now() - lastRecordTime)) * 1000
      }

      const progress = completedBytes / context.downloadStatus.totalSize
      const progressBar = bgWhite(green(resolveProgressBar(progress, symbols, progressBarLength)))

      print(
        '\r' +
          template({
            progressBar,
            progressPercentage: (progress * 100).toFixed(2) + '%',
            speed: sizeFormat(speed) + '/s',
          })
      )

      if (Date.now() - lastRecordTime > 1000 / fps) {
        lastRecordTime = Date.now()
        lastCompletedBytes = completedBytes
      }
      return { chunk, currentSegmentInfo, context }
    },
  }
}

function resolveProgressBar(
  progress: number,
  symbols: Array<string> | string,
  progressBarLength = 80
) {
  const num_symbol = symbols.length
  if (progress >= 1) {
    return symbols.slice(-1)[0].repeat(progressBarLength)
  }
  const length = progressBarLength * progress
  const lengthInt = Math.floor(length)
  const lengthFloat = length - lengthInt

  return (
    symbols.slice(-1)[0].repeat(lengthInt) +
    symbols[Math.floor(lengthFloat * (num_symbol - 1))] +
    symbols[0].repeat(progressBarLength - lengthInt - 1)
  )
}

function sizeFormat(size: number, ndigits = 2, baseUnitSize = 2 ** 10) {
  const flag = size < 0 ? '-' : ''
  size = Math.abs(size)
  const unitList =
    baseUnitSize === 2 ** 10
      ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB', 'BiB']
      : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB']
  let index = unitList.length - 1
  while (index >= 0) {
    if (size >= baseUnitSize ** index) {
      break
    }
    index -= 1
  }
  return `${flag}${(size / baseUnitSize ** index).toFixed(ndigits)} ${unitList[index]}`
}
