import service from '@/utils/request'

export const deleteSearchRecord = (params: any) => service({ url: '/api/v1/searchrecord', method: 'delete', params })
export const listSearchRecord = (params: any) => service({ url: '/api/v1/searchrecord/list', method: 'get', params })