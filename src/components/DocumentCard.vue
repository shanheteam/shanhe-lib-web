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
  return (settings.value.system && settings.value.system.credit_name) || '魔豆'
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

<style lang="scss">
.com-document-card {
  width: 100%;

  .card-shell {
    display: flex;
    gap: 18px;
    padding: 5px;
  }

  .doc-cover {
    flex: 0 0 128px;
    width: 128px;
    display: block;
    background-color: $background-grey-light;
    padding: 12px 15px 3px 10px;
    border-radius: 8px;
  }

  .doc-title {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 10px;
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;

    img {
      width: 18px;
      height: 18px;
      margin-top: 2px;
      flex: 0 0 auto;
    }

    span {
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      word-break: break-word;
      width: 100%;
    }
  }

  .doc-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
    margin-bottom: 8px;
    color: var(--app-text-muted-soft);
    font-size: 13px;
    line-height: 1.6;

    span::after {
      content: '•';
      margin-left: 10px;
      color: var(--el-text-color-placeholder);
    }

    span:last-child::after {
      display: none;
    }
  }

  .doc-summary {
    color: var(--el-text-color-regular);
    font-size: 13px;
    line-height: 1.7;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    margin-bottom: 30px;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    margin-bottom: 4px;
  }

  .doc-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin-top: 10px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.5;
  }

  .stat-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    i {
      font-size: 13px;
      color: var(--app-text-muted-soft-3);
    }
  }

  .com-document-cover {
    width: 128px !important;
  }

  @media (max-width: 768px) {
    .card-shell {
      gap: 14px;
    }

    .doc-cover {
      flex-basis: 104px;
      width: 104px;
    }

    .com-document-cover {
      width: 104px !important;
    }
  }

  @media (max-width: 520px) {
    .card-shell {
      flex-direction: column;
    }

    .doc-cover {
      width: 116px;
      flex-basis: 116px;
    }

    .com-document-cover {
      width: 116px !important;
    }
  }
}
</style>