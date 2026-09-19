<template>
  <div class="page page-oauth">
    <el-card shadow="never">
      <div v-if="loading" style="padding: 150px 0; text-align: center">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <p style="margin-top: 20px; color: var(--app-text-muted)">登录中...</p>
      </div>
      <div v-else-if="error" style="padding: 150px 0; text-align: center">
        <el-icon :size="40" color="var(--el-color-danger)"><CircleClose /></el-icon>
        <p style="margin-top: 20px; color: var(--app-text-muted)">{{ error }}</p>
        <el-button type="primary" style="margin-top: 20px" @click="goHome">返回首页</el-button>
      </div>
      <div v-else style="padding: 150px 0; text-align: center">
        <el-icon :size="40" color="var(--el-color-success)"><SuccessFilled /></el-icon>
        <p style="margin-top: 20px; color: var(--app-text-muted)">登录成功，正在跳转...</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Loading, CircleClose, SuccessFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { getPkceParams, clearPkceParams } from '@/utils/pkce'
import { resolveOauthType } from '@/utils/oauth'

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
  // 类型来源：/oauth/{类型名} 路径参数优先，兼容 /oauth/callback?type=xxx 查询参数
  const type = (route.params.type as string) || (route.query.type as string)
  const state = route.query.state as string

  if (!code) {
    error.value = '缺少授权码'
    loading.value = false
    return
  }

  // 验证 state 防 CSRF
  const pkceParams = getPkceParams()
  if (!pkceParams) {
    error.value = 'PKCE 参数丢失，请重新登录'
    loading.value = false
    return
  }
  if (pkceParams.state !== state) {
    error.value = 'State 验证失败，请重新登录'
    clearPkceParams()
    loading.value = false
    return
  }

  // 按回调地址中的类型名解析 oauth_type（wechat/qq/gitee/... → 对应数字）
  const oauthType = resolveOauthType(type)

  try {
    const res: any = await userStore.loginOauth({
      code,
      oauth_type: oauthType,
      code_verifier: pkceParams.codeVerifier,
    })
    clearPkceParams()
    
    // 检查是否登录成功（有 token 返回）
    // res 是 axios response: { status: 200, data: { token, user } }
    const hasToken = res?.data?.token || res?.token
    const httpOk = res?.status === 200 || res?.status === 201
    
    if (hasToken && httpOk) {
      // 登录成功，通知父窗口并关闭弹窗
      notifyParentAndClose()
    } else {
      // 没有 token，可能是需要绑定账号或其他情况
      if (res?.data?.oauth) {
        error.value = '需要绑定账号'
      } else {
        error.value = res?.data?.message || res?.message || '登录失败'
      }
      loading.value = false
    }
  } catch (e: any) {
    console.error('[OAuth] login error:', e)
    error.value = e?.message || e?.data?.message || '登录异常'
    loading.value = false
  }
})

// 通知父窗口登录成功并关闭弹窗
const notifyParentAndClose = () => {
  // 尝试多种方式通知父窗口
  const sendSuccessMessage = () => {
    const message = { type: 'oauth-login-success' }
    
    // 如果在 iframe 中
    if (window.parent !== window) {
      try {
        window.parent.postMessage(message, window.location.origin)
      } catch (e) {
        console.error('[OAuth] postMessage to parent failed:', e)
      }
    }
    
    // 如果是 window.open 打开的弹窗
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(message, window.location.origin)
      } catch (e) {
        console.error('[OAuth] postMessage to opener failed:', e)
      }
    }
  }
  
  sendSuccessMessage()
  
  // 延迟关闭，确保消息发送完成
  setTimeout(() => {
    try {
      window.close()
    } catch (e) {
      console.error('[OAuth] window.close failed:', e)
      // 如果无法关闭，显示提示让用户手动关闭
      error.value = '登录成功，请手动关闭此窗口'
      loading.value = false
    }
  }, 300)
}
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
