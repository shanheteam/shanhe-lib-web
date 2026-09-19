<template>
  <aside class="sidebar-card quick-links">
    <el-card shadow="never">
      <template #header>
        <h3 class="card-title">
          <el-icon><Link /></el-icon>
          快捷入口
        </h3>
      </template>
      <div class="links-grid">
        <router-link to="/upload" class="link-item">
          <el-icon><Upload /></el-icon>
          <span>上传文档</span>
        </router-link>
        <router-link to="/post" class="link-item">
          <el-icon><EditPen /></el-icon>
          <span>发布文章</span>
        </router-link>
        <router-link to="/category" class="link-item">
          <el-icon><Files /></el-icon>
          <span>浏览文档</span>
        </router-link>
        <router-link to="/article" class="link-item">
          <el-icon><Reading /></el-icon>
          <span>阅读文章</span>
        </router-link>
      </div>
    </el-card>
  </aside>
</template>

<script setup lang="ts">
import { Link, Upload, EditPen, Files, Reading } from '@element-plus/icons-vue'

defineOptions({ name: 'QuickLinks' })
</script>
