import { defineStore } from 'pinia'
import { getSettings as fetchSettings } from '@/api/config'
import { listNavigation } from '@/api/navigation'
import { categoryToTrees } from '@/utils/utils'
import { STORAGE_KEYS } from '@/utils/storage'

// 站点配置的并发请求去重：main.ts 预取与路由守卫会几乎同时调用，
// 若不去重会重复发起同一请求。
let settingsRequest: Promise<any> | null = null

// 配置拉取失败后的冷却时间：避免路由守卫在配置接口异常时，每次跳转都等待一次超时请求
const SETTINGS_RETRY_COOLDOWN_MS = 30 * 1000
let settingsFailedAt = 0

export const useSettingStore = defineStore('setting', {
  state: () => ({
    settings: {
      system: {},
      footer: {},
      security: {},
      display: {},
      language: [],
    } as Record<string, any>,
    navigations: [] as any[],
  }),
  getters: {
    getNavigations: (state) => state.navigations || [],
  },
  actions: {
    setSettings(settings: any) {
      this.settings = settings
    },
    setNavigations(navigations: any[]) {
      this.navigations = navigations
    },
    async getSettings() {
      if (!settingsRequest) {
        settingsRequest = fetchSettings().finally(() => {
          settingsRequest = null
        })
      }
      const res: any = await settingsRequest
      if (res.status === 200) {
        settingsFailedAt = 0
        this.setSettings({
          system: {},
          footer: {},
          security: {},
          display: {},
          language: [],
          ...res.data,
        })
      } else {
        settingsFailedAt = Date.now()
      }
      return res
    },
    /** 是否还需要拉取站点配置：已有配置、或正处于失败冷却期内则跳过，避免反复阻塞路由 */
    needFetchSettings(): boolean {
      if (Object.keys(this.settings?.system || {}).length > 0) return false
      return Date.now() - settingsFailedAt >= SETTINGS_RETRY_COOLDOWN_MS
    },
    async listNavigation() {
      const res: any = await listNavigation({ page: 1, size: 10000 })
      if (res.status === 200) {
        let navigations = res.data.navigation || []
        navigations = categoryToTrees(navigations).filter((item: any) => item.enable)
        this.setNavigations(navigations)
      }
      return res
    },
  },
  // 显式声明持久化 key（默认取 store id），与 utils/storage.ts 的 STORAGE_KEYS.SETTING 保持一致。
  // 只持久化 navigations：settings 是后台实时配置，若一并持久化到 localStorage，
  // 后台改配置后前端刷新仍会命中 needFetchSettings 的缓存判断而跳过重新拉取，导致配置不生效。
  persist: { key: STORAGE_KEYS.SETTING, paths: ['navigations'] },
})