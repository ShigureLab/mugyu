import { Hook } from './types.ts'

// deno-lint-ignore no-explicit-any
export const donothingHook: Hook<any> = (arg?) => arg

export function combineHooks<T>(...hooks: Array<Hook<T>>): Hook<T> {
  if (!hooks.length) {
    return donothingHook
  }
  return hooks.reduce((prev, curr) => {
    return async (arg: T): Promise<T> => {
      return await curr(await prev(arg))
    }
  })
}
