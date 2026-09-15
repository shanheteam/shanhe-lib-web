<template>
  <!-- 更新指定用户的资料 -->
  <div class="com-form-user-profile">
    <el-form label-position="left" label-width="80px" :model="profile">
      <el-form-item label="真实姓名" prop="realname">
        <el-input v-model="profile.realname" clearable></el-input>
      </el-form-item>
      <el-form-item label="身份证号">
        <el-input v-model="profile.identity" clearable></el-input>
      </el-form-item>
      <el-form-item
        label="电子邮箱"
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
          :rows="5"
        ></el-input>
      </el-form-item>
      <el-form-item v-if="isAdmin" label="用户备注">
        <el-input
          v-model="profile.remark"
          type="textarea"
          placeholder="管理员可以在此处添加对用户的备注信息，备注只有管理员可见"
          clearable
          :rows="5"
        ></el-input>
      </el-form-item>
      <el-form-item>
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
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateUserProfile } from '@/api/user'

defineOptions({ name: 'FormUserProfile' })
const props = defineProps({
  initUser: {
    type: Object,
    default: () => ({}),
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['success'])

const profile = ref<Record<string, any>>({})

watch(
  () => props.initUser,
  (val) => {
    profile.value = val
  },
  { immediate: true },
)

const reset = () => {
  profile.value = {}
}

const setProfile = async () => {
  const res: any = await updateUserProfile(profile.value)
  if (res.status === 200) {
    ElMessage.success('修改成功')
    emit('success')
  } else {
    ElMessage.error(res.data.message)
  }
}

defineExpose({ reset })
</script>