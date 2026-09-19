<template>
  <div class="com-article-simple-list">
    <ul>
      <li v-for="article in articles" :key="'article-' + article.id">
        <el-tooltip :content="article.title" placement="left">
          <router-link
            :to="`/article/${article.identifier}`"
            class="el-link el-link--default"
            target="_blank"
          >
            {{ article.title }}
          </router-link>
        </el-tooltip>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
defineOptions({ name: 'ArticleSimpleList' })
defineProps({
  articles: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  target: {
    type: String,
    default: '',
  },
})
</script>
