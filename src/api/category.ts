import service from '@/utils/request'

export const createCategory = (data: any) => service({ url: '/api/v1/category', method: 'post', data })
export const updateCategory = (data: any) => service({ url: '/api/v1/category', method: 'put', data })
export const deleteCategory = (params: any) => service({ url: '/api/v1/category', method: 'delete', params })
export const getCategory = (params: any) => service({ url: '/api/v1/category', method: 'get', params })
export const listCategory = (params: any) => service({ url: '/api/v1/category/list', method: 'get', params })