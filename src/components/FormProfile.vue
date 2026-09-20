<template>
  <!-- 更新当前用户自身资料 -->
  <div class="com-form-profile">
    <el-form ref="profileForm" label-width="80px" :model="profile">
      <el-form-item label="联系地址">
        <el-input
          v-model="profile.address"
          clearable
          type="textarea"
          :rows="3"
        ></el-input>
      </el-form-item>
      <el-form-item label="个性签名">
        <el-input
          v-model="profile.signature"
          type="textarea"
          clearable
          :rows="3"
        ></el-input>
      </el-form-item>

      <el-form-item class="btn-setprofile">
        <el-button
          type="primary"
          class="btn-block"
          icon="Check"
          @click="setProfile"
          >修改资料</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'

defineOptions({ name: 'FormProfile' })
const emit = defineEmits(['success'])

const userStore = useUserStore()
const user = computed(() => userStore.user)
const profileForm = ref<any>()
const profile = ref<Record<string, any>>({ ...user.value })

const setProfile = () => {
  profileForm.value.validate(async (valid: boolean) => {
    if (valid) {
      // 修改资料仅允许修改联系地址与个性签名
      const res: any = await userStore.updateUserProfile({
        address: profile.value.address,
        signature: profile.value.signature,
      })
      if (res.status === 200) {
        emit('success', res)
      }
    }
  })
}
</script>
