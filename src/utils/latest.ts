/**
 * 并发请求序号守卫：列表页在翻页、切 tab、改筛选条件时会连续发起多次请求，
 * 网络抖动下"先发后到"的响应会覆盖最新数据（页码与内容不一致）。
 * 用法：请求前 start() 取序号，响应回来先 isLatest() 判断，过期响应直接丢弃。
 */
export function createLatestGuard() {
  let seq = 0
  return {
    /** 开始一次请求，返回本次请求的序号 */
    start(): number {
      return ++seq
    },
    /** 该序号是否仍是最新一次请求 */
    isLatest(token: number): boolean {
      return token === seq
    },
  }
}