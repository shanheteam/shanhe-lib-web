<template>
  <div ref="imagebox">
    <el-image
      ref="image"
      class="com-document-cover"
      :src="
        assetUrl(
          document.attachment && document.attachment.hash
            ? `/view/cover/${document.attachment.hash}`
            : document.cover || ''
        )
      "
      :lazy="lazy"
      :alt="document.title"
      :class="showExt ? 'ext-icon ext-' + getIcon(document.ext) : ''"
    >
      <template #error>
        <div class="image-slot">
          <img src="/static/images/default-cover.png" />
        </div>
      </template>
    </el-image>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { getIcon } from '@/utils/utils'
import { assetUrl } from '@/utils/asset'

const props = withDefaults(
  defineProps<{
    document?: Record<string, any>
    lazy?: boolean
    width?: number
    showExt?: boolean
  }>(),
  {
    document: () => ({}),
    lazy: true,
    width: 0,
    showExt: false,
  },
)

const imagebox = ref<HTMLElement>()
const image = ref<any>()

const resetImageHeight = () => {
  nextTick(() => {
    // 210/297
    // 重置封面高度：1. 读取封面宽度，2，根据宽高比计算高度
    const imageEl = image.value?.$el as HTMLElement | undefined
    const box = imagebox.value
    if (!imageEl) return
    const isMobile = document.body.clientWidth < 768
    const width = props.width || (box ? box.offsetWidth - 4 : 0) // 减去边框
    const height = (width * 297) / 210
    imageEl.style.height = `${isMobile ? height - 2 : height - 7}px`
    imageEl.style.width = `${width}px`
  })
}

onMounted(() => {
  resetImageHeight()
  window.addEventListener('resize', resetImageHeight)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resetImageHeight)
})
</script>
<style lang="scss">
.com-document-cover {
  border: 2px solid #efefef;
  border-radius: 5px;
  img {
    width: 100% !important;
    transition: transform 0.3s ease 0s;
    &:hover {
      transform: scale(1.2);
    }
  }
}
</style>