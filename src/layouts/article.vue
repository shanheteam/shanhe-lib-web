<template>
  <el-container class="layout-default layout-article">
    <global-header />
    <el-main>
      <router-view />
    </el-main>
    <el-footer height="auto">
      <global-footer />
    </el-footer>
  </el-container>
</template>

<script lang="ts">
export default { name: 'ArticleLayout' }
</script>