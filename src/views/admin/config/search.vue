<template>
  <el-card v-loading="loading" shadow="never">
    <FormConfig v-if="configs.length > 0" :init-configs="configs">
      <template #buttons>
        <el-alert class="mgt-20px" type="warning" show-icon :closable="false">
          变更全文搜索引擎之后，务必在当前 管理后台 ->
          <router-link
            to="/admin/dashboard"
            style="font-size: 12px; vertical-align: middle"
            class="el-link el-link--primary"
            >面板</router-link
          >
          数据统计右侧分别更新全文索引。
        </el-alert>
      </template>
    </FormConfig>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listConfig } from '@/api/config'

defineOptions({ name: 'AdminConfigSearch' })

const activeName = 'fulltext_search'
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
