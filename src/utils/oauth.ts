// OAuth 类型常量：与后端 server/src/modules/oauth/oauth.service.ts 的 OAUTH_TYPE_* 一一对应
export const OAUTH_TYPE_CUSTOM = 6

// 回调路径中的类型名 → oauth_type 数字
// 类型名与后端配置 category（oauthCustom）去掉 oauth 前缀一致，
// 与 admin 配置页提示的回调地址 /oauth/{类型名} 对应
const OAUTH_TYPE_BY_NAME: Record<string, number> = {
  custom: OAUTH_TYPE_CUSTOM,
}

/**
 * 解析回调地址携带的授权类型。
 * 支持 /oauth/{类型名} 路径参数、?type=xxx 查询参数（类型名或数字字符串）。
 * 未识别或缺失时默认自定义类型（原实现所有类型均按 custom 处理，保持向后兼容）。
 */
// 单点登出(SLO)：跳转到 IdP 端会话登出端点时，用来标记“登出返回”回调，供回调页静默回首页
export const SSO_LOGOUT_RETURN_KEY = 'sso_logout_return'

export function resolveOauthType(type?: string | null): number {
  if (!type) return OAUTH_TYPE_CUSTOM
  const t = String(type).trim().toLowerCase()
  if (OAUTH_TYPE_BY_NAME[t]) return OAUTH_TYPE_BY_NAME[t]
  const num = Number(t)
  if (Number.isInteger(num) && num > 0) return num
  return OAUTH_TYPE_CUSTOM
}
