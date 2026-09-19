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
<style lang="scss" scoped>
.com-article-simple-list {
  ul,
  li {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    a {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 40px;
      height: 40px;
      border-bottom: 1px dashed var(--app-border-color-light);
      img {
        height: 18px;
        position: relative;
        top: 3px;
        margin-right: 5px;
      }
    }
    &:last-of-type {
      a {
        border-bottom: none;
      }
    }
  }
}
</style>