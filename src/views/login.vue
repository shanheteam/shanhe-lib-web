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
          <div v-html="settings.security.close_statement"></div>
        </div>
        <div v-if="!(user.id > 0 && settings.security.is_close)" class="oauth-login-container">
          <div v-if="loading" style="text-align: center; padding: 40px 0">
            <el-icon class="is-loading" :size="30"><Loading /></el-icon>
            <p style="margin-top: 10px; color: #666">加载中...</p>
          </div>
          <div v-else-if="oauths.length === 0" style="text-align: center; padding: 40px 0; color: #999">
            暂无可用的登录方式
          </div>
          <div v-else class="oauth-list">
            <p style="text-align: center; color: #666; margin-bottom: 20px">请选择登录方式</p>
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
        <div style="margin-top: 20px; text-align: center">
          <router-link
            to="/findpassword"
            title="找回密码"
            class="el-link el-link--default"
            >找回密码</router-link
          >
          <router-link
            :to="{ name: 'register', query: { redirect } }"
            title="注册账户"
            class="el-link el-link--default float-right"
            >注册账户</router-link
          >
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { assetUrl } from '@/utils/asset'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const settingStore = useSettingStore()

const user = computed(() => userStore.user)
const settings = computed(() => settingStore.settings)
const redirect = computed(() => (route.query.redirect as string) || '/me')

const oauths = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res: any = await userStore.getOauths()
    if (res.status === 200 && res.data.oauths) {
      oauths.value = res.data.oauths.filter((o: any) => o.enable)
    }
  } catch (e) {
    console.error('获取OAuth配置失败:', e)
  } finally {
    loading.value = false
  }
})

const handleOAuthLogin = (oauth: any) => {
  if (oauth.authorize_url) {
    window.location.href = oauth.authorize_url
  }
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