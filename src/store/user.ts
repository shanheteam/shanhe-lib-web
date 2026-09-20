import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import {
  getUser,
  updateUserProfile,
  logout,
  getUserPermissions,
  listUserGroup,
} from '@/api/user'
import { loginOauth, getOauths, passwordLogin, ssoLogin, ssoSession, ssoLogout } from '@/api/oauth'
import { permissionsToTree } from '@/utils/permission'
import { OAUTH_TYPE_CUSTOM, SSO_LOGOUT_RETURN_KEY } from '@/utils/oauth'
import { STORAGE_KEYS, clearSiteStorage } from '@/utils/storage'

let ssoSilentLastCheck = 0
// 主动退出后短时抑制 SSO 静默自动登录，避免 user 未真正登出、共享 cookie 被续期回填时"刚退出又自动回来"
const SSO_SUPPRESS_KEY = 'uc_sso_suppress_until'
const SSO_SUPPRESS_MS = 10 * 60 * 1000

interface UserState {
  user: Record<string, any>
  token: string
  permissions: any[]
  allowPages: string[]
  groups: any[]
}

const emptyUser = () => ({
  id: 0,
  realname: '',
  email: '',
  mobile: '',
  avatar: '',
  address: '',
  signature: '',
})

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: emptyUser(),
    token: '',
    permissions: [],
    allowPages: [],
    groups: [],
  }),
  getters: {
    currentUser: (state) => state.user || { id: 0 },
    getToken: (state) => state.token || '',
    getPermissions: (state) => state.permissions || [],
    getAllowPages: (state) => state.allowPages || [],
    getGroups: (state) => state.groups || [],
  },
  actions: {
    setUser(user: any) {
      this.user = user
    },
    setGroups(groups: any[]) {
      this.groups = groups
    },
    mergeUser(user: any) {
      this.user = { ...this.user, ...user }
    },
    setToken(token: string) {
      this.token = token
    },
    clearState() {
      this.user = emptyUser()
      this.token = ''
      this.permissions = []
      this.allowPages = []
      // 只清理站点自身管理的持久化数据，保留 OAuth PKCE 等登录流程临时参数
      clearSiteStorage()
    },
    setPermissions(permissions: any[]) {
      this.permissions = permissions
    },
    setAllowPages(pages: string[]) {
      this.allowPages = pages
    },
    async getUser() {
      const res: any = await getUser()
      if (res.status === 200) this.setUser(res.data)
      return res
    },
    async getUserGroups() {
      const res: any = await listUserGroup()
      if (res.status === 200) this.setGroups(res.data.group || [])
      return res
    },
    async updateUserProfile(profile: any) {
      const res: any = await updateUserProfile(profile)
      if (res.status === 200) {
        this.mergeUser(profile)
      } else {
        ElMessage({ type: 'error', message: res.data.message || '修改失败' })
      }
      return res
    },
    async loginOauth(loginInfo: any) {
      const res: any = await loginOauth(loginInfo)
      if (res.status !== 200) {
        ElMessage({ type: 'error', message: res.data.message || '登录失败' })
        return res
      }
      if (res.data.token && res.data.user) {
        this.setUser(res.data.user)
        this.setToken(res.data.token)
        await Promise.all([this.getUserPermissions(), this.getUserGroups()])
      }
      return res
    },
    async getOauths() {
      const res: any = await getOauths()
      return res
    },
    checkAndRefreshUser() {
      try {
        // 以 localStorage 持久化的信息为准，刷新用户状态（对应原 store 的 checkAndRefreshUser）
        const raw = localStorage.getItem(STORAGE_KEYS.USER)
        if (!raw) return
        const persisted = JSON.parse(raw)
        if (persisted && this.token !== persisted.token) {
          this.setUser(persisted.user || {})
          this.setToken(persisted.token || '')
          this.setPermissions(persisted.permissions || [])
          this.setAllowPages(persisted.allowPages || [])
        }
      } catch (error) {
        console.log(error)
      }
    },
    async logout() {
      const res: any = await logout()
      this.clearState()
      return res
    },
    /**
     * 登出并做单点登出(SLO)：本地清理后跳转 user-center 的端会话登出端点。
     * 同域共享 .shanhe.co cookie，IdP 清 cookie 后全子域同时登出。
     */
    async logoutWithSso() {
      try { sessionStorage.setItem(SSO_SUPPRESS_KEY, String(Date.now())) } catch { void 0 }
      await this.logout()
      // 先经 lib 后端清除 .shanhe.co 共享 cookie，再做 IdP 端会话登出。
      // 若先跳 IdP /logout 而该端点未清共享 cookie（端点异常/参数不符），
      // 刷新后 SSO 静默探测会把已登出的会话"带回来"（表现为退出后立即自动登录）。
      try {
        await ssoLogout()
      } catch (e) {
        console.warn('[OAuth] shared cookie clear failed:', (e as Error)?.message)
      }
      try {
        const res: any = await getOauths()
        const list: any[] = res?.data?.oauths || []
        // user-center 对应 custom 类型（type=6）
        const custom = list.find((o: any) => Number(o.type) === OAUTH_TYPE_CUSTOM)
        if (custom?.client_id && custom?.redirect_url) {
          // 优先用后端给出的登出地址（ucBase 推导），缺失时兜底按 authorize 基址改写
          const logoutUrl =
            String(custom?.logout_url || '') ||
            String(custom.authorize_url_base || '').replace(/\/authorize$/, '/logout')
          if (logoutUrl && /^https?:/.test(logoutUrl)) {
            sessionStorage.setItem(SSO_LOGOUT_RETURN_KEY, '1')
            const params = new URLSearchParams({
              client_id: custom.client_id,
              post_logout_redirect_uri: custom.redirect_url,
            })
            window.location.href = `${logoutUrl}?${params.toString()}`
            return
          }
        }
      } catch (e) {
        console.error('[OAuth] SSO logout failed, fallback to local reload:', e)
      }
      window.location.reload()
    },
    async loginByPassword(loginInfo: any) {
      const res: any = await passwordLogin(loginInfo)
      if (res.status !== 200) {
        ElMessage({ type: 'error', message: res.data?.message || res.message || '登录失败' })
        return res
      }
      if (res.data.token && res.data.user) {
        this.setUser(res.data.user)
        this.setToken(res.data.token)
        await Promise.all([this.getUserPermissions(), this.getUserGroups()])
      }
      return res
    },
    /**
     * 静默 SSO 建会话：user-center 已登录（共享 .shanhe.co cookie 有效）时，自动建立 lib 登录态。
     * 仅在本地未登录时执行，用 sessionStorage 标记去抖，避免每次路由重复请求。
     */
    async silentSsoCheck() {
      // 内存短时间去抖（5s），避免 focus/定时频繁触发重复请求；不依赖 sessionStorage，
      // 因 sessionStorage 跨刷新保留，会导致"刷新首页不再探测、user 登录后 lib 无法自动登录"。
      if (this.token) return // 已本地登录
      const now = Date.now()
      // 主动退出后一段窗口内不自动登录（user 未真正登出时共享 cookie 会被续期回填，导致"刚退出又回来"）
      try {
        const until = Number(sessionStorage.getItem(SSO_SUPPRESS_KEY) || 0)
        if (until && now - until < SSO_SUPPRESS_MS) return
      } catch { void 0 }
      if (now - ssoSilentLastCheck < 5000) return
      ssoSilentLastCheck = now
      try {
        const res: any = await ssoLogin()
        if (res?.status === 200 && res?.data?.valid && res?.data?.token && res?.data?.user) {
          this.setUser(res.data.user)
          this.setToken(res.data.token)
          await Promise.all([this.getUserPermissions(), this.getUserGroups()])
        }
      } catch (e) {
        // 静默：无 cookie / 校验失败 / 未绑定均不打扰
        console.warn('[SSO] silent login skipped:', (e as Error)?.message)
      }
    },
    /**
     * SSO 会话探测：本地上有登录态时，周期/焦点时探测共享 cookie 是否仍有效；
     * user-center 已登出（cookie 失效）则后台静默退出，不跳转不提示。
     */
    async ssoSessionProbe() {
      if (!this.token) return
      try {
        const res: any = await ssoSession()
        if (res?.status === 200) {
          if (res?.data?.valid === false) {
            // 同一账号在 user-center 已登出/被禁：本地退出
            this.clearState()
          } else if (res?.data?.user) {
            // 共享 cookie 已切换为另一账号：本地旧账号会话失效，登出释放（稍后 silentSsoCheck 用新 cookie 登入）
            const ucUserId = String(res.data.user.id ?? '')
            const localUserId = String(this.user?.id ?? '')
            if (ucUserId && localUserId && ucUserId !== localUserId) {
              this.clearState()
            }
          }
        }
      } catch (e) {
        // 网络异常不登出，避免误踢
        console.warn('[SSO] session probe failed:', (e as Error)?.message)
      }
    },
    async getUserPermissions() {
      const res: any = await getUserPermissions()
      if (res.status === 200) {
        this.setPermissions(res.data.permission)
        const allowPages: string[] = []
        try {
          const trees = permissionsToTree(res.data.permission)
          trees.forEach((tree: any) => {
            if (tree.pages && tree.id && tree.id > 0) allowPages.push(...tree.pages)
          })
        } catch (error) {
          // ignore
        }
        this.setAllowPages(allowPages)
      } else {
        ElMessage({ type: 'error', message: res.data.message || '获取权限失败' })
      }
      return res
    },
  },
  // 显式声明持久化 key（默认取 store id），与 utils/storage.ts 的 STORAGE_KEYS.USER 保持一致
  persist: { key: STORAGE_KEYS.USER },
})