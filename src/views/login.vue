<template>
  <div class="uc-page-wrap" v-loading="loading">
    <div class="uc-card">
      <div class="uc-head">
        <img :src="site.logo?.og_image || site.logo?.favicon" class="uc-logo" alt="" />
        <div class="uc-brand">
          <div class="uc-name">{{ site.information?.site_name || '图书馆' }}</div>
          <div class="uc-sub">统一认证中心</div>
        </div>
      </div>

      <el-tabs v-model="tab" class="uc-tabs" stretch>
        <!-- 登录 -->
        <el-tab-pane label="登录" name="login">
          <el-form :model="loginForm" class="uc-form" @submit.prevent>
            <el-form-item>
              <el-input
                v-model="loginForm.username"
                placeholder="学号 / 手机号 / 邮箱"
                clearable
                @keyup.enter="submitLogin"
              />
            </el-form-item>
            <el-form-item>
              <el-input
                v-model="loginForm.password"
                type="password"
                show-password
                placeholder="密码"
                @keyup.enter="submitLogin"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="uc-submit" :loading="loginLoading" @click="submitLogin">
                登录
              </el-button>
            </el-form-item>
          </el-form>

          <div class="uc-alt">
            <el-button text type="primary" @click="tab = 'register'">还没有账号？立即注册</el-button>
          </div>

          <template v-if="oauths.length">
            <div class="uc-divider"><span>其他登录方式</span></div>
            <div class="uc-oauth-list">
              <el-button
                v-for="o in oauths"
                :key="o.type"
                class="uc-oauth-btn"
                :loading="oauthLoading === o.type"
                @click="handleOAuthLogin(o)"
              >
                {{ o.type === OAUTH_TYPE_CUSTOM ? '山河大学学籍登录' : o.name }}
              </el-button>
            </div>
          </template>
        </el-tab-pane>

        <!-- 注册 -->
        <el-tab-pane label="注册" name="register">
          <div v-if="regError" class="uc-reg-error">{{ regError }}</div>
          <el-form :model="regForm" class="uc-form" @submit.prevent>
            <el-form-item>
              <el-input v-model="regForm.email" placeholder="邮箱" clearable />
            </el-form-item>
            <el-form-item>
              <el-input v-model="regForm.real_name" placeholder="真实姓名（纯中文）" clearable />
            </el-form-item>
            <el-form-item>
              <div class="uc-reg-stud">
                <span class="uc-reg-head">{{ ucStudHead }}</span>
                <el-input v-model="regForm.student_tail" placeholder="后4位" maxlength="4" />
                <el-button class="uc-reg-random" :loading="randLoading" @click="randomStudentId">
                  随机学号
                </el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-input v-model="regForm.password" type="password" show-password placeholder="密码（至少8位）" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="regForm.password2" type="password" show-password placeholder="确认密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="uc-submit" :loading="regLoading" @click="submitReg">
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { getOauths, registerUc, getAvailableStudentId } from '@/api/oauth'
import { OAUTH_TYPE_CUSTOM } from '@/utils/oauth'
import { generateRandomString, generateCodeChallenge, savePkceParams } from '@/utils/pkce'

defineOptions({ name: 'Login' })

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const settingStore = useSettingStore()

const tab = ref('login')
const loading = ref(false)
const loginLoading = ref(false)
const oauths = ref<any[]>([])
const oauthLoading = ref(0)
const loginForm = ref<{ username: string; password: string }>({ username: '', password: '' })

// 注册表单
const regForm = ref({
  email: '',
  real_name: '',
  student_tail: '',
  password: '',
  password2: '',
})
const regLoading = ref(false)
const regError = ref('')
const ucStudHead = '2027'
const randLoading = ref(false)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STUDENT_RE = /^\d{8}$/
const NAME_RE = /^[\u4e00-\u9fa5]+$/

const site = computed(() => settingStore.settings)

const redirectTo = () => {
  const redirect = (route.query.redirect as string) || '/me'
  router.push(redirect.startsWith('/') ? redirect : '/me')
}

const submitLogin = async () => {
  const username = loginForm.value.username.trim()
  const password = loginForm.value.password
  if (!username || !password) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  loginLoading.value = true
  try {
    const res: any = await userStore.loginByPassword({ username, password })
    if (res?.data?.token) {
      ElMessage.success('登录成功')
      redirectTo()
    }
  } finally {
    loginLoading.value = false
  }
}

// 注册
const randomStudentId = async () => {
  if (randLoading.value) return
  randLoading.value = true
  try {
    const res: any = await getAvailableStudentId()
    const sid = res?.data?.student_id
    if (sid) regForm.value.student_tail = String(sid).slice(-4)
    else ElMessage.error(res?.data?.message || '获取随机学号失败')
  } finally {
    randLoading.value = false
  }
}

const submitReg = async () => {
  const email = regForm.value.email.trim()
  const realName = regForm.value.real_name.trim()
  const studentTail = regForm.value.student_tail.trim()
  regError.value = ''
  if (!/^\d{4}$/.test(studentTail)) { regError.value = '学号后4位必须为数字'; return }
  const studentId = ucStudHead + studentTail
  if (!EMAIL_RE.test(email)) { regError.value = '请输入正确的邮箱'; return }
  if (!NAME_RE.test(realName)) { regError.value = '真实姓名须为纯中文'; return }
  if (!STUDENT_RE.test(studentId)) { regError.value = '学号须为8位数字'; return }
  if (!regForm.value.password || regForm.value.password.length < 8) { regError.value = '密码至少8位'; return }
  if (regForm.value.password !== regForm.value.password2) { regError.value = '两次输入的密码不一致'; return }

  regLoading.value = true
  try {
    const res: any = await registerUc({ email, real_name: realName, password: regForm.value.password, student_id: studentId })
    if (res?.status && res.status < 400) {
      ElMessage.success(res?.data?.message || '注册成功')
      loginForm.value = { username: email, password: regForm.value.password }
      tab.value = 'login'
    } else {
      regError.value = res?.data?.message || '注册失败，请稍后重试'
    }
  } catch (e: any) {
    regError.value = e?.data?.message || e?.message || '注册失败，请稍后重试'
  } finally {
    regLoading.value = false
  }
}

// OAuth
const handleOAuthLogin = async (oauth: any) => {
  if (!oauth.authorize_url_base) {
    ElMessage.error('该登录方式配置不完整')
    return
  }
  if (oauthLoading.value) return
  oauthLoading.value = oauth.type
  try {
    const codeVerifier = generateRandomString(64)
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    const state = generateRandomString(32)
    savePkceParams(codeVerifier, state)
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: oauth.client_id,
      redirect_uri: oauth.redirect_url,
      scope: oauth.scope || 'openid profile email',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })
    window.open(`${oauth.authorize_url_base}?${params.toString()}`, '_blank', 'width=520,height=640')
    setTimeout(() => {
      oauthLoading.value = 0
    }, 1500)
  } catch (e) {
    console.error('启动OAuth登录失败:', e)
    ElMessage.error('启动登录失败')
    oauthLoading.value = 0
  }
}

onMounted(async () => {
  loading.value = true
  try {
    if (!settingStore.settings.information) await settingStore.getSettings()
    const res: any = await getOauths()
    if (res.status === 200 && res.data.oauths) {
      oauths.value = res.data.oauths.filter((o: any) => o.enable)
    }
  } finally {
    loading.value = false
  }
})
</script>
