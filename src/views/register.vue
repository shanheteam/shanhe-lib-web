<template>
  <div
    class="page page-register"
    :style="
      settings.system.register_background
        ? 'background:url(' +
          assetUrl(settings.system.register_background) +
          ') no-repeat center center'
        : ''
    "
  >
    <div>
      <el-card shadow="never">
        <template #header>
          <div class="clearfix">
            <span>用户注册</span>
          </div>
        </template>
        <form-register :redirect="redirect" />
        <router-link to="/findpassword" class="el-link el-link--default"
          >找回密码</router-link
        >
        <router-link
          :to="{ name: 'login', query: { redirect } }"
          class="el-link el-link--default float-right"
          >马上登录</router-link
        >
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingStore } from '@/store/setting'
import { assetUrl } from '@/utils/asset'

const route = useRoute()
const settingStore = useSettingStore()

const settings = computed(() => settingStore.settings)
const redirect = computed(() => (route.query.redirect as string) || '/me')
</script>

<style lang="scss">
.page-register {
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
  }
}

@media screen and (max-width: $mobile-width) {
  .page-register {
    background: none !important;
    & > div {
      width: 100%;
      margin: 0;
    }
    .el-card {
      width: 100%;
      margin: 20px 0;
    }
  }
}
</style>