<template>
  <div class="com-share-box">
    <span class="text-muted">分享到: &nbsp;</span>
    <el-popover
      placement="top"
      width="200"
      class="hidden-xs-only"
      trigger="hover"
    >
      <div id="qrcode" ref="qrcode" class="qrcode text-center">
        <div class="mgb-5px">打开微信 扫码分享</div>
      </div>
      <template #reference>
        <span target="_blank" class="share-wechat">
          <i class="fa fa-wechat"></i>
        </span>
      </template>
    </el-popover>
    <el-tooltip effect="dark" content="分享到QQ" placement="top">
      <a
        :href="`https://connect.qq.com/widget/shareqq/index.html?title=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(currentURL)}`"
        target="_blank"
        class="share-qq"
      >
        <i class="fa fa-qq"></i>
      </a>
    </el-tooltip>
    <el-tooltip effect="dark" content="分享到微博" placement="top">
      <a
        :href="`https://service.weibo.com/share/share.php?title=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(currentURL)}`"
        target="_blank"
        class="share-weibo"
      >
        <i class="fa fa-weibo"></i>
      </a>
    </el-tooltip>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import QRCode from 'qrcode'
import { cssVar } from '@/utils/utils'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
})

const qrcode = ref<HTMLElement>()

const currentURL = computed(() => window.location.href)

const genQrcode = async () => {
  // 把之前可能存在的二维码清空
  if (!qrcode.value) return
  qrcode.value.innerHTML = '<div class="mgb-5px">打开微信 扫码分享</div>'
  const url = await QRCode.toDataURL(location.href, {
    width: 200,
    margin: 1,
    color: { dark: cssVar('--el-color-black'), light: cssVar('--el-color-white') },
  })
  const img = document.createElement('img')
  img.src = url
  qrcode.value.appendChild(img)
}

onMounted(() => {
  genQrcode()
})
</script>
