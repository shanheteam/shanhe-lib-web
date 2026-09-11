import service from '@/utils/request'

export const updatePermission = (data: any) => service({ url: '/api/v1/permission', method: 'put', data })
export const getPermission = (params: any) => service({ url: '/api/v1/permission', method: 'get', params })
export const listPermission = (params: any) => service({ url: '/api/v1/permission/list', method: 'get', params })