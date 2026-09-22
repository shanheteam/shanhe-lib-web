import { useUserStore } from '@/store/user'

// user-center（统一认证中心）站点基址，登录/注册页路径与其授权端点一致
const UC_BASE = 'https://user.shanhe.co'

/**
 * 登录入口统一跳转：仅保留 SSO。
 * 已登录直接返回；否则先尝试 SSO 静默建会话（复用 store 的 silentSsoCheck），
 * 仍无登录态再整页跳转 user-center 登录页，登录后回跳并经 SSO 自动登录。
 */
export async function ssoRedirectToUc(opts?: {
  register?: boolean
  redirect?: string
}): Promise<void> {
  const userStore = useUserStore()
  if (userStore.token) return // 已本地登录，无需跳转

  // 尝试 SSO 静默建会话，避免每次未登录访问都强跳
  await userStore.silentSsoCheck()
  if (userStore.token) return

  const path = opts?.register ? 'register' : 'login'
  const redirect = opts?.redirect || window.location.href
  window.location.href = `${UC_BASE}/${path}?redirect=${encodeURIComponent(redirect)}`
}