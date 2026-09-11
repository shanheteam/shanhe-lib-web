<template>
  <!-- 更新当前用户自身资料 -->
  <div class="com-form-profile">
    <el-form ref="profile" label-width="80px" :model="profile">
      <el-form-item label="用户名">
        <el-input
          v-model="profile.username"
          placeholder="请输入您的登录用户名"
          :disabled="true"
        ></el-input>
      </el-form-item>
      <el-form-item label="真实姓名" prop="realname">
        <el-input v-model="profile.realname" clearable></el-input>
      </el-form-item>
      <el-form-item label="身份证号">
        <el-input v-model="profile.identity" clearable></el-input>
      </el-form-item>
      <el-form-item
        label="联系邮箱"
        prop="email"
        :rules="[
          { required: true, message: '请输入电子邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的电子邮箱', trigger: 'blur' },
        ]"
      >
        <el-input v-model="profile.email" clearable></el-input>
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="profile.mobile" clearable></el-input>
      </el-form-item>
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
      const res: any = await userStore.updateUserProfile(profile.value)
      if (res.status === 200) {
        emit('success', res)
      }
    }
  })
}
</script>
<style lang="scss">
.com-form-profile {
  .btn-setprofile {
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
}
</style>