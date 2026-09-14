import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import qs from 'qs'
import { useUserStore } from '@/store/user'

// 删除下划线的无效参数
const removeUnderscoreParams = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeUnderscoreParams(item))
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: Record<string, any> = {}
    Object.keys(obj).forEach((key) => {
      if (!key.startsWith('_')) {
        newObj[key] = removeUnderscoreParams(obj[key])
      }
    })
    return newObj
  }
  return obj
}

const service: AxiosInstance = axios.create({
  // 生产部署到 EdgeOne Makers 时，通过 VITE_API_BASE_URL 指向后端域名（如 https://apilib.shanhe.co）
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer(params) {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    config.params = removeUnderscoreParams(config.params)
    config.data = removeUnderscoreParams(config.data)
    const userStore = useUserStore()
    const token = userStore.token || ''
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器
service.interceptors.response.use(
  (response) => response,
  (error: any) => {
    const response = error?.response
    if (!response) {
      return {
        status: 0,
        data: { message: error.message || '网络错误' },
      }
    }
    return {
      status: response.status,
      data:
        response.data && response.data.message
          ? response.data
          : {
              message: `${response.status} ${response.statusText} ${
                response.data || ''
              }`,
            },
    }
  },
)

export default service

export type ApiResponse<T = any> = {
  status: number
  data: T
}

export const request = <T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> =>
  service.request(config)