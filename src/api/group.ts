import service from '@/utils/request'

export const createGroup = (data: any) => service({ url: '/api/v1/group', method: 'post', data })
export const updateGroup = (data: any) => service({ url: '/api/v1/group', method: 'put', data })
export const deleteGroup = (params: any) => service({ url: '/api/v1/group', method: 'delete', params })
export const getGroup = (params: any) => service({ url: '/api/v1/group', method: 'get', params })
export const listGroup = (params: any) => service({ url: '/api/v1/group/list', method: 'get', params })
export const getGroupPermission = (params: any) => service({ url: '/api/v1/group/permission', method: 'get', params })
export const updateGroupPermission = (data: any) => service({ url: '/api/v1/group/permission', method: 'put', data })