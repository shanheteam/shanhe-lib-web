<template>
  <el-card shadow="never">
    <el-row v-loading="loading" :gutter="20">
      <el-col :span="10">
        <FormConfig
          ref="smsFormRef"
          :init-configs="configs"
          :show-button="false"
          @change="onChange"
        />
        <el-form-item>
          <el-button type="primary" icon="Check" @click="submitBase">
            保存短信设置
          </el-button>
        </el-form-item>
      </el-col>
      <el-col :span="14">
        <FormConfig
          v-if="subConfigs.length > 0"
          :init-configs="subConfigs"
          :show-message="false"
          @on-success="onSMSConfigSuccess"
        />
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { listConfig } from '@/api/config'
import FormConfig from '@/components/FormConfig.vue'

defineOptions({ name: 'AdminConfigSms' })

const activeName = 'sms'
const configs = ref<any[]>([])
const subConfigs = ref<any[]>([])
const loading = ref(false)
const smsFormRef = ref<any>(null)

async function loadConfig() {
  loading.value = true
  const res: any = await listConfig({ category: [activeName] })
  if (res.status === 200) {
    configs.value = res.data.config || []
    configs.value.forEach((item: any) => {
      if (item.name === 'sms_provider') {
        loadSubConfigs(item.value)
      }
    })
  } else {
    configs.value = []
    ElMessage.error(res.data.message)
  }
  loading.value = false
}

async function loadSubConfigs(category: string) {
  if (!category) {
    subConfigs.value = []
    return
  }
  const res: any = await listConfig({ category: [category] })
  if (res.status === 200) {
    subConfigs.value = res.data.config || []
  } else {
    subConfigs.value = []
    ElMessage.error(res.data.message)
  }
}

function onChange(item: any) {
  loadSubConfigs(item.value)
}

function submitBase() {
  smsFormRef.value && smsFormRef.value.onSubmit()
}

async function onSMSConfigSuccess() {
  // 服务商子配置保存成功后，顺带保存左侧短信基础配置
  await nextTick()
  smsFormRef.value && smsFormRef.value.onSubmit()
}

onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
.oauth-tips {
  margin-bottom: 10px;
}
</style>
