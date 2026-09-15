<template>
  <div class="page page-oauth">
    <el-card shadow="never">
      <div v-if="loading" style="padding: 150px 0; text-align: center">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <p style="margin-top: 20px; color: #666">登录中...</p>
      </div>
      <div v-else-if="error" style="padding: 150px 0; text-align: center">
        <el-icon :size="40" color="#f56c6c"><CircleClose /></el-icon>
        <p style="margin-top: 20px; color: #666">{{ error }}</p>
        <el-button type="primary" style="margin-top: 20px" @click="goHome">返回首页</el-button>
      </div>
      <div v-else style="padding: 150px 0; text-align: center">
        <el-icon :size="40" color="#67c23a"><SuccessFilled /></el-icon>
        <p style="margin-top: 20px; color: #666">登录成功，正在跳转...</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Loading, CircleClose, SuccessFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const error = ref('')

const goHome = () => {
  router.push('/')
}

onMounted(async () => {
  const code = route.query.code as string
  const type = route.query.type as string

  if (!code) {
    error.value = '缺少授权码'
    loading.value = false
    return
  }

  let oauthType = 0
  switch (type) {
    case 'custom':
      oauthType = 6
      break
    default:
      oauthType = 6
  }

  if (oauthType === 0) {
    error.value = '未知授权类型'
    loading.value = false
    return
  }

  try {
    const res: any = await userStore.loginOauth({ code, oauth_type: oauthType })
    if (res.status === 200) {
      if (res.data.oauth) {
        // 需要绑定账号
        error.value = '需要绑定账号'
        loading.value = false
      } else {
        // 登录成功
        loading.value = false
        const redirect = (route.query.redirect as string) || '/me'
        router.push(redirect)
      }
    } else {
      error.value = res.data?.message || '登录失败'
      loading.value = false
    }
  } catch (e: any) {
    error.value = e.message || '登录异常'
    loading.value = false
  }
})
</script>

<style lang="scss">
.page-oauth {
  width: 100%;
  margin-top: -20px;
  margin-bottom: -20px;
  & > div {
    width: $default-width;
    margin: 0 auto;
  }
  .el-card {
    width: 520px;
    max-width: 100%;
    margin: 100px auto;
  }
}
@media screen and (max-width: $mobile-width) {
  .page-oauth {
    & > div {
      width: 100%;
    }
    .el-card {
      width: 100%;
      margin: 20px auto;
    }
  }
}
</style>
