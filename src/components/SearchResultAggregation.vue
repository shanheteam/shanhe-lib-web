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
            <span v-safe-html="doc.title"></span>
          </router-link>
        </h3>
        <div class="doc-desc" v-safe-html="doc.description"></div>
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
