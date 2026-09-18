import service from '@/utils/request'

export const listSms = (params: any) => service({ url: '/api/v1/sms/list', method: 'get', params })
