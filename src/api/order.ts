import service from '@/utils/request'

export const systemRecharge = (data: any) =>
  service({ url: '/api/v1/order/system/recharge', method: 'post', data })
export const createOrder = (data: any) => service({ url: '/api/v1/order', method: 'post', data })
export const getOrder = (params: any) => service({ url: '/api/v1/order', method: 'get', params })
export const deleteOrder = (params: any) => service({ url: '/api/v1/order', method: 'delete', params })
export const getOrderStatus = (params: any) => service({ url: '/api/v1/order/status', method: 'get', params })
export const listOrder = (params: any) => service({ url: '/api/v1/order/list', method: 'get', params })
export const payOrder = (data: any) => service({ url: '/api/v1/order/pay', method: 'post', data })
export const closeOrder = (data: any) => service({ url: '/api/v1/order/close', method: 'put', data })
export const creditRecharge = (data: any) => service({ url: '/api/v1/order/recharge', method: 'post', data })
