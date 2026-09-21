<template>
  <div class="com-search-result-document">
    <ul>
      <li v-if="docs.length === 0">
        <el-empty description="很遗憾，未能检索到相关结果"></el-empty>
      </li>
      <li v-for="doc in docs" :key="'doc-' + doc.id">
        <h3 class="doc-title">
          <router-link
            target="_blank"
            :to="`/document/${doc.uuid || doc.id}`"
            class="el-link el-link--primary"
          >
            <img
              :src="`/static/images/${doc.icon}_24.png`"
              :alt="`${doc.icon}文档`"
            />
            {{ doc.title }}
          </router-link>
        </h3>
        <div class="doc-desc">{{ doc.description }}</div>
        <div class="doc-info">
          <span
            >{{ doc.price || 0 }} {{ creditName(settings) }} |
            {{ doc.pages || '-' }} 页 |
            {{ formatBytes(doc.size) }}
            <span class="hidden-xs-only"
              >| {{ formatRelativeTime(doc.created_at) }}</span
            ></span
          >
          <el-rate
            v-model="doc.score"
            disabled
            show-score
            text-color="var(--app-color-tag-warning)"
            score-template="{value}"
            class="float-right"
          >
          </el-rate>
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import { formatBytes, formatRelativeTime } from '@/utils/utils'
import { useSettingStore } from '@/store/setting'
import { creditName } from '@/utils/credit'

defineOptions({ name: 'SearchResultDocument' })
defineProps({
  docs: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
})

const settingStore = useSettingStore()
const settings = computed(() => settingStore.settings)
</script>
