import service from '@/utils/request'

export const createBanner = (data: any) => service({ url: '/api/v1/banner', method: 'post', data })
export const updateBanner = (data: any) => service({ url: '/api/v1/banner', method: 'put', data })
export const deleteBanner = (params: any) => service({ url: '/api/v1/banner', method: 'delete', params })
export const getBanner = (params: any) => service({ url: '/api/v1/banner', method: 'get', params })
export const listBanner = (params: any) => service({ url: '/api/v1/banner/list', method: 'get', params })