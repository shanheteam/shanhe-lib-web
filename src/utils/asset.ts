/**
 * 资源地址工具。
 *
 * 部署到跨域前端（如 EdgeOne Makers，前端域名 ≠ 后端域名）时，后端返回的
 * 相对资源路径（/uploads/...、/view/... 等）不能按前端域名解析，需要统一拼上
 * VITE_API_BASE_URL 指向的后端域名。本地开发 base 为空时原样返回，走 vite 代理。
 */
const baseUrl = import.meta.env.VITE_API_BASE_URL || ''

export function assetUrl(p: string | undefined | null): string {
  if (!p) return ''
  if (/^(https?:|data:|blob:)/i.test(p)) return p
  return baseUrl.replace(/\/+$/, '') + '/' + String(p).replace(/^\/+/, '')
}