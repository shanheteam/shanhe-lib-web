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
    <FormConfig v-loading="loading" :init-configs="configs" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listConfig } from '@/api/config'

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

onMounted(() => {
  loadConfig(subActiveName.value)
})
</script>

<style lang="scss" scoped>
.oauth-tips {
  margin-bottom: 10px;
}
</style>
