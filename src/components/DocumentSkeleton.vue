<template>
  <div class="com-document-skeleton">
    <el-skeleton>
      <template #template>
        <!-- h1 -->
        <el-skeleton-item variant="h1" style="width: 70%" />
      </template>
    </el-skeleton>
  </div>
</template>
<script setup lang="ts">
defineProps({
  rows: {
    type: Number,
    default: 4,
  },
})
</script>