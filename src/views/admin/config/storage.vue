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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listConfig } from '@/api/config'

defineOptions({ name: 'AdminConfigStorage' })

const activeName = 'storage'
const configs = ref<any[]>([])
const loading = ref(false)

async function loadConfig() {
  loading.value = true
  const res: any = await listConfig({ category: [activeName] })
  if (res.status === 200) {
    configs.value = res.data.config || []
  } else {
    configs.value = []
    ElMessage.error(res.data.message)
  }
  loading.value = false
}

onMounted(() => {
  loadConfig()
})
</script>