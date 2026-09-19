<template>
  <div class="com-article-list">
    <ul v-if="articles.length > 0">
      <li v-for="article in articles" :key="'article-' + article.id">
        <h3>
          <router-link
            :to="`/article/${article.identifier}`"
            class="el-link el-link--default"
            target="_blank"
            >{{ article.title }}
            <img
              v-if="article.recommend_at"
              src="/static/images/recommend.png"
              alt="推荐"
              class="min-recommend"
          /></router-link>
        </h3>
        <div class="info">
          <span v-if="article.user_id" class="author">
            <router-link
              :to="`/user/${article.user_id}`"
              class="el-link el-link--default font-normal author"
              target="_blank"
              ><el-avatar
                :size="16"
                class="avatar"
                :src="assetUrl(article.user && article.user.avatar)"
              ></el-avatar
              >{{ article.user && (article.user.realname || '未命名用户') }}</router-link
            >
          </span>
          <span class="text-muted">·</span>
          <span
            ><el-icon><Clock /></el-icon
            >{{ formatRelativeTime(article.created_at) }}</span
          >
        </div>
        <div class="desc">
          {{ article.description }}
        </div>
        <div class="info">
          <span
            ><el-icon><View /></el-icon>
            {{ article.view_count || 0 }} 阅读</span
          >
          <span>
            <el-icon><Star /></el-icon>
            {{ article.favorite_count || 0 }} 收藏
          </span>
          <span>
            <el-icon><ChatDotSquare /></el-icon>
            {{ article.comment_count || 0 }} 评论
          </span>
        </div>
      </li>
    </ul>
    <div v-else>
      <el-empty></el-empty>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { PropType } from 'vue'
import { formatRelativeTime } from '@/utils/utils'
import { assetUrl } from '@/utils/asset'

defineProps({
  articles: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  withDescription: {
    type: Boolean,
    default: false,
  },
  withHtml: {
    type: Boolean,
    default: false,
  },
})
</script>
