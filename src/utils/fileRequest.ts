import axios from 'axios'
import { useUserStore } from '@/store/user'

const fileService = axios.create({
  timeout: 6000000, // 文件上传超时时间，100分钟
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

fileService.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token || ''
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

fileService.interceptors.response.use(
  (response) => response,
  (error) => error.response,
)

export default fileService