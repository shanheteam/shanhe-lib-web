<template>
  <el-config-provider :locale="zhCn">
    <component :is="layoutComponent">
      <router-view />
    </component>
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent, computed, watch, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useSettingStore } from '@/store/setting'
import DefaultLayout from '@/layouts/default.vue'

// 后台/文章/错误布局与首屏无关，改为异步加载，避免后台的菜单、表单组件进入首屏包
const AdminLayout = defineAsyncComponent(() => import('@/layouts/admin.vue'))
const ArticleLayout = defineAsyncComponent(() => import('@/layouts/article.vue'))
const ErrorLayout = defineAsyncComponent(() => import('@/layouts/error.vue'))

export default defineComponent({
  name: 'App',
  setup() {
    const route = useRoute()
    const settingStore = useSettingStore()
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

    // 动态应用后台上传的站点 favicon。复用 store 中已有的站点配置，
    // 不再单独请求一次 /settings（原实现在挂载时重复请求）。
    watch(
      () => settingStore.settings.system?.favicon,
      (favicon) => {
        const href = String(favicon ?? '').trim()
        if (!href) return
        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.head.appendChild(link)
        }
        link.href = href
      },
      { immediate: true }
    )

    return { layoutComponent, zhCn }
  },
})
</script>