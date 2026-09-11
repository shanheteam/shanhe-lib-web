import service from '@/utils/request'

export const updateConfig = (data: any) => service({ url: '/api/v1/config', method: 'put', data })
export const updateSitemap = (data?: any) => service({ url: '/api/v1/sitemap', method: 'put', data })
export const listConfig = (params: any) => service({ url: '/api/v1/config/list', method: 'get', params })
export const getSettings = () => service({ url: '/api/v1/settings', method: 'get' })
export const getStats = () => service({ url: '/api/v1/stats', method: 'get' })
export const getEnvs = () => service({ url: '/api/v1/envs', method: 'get' })
export const getDevice = () => service({ url: '/api/v1/device', method: 'get' })
export const setSQLMode = (data: any) => service({ url: '/api/v1/sqlmode', method: 'put', data })
export const getLatestRelease = () => service({ url: '/api/v1/release', method: 'get' })
export const refreshLatestRelease = () => service({ url: '/api/v1/release', method: 'post' })
export const ignoreRelease = (data: any) => service({ url: '/api/v1/release/ignore', method: 'put', data })
export const setReleaseSource = (data: any) => service({ url: '/api/v1/release/source', method: 'put', data })