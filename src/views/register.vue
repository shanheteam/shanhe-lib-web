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
