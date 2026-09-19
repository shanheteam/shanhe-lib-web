<template>
  <div class="page page-findpassword">
    <el-card shadow="never">
      <template #header>找回密码</template>
      <form-find-password-step-two v-if="token" />
      <form-find-password-step-one v-else />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const user = computed(() => userStore.user)
const token = computed(() => route.query.token)

onMounted(() => {
  // 如果已经登录，跳转到个人中心
  if (user.value && user.value.id) {
    router.push('/me')
  }
})
</script>
