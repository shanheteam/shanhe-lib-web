import service from '@/utils/request'

export const createFriendlink = (data: any) => service({ url: '/api/v1/friendlink', method: 'post', data })
export const updateFriendlink = (data: any) => service({ url: '/api/v1/friendlink', method: 'put', data })
export const deleteFriendlink = (params: any) => service({ url: '/api/v1/friendlink', method: 'delete', params })
export const getFriendlink = (params: any) => service({ url: '/api/v1/friendlink', method: 'get', params })
export const listFriendlink = (params: any) => service({ url: '/api/v1/friendlink/list', method: 'get', params })