<template>
  <el-card shadow="never">
    <el-alert title="Oauth配置提示" type="success" class="oauth-tips">
      <div>当前Oauth的回调地址是：{{ origin }}/oauth/{{ oauthType }}</div>
      <div>
        公众号Token验证 URL地址：{{ origin }}/api/v1/oauth/officialaccount/token
      </div>
    </el-alert>
    <el-tabs v-model="subActiveName" type="card" @tab-click="subTabClick">
      <el-tab-pane
        v-for="item in subCategories"
        :key="'sub-category-' + item.value"
        :label="item.label"
        :name="item.value"
      >
        <el-alert
          v-if="item.apply"
          title="Oauth登录申请"
          type="warning"
          class="oauth-tips"
        >
          <a
            :href="item.apply"
            target="_blank"
            class="el-link el-link--primary"
            >{{ item.apply }}</a
          >
        </el-alert>
      </el-tab-pane>
    </el-tabs>
    <FormConfig ref="formConfig" v-loading="loading" :init-configs="configs">
      <template #buttons>
        <el-button
          v-if="subActiveName === 'oauthCustom'"
          type="success"
          icon="Monitor"
          :loading="testing"
          @click="onTest"
          >测试</el-button
        >
      </template>
    </FormConfig>

    <!-- 测试日志弹窗 -->
    <el-dialog v-model="logVisible" title="OAuth 测试日志" width="600px">
      <div class="test-log">
        <div
          v-for="(log, index) in testLogs"
          :key="index"
          :class="['log-item', log.type]"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-icon">{{ log.icon }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="logVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listConfig } from '@/api/config'
import service from '@/utils/request'

defineOptions({ name: 'AdminConfigOauth' })

const subCategories = [
  { label: '微信登录', value: 'oauthWechat', apply: 'https://open.weixin.qq.com/' },
  {
    label: '微信公众号',
    value: 'oauthOfficialAccount',
    apply: 'https://mp.weixin.qq.com/',
  },
  {
    label: 'QQ登录',
    value: 'oauthQQ',
    apply: 'https://connect.qq.com/manage.html#/',
  },
  {
    label: '谷歌登录',
    value: 'oauthGoogle',
    apply: 'https://console.developers.google.com/',
  },
  {
    label: 'Github登录',
    value: 'oauthGithub',
    apply: 'https://github.com/settings/apps/new',
  },
  { label: 'Gitee登录', value: 'oauthGitee', apply: 'https://gitee.com/oauth/applications' },
  { label: '自定义Oauth', value: 'oauthCustom' },
]

const origin = window.location.origin
const subActiveName = ref(subCategories[0].value)
const configs = ref<any[]>([])
const loading = ref(false)
const formConfig = ref<any>(null)
const testing = ref(false)
const logVisible = ref(false)
const testLogs = ref<any[]>([])

const oauthType = computed(() =>
  subActiveName.value.toLocaleLowerCase().replace('oauth', ''),
)

async function loadConfig(category: string) {
  loading.value = true
  const res: any = await listConfig({ category: [category] })
  if (res.status === 200) {
    configs.value = res.data.config || []
  } else {
    configs.value = []
    ElMessage.error(res.data.message)
  }
  loading.value = false
}

function subTabClick(tab: any) {
  loadConfig(tab.name || tab.props?.name)
}

function formatTime() {
  const now = new Date()
  return now.toTimeString().slice(0, 8)
}

function addLog(type: 'info' | 'success' | 'error' | 'warn', message: string) {
  const icons: Record<string, string> = {
    info: 'ℹ️',
    success: '✅',
    error: '',
    warn: '⚠️',
  }
  testLogs.value.push({
    time: formatTime(),
    type,
    icon: icons[type] || 'ℹ️',
    message,
  })
}

async function onTest() {
  testing.value = true
  logVisible.value = true
  testLogs.value = []

  addLog('info', '开始测试自定义 OAuth 配置...')

  // 读取表单配置
  const formConfigs = formConfig.value?.configs || {}
  const getConfig = (name: string) => {
    const item = Object.values(formConfigs).find((c: any) => c.name === name) as any
    return item?.value || ''
  }

  const clientId = getConfig('client_id')
  const clientSecret = getConfig('client_secret')
  const redirectUrl = getConfig('redirect_url')
  const authorizeUrl = getConfig('authorize_url')
  const tokenUrl = getConfig('token_url')
  const userinfoUrl = getConfig('userinfo_url')
  const scope = getConfig('scope')

  // 1. 检查必填字段
  addLog('info', '步骤 1：检查必填配置项...')
  const requiredFields: Record<string, string> = {
    client_id: 'Client ID',
    client_secret: 'Client Secret',
    authorize_url: '授权地址',
    token_url: '获取Token地址',
    userinfo_url: '获取用户信息地址',
    redirect_url: '授权回调地址',
  }

  let hasError = false
  for (const [key, label] of Object.entries(requiredFields)) {
    const value = getConfig(key)
    if (!value) {
      addLog('error', `缺少必填项：${label}（${key}）`)
      hasError = true
    } else {
      addLog('success', `已配置：${label}`)
    }
  }

  if (hasError) {
    addLog('error', '测试终止：请先填写所有必填配置项')
    testing.value = false
    return
  }

  // 2. 检查 URL 格式
  addLog('info', '步骤 2：检查 URL 格式...')
  const urlFields: Record<string, string> = {
    authorize_url: authorizeUrl,
    token_url: tokenUrl,
    userinfo_url: userinfoUrl,
    redirect_url: redirectUrl,
  }

  let urlValid = true
  for (const [key, url] of Object.entries(urlFields)) {
    try {
      new URL(url)
      addLog('success', `${key} 格式正确`)
    } catch {
      addLog('error', `${key} 格式无效：${url}`)
      urlValid = false
    }
  }

  if (!urlValid) {
    addLog('error', '测试终止：存在无效的 URL 配置')
    testing.value = false
    return
  }

  // 3. 测试授权地址可达性
  addLog('info', '步骤 3：测试授权地址可达性...')
  try {
    const res = await service({
      url: authorizeUrl,
      method: 'get',
      params: {
        client_id: clientId,
        redirect_uri: redirectUrl,
        response_type: 'code',
        scope: scope || 'user',
      },
      timeout: 10000,
    })
    if (res.status === 200) {
      addLog('success', `授权地址可达，HTTP ${res.status}`)
    } else {
      addLog('warn', `授权地址返回 HTTP ${res.status}`)
    }
  } catch (err: any) {
    const msg = err?.message || err?.response?.statusText || '未知错误'
    addLog('error', `授权地址请求失败：${msg}`)
  }

  // 4. 测试 Token 地址可达性
  addLog('info', '步骤 4：测试 Token 地址可达性...')
  try {
    const res = await service({
      url: tokenUrl,
      method: 'post',
      data: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: 'test_code',
        redirect_uri: redirectUrl,
      },
      timeout: 10000,
    })
    if (res.status === 200) {
      addLog('success', `Token 地址可达，HTTP ${res.status}`)
    } else {
      addLog('warn', `Token 地址返回 HTTP ${res.status}（预期行为，code 无效）`)
    }
  } catch (err: any) {
    const msg = err?.message || err?.response?.statusText || '未知错误'
    // 4xx 是预期行为（因为 code 是假的）
    if (err?.response?.status >= 400 && err?.response?.status < 500) {
      addLog('success', `Token 地址可达，返回 HTTP ${err.response.status}（预期行为）`)
    } else {
      addLog('error', `Token 地址请求失败：${msg}`)
    }
  }

  // 5. 测试用户信息地址可达性
  addLog('info', '步骤 5：测试用户信息地址可达性...')
  try {
    const res = await service({
      url: userinfoUrl,
      method: 'get',
      timeout: 10000,
    })
    if (res.status === 200) {
      addLog('success', `用户信息地址可达，HTTP ${res.status}`)
    } else {
      addLog('warn', `用户信息地址返回 HTTP ${res.status}（预期行为，未携带 token）`)
    }
  } catch (err: any) {
    const msg = err?.message || err?.response?.statusText || '未知错误'
    if (err?.response?.status >= 400 && err?.response?.status < 500) {
      addLog('success', `用户信息地址可达，返回 HTTP ${err.response.status}（预期行为）`)
    } else {
      addLog('error', `用户信息地址请求失败：${msg}`)
    }
  }

  addLog('info', '测试完成！')
  testing.value = false
}

onMounted(() => {
  loadConfig(subActiveName.value)
})
</script>

<style lang="scss" scoped>
.oauth-tips {
  margin-bottom: 10px;
}

.test-log {
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  background: #f5f7fa;
  border-radius: 4px;
  padding: 12px;

  .log-item {
    display: flex;
    align-items: flex-start;
    padding: 6px 0;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }

    .log-time {
      color: #909399;
      margin-right: 8px;
      flex-shrink: 0;
      font-size: 12px;
    }

    .log-icon {
      margin-right: 8px;
      flex-shrink: 0;
    }

    .log-message {
      flex: 1;
      word-break: break-all;
    }

    &.info .log-message {
      color: #409eff;
    }

    &.success .log-message {
      color: #67c23a;
    }

    &.error .log-message {
      color: #f56c6c;
    }

    &.warn .log-message {
      color: #e6a23c;
    }
  }
}
</style>
