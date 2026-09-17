import service from '@/utils/request'

export const updateConfig = (data: any) => service({ url: '/api/v1/config', method: 'put', data })
export const updateSitemap = (data?: any) => service({ url: '/api/v1/sitemap', method: 'put', data })
export const listConfig = (params: any) => service({ url: '/api/v1/config/list', method: 'get', params })
// 站点配置：路由守卫会 await 它，超时时间收紧，避免后端异常时页面长时间无法切换
export const getSettings = () =>
  service({ url: '/api/v1/settings', method: 'get', timeout: 10000 })
export const getStats = () => service({ url: '/api/v1/stats', method: 'get' })
export const getEnvs = () => service({ url: '/api/v1/envs', method: 'get' })
export const getDevice = () => service({ url: '/api/v1/device', method: 'get' })
export const getWechatPayCert = (params?: any) => service({ url: '/api/v1/wechatpay/cert', method: 'get', params })
export const setSQLMode = (data: any) => service({ url: '/api/v1/sqlmode', method: 'put', data })
// 检测邮箱：用表单里的最新值校验 SMTP 连接，填写测试邮箱时会真实发送一封测试邮件
export const testEmailConfig = (data: any) =>
  service({ url: '/api/v1/config/email-test', method: 'post', data })