import service from '@/utils/request'

export const getSms = (params: any) => service({ url: '/api/v1/sms', method: 'get', params })
export const listSms = (params: any) => service({ url: '/api/v1/sms/list', method: 'get', params })
export const sendSMS = (data: any) => service({ url: '/api/v1/sms', method: 'post', data })
export const deleteSms = (params: any) => service({ url: '/api/v1/sms', method: 'delete', params })
