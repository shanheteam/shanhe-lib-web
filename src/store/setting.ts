import { defineStore } from 'pinia'
import { getSettings } from '@/api/config'
import { listNavigation } from '@/api/navigation'
import { categoryToTrees } from '@/utils/utils'

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
      const res: any = await getSettings()
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