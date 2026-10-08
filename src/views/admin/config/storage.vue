<template>
  <el-card v-loading="loading" shadow="never">
    <FormConfig v-if="configs.length > 0" :init-configs="configs">
      <template #buttons>
        <el-alert class="mgt-20px" type="info" show-icon :closable="false">
          启用 OSS 后，图片/头像/文章资源等附件将上传到阿里云 OSS；文档原文件仍保存在本地，用于文档预览转换。
        </el-alert>
      </template>
    </FormConfig>
  </el-card>
</template>

<script setup lang="ts">
import { useConfigForm } from '@/composables/useConfigForm'

defineOptions({ name: 'AdminConfigStorage' })

const { configs, loading } = useConfigForm('storage')
</script>