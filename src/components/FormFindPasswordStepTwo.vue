<template>
  <div class="com-form-find-password-step-two">
    <el-form label-position="top" label-width="80px" :model="user">
      <el-form-item label="电子邮箱">
        <el-input
          v-model="user.email"
          placeholder="请输入您注册账户时的电子邮箱"
          :disabled="true"
        ></el-input>
      </el-form-item>
      <el-form-item label="账户密码">
        <el-input
          v-model="user.password"
          type="password"
          placeholder="请输入您的账户新密码"
        ></el-input>
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input
          v-model="user.repassword"
          type="password"
          placeholder="请再次输入您的账户新密码"
        ></el-input>
      </el-form-item>
      <el-form-item v-if="captcha.enable" label="验证码">
        <div v-if="captcha.type == 'audio'">
          <el-row :gutter="15">
            <el-col :span="20">
              <audio :controls="true" :src="captcha.captcha"></audio>
            </el-col>
            <el-col :span="4">
              <el-tooltip placement="top" content="刷新语音验证码">
                <el-button
                  icon="Refresh"
                  class="btn-audio-refresh"
                  @click="loadCaptcha"
                ></el-button>
              </el-tooltip>
            </el-col>
          </el-row>
        </div>
        <div v-else>
          <el-tooltip placement="right" content="点击可刷新验证码">
            <img :src="captcha.captcha" class="pointer" @click="loadCaptcha" />
          </el-tooltip>
        </div>
        <el-input v-model="user.captcha" placeholder="请输入验证码"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="Check"
          :loading="loading"
          :disabled="disabled"
          @click="execFindPassword"
          >立即提交</el-button
        >
        <router-link to="/register" title="" class="el-link el-link--default"
          >注册账户</router-link
        >
        <router-link
          to="/login"
          title="登录账户"
          class="el-link el-link--default float-right"
          >登录账户</router-link
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserCaptcha, findPasswordStepTwo } from '@/api/user'
import { useSettingStore } from '@/store/setting'

defineOptions({ name: 'FormFindPasswordStepTwo' })
defineProps({
  redirect: {
    type: String,
    default: '',
  },
})

const route = useRoute()
const router = useRouter()
const settingStore = useSettingStore()
const settings = computed(() => settingStore.settings)

const user = ref<Record<string, any>>({
  email: '',
  token: '',
  password: '',
  repassword: '',
  captcha: '',
  captcha_id: '',
})
const captcha = ref<Record<string, any>>({
  enable: false,
  captcha: '/static/images/touch-captcha.png',
  type: 'image',
})
const loading = ref(false)
const disabled = ref(false)

user.value.token = route.query.token as string
user.value.email = route.query.email as string
if (settings.value.security.enable_captcha_find_password) {
  captcha.value.enable = true
}

const execFindPassword = async () => {
  loading.value = true
  const target = { ...user.value }
  if (target.password !== target.repassword) {
    ElMessage.error('两次输入的密码不一致')
    loading.value = false
    return
  }
  delete target.repassword
  const res: any = await findPasswordStepTwo(target)
  if (res.status === 200) {
    ElMessage.success('设置成功，请用新密码重新登录')
    router.push('/login')
    disabled.value = true
  } else {
    loadCaptcha()
    ElMessage.error(res.data.message || '请求失败')
  }
  loading.value = false
}
const loadCaptcha = async () => {
  const res: any = await getUserCaptcha({ type: 'find_password', t: Date.now() })
  if (res.data.enable) {
    user.value = {
      ...user.value,
      captcha_id: res.data.id,
    }
    captcha.value = res.data
  }
}
</script>
<style scoped>
.btn-audio-refresh {
  vertical-align: -webkit-baseline-middle;
}
</style>