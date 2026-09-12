import service from '@/utils/request'

export const updateSpiderDocument = (data: any) =>
  service({ url: '/api/v1/spiderdocument', method: 'put', data })
export const deleteSpiderDocument = (params: any) =>
  service({ url: '/api/v1/spiderdocument', method: 'delete', params })
export const getSpiderDocument = (params: any) =>
  service({ url: '/api/v1/spiderdocument', method: 'get', params })
export const listSpiderDocument = (params: any) =>
  service({ url: '/api/v1/spiderdocument/list', method: 'get', params })
export const batchUpdateSpiderDocument = (data: any) =>
  service({ url: '/api/v1/spiderdocument/batch', method: 'put', data })
