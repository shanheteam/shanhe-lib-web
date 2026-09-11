<template>
  <el-tooltip class="item" effect="dark" :content="content" placement="top">
    <el-button size="small" text><el-icon><InfoFilled /></el-icon></el-button>
  </el-tooltip>
</template>
<script setup lang="ts">
defineProps({
  content: {
    type: String,
    default: '',
  },
})
</script>