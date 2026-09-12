import service from '@/utils/request'

export const listUserVip = (params: any) => service({ url: '/api/v1/uservip/list', method: 'get', params })
export const updateUserVip = (data: any) => service({ url: '/api/v1/uservip', method: 'put', data })
export const deleteUserVip = (params: any) => service({ url: '/api/v1/uservip', method: 'delete', params })
