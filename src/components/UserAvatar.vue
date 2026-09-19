<template>
  <div class="com-user-avatar">
    <el-avatar
      :size="size"
      :alt="user.realname || '未命名用户'"
      :src="assetUrl(user.avatar)"
      @error="errorAvatar"
    >
      <img src="/static/images/avatar.png" />
    </el-avatar>
  </div>
</template>
<script setup lang="ts">
import { assetUrl } from '@/utils/asset'
defineProps({
  size: {
    type: Number,
    default: 80,
  },
  src: {
    type: String,
    default: '',
  },
  user: {
    type: Object,
    default: () => ({}),
  },
})
const errorAvatar = () => true
</script>
<style lang="scss">
.com-user-avatar {
  display: inline-block;
  position: relative;
  .el-avatar {
    border: 2px solid var(--app-border-avatar);
    box-sizing: border-box;
    background-color: var(--el-color-white);
    img {
      margin: 0 auto;
    }
  }
}
</style>