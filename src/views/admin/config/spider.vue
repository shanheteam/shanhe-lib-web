<template>
  <el-card v-loading="loading" shadow="never">
    <FormConfig v-if="configs.length > 0" :init-configs="configs" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listConfig } from '@/api/config'

defineOptions({ name: 'AdminConfigSpider' })

const activeName = 'spider'
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
