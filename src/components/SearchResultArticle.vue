<template>
  <div class="com-search-result-article">
    <ul>
      <li v-if="articles.length === 0">
        <el-empty description="很遗憾，未能检索到相关结果"></el-empty>
      </li>
      <li v-for="article in articles" :key="'article-' + article.id">
        <h3 class="article-title">
          <router-link
            target="_blank"
            :to="`/article/${article.identifier || article.id}`"
            class="el-link el-link--primary"
          >
            {{ article.title }}
          </router-link>
        </h3>
        <div class="article-desc">{{ article.description }}</div>
        <div class="article-info">
          <span class="hidden-xs-only"
            ><el-icon><Clock /></el-icon>
            {{ formatRelativeTime(article.created_at) }}</span
          >
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import type { PropType } from 'vue'
import { formatRelativeTime } from '@/utils/utils'

defineOptions({ name: 'SearchResultArticle' })
defineProps({
  articles: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
})
</script>
