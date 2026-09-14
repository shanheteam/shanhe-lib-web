<template>
  <div class="com-upload-image">
    <el-upload
      class="image-uploader"
      :action="actionUrl"
      :headers="{ authorization: `bearer ${token}` }"
      :show-file-list="false"
      :on-success="success"
      :on-error="onError"
      accept="image/*"
      :multiple="false"
      :disabled="disabled"
    >
      <el-image
        v-if="disabled"
        :src="image"
        :style="'width:' + width + ';height:' + height"
      >
        <template #error>
          <div class="image-slot">
            <img :src="errorImage" />
          </div>
        </template>
      </el-image>
      <el-tooltip v-else content="点击上传图片" placement="top">
        <el-image :src="image" :style="'width:' + width + ';height:' + height">
          <template #error>
            <div class="image-slot">
              <img :src="errorImage" />
            </div>
          </template>
        </el-image>
      </el-tooltip>
      <div v-if="showRemove && image" class="el-upload__tip">
        <el-button
          text
          size="small"
          @click="onRemove"
          >移除图片</el-button
        >
      </div>
    </el-upload>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { assetUrl } from '@/utils/asset'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

const props = defineProps({
  action: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: 'auto',
  },
  height: {
    type: String,
    default: 'auto',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showRemove: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: '',
  },
  errorImage: {
    type: String,
    default: '/static/images/blank.png',
  },
})
const emit = defineEmits(['success', 'remove'])

// 生产下 action 为相对路径（/api/v1/upload/...），需拼上后端域名，否则原生 XHR 会按前端域名解析失败
const actionUrl = computed(() => assetUrl(props.action))

const userStore = useUserStore()
const token = computed(() => userStore.token)

const success = (res: any) => {
  emit('success', res)
}
const onRemove = () => {
  emit('remove')
}
const onError = (err: any) => {
  try {
    const message = JSON.parse(err.message)
    ElMessage.error(message.message)
  } catch (e) {
    ElMessage.error(err)
  }
}
</script>
<style lang="scss">
.com-upload-image {
  line-height: 1 !important;
  .el-image {
    img {
      width: 100%;
      height: auto;
    }
  }
}
</style>