<template>
  <div class="com-form-login">
    <el-form label-position="top" label-width="80px" :model="user">
      <el-form-item label="邮箱">
        <el-input
          v-model="user.email"
          placeholder="请输入您的邮箱"
        ></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input
          v-model="user.password"
          placeholder="请输入您的登录密码"
          type="password"
          @keydown.enter="execLogin"
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
          @click="execLogin"
          :loading="loading"
          >立即登录</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserCaptcha } from '@/api/user'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'

defineOptions({ name: 'FormLogin' })
const props = defineProps({
  redirect: {
    type: String,
    default: '',
  },
})

const router = useRouter()
const userStore = useUserStore()
const settingStore = useSettingStore()
const settings = computed(() => settingStore.settings)

const user = ref<Record<string, any>>({
  email: '',
  password: '',
  captcha: '',
  captcha_id: '',
})
const captcha = ref<Record<string, any>>({
  enable: false,
  captcha: '/static/images/touch-captcha.png',
  type: 'image',
})
const loading = ref(false)

if (settings.value.security.enable_captcha_login) captcha.value.enable = true

const execLogin = async () => {
  loading.value = true
  const res: any = await userStore.login(user.value)
  if (res.status === 200) {
    ElMessage.success('登录成功')
    if (props.redirect) {
      router.push(props.redirect)
    } else {
      router.push({ name: 'index' })
    }
  } else {
    loadCaptcha()
  }
  loading.value = false
}

const loadCaptcha = async () => {
  const res: any = await getUserCaptcha({ type: 'login', t: Date.now() })
  if (res.data.enable) {
    user.value = {
      ...user.value,
      captcha_id: res.data.id,
    }
    captcha.value = res.data
  }
}
</script>
<style scoped lang="scss">
.btn-audio-refresh {
  vertical-align: -webkit-baseline-middle;
}
</style>