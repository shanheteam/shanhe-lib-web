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
          <form-login :redirect="redirect"></form-login>
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
                {{ oauth.name }} 登录
              </el-button>
            </div>
          </div>
        </div>
        <div style="margin-top: 20px; text-align: center">
          <router-link
            to="/findpassword"
            title="找回密码"
            class="el-link el-link--default"
            >找回密码</router-link
          >
          <el-link
            type="default"
            class="float-right"
            @click="showRegDialog = true"
            >注册账户</el-link
          >
        </div>
      </el-card>
    </div>

    <!-- 注册提示弹窗 -->
    <el-dialog v-model="showRegDialog" title="注册账号" width="420" :close-on-click-modal="true">
      <div style="text-align: center; padding: 10px 0">
        <p style="margin-bottom: 16px; color: #606266">
          山河大学图书馆不支持注册，请前往山河大学学籍系统注册。
        </p>
        <el-button type="primary" @click="goRegister">
          前往注册
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { assetUrl } from '@/utils/asset'
import { generateRandomString, generateCodeChallenge, savePkceParams } from '@/utils/pkce'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const settingStore = useSettingStore()

const user = computed(() => userStore.user)
const settings = computed(() => settingStore.settings)
const redirect = computed(() => (route.query.redirect as string) || '/me')

const oauths = ref<any[]>([])
const showRegDialog = ref(false)

const goRegister = () => {
  showRegDialog.value = false
  window.open('https://user.shanhe.co/?libreg', '_blank')
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

const handleOAuthLogin = async (oauth: any) => {
  // 生成 PKCE 参数
  const codeVerifier = generateRandomString(64)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateRandomString(32)

  // 保存到 sessionStorage，回调时使用
  savePkceParams(codeVerifier, state)

  // 构建授权 URL
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
</script>

<style lang="scss">
.page-login {
  width: 100%;
  margin-top: -20px;
  margin-bottom: -20px;
  background-size: cover !important;
  & > div {
    width: $default-width;
    margin: 0 auto;
  }
  .el-card {
    width: 520px;
    max-width: 100%;
    margin: 100px auto;
    margin-right: 0;
    &.close-box {
      margin-right: auto;
      width: 520px;
      .close-tips {
        margin-bottom: 20px;
        border: 1px dashed #f60;
        padding: 20px;
        border-radius: 4px;
        line-height: 180%;
        font-size: 15px;
      }
    }
  }
  .oauth-login-container {
    padding: 20px 0;
  }
  .oauth-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    .oauth-btn {
      width: 100%;
      height: 45px;
      font-size: 16px;
    }
  }
}
@media screen and (max-width: $mobile-width) {
  .page-login {
    background: none !important;
    & > div {
      width: 100%;
      margin: 0 auto;
    }
    .el-card {
      width: 100%;
      margin: 20px auto;
    }
  }
}
</style>
