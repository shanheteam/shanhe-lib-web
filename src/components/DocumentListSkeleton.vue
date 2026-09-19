<template>
  <div class="com-document-list">
    <el-skeleton animated>
      <template #template>
        <ul>
          <li v-for="i in 1" :key="i">
            <el-row :gutter="20">
              <el-col
                :span="
                  !settings.display.hide_keywords_on_lists || isMobile ? 4 : 3
                "
                class="doc-cover"
              >
                <el-skeleton-item
                  variant="image"
                  :style="
                    isMobile
                      ? `width: 100%; height: 120px`
                      : `width: 100%; height: 178px`
                  "
                />
              </el-col>
              <el-col
                :span="
                  !settings.display.hide_keywords_on_lists || isMobile ? 20 : 21
                "
              >
                <el-skeleton-item variant="h1" style="width: 70%" />
                <div class="doc-info">
                  <el-skeleton-item variant="text" style="width: 20%" />
                  <el-skeleton-item
                    variant="text"
                    style="width: 45%; float: right"
                  />
                </div>
                <div class="doc-desc">
                  <el-skeleton-item variant="text" style="width: 100%" />
                  <el-skeleton-item variant="text" style="width: 100%" />
                  <el-skeleton-item variant="text" style="width: 45%" />
                </div>
              </el-col>
            </el-row>
          </li>
        </ul>
      </template>
    </el-skeleton>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useSettingStore } from '@/store/setting'

defineProps({
  rows: {
    type: Number,
    default: 4,
  },
})

const settingStore = useSettingStore()
const settings = computed(() => settingStore.settings)
</script>
