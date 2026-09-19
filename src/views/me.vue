<template>
  <div class="page page-me">
    <el-row :gutter="20">
      <el-col :span="6" class="part-left">
        <el-card shadow="never">
          <user-card :user="user" :hide-latest="true" />
          <el-row v-if="!isMobile" :gutter="10">
            <el-col :span="12">
              <router-link to="/upload">
                <el-button
                  type="primary"
                  class="btn-block mgt-20px"
                >
                  <el-icon><UploadFilled /></el-icon>上传文档
                </el-button>
              </router-link>
            </el-col>
            <el-col :span="12">
              <router-link to="/post">
                <el-button
                  type="primary"
                  class="btn-block mgt-20px"
                >
                  <el-icon><Plus /></el-icon>发布文章
                </el-button>
              </router-link>
            </el-col>
          </el-row>
          <el-tabs
            v-if="isMobile"
            v-model="defaultActive.value"
            class="mgt-20px"
            type="card"
            @tab-click="tabClick"
          >
            <el-tab-pane
              v-for="item in tabs"
              :key="item.value"
              :name="item.value"
              :label="item.label"
            >
              <template #label>
                <i v-if="item.fa" :class="item.icon"></i>
                <el-icon v-else><component :is="item.icon" /></el-icon>
                {{ item.label }}
              </template>
            </el-tab-pane>
          </el-tabs>
          <el-menu
            v-else
            class="mgt-20px"
            :router="true"
            :default-active="defaultActive.value"
          >
            <el-menu-item
              v-for="item in tabs"
              :key="item.value"
              :index="item.value"
            >
              <i v-if="item.fa" :class="item.icon"></i>
              <el-icon v-else><component :is="item.icon" /></el-icon>
              <template #title>{{ item.label }}</template>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      <el-col :span="18" class="part-right">
        <el-card shadow="never">
          <template #header>{{ defaultActive.label }}</template>
          <div class="nuxt-child">
            <router-view />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const user = computed(() => userStore.user)

const defaultActive = reactive({
  value: '/me',
  label: '我的动态',
})
const tabs = [
  {
    label: '我的动态',
    value: '/me',
    icon: 'MagicStick',
  },
  {
    label: '我的上传',
    value: '/me/document',
    icon: 'Document',
  },
  {
    label: '我的文章',
    value: '/me/article',
    icon: 'Tickets',
  },
  {
    label: '我的收藏',
    value: '/me/favorite',
    icon: 'Star',
  },
  {
    label: '我的下载',
    value: '/me/download',
    icon: 'Download',
  },
  {
    label: '资料设置',
    value: '/me/profile',
    icon: 'fa fa-shield',
    fa: true,
  },
]

watch(
  () => route.path,
  (val) => {
    // val 去掉最后的斜杠
    const path = val.replace(/\/$/, '')
    const item = tabs.find((it) => it.value === path)
    defaultActive.value = path
    defaultActive.label = item?.label || '我的动态'
  },
  { immediate: true }
)

const tabClick = (tab: any) => {
  const name = tab?.paneName ?? tab?.props?.name
  defaultActive.value = name
  defaultActive.label = tab?.props?.label
  router.push(name)
}
</script>
