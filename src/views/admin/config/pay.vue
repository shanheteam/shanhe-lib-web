<template>
  <el-card shadow="never">
    <div style="margin-bottom: 10px">
      <el-alert title="重要配置提示" type="warning" :closable="false" show-icon>
        <ul>
          <li>
            请务必填写【系统设置】->【<router-link
              class="el-link el-link--primary"
              to="/admin/config/system"
              >系统配置</router-link
            >】->【网站域名】，否则支付回调无法正常更新订单支付状态。
          </li>
          <li>
            请配置【系统设置】->【<router-link
              class="el-link el-link--primary"
              to="/admin/config/score"
              >积分配置</router-link
            >】->【人民币兑积分】，以确定人民币与积分的兑换比率。
          </li>
          <li>
            请配置【系统设置】->【<router-link
              class="el-link el-link--primary"
              to="/admin/config/security"
              >安全配置</router-link
            >】->【待支付超时关闭】，以确定待支付订单超时多长时间自动关闭。
          </li>
          <li>
            当前支付的回调地址是：
            <span class="text-danger">{{ origin }}/callback/{{ subActiveName }}</span>
          </li>
          <li v-if="subActiveName === 'wechatpay'">
            <strong style="font-size: 1.2em; color: red">
              如果需要用户可以在微信内支付，则请配置微信公众号登录！在 系统配置
              -> Oauth配置 -> 微信公众号 进行配置！</strong
            >
          </li>
        </ul>
      </el-alert>
    </div>
    <el-tabs v-model="subActiveName" type="card" @tab-click="subTabClick">
      <el-tab-pane
        v-for="item in subCategories"
        :key="'sub-category-' + item.value"
        :label="item.label"
        :name="item.value"
      >
      </el-tab-pane>
    </el-tabs>
    <FormConfig v-loading="loading" :init-configs="configs">
      <template v-if="subActiveName === 'wechatpay'" #buttons>
        <el-button type="success" icon="Refresh" @click="onGetWechatPayCert">
          获取平台证书
        </el-button>
        <div>
          <el-alert
            type="warning"
            class="mgt-20px"
            title="注意"
            :closable="false"
            show-icon
            >【微信支付公钥】与【平台证书】，二选一填写。</el-alert
          >
        </div>
      </template>
    </FormConfig>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listConfig, getWechatPayCert } from '@/api/config'

defineOptions({ name: 'AdminConfigPay' })

const subCategories = [
  { label: '微信支付', value: 'wechatpay' },
  { label: '支付宝支付', value: 'alipay' },
  { label: '虎皮椒支付', value: 'xunhupay' },
]

const origin = window.location.origin
const subActiveName = ref(subCategories[0].value)
const configs = ref<any[]>([])
const loading = ref(false)

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

async function onGetWechatPayCert() {
  const res: any = await getWechatPayCert()
  if (res.status === 200) {
    configs.value = configs.value.map((item: any) => {
      if (item.name === 'platform_cert') {
        return { ...item, value: res.data.cert || '' }
      }
      return item
    })
    ElMessageBox.alert(
      '微信支付平台证书获取成功，请点击【提交】按钮保存配置',
      '提示',
      { confirmButtonText: '知道了' },
    )
    return
  }
  ElMessage.error(res.data.message || '获取失败')
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
