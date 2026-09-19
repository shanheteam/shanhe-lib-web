// PKCE (Proof Key for Code Exchange) 工具函数
// OAuth 2.1 标准，防止授权码拦截攻击
import { STORAGE_KEYS } from '@/utils/storage'

/**
 * 生成随机字符串（用于 code_verifier 和 state）
 */
export function generateRandomString(length: number = 64): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  const values = new Uint32Array(length)
  crypto.getRandomValues(values)
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length]
  }
  return result
}

/**
 * 计算 code_challenge (SHA-256 hash of code_verifier, base64url encoded)
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(digest)
}

/**
 * Base64URL 编码（去除填充，替换字符）
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const base64 = btoa(binary)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * 保存 PKCE 参数到 localStorage（跨窗口共享，支持 window.open 弹窗场景）
 */
export function savePkceParams(codeVerifier: string, state: string): void {
  localStorage.setItem(STORAGE_KEYS.OAUTH_CODE_VERIFIER, codeVerifier)
  localStorage.setItem(STORAGE_KEYS.OAUTH_STATE, state)
}

/**
 * 从 localStorage 获取 PKCE 参数
 */
export function getPkceParams(): { codeVerifier: string; state: string } | null {
  const codeVerifier = localStorage.getItem(STORAGE_KEYS.OAUTH_CODE_VERIFIER)
  const state = localStorage.getItem(STORAGE_KEYS.OAUTH_STATE)
  if (!codeVerifier || !state) return null
  return { codeVerifier, state }
}

/**
 * 清除 PKCE 参数
 */
export function clearPkceParams(): void {
  localStorage.removeItem(STORAGE_KEYS.OAUTH_CODE_VERIFIER)
  localStorage.removeItem(STORAGE_KEYS.OAUTH_STATE)
}
