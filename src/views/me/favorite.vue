<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="文档收藏" name="document">
        <favorite-document :user-id="user.id" />
      </el-tab-pane>
      <el-tab-pane label="文章收藏" name="article">
        <favorite-article :user-id="user.id" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const user = computed(() => userStore.user)
const activeName = ref<string>(String(route.query.type || 'document'))

const handleClick = (tab: any) => {
  const name = tab?.paneName ?? tab?.props?.name
  router.push({ query: { type: name } })
}
</script>