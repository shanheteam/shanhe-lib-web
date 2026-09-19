<template>
  <div class="com-article-list">
    <el-skeleton animated>
      <template #template>
        <ul>
          <li v-for="i in rows" :key="i">
            <el-skeleton-item variant="h1" style="width: 60%" />
            <div><el-skeleton-item variant="text" style="width: 80px" /></div>
            <el-skeleton-item variant="text" style="width: 100%" />
            <el-skeleton-item variant="text" style="width: 80%" />
            <div><el-skeleton-item variant="text" style="width: 160px" /></div>
          </li>
        </ul>
      </template>
    </el-skeleton>
  </div>
</template>
<script setup lang="ts">
defineProps({
  rows: {
    type: Number,
    default: 5,
  },
})
</script>
