import { type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  uploadDocument as uploadDocumentApi,
  getOssPolicy,
  registerOssDocument,
} from '@/api/attachment'
import { computeFileMd5 } from '@/utils/md5'

type CreateDocument = (doc: any) => Promise<void>

/**
 * 单文档上传逻辑（上传页）：优先 OSS 直传（大文件绕开网关请求体限制），
 * 未启用或失败时回退后端 multer 上传。
 *
 * createDocument: 组件内"登记文档成功后创建文档"的回调（含列表剔除逻辑）；
 * totalFailed / totalSuccess：上传结果计数 ref，供页面状态展示。
 */
export function useDocumentUpload(
  createDocument: CreateDocument,
  totalFailed: Ref<number>,
  totalSuccess: Ref<number>
) {
  // OSS 直传开关缓存：null=未知，true=已启用（走 OSS 直传），false=未启用（回退后端 multer 上传）
  let ossUploadEnabled: boolean | null = null

  // 上传单个文档
  const uploadDocumentOne = async (file: any): Promise<boolean> => {
    // 首次探测后端是否启用 OSS 直传（全局缓存，避免每个文件都先算完 MD5 才发现不可用）
    if (ossUploadEnabled === null) {
      try {
        const probe: any = await getOssPolicy({
          hash: '0'.repeat(32),
          ext: file.ext,
          size: file.size,
        })
        ossUploadEnabled = probe.data?.enabled === true
      } catch (error) {
        ossUploadEnabled = false
      }
    }
    if (!ossUploadEnabled) return false

    // 1. 分片计算文件 MD5（服务端据此校验 OSS 对象真实性与完整性）
    file.statusText = '计算文件指纹...'
    file.percentage = 0
    let hash: string
    try {
      hash = await computeFileMd5(file.raw)
    } catch (error) {
      file.progressStatus = 'exception'
      file.error = '计算文件指纹失败，请重试'
      ElMessage.error(`《${file.name}》${file.error}`)
      totalFailed.value++
      return true
    }

    // 2. 获取 OSS POST 表单直传签名
    file.statusText = '获取上传凭证...'
    let policy: any
    try {
      const policyRes: any = await getOssPolicy({
        hash,
        ext: file.ext,
        size: file.size,
      })
      policy = policyRes.data || {}
      if (policy.enabled === false) {
        ossUploadEnabled = false
        return false
      }
    } catch (error) {
      file.progressStatus = 'exception'
      file.error = '获取上传凭证失败，请重试'
      ElMessage.error(`《${file.name}》${file.error}`)
      totalFailed.value++
      return true
    }

    // 3. POST 表单直传 OSS
    file.statusText = '上传至 OSS...'
    file.percentage = 0
    if (!(await postFileToOss(policy, file, hash))) {
      // 直传失败（错误已提示），回退后端 multer 上传
      return false
    }

    // 4. 注册文档（服务端通过 OSS head 校验对象真实存在且 MD5 一致）
    file.statusText = '登记文档...'
    try {
      const res: any = await registerOssDocument({
        hash,
        name: file.name,
        ext: file.ext,
        size: file.size,
      })
      const uploadData = res.data || {}
      file.attachment_id = uploadData.id || 0
      file.statusText = ''
      file.percentage = 100
      createDocument(file)
      totalSuccess.value++
      return true
    } catch (error: any) {
      file.progressStatus = 'exception'
      file.error = error?.response?.data?.message || '登记文档失败，请重试'
      ElMessage.error(`《${file.name}》${file.error}`)
      totalFailed.value++
      return true
    }
  }

  // POST 表单直传 OSS（用 OSS 默认端点，绕过平台网关请求体限制）。403 时按 hash 重新取签名重试一次
  const postFileToOss = async (
    policy: any,
    file: any,
    hash: string,
    retry = true
  ): Promise<boolean> =>
    new Promise((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', policy.host, true)
      xhr.timeout = 60 * 60 * 1000 // 大文件传输慢，超时放宽到 1 小时
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          file.percentage = Math.round((e.loaded / e.total) * 100)
        }
      }
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(true)
          return
        }
        if (xhr.status === 403 && retry) {
          // 签名/策略过期，重新获取凭证再试一次
          file.statusText = '重新获取上传凭证...'
          getOssPolicy({ hash, ext: file.ext, size: file.size })
            .then((res: any) => {
              const data = res.data || {}
              if (data.enabled === false) {
                ossUploadEnabled = false
                resolve(false)
                return
              }
              postFileToOss(data, file, hash, false).then(resolve)
            })
            .catch(() => resolve(false))
          return
        }
        const message = parseOssError(xhr.responseText) || '上传到 OSS 失败'
        file.progressStatus = 'exception'
        file.error = message
        ElMessage.error(`《${file.name}》${message}`)
        resolve(false)
      }
      xhr.onerror = () => {
        file.progressStatus = 'exception'
        file.error = '网络异常，上传到 OSS 失败'
        ElMessage.error(`《${file.name}》${file.error}`)
        resolve(false)
      }
      xhr.ontimeout = () => {
        file.progressStatus = 'exception'
        file.error = '上传到 OSS 超时，请重试'
        ElMessage.error(`《${file.name}》${file.error}`)
        resolve(false)
      }

      const formData = new FormData()
      formData.append('key', policy.key)
      formData.append('policy', policy.policy)
      formData.append('OSSAccessKeyId', policy.OSSAccessKeyId)
      formData.append('Signature', policy.Signature)
      formData.append('success_action_status', '200')
      formData.append('Content-Type', policy['Content-Type'])
      formData.append('file', file.raw)
      xhr.send(formData)
    })

  // 从 OSS 错误响应 XML 中提取 Message
  const parseOssError = (text: string): string => {
    if (!text) return ''
    const match = text.match(/<Message>([\s\S]*?)<\/Message>/)
    return match ? match[1].trim() : ''
  }

  // 回退路径：走后端 multer 上传（OSS 未启用或直传失败时）
  const uploadViaMulter = async (file: any) => {
    file.error = ''
    file.statusText = '上传中...'
    const formData = new FormData()
    formData.append('file', file.raw)

    try {
      const res: any = await uploadDocumentApi(formData, {
        onUploadProgress: (progressEvent: any) => {
          file.percentage = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          )
        },
      })
      if (res.status === 200) {
        // 服务端返回 {id}，兼容旧的 {data:{id}} 包装结构
        const uploadData = res.data || {}
        file.attachment_id = uploadData.data?.id || uploadData.id || 0
        file.statusText = ''
        file.percentage = 100
        createDocument(file)
        totalSuccess.value++
      } else {
        file.progressStatus = 'exception'
        file.error = res.data.message || res.statusText
        ElMessage.error(`《${file.name}》${file.error}`)
        totalFailed.value++
      }
    } catch (error) {
      file.progressStatus = 'exception'
      file.error = '上传失败或超时，请重试'
      ElMessage.error(`《${file.name}》${file.error}`)
      totalFailed.value++
    }
  }

  return { uploadDocumentOne, uploadViaMulter }
}