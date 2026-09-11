import service from '@/utils/request'

export const createFavorite = (data: any) => service({ url: '/api/v1/favorite', method: 'post', data })
export const deleteFavorite = (params: any) => service({ url: '/api/v1/favorite', method: 'delete', params })
export const getFavorite = (params: any) => service({ url: '/api/v1/favorite', method: 'get', params })
export const listFavorite = (params: any) => service({ url: '/api/v1/favorite/list', method: 'get', params })