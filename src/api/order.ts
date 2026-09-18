import service from '@/utils/request'

export const listOrder = (params: any) => service({ url: '/api/v1/order/list', method: 'get', params })
