import service from '@/utils/request'

export const createAdvertisement = (data: any) => service({ url: '/api/v1/advertisement', method: 'post', data })
export const updateAdvertisement = (data: any) => service({ url: '/api/v1/advertisement', method: 'put', data })
export const deleteAdvertisement = (params: any) => service({ url: '/api/v1/advertisement', method: 'delete', params })
export const getAdvertisement = (params: any) => service({ url: '/api/v1/advertisement', method: 'get', params })
export const getAdvertisementByPosition = (params: any) => service({ url: '/api/v1/advertisement/position', method: 'get', params })
export const listAdvertisement = (params: any) => service({ url: '/api/v1/advertisement/list', method: 'get', params })