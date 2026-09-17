import { defineStore } from 'pinia'
import { getSettings as fetchSettings } from '@/api/config'
import { listNavigation } from '@/api/navigation'
import { categoryToTrees } from '@/utils/utils'

// 站点配置的并发请求去重：main.ts 预取与路由守卫会几乎同时调用，
// 若不去重会重复发起同一请求。
let settingsRequest: Promise<any> | null = null

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
        this.setSettings({
          system: {},
          footer: {},
          security: {},
          display: {},
          language: [],
          ...res.data,
        })
      }
      return res
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
  persist: true,
})