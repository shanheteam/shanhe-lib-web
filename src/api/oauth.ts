import service from '@/utils/request'

export const getOauths = (params?: any) => service({ url: '/api/v1/oauth/configs', method: 'get', params })
export const loginOauth = (data: any) => service({ url: '/api/v1/oauth/login', method: 'post', data })
export const passwordLogin = (data: any) => service({ url: '/api/v1/oauth/password-login', method: 'post', data })
export const bindOauth = (data: any) => service({ url: '/api/v1/oauth/bind', method: 'post', data })
