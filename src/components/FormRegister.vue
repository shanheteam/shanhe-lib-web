<template>
  <div class="com-form-register">
    <el-form
      ref="formRegister"
      label-position="left"
      label-width="100px"
      :model="user"
    >
      <el-form-item
        label="电子邮箱"
        prop="email"
        :rules="[
          {
            required: true,
            message: '请输入您的邮箱地址，以便忘记密码时找回',
            trigger: 'blur',
          },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="user.email"
          placeholder="请输入您的邮箱地址，以便忘记密码时找回"
        >
          <template #append>
            <el-button
              v-if="settings.security.enable_verify_register_email"
              :disabled="leftSeconds > 0"
              icon="Message"
              @click="sendEmailCode"
            >
              <template v-if="leftSeconds > 0"
                >剩余 {{ leftSeconds }} 秒</template
              >
              <template v-else>获取邮箱验证码</template>
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        label="登录密码"
        prop="password"
        :rules="[
          {
            required: true,
            message: '请输入您的登录密码',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="user.password"
          placeholder="请输入您的登录密码"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="确认密码"
        prop="repeat_password"
        :rules="[
          {
            required: true,
            message: '请再次输入您的登录密码',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="user.repeat_password"
          placeholder="请再次输入您的登录密码"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item
        v-if="captcha.enable"
        label="验证码"
        prop="captcha"
        :rules="[
          {
            required: true,
            message: '请输入验证码',
            trigger: 'blur',
          },
        ]"
      >
        <el-row :gutter="0">
          <el-col :span="12">
            <el-input
              v-model="user.captcha"
              placeholder="请输入验证码"
            ></el-input>
          </el-col>
          <el-col :span="12">
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
                <img
                  :src="captcha.captcha"
                  class="pointer"
                  style="height: 40px; margin-left: 5px"
                  @click="loadCaptcha"
                />
              </el-tooltip>
            </div>
          </el-col>
        </el-row>
      </el-form-item>
      <!-- 邮箱验证码 -->
      <el-form-item
        v-if="settings.security.enable_verify_register_email"
        label="邮箱验证码"
        prop="code"
        :rules="[
          {
            required: true,
            message: '请输入邮箱验证码',
            trigger: 'blur',
          },
        ]"
      >
        <el-input v-model="user.code" placeholder="请输入邮箱验证码"></el-input>
      </el-form-item>
      <el-form-item class="register">
        <el-alert
          v-if="
            settings && settings.security && !settings.security.enable_register
          "
          title="网站暂未开放用户注册"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 10px"
        ></el-alert>
        <el-button
          type="primary"
          class="btn-block btn-register"
          icon="Check"
          :disabled="
            settings && settings.security && !settings.security.enable_register
          "
          :loading="loading"
          @click="execRegister"
          >立即注册</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserCaptcha, sendEmailCode as sendEmailCodeApi } from '@/api/user'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'

defineOptions({ name: 'FormRegister' })
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

const formRegister = ref<any>()
const user = ref<Record<string, any>>({
  email: '',
  password: '',
  repeat_password: '',
  captcha: '',
  captcha_id: '',
  code: '',
})
const captcha = ref<Record<string, any>>({
  enable: false,
  captcha: '/static/images/touch-captcha.png',
  type: 'image',
})
const loading = ref(false)
const leftSeconds = ref(0)
let timer: any = null

if (settings.value.security.enable_captcha_register) captcha.value.enable = true

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const execRegister = () => {
  formRegister.value.validate(async (valid: boolean) => {
    if (valid) {
      const target = { ...user.value }
      if (target.password !== target.repeat_password) {
        ElMessage.error('两次输入的密码不一致')
        return
      }
      delete target.repeat_password

      loading.value = true
      const res: any = await userStore.register(target)
      if (res.status === 200) {
        ElMessage.success('注册成功')
        if (props.redirect) {
          router.replace(props.redirect)
        } else {
          router.replace({ name: 'index' })
        }
      } else {
        loadCaptcha()
      }
      loading.value = false
    }
  })
}

const loadCaptcha = async () => {
  const res: any = await getUserCaptcha({ type: 'register', t: Date.now() })
  if (res.data.enable) {
    user.value = {
      ...user.value,
      captcha_id: res.data.id,
    }
    captcha.value = res.data
  }
}

const sendEmailCode = async () => {
  if (!user.value.email) {
    ElMessage.error('请输入邮箱地址')
    return
  }

  if (!user.value.captcha) {
    ElMessage.error('请输入验证码')
    return
  }

  const res: any = await sendEmailCodeApi({
    email: user.value.email,
    captcha_id: user.value.captcha_id,
    captcha: user.value.captcha,
  })
  if (res.status === 200) {
    ElMessage.success('验证码发送成功')
    leftSeconds.value = 60
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
      leftSeconds.value--
      if (leftSeconds.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } else {
    ElMessage.error(res.data.message || '请求失败')
  }
}
</script>
<style lang="scss">
.com-form-register {
  .btn-audio-refresh {
    vertical-align: -webkit-baseline-middle;
  }
  .register {
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
}
</style>