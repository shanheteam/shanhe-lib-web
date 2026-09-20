<template>
  <div
    class="page page-login"
    :style="
      settings.system.login_background
        ? 'background:url(' +
          assetUrl(settings.system.login_background) +
          ') no-repeat center center'
        : ''
    "
  >
    <div>
      <el-card
        shadow="never"
        :class="settings.security.is_close ? 'close-box' : ''"
      >
        <template #header>
          <div class="clearfix">
            <span v-if="user.id > 0 && settings.security.is_close">网站关闭</span>
            <span v-else>用户登录</span>
          </div>
        </template>
        <div v-if="settings.security.is_close" class="close-tips">
          <div v-safe-html="settings.security.close_statement"></div>
        </div>
        <div v-if="!(user.id > 0 && settings.security.is_close)">
          <div class="uc-acct-login">
            <el-divider>山河大学账号密码登录</el-divider>
            <div class="uc-acct-form">
              <el-input v-model="ucForm.username" placeholder="学号 / 手机号 / 邮箱" clearable @keyup.enter="submitUcLogin" />
              <el-input v-model="ucForm.password" type="password" show-password placeholder="密码" @keyup.enter="submitUcLogin" />
              <el-button type="primary" class="uc-acct-submit" :loading="ucLoginLoading" @click="submitUcLogin">登录</el-button>
            </div>
          </div>
          <div v-if="oauths.length > 0" class="oauth-login-container">
            <el-divider>其他登录方式</el-divider>
            <div class="oauth-list">
              <el-button
                v-for="oauth in oauths"
                :key="oauth.type"
                type="primary"
                class="oauth-btn"
                @click="handleOAuthLogin(oauth)"
              >
                <!-- 自定义 OAuth（type=6）为本站学籍登录，文案单独处理 -->
                {{ oauth.type === OAUTH_TYPE_CUSTOM ? '使用' + oauth.name + '登录' : oauth.name + ' 登录' }}
              </el-button>
            </div>
          </div>
        </div>
        <div style="margin-top: 20px; text-align: center">
          <el-link
            type="default"
            class="float-right"
            @click="openLoginDialog('register')"
            >注册账户</el-link
          >
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { assetUrl } from '@/utils/asset'
import { generateRandomString, generateCodeChallenge, savePkceParams } from '@/utils/pkce'
import { passwordLogin } from '@/api/oauth'
import { OAUTH_TYPE_CUSTOM } from '@/utils/oauth'
import { openLoginDialog } from '@/utils/login'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const settingStore = useSettingStore()

const user = computed(() => userStore.user)
const settings = computed(() => settingStore.settings)
const redirect = computed(() => (route.query.redirect as string) || '/me')

const oauths = ref<any[]>([])
const ucLoginLoading = ref(false)
const ucForm = ref<{ username: string; password: string }>({ username: '', password: '' })

const submitUcLogin = async () => {
  const username = ucForm.value.username.trim()
  const password = ucForm.value.password
  if (!username || !password) {
    ElMessage.warning('请输入山河大学账号和密码')
    return
  }
  ucLoginLoading.value = true
  try {
    const res: any = await passwordLogin({ username, password })
    if (res?.data?.token && res?.data?.user) {
      ucForm.value = { username: '', password: '' }
      ElMessage.success('登录成功')
      userStore.setUser(res.data.user)
      userStore.setToken(res.data.token)
      userStore.getUserPermissions()
      userStore.getUserGroups()
      router.push(redirect.value)
    } else {
      ElMessage.error(res?.data?.message || res?.message || '登录失败')
    }
  } catch (e: any) {
    console.error('[OAuth] password login error:', e)
    ElMessage.error(e?.data?.message || e?.message || '登录异常')
  } finally {
    ucLoginLoading.value = false
  }
}

const handleOAuthLogin = async (oauth: any) => {
  const codeVerifier = generateRandomString(64)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateRandomString(32)
  savePkceParams(codeVerifier, state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: oauth.client_id,
    redirect_uri: oauth.redirect_url,
    scope: oauth.scope || 'openid profile email',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  const authorizeUrl = `${oauth.authorize_url_base}?${params.toString()}`
  window.location.href = authorizeUrl
}

onMounted(async () => {
  try {
    const res: any = await userStore.getOauths()
    if (res.status === 200 && res.data.oauths) {
      oauths.value = res.data.oauths.filter((o: any) => o.enable)
    }
  } catch (e) {
    console.error('获取OAuth配置失败:', e)
  }
})
</script>
