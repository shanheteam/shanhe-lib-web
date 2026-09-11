import service from '@/utils/request'

export const createComment = (data: any) => service({ url: '/api/v1/comment', method: 'post', data })
export const updateComment = (data: any) => service({ url: '/api/v1/comment', method: 'put', data })
export const deleteComment = (params: any) => service({ url: '/api/v1/comment', method: 'delete', params })
export const getComment = (params: any) => service({ url: '/api/v1/comment', method: 'get', params })
export const listComment = (params: any) => service({ url: '/api/v1/comment/list', method: 'get', params })
export const checkComment = (data: any) => service({ url: '/api/v1/comment/check', method: 'post', data })