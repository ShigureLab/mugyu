// deno-lint-ignore-file no-explicit-any

export class StandbyFunction<T extends Array<any>> {
  constructor(private func: (...args: T) => Promise<void>, private args: T) {
    this.call = this.call.bind(this)
  }

  async call() {
    await this.func(...this.args)
  }

  static wrap<U extends Array<any>>(
    func: (...args: U) => Promise<void>,
    ...args: U
  ): StandbyFunction<any> {
    return new StandbyFunction(func, args)
  }
}

/**
 * 防止同时启动的 Promise 过多
 * 用于替代 Promise.all()
 * 比如下面的用例：
 * ``` ts
 * // 批量 fetch url 列表
 * await Promise.all(urls.map((url) => fetch(url)))
 * // 使用一个 pool 维持最大 16 个连接
 * const pool = new PromisePool(urls.map((url) => StandbyFunction.wrap(fetch as any, url)), 16)
 * await pool.run()
 * ```
 */
export class PromisePool<T extends Array<any>> {
  private queue: Array<StandbyFunction<[]>>
  constructor(funcs: StandbyFunction<T>[], private limit = 16) {
    this.wrapFunctionWithLimit = this.wrapFunctionWithLimit.bind(this)
    this.queue = funcs.map((sfunc) => this.wrapFunctionWithLimit(sfunc))
  }

  async run() {
    await Promise.all(this.queue.splice(0, this.limit).map((sfun) => sfun.call()))
  }

  wrapFunctionWithLimit(sfunc: StandbyFunction<T>) {
    return new StandbyFunction<[]>(async () => {
      await sfunc.call()
      await this.queue.shift()?.call()
    }, [])
  }
}
