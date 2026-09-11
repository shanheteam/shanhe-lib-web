<template>
  <div class="com-search-result-aggregation">
    <ul>
      <li v-if="docs.length === 0">
        <el-empty description="很遗憾，未能检索到相关结果"></el-empty>
      </li>
      <li v-for="doc in docs" :key="'doc-' + doc.doc_type + '-' + doc.id">
        <h3 class="doc-title">
          <router-link
            target="_blank"
            :to="
              doc.doc_type === 1
                ? `/article/${doc.identifier}`
                : `/document/${doc.identifier}`
            "
            class="el-link el-link--primary"
          >
            <img
              v-if="doc.ext"
              :src="`/static/images/${getIcon(doc.ext)}_24.png`"
              :alt="`${getIcon(doc.ext)}文档`"
            />
            <el-icon v-else><Tickets /></el-icon>
            <span v-html="doc.title"></span>
          </router-link>
        </h3>
        <div class="doc-desc" v-html="doc.description"></div>
        <div class="doc-info">
          <el-icon><Clock /></el-icon> {{ formatRelativeTime(doc.created_at) }}
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import type { PropType } from 'vue'
import { Tickets, Clock } from '@element-plus/icons-vue'
import { getIcon, formatRelativeTime } from '@/utils/utils'

defineOptions({ name: 'SearchResultAggregation' })
defineProps({
  docs: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
})
</script>
<style lang="scss" scoped>
ul,
li {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  padding-top: 20px;
  &:first-of-type {
    padding-top: 0;
  }
}
h3 {
  margin-bottom: 10px;
  :deep(.el-link) {
    font-size: 18px;
    font-weight: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    gap: 4px;
    img {
      height: 18px;
      position: relative;
      top: 2px;
    }
    .el-icon {
      font-size: 18px;
    }
  }
}
.doc-desc {
  font-size: 14px;
  color: #6b7a88;
  line-height: 180%;
  word-break: break-all;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  max-height: 81px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}
.doc-info {
  color: #bdc3c7;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  .el-icon {
    font-size: 13px;
  }
}
</style>