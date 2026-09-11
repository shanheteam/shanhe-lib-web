import service from '@/utils/request'

export const createPunishment = (data: any) => service({ url: '/api/v1/punishment', method: 'post', data })
export const updatePunishment = (data: any) => service({ url: '/api/v1/punishment', method: 'put', data })
export const getPunishment = (params: any) => service({ url: '/api/v1/punishment', method: 'get', params })
export const listPunishment = (params: any) => service({ url: '/api/v1/punishment/list', method: 'get', params })
export const cancelPunishment = (data: any) => service({ url: '/api/v1/punishment/cancel', method: 'put', data })