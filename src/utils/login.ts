// 全局登录弹窗触发：各登录入口（首页侧栏/搜索页/发布页/移动端抽屉等）统一对一个自定义事件
// 派发该常量事件名，GlobalHeader 监听到后打开站内登录弹窗（邮箱登录 + 山河大学账号密码 + 第三方 OAuth）。
// 相比各自 router.push('/login') 跳整页，可保持在当前页弹出登录框。

export const OPEN_LOGIN_EVENT = 'global:open-login'

/** 派发全局登录弹窗打开事件；tab 传 'register' 时弹窗默认选中注册页。 */
export function openLoginDialog(tab?: 'login' | 'register'): void {
  window.dispatchEvent(new CustomEvent(OPEN_LOGIN_EVENT, { detail: { tab } }))
}
