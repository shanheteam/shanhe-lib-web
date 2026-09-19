<template>
  <div class="com-form-find-password-step-one">
    <el-form label-position="top" label-width="80px" :model="user">
      <el-form-item label="电子邮箱">
        <el-input
          v-model="user.email"
          placeholder="请输入您注册账户时的电子邮箱"
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
          @click="execFindPassword"
          :loading="loading"
          :disabled="disabled"
          >立即提交</el-button
        >
        <el-link type="default" @click="showRegDialog = true">注册账户</el-link>
        <router-link
          to="/login"
          title="登录账户"
          class="el-link el-link--default float-right"
          >登录账户</router-link
        >
      </el-form-item>
    </el-form>

    <!-- 注册提示弹窗 -->
    <el-dialog v-model="showRegDialog" title="注册账号" width="420" :close-on-click-modal="true">
      <div style="text-align: center; padding: 10px 0">
        <p style="margin-bottom: 16px; color: var(--el-text-color-regular)">
          山河大学图书馆不支持注册，请前往山河大学学籍系统注册。
        </p>
        <el-button type="primary" @click="goRegister">前往注册</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserCaptcha, findPasswordStepOne } from '@/api/user'
import { useSettingStore } from '@/store/setting'

defineOptions({ name: 'FormFindPasswordStepOne' })
defineProps({
  redirect: {
    type: String,
    default: '',
  },
})

const settingStore = useSettingStore()
const settings = computed(() => settingStore.settings)

const user = ref<Record<string, any>>({
  email: '',
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
const showRegDialog = ref(false)

const goRegister = () => {
  showRegDialog.value = false
  window.open('https://user.shanhe.co/?libreg', '_blank')
}

if (settings.value.security.enable_captcha_find_password) {
  captcha.value.enable = true
}

const execFindPassword = async () => {
  loading.value = true
  const res: any = await findPasswordStepOne(user.value)
  if (res.status === 200) {
    ElMessage.success('提交成功，请查看您的邮箱')
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
