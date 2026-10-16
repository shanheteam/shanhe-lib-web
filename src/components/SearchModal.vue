<template>
  <div
    class="search-modal-overlay"
    :class="{ show: modelValue }"
    @click="close"
  >
    <div class="search-modal" @click.stop>
      <div class="search-modal-header">
        <h3>搜索</h3>
        <button class="close-btn" type="button" @click="close">
          <el-icon><Close /></el-icon>
        </button>
      </div>
      <div class="search-modal-body">
        <el-input
          ref="searchModalInput"
          v-model="wd"
          class="search-modal-input"
          size="large"
          :placeholder="placeholder"
          @keydown.enter="onSearch"
        >
          <template #prefix>
            <el-icon class="el-input__icon"><Search /></el-icon>
          </template>
        </el-input>
        <el-button
          type="primary"
          class="search-submit-btn"
          :disabled="!wd"
          :icon="Search"
          @click="onSearch"
        >
          搜索
        </el-button>
      </div>
      <div class="search-modal-footer">按 Enter 键快速搜索</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Close, Search } from '@element-plus/icons-vue'

defineOptions({ name: 'SearchModal' })

const props = defineProps<{
  modelValue: boolean
  placeholder?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'search', wd: string): void
}>()

const wd = ref('')
const searchModalInput = ref<any>()

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) return
    wd.value = ''
    nextTick(() => {
      setTimeout(() => {
        searchModalInput.value?.focus()
      }, 300)
    })
  },
)

const close = () => {
  emit('update:modelValue', false)
}

const onSearch = () => {
  const keyword = (wd.value || '').trim()
  if (!keyword) return
  emit('update:modelValue', false)
  emit('search', keyword)
}
</script>