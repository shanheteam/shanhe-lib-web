import service from '@/utils/request'

export const getOauths = (params?: any) => service({ url: '/api/v1/oauth/configs', method: 'get', params })
export const loginOauth = (data: any) => service({ url: '/api/v1/oauth/login', method: 'post', data })
export const bindOauth = (data: any) => service({ url: '/api/v1/oauth/bind', method: 'post', data })
// SSO：静默建立 lib 会话（校验 user-center 共享 cookie）与会话探测（user-center 登出后后台登出）
// withCredentials 确保浏览器把 .shanhe.co 共享 cookie 一并带上
export const ssoLogin = () => service({ url: '/api/v1/oauth/sso', method: 'post', withCredentials: true })
export const ssoSession = () => service({ url: '/api/v1/oauth/sso/session', method: 'get', withCredentials: true })
export const ssoLogout = () => service({ url: '/api/v1/oauth/sso/logout', method: 'post', withCredentials: true })
