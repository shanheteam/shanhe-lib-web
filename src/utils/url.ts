/**
 * 只允许 http/https 的链接输出，其余（`javascript:`、`data:` 等）返回 undefined，
 * 使 `:href="safeHref(x)"` 不渲染出危险地址。
 *
 * 用途：文章/文档的 `source_url` 由有发文权限的用户提交，后端虽已在写入时净化，
 * 但库里可能仍存在修复前写入的 `javascript:` 历史数据，故前端输出时再兜一层。
 * 调用方模板里配合 `v-if` 使用即可隐藏无效链接。
 */
export function safeHref(raw: unknown): string | undefined {
  const s = String(raw ?? '').trim()
  if (!/^https?:\/\//i.test(s)) return undefined
  return s
}
