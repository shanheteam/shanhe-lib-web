<template>
  <div class="com-document-card">
    <div class="card-shell">
      <router-link
        :to="`/document/${document.uuid || document.id}`"
        class="doc-cover"
      >
        <document-cover :document="document" :lazy="false" :width="128" />
      </router-link>

      <div class="doc-main">
        <router-link
          :to="`/document/${document.uuid || document.id}`"
          class="doc-title el-link el-link--default"
        >
          <img
            v-if="document.id > 0"
            :src="`/static/images/${getIcon(document.ext)}_24.png`"
            :alt="`${formatLabel}文档`"
          />
          <span>{{ document.title }}</span>
        </router-link>

        <div class="doc-summary">{{ summaryText }}</div>

        <div class="doc-stats">
          <span class="stat-item">
            <el-icon><Coin /></el-icon>
            {{ document.price || 0 }} {{ creditName }}
          </span>
          <span class="stat-item">
            <el-icon><Document /></el-icon>
            {{ formatBytes(document.size) }}
          </span>
          <span class="stat-item">
            <el-icon><Files /></el-icon>
            {{ pageCount }} 页
          </span>
          <span
            v-if="settings.display.show_document_favorite_count"
            class="stat-item"
          >
            <el-icon><Star /></el-icon>
            {{ document.favorite_count || 0 }} 收藏
          </span>
          <span
            v-if="settings.display.show_document_download_count"
            class="stat-item"
          >
            <el-icon><Download /></el-icon>
            {{ document.download_count || 0 }} 下载
          </span>
          <span v-if="!isCommentClosed" class="stat-item">
            <el-icon><ChatDotSquare /></el-icon>
            {{ document.comment_count || 0 }} 评论
          </span>
          <span
            v-if="settings.display.show_document_view_count"
            class="stat-item"
          >
            <el-icon><View /></el-icon>
            {{ document.view_count || 0 }} 阅读
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingStore } from '@/store/setting'
import { DEFAULT_CREDIT_NAME } from '@/utils/credit'
import { formatBytes, getIcon } from '@/utils/utils'

defineOptions({ name: 'DocumentCard' })
const props = defineProps({
  document: {
    type: Object,
    default: () => ({}),
  },
})

const settingStore = useSettingStore()
const settings = computed(() => settingStore.settings)

const creditName = computed(() => {
  return (settings.value.system && settings.value.system.credit_name) || DEFAULT_CREDIT_NAME
})
const pageCount = computed(() => {
  return props.document.pages || '-'
})
const summaryText = computed(() => {
  return props.document.description || props.document.content || '暂无摘要'
})
const formatLabel = computed(() => {
  return ((props.document.ext || '').replace('.', '') || '文档').toUpperCase()
})
const isCommentClosed = computed(() => {
  return !!(settings.value.security && settings.value.security.close_comment)
})
</script>
