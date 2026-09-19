<template>
  <div class="com-notice-board">
    <div class="text">
      <router-link
        class="notice-link"
        :to="{ path: '/article', query: { is_notice: 1 } }"
      >
        <el-icon><BellFilled /></el-icon>
        <span class="hidden-xs-only">网站公告</span>
      </router-link>
    </div>
    <el-carousel
      class="notice-carousel"
      :interval="interval"
      :height="height"
      direction="vertical"
      indicator-position="none"
      arrow="never"
    >
      <el-carousel-item v-for="item in notices" :key="'mb-' + item.id">
        <router-link
          class="notice-item-link"
          :to="`/article/${item.identifier}`"
          target="_blank"
        >
          {{ item.title }}
        </router-link>
        <span class="notice-datetime">{{ formatDate(item.updated_at) }}</span>
      </el-carousel-item>
    </el-carousel>
    <router-link
      class="notice-more"
      :to="{ path: '/article', query: { is_notice: 1 } }"
    >
      <small
        >更多 <el-icon><DArrowRight /></el-icon
      ></small>
    </router-link>
  </div>
</template>
<script setup lang="ts">
import { BellFilled, DArrowRight } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/utils'

defineOptions({ name: 'NoticeBoard' })

withDefaults(
  defineProps<{
    notices?: any[]
    height?: string
    interval?: number
  }>(),
  {
    notices: () => [],
    height: '50px',
    interval: 3000,
  }
)
</script>
