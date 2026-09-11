<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRoute } from 'vue-router'
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
    return { layoutComponent }
  },
})
</script>