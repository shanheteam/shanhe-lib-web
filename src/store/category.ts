import { defineStore } from 'pinia'
import { listCategory } from '@/api/category'
import { categoryToTrees } from '@/utils/utils'
import { categoryTypeOptions } from '@/utils/enum'
import { STORAGE_KEYS } from '@/utils/storage'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [] as any[],
    categoryMap: {} as Record<string, any>,
  }),
  getters: {
    categoryTrees: (state) => categoryToTrees(state.categories) || [],
    getCategoryMap: (state) => state.categoryMap || {},
  },
  actions: {
    setCategories(categories: any[]) {
      this.categories = categories || []
    },
    setCategoryMap(categories: any[]) {
      const map: Record<string, any> = {}
      ;(categories || []).forEach((item) => {
        map[item.id] = item
      })
      this.categoryMap = map
    },
    async getCategories() {
      const types = categoryTypeOptions.map((item) => item.value)
      const res: any = await listCategory({
        field: [
          'id',
          'title',
          'parent_id',
          'icon',
          'cover',
          'doc_count',
          'enable',
          'description',
          'show_description',
          'type',
        ],
        type: types,
      })
      if (res.status === 200) {
        this.setCategories(res.data.category || [])
        this.setCategoryMap(res.data.category || [])
      }
      return res
    },
  },
  // 显式声明持久化 key（默认取 store id），与 utils/storage.ts 的 STORAGE_KEYS.CATEGORY 保持一致
  persist: { key: STORAGE_KEYS.CATEGORY },
})