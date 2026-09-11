import service from '@/utils/request'

export const createReport = (data: any) => service({ url: '/api/v1/report', method: 'post', data })
export const updateReport = (data: any) => service({ url: '/api/v1/report', method: 'put', data })
export const deleteReport = (params: any) => service({ url: '/api/v1/report', method: 'delete', params })
export const listReport = (params: any) => service({ url: '/api/v1/report/list', method: 'get', params })