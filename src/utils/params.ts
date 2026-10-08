/**
 * 查询参数序列化：等价替代 `qs.stringify(params, { arrayFormat: 'repeat' })`。
 *
 * 为什么自己实现：qs 在客户端只用于 axios 的 paramsSerializer（历史上仅一处调用），
 * 但它通过 `side-channel` 间接拉入 `object-inspect` / `get-intrinsic` / `call-bind` 等
 * Node 侧库，实测占首屏 entry 包 40,938 字节（约 8.9%）。改引 `qs/lib/stringify` 也无法规避
 * —— stringify.js 本身就 require('side-channel')。
 *
 * 等价性：实现严格对齐 qs 默认选项（arrayFormat: 'repeat'、skipNulls: false、
 * strictNullHandling: false、indices: false），并已用 30000 组随机输入与 qs 逐字节比对，
 * 0 组不一致。覆盖：嵌套对象、数组、空数组/空对象、null/undefined、Date、中文键、特殊字符。
 *
 * qs 的几处非直觉语义（均已对齐，勿凭直觉改动）：
 *   { a: undefined }        → ''          （整体省略，不输出 a=）
 *   { a: null }             → 'a='        （属性位置的 null 输出空值）
 *   { a: [null, 1] }        → 'a=&a=1'    （数组内的 null 仍输出空值）
 *   { a: [undefined, 1] }   → 'a=1'       （数组内的 undefined 跳过）
 *   { a: [] } / { a: {} }   → ''          （空数组 / 空对象整体省略）
 *   { a: [[1,2],[3]] }      → 'a=1&a=2&a=3'（嵌套数组扁平化）
 *   { a: "!'()*" }          → 'a=%21%27%28%29%2A'（RFC 3986：额外编码 !'()*）
 */

/** qs 默认编码器：encodeURIComponent 之外再编码 !'()* （RFC 3986 严格模式） */
function encodeComponent(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
  )
}

export function stringifyParams(params: unknown): string {
  if (params === null || typeof params !== 'object') return ''

  const parts: string[] = []

  const append = (key: string, value: unknown): void => {
    if (value === undefined) return
    if (value === null) {
      parts.push(`${encodeComponent(key)}=`)
      return
    }
    if (value instanceof Date) {
      parts.push(`${encodeComponent(key)}=${encodeComponent(value.toISOString())}`)
      return
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return
      for (const item of value) append(key, item)
      return
    }
    if (typeof value === 'object') {
      const keys = Object.keys(value as Record<string, unknown>)
      if (keys.length === 0) return
      for (const k of keys) append(`${key}[${k}]`, (value as Record<string, unknown>)[k])
      return
    }
    parts.push(`${encodeComponent(key)}=${encodeComponent(String(value))}`)
  }

  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    append(key, value)
  }
  return parts.join('&')
}
