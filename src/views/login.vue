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
          <template v-if="!showReg">
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
          </template>
          <!-- 注册模式：内联注册表单（与登录弹窗的 uc-reg-form 一致） -->
          <template v-else>
            <div class="uc-reg-form">
              <el-divider>山河大学账号注册</el-divider>
              <div v-if="regError" class="uc-reg-error">{{ regError }}</div>
              <el-input v-model="regForm.email" placeholder="邮箱" clearable />
              <el-input v-model="regForm.real_name" placeholder="真实姓名（纯中文）" clearable />
              <div class="uc-reg-stud">
                <span class="uc-reg-head">{{ ucStudHead }}</span>
                <el-input v-model="regForm.student_tail" placeholder="后4位" maxlength="4" clearable @keyup.enter="submitReg" />
                <el-button class="uc-reg-random" :loading="randLoading" @click="randomStudentId">随机学号</el-button>
              </div>
              <el-input v-model="regForm.password" type="password" show-password placeholder="密码（至少8位）" />
              <el-input v-model="regForm.password2" type="password" show-password placeholder="确认密码" @keyup.enter="submitReg" />
              <el-button type="primary" class="uc-reg-submit" :loading="regLoading" @click="submitReg">注册</el-button>
            </div>
          </template>
        </div>
        <div style="margin-top: 20px; text-align: center">
          <el-link
            v-if="!showReg"
            type="default"
            class="float-right"
            @click="showReg = true"
            >注册账户</el-link
          >
          <el-link v-else type="default" class="float-right" @click="showReg = false"
            >已有账号？立即登录</el-link
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
import { passwordLogin, registerUc, getAvailableStudentId } from '@/api/oauth'
import { OAUTH_TYPE_CUSTOM } from '@/utils/oauth'

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

// 注册模式：登录表单与注册表单互斥切换
const showReg = ref(false)

// 内联注册表单 state/校验（与登录弹窗 uc-reg-form 一致）
const regForm = ref<{
  email: string
  real_name: string
  student_tail: string
  password: string
  password2: string
}>({ email: '', real_name: '', student_tail: '', password: '', password2: '' })
const regLoading = ref(false)
const regError = ref('')
const randLoading = ref(false)
const ucStudHead = '2027'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STUDENT_RE = /^\d{8}$/
const NAME_RE = /^[\u4e00-\u9fa5]+$/

const randomStudentId = async () => {
  if (randLoading.value) return
  randLoading.value = true
  try {
    const res: any = await getAvailableStudentId()
    const sid = res?.data?.student_id
    if (sid) {
      regForm.value.student_tail = String(sid).slice(-4)
    } else {
      ElMessage.error(res?.data?.message || '获取随机学号失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.data?.message || e?.message || '获取随机学号失败')
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
  const password = regForm.value.password
  const password2 = regForm.value.password2
  if (!EMAIL_RE.test(email)) { regError.value = '请输入正确的邮箱'; return }
  if (!NAME_RE.test(realName)) { regError.value = '真实姓名须为纯中文'; return }
  if (!STUDENT_RE.test(studentId)) { regError.value = '学号须为8位数字'; return }
  if (!password || password.length < 8) { regError.value = '密码至少8位'; return }
  if (password !== password2) { regError.value = '两次输入的密码不一致'; return }

  regLoading.value = true
  try {
    const res: any = await registerUc({ email, real_name: realName, password, student_id: studentId })
    // 成功仅当 2xx（拦截器会把 4xx/5xx 与网络错误转为 { status, data }，status=0 表示网络层失败）
    const ok = res?.status && res.status < 400
    if (!ok) {
      const detail =
        res?.data?.message ||
        res?.data?.msg ||
        res?.data?.error ||
        res?.message ||
        (res?.status === 0 ? '网络错误，请检查网络后重试' : '注册失败，请稍后重试')
      regError.value = res?.status === 429 ? '注册过于频繁，请24小时后再试' : detail
      console.error('[OAuth] register failed:', res)
      return
    }
    ElMessage.success(res?.data?.message || '注册成功')
    // 填入登录表单并切换，方便直接登录
    ucForm.value = { username: email, password }
    showReg.value = false
    regForm.value = { email: '', real_name: '', student_tail: '', password: '', password2: '' }
  } catch (e: any) {
    const detail =
      e?.data?.message ||
      e?.data?.msg ||
      e?.data?.error ||
      e?.message ||
      (e?.status === 0 ? '网络错误，请检查网络后重试' : '注册失败，请稍后重试')
    regError.value = e?.status === 429 ? '注册过于频繁，请24小时后再试' : detail
    console.error('[OAuth] register error:', e)
  } finally {
    regLoading.value = false
  }
}

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
