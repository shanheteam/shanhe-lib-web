<template>
  <div class="com-form-user">
    <el-form ref="user" label-position="top" label-width="80px" :model="user">
      <el-form-item
        label="用户名"
        prop="username"
        :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]"
      >
        <el-input
          v-model="user.username"
          placeholder="请输入用户名"
          :disabled="user.id > 0 ? true : false"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="密码"
        prop="password"
        :rules="
          user.id > 0
            ? []
            : [{ required: true, message: '请输入用户密码', trigger: 'blur' }]
        "
      >
        <el-input
          v-model="user.password"
          :placeholder="
            user.id > 0 ? '输入密码表示修改用户密码' : '请输入用户密码'
          "
          type="password"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item
        label="邮箱"
        prop="email"
        :rules="[
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
        ]"
      >
        <el-input v-model="user.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      <el-form-item
        label="角色"
        prop="group_id"
        :rules="[{ required: true, message: '请选择角色', trigger: 'blur' }]"
      >
        <el-select
          v-model="user.group_id"
          multiple
          filterable
          placeholder="请选择角色"
        >
          <el-option
            v-for="group in groups"
            :key="'group-' + group.id"
            :label="group.title"
            :value="group.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="Check"
          @click="setUser"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import { ElMessage } from 'element-plus'
import { addUser, setUser as setUserApi } from '@/api/user'

defineOptions({ name: 'FormUser' })
const props = defineProps({
  groups: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  initUser: {
    type: Object,
    default: () => ({
      id: 0,
      email: '',
      username: '',
      password: '',
      group_id: [],
    }),
  },
})
const emit = defineEmits(['success'])

const userForm = ref<any>()
const user = ref<Record<string, any>>({ id: 0 })

watch(
  () => props.initUser,
  (val) => {
    user.value = val
  },
  { immediate: true },
)

const setUser = () => {
  userForm.value.validate(async (valid: boolean) => {
    if (valid) {
      if (user.value.id > 0) {
        const res: any = await setUserApi({
          id: user.value.id,
          username: user.value.username,
          password: user.value.password,
          group_id: user.value.group_id,
        })
        if (res.status === 200) {
          ElMessage.success('设置成功')
          emit('success')
        } else {
          ElMessage.error(res.data.message)
        }
      } else {
        const res: any = await addUser(user.value)
        if (res.status === 200) {
          ElMessage.success('新增成功')
          emit('success')
        } else {
          ElMessage.error(res.data.message)
        }
      }
    }
  })
}

const reset = () => {
  user.value = { id: 0 }
  userForm.value.resetFields()
  userForm.value.clearValidate()
}

defineExpose({ reset })
</script>
<style lang="scss">
.com-form-user {
  .el-select {
    width: 100%;
  }
}
</style>