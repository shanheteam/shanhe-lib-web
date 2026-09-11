import service from '@/utils/request'

export const search = (params: any) => service({ url: '/api/v1/search', method: 'get', params })