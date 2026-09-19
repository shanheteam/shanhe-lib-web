// 全局 localStorage key 常量：统一管理，避免散落的裸字符串被误改/误删。
// pinia 持久化 store 的 persist.key 必须与此保持一致（默认取 store id，显式声明防止改名后静默失效）。
export const STORAGE_KEYS = {
  // pinia 持久化 store
  USER: 'user',
  SETTING: 'setting',
  CATEGORY: 'category',
  // 采集发布表单记住的发布者 id
  USER_ID: 'user_id',
  // OAuth PKCE 参数（window.open 跨窗口共享，与登录态无关）
  OAUTH_CODE_VERIFIER: 'oauth_code_verifier',
  OAUTH_STATE: 'oauth_state',
} as const

export function getLocal(key: string): string | null {
  return localStorage.getItem(key)
}

export function setLocal(key: string, value: string): void {
  localStorage.setItem(key, value)
}

export function removeLocal(key: string): void {
  localStorage.removeItem(key)
}

/**
 * 清空站点自身的全部持久化数据（登出 / 登录态失效时调用）。
 * 刻意保留 OAuth PKCE 参数：它们是登录流程中的临时数据，
 * 避免登出与 OAuth 弹窗回调并发时把 code_verifier 误清导致回调失败。
 */
export function clearSiteStorage(): void {
  ;(Object.keys(STORAGE_KEYS) as Array<keyof typeof STORAGE_KEYS>).forEach((key) => {
    const value = STORAGE_KEYS[key]
    if (value === STORAGE_KEYS.OAUTH_CODE_VERIFIER || value === STORAGE_KEYS.OAUTH_STATE) return
    localStorage.removeItem(value)
  })
}
