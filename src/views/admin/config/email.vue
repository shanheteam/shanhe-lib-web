<template>
  <el-card shadow="never" v-loading="loading">
    <FormConfig
      v-if="configs.length > 0"
      ref="formConfig"
      :init-configs="configs"
      @on-success="onSaveSuccess"
    >
      <template #buttons>
        <el-button
          type="success"
          icon="Promotion"
          :loading="testing"
          @click="onTest"
          >检测邮箱</el-button
        >
      </template>
    </FormConfig>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as configApi from '@/api/config'

const activeName = 'email'
const configs = ref<any[]>([])
const loading = ref(false)
const formConfig = ref<any>(null)
const testing = ref(false)

async function loadConfig() {
  loading.value = true
  const res: any = await configApi.listConfig({ category: [activeName] })
  if (res.status === 200) {
    configs.value = res.data.config || []
  } else {
    configs.value = []
    ElMessage.error(res.data.message)
  }
  loading.value = false
}

/** 取表单里某一项的值（未保存的修改也参与检测） */
function formValue(name: string): string {
  const map = (formConfig.value?.configs || {}) as Record<string, any>
  const item = Object.values(map).find((c: any) => c.name === name) as any
  if (item?.value === null || item?.value === undefined) return ''
  return String(item.value)
}

/** 表单里允许覆盖的 email 配置项，提交给后端做连接检测 */
function formConfigList(): Array<{ name: string; value: string }> {
  const names = ['host', 'port', 'is_tls', 'from_name', 'username', 'password']
  const map = (formConfig.value?.configs || {}) as Record<string, any>
  return names.map((name) => {
    const item = Object.values(map).find((c: any) => c.name === name) as any
    return { name, value: item?.value === null || item?.value === undefined ? '' : String(item.value) }
  })
}

async function onTest() {
  if (!formValue('host')) {
    ElMessage.warning('请先填写 SMTP 服务器地址')
    return
  }
  if (!formValue('username')) {
    ElMessage.warning('请先填写 SMTP 账号')
    return
  }

  testing.value = true
  const res: any = await configApi.testEmailConfig({
    test_email: formValue('test_email'),
    config: formConfigList(),
  })
  testing.value = false

  // 该接口为 POST，HTTP 状态是 201，检测结果放在响应体的 status 字段里
  const result = res.data || {}
  if (result.status === 200) {
    ElMessage.success(result.message || '检测通过')
  } else {
    ElMessage.error(result.message || '检测失败')
  }
}

/** 保存配置后，后端会自动向测试邮箱发一封测试邮件，这里回显结果 */
function onSaveSuccess(data: any) {
  const result = data?.email_test
  if (!result) return
  if (result.success) {
    ElMessage.success(result.message)
  } else {
    ElMessage.warning(result.message)
  }
}

onMounted(() => {
  loadConfig()
})
</script>