import fileService from '@/utils/fileRequest'
import service from '@/utils/request'

export const updateAttachment = (data: any) => service({ url: '/api/v1/attachment', method: 'put', data })
export const deleteAttachment = (params: any) => service({ url: '/api/v1/attachment', method: 'delete', params })
export const getAttachment = (params: any) => service({ url: '/api/v1/attachment', method: 'get', params })
export const listAttachment = (params: any) => service({ url: '/api/v1/attachment/list', method: 'get', params })
export const uploadDocument = (data: any, option?: any) => fileService({ url: '/api/v1/upload/document', method: 'post', data, ...option })
// OSS 直传：获取 POST 表单直传签名（大文件绕开平台网关限制）
export const getOssPolicy = (data: any) => service({ url: '/api/v1/upload/oss-policy', method: 'post', data })
// OSS 直传：上传完成后注册文档（校验对象真实性并落库，返回附件 id）
export const registerOssDocument = (data: any) => service({ url: '/api/v1/upload/document/oss', method: 'post', data })