import service from '@/utils/request'

export const createNavigation = (data: any) => service({ url: '/api/v1/navigation', method: 'post', data })
export const updateNavigation = (data: any) => service({ url: '/api/v1/navigation', method: 'put', data })
export const deleteNavigation = (params: any) => service({ url: '/api/v1/navigation', method: 'delete', params })
export const getNavigation = (params: any) => service({ url: '/api/v1/navigation', method: 'get', params })
export const listNavigation = (params: any) => service({ url: '/api/v1/navigation/list', method: 'get', params })