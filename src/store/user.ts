import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import {
  login,
  getUser,
  updateUserProfile,
  logout,
  getUserPermissions,
  register,
  listUserGroup,
} from '@/api/user'
import { permissionsToTree } from '@/utils/permission'

interface UserState {
  user: Record<string, any>
  token: string
  permissions: any[]
  allowPages: string[]
  groups: any[]
}

const emptyUser = () => ({
  id: 0,
  username: '',
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
      localStorage.clear()
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
    async register(registerInfo: any) {
      const res: any = await register(registerInfo)
      if (res.status !== 200) {
        ElMessage({ type: 'error', message: res.data.message || '注册失败' })
        return res
      }
      this.setUser(res.data.user)
      this.setToken(res.data.token)
      await Promise.all([this.getUserPermissions(), this.getUserGroups()])
      return res
    },
    async login(loginInfo: any) {
      const res: any = await login(loginInfo)
      if (res.status !== 200) {
        ElMessage({ type: 'error', message: res.data.message || '登录失败' })
        return res
      }
      this.setUser(res.data.user)
      this.setToken(res.data.token)
      await Promise.all([this.getUserPermissions(), this.getUserGroups()])
      return res
    },
    checkAndRefreshUser() {
      try {
        // 以 localStorage 持久化的信息为准，刷新用户状态（对应原 store 的 checkAndRefreshUser）
        const raw = localStorage.getItem('user')
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
  persist: true,
})