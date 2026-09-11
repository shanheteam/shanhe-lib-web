<template>
  <div class="com-form-password">
    <el-form
      ref="formPassword"
      label-position="top"
      label-width="80px"
      :model="profile"
    >
      <el-form-item label="用户名">
        <el-input
          v-model="profile.username"
          placeholder="请输入您的登录用户名"
          :disabled="true"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="原密码"
        prop="old_password"
        :rules="[
          { required: true, trigger: 'blur', message: '请输入您的原密码' },
        ]"
      >
        <el-input v-model="profile.old_password" type="password"></el-input>
      </el-form-item>
      <el-form-item
        label="新密码"
        prop="new_password"
        :rules="[
          { required: true, trigger: 'blur', message: '请输入您的新密码' },
        ]"
      >
        <el-input v-model="profile.new_password" type="password"></el-input>
      </el-form-item>
      <el-form-item
        label="确认密码"
        prop="repeat_password"
        :rules="[
          { required: true, trigger: 'blur', message: '请再次输入您的新密码' },
        ]"
      >
        <el-input v-model="profile.repeat_password" type="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="Check"
          @click="setPassword"
          >修改密码</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { updateUserPassword } from '@/api/user'
import { useUserStore } from '@/store/user'

defineOptions({ name: 'FormPassword' })
const emit = defineEmits(['success'])

const userStore = useUserStore()
const user = computed(() => userStore.user)
const formPassword = ref<any>()

const profile = ref<Record<string, any>>({
  username: user.value.username,
  old_password: '',
  new_password: '',
  repeat_password: '',
})

const setPassword = () => {
  formPassword.value.validate(async (valid: boolean) => {
    if (valid) {
      if (profile.value.new_password !== profile.value.repeat_password) {
        ElMessage.error('新密码和确认密码不一致')
        return
      }
      const res: any = await updateUserPassword({
        id: user.value.id,
        old_password: profile.value.old_password,
        new_password: profile.value.new_password,
      })
      if (res.status === 200) {
        ElMessage.success('密码修改成功')
        formPassword.value.resetFields()
        emit('success', res)
      } else {
        ElMessage.error(res.data.message)
      }
    }
  })
}
</script>