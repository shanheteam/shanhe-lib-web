<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSettings } from '@/api/config'
import DefaultLayout from '@/layouts/default.vue'
import AdminLayout from '@/layouts/admin.vue'
import ArticleLayout from '@/layouts/article.vue'
import ErrorLayout from '@/layouts/error.vue'

export default defineComponent({
  name: 'App',
  setup() {
    const route = useRoute()
    const layoutComponent = computed(() => {
      const layout = (route.meta.layout as string) || 'default'
      switch (layout) {
        case 'admin':
          return AdminLayout
        case 'article':
          return ArticleLayout
        case 'error':
          return ErrorLayout
        default:
          return DefaultLayout
      }
    })

    // 动态应用后台上传的站点 favicon
    onMounted(async () => {
      try {
        const res: any = await getSettings()
        const favicon = String(res?.data?.system?.favicon ?? '').trim()
        if (!favicon) return
        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.head.appendChild(link)
        }
        link.href = favicon
      } catch {
        // 静默失败，保留 index.html 默认图标
      }
    })

    return { layoutComponent }
  },
})
</script>