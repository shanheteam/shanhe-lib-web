import service from '@/utils/request'

export const createSpiderUrl = (data: any) => service({ url: '/api/v1/spiderurl', method: 'post', data })
export const updateSpiderUrl = (data: any) => service({ url: '/api/v1/spiderurl', method: 'put', data })
export const deleteSpiderUrl = (params: any) => service({ url: '/api/v1/spiderurl', method: 'delete', params })
export const getSpiderUrl = (params: any) => service({ url: '/api/v1/spiderurl', method: 'get', params })
export const listSpiderUrl = (params: any) => service({ url: '/api/v1/spiderurl/list', method: 'get', params })
export const batchSetSpiderUrlStatus = (data: any) => service({ url: '/api/v1/spiderurl/status', method: 'put', data })
