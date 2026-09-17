import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import qs from 'qs'
import { ElMessage } from 'element-plus'
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

// 401 并发去重：页面同时发出多个请求且都失效时，只清理一次登录态、只提示一次并只跳转一次
let handlingAuthExpired = false

/**
 * 登录态失效（401）统一处理：清理本地登录态并带着回跳地址跳转登录页。
 * 动态引入 router，避免 request -> router -> store -> api -> request 的循环依赖。
 */
async function handleAuthExpired() {
  if (handlingAuthExpired) return
  const userStore = useUserStore()
  if (!userStore.token) return // 未登录状态下的 401 不属于登录过期，交由调用方提示
  handlingAuthExpired = true
  try {
    userStore.clearState()
    const { default: router } = await import('@/router')
    const current = router.currentRoute.value
    if (current.name === 'login') return
    ElMessage({ type: 'warning', message: '登录已过期，请重新登录' })
    router.push({ path: '/login', query: { redirect: current.fullPath } })
  } finally {
    // 保留一个短窗口合并并发的 401，之后恢复处理能力
    setTimeout(() => {
      handlingAuthExpired = false
    }, 1000)
  }
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
    // 登录态失效：统一清理登录态并跳转登录页，避免界面仍显示"已登录"却处处请求失败
    if (response.status === 401) {
      void handleAuthExpired()
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