<template>
  <div class="com-document-list">
    <ul>
      <li v-for="doc in documents" :key="'doc-' + doc.id">
        <el-row :gutter="20">
          <el-col
            :span="!settings.display.hide_keywords_on_lists || isMobile ? 4 : 3"
            class="doc-cover"
          >
            <router-link :to="`/document/${doc.uuid || doc.id}`" target="_blank">
              <document-cover :document="doc" />
            </router-link>
          </el-col>
          <el-col
            :span="
              !settings.display.hide_keywords_on_lists || isMobile ? 20 : 21
            "
          >
            <h3>
              <router-link
                target="_blank"
                :to="`/document/${doc.uuid || doc.id}`"
                class="el-link el-link--primary hover-link-imp"
                ><img
                  :src="`/static/images/${getIcon(doc.ext)}_24.png`"
                  :alt="`${getIcon(doc.ext)} 文档`"
                />
                {{ doc.title }}
                <img
                  v-if="doc.recommend_at"
                  src="/static/images/recommend.png"
                  alt="推荐"
                />
              </router-link>
            </h3>
            <div class="doc-info">
              <span>
                {{ doc.price || 0 }}
                {{ settings.system.credit_name || '魔豆' }}
                <span class="line">|</span> {{ doc.pages || '-' }} 页
                <span class="line">|</span>
                {{ formatBytes(doc.size) || '-' }}
                <span
                  ><span class="line">|</span>
                  {{ formatRelativeTime(doc.created_at) }}</span
                ></span
              >
              <el-rate
                v-model="doc.score"
                disabled
                class="float-right hidden-xs-only"
                show-score
                text-color="var(--app-color-tag-warning)"
                score-template="{value}"
              >
              </el-rate>
            </div>
            <div class="doc-desc">
              {{ doc.description }}
            </div>
          </el-col>
        </el-row>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import { useSettingStore } from '@/store/setting'
import { formatBytes, formatRelativeTime, getIcon } from '@/utils/utils'

defineOptions({ name: 'DocumentList' })
defineProps({
  documents: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
})

const settingStore = useSettingStore()
const settings = computed(() => settingStore.settings)
</script>
