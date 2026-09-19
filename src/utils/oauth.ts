// OAuth 类型常量：与后端 server/src/modules/oauth/oauth.service.ts 的 OAUTH_TYPE_* 一一对应
export const OAUTH_TYPE_QQ = 1
export const OAUTH_TYPE_WECHAT = 2
export const OAUTH_TYPE_GITEE = 3
export const OAUTH_TYPE_GITHUB = 4
export const OAUTH_TYPE_WECHAT_MINI = 5
export const OAUTH_TYPE_CUSTOM = 6
export const OAUTH_TYPE_GOOGLE = 7
export const OAUTH_TYPE_OFFICIAL_ACCOUNT = 8

// 回调路径中的类型名 → oauth_type 数字
// 类型名与后端配置 category（oauthWechat/oauthQQ/...）去掉 oauth 前缀一致，
// 与 admin 配置页提示的回调地址 /oauth/{类型名} 对应
const OAUTH_TYPE_BY_NAME: Record<string, number> = {
  qq: OAUTH_TYPE_QQ,
  wechat: OAUTH_TYPE_WECHAT,
  gitee: OAUTH_TYPE_GITEE,
  github: OAUTH_TYPE_GITHUB,
  wechatmini: OAUTH_TYPE_WECHAT_MINI,
  custom: OAUTH_TYPE_CUSTOM,
  google: OAUTH_TYPE_GOOGLE,
  officialaccount: OAUTH_TYPE_OFFICIAL_ACCOUNT,
}

/**
 * 解析回调地址携带的授权类型。
 * 支持 /oauth/{类型名} 路径参数、?type=xxx 查询参数（类型名或数字字符串）。
 * 未识别或缺失时默认自定义类型（原实现所有类型均按 custom 处理，保持向后兼容）。
 */
export function resolveOauthType(type?: string | null): number {
  if (!type) return OAUTH_TYPE_CUSTOM
  const t = String(type).trim().toLowerCase()
  if (OAUTH_TYPE_BY_NAME[t]) return OAUTH_TYPE_BY_NAME[t]
  const num = Number(t)
  if (Number.isInteger(num) && num > 0) return num
  return OAUTH_TYPE_CUSTOM
}
