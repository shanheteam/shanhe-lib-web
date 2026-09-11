<template>
  <div class="com-form-permission">
    <el-form
      ref="formRef"
      label-position="top"
      label-width="80px"
      :model="permission"
    >
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="Method" prop="method">
            <el-input v-model="permission.method" :disabled="true"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="18">
          <el-form-item label="API" prop="path">
            <el-input v-model="permission.path" :disabled="true"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="名称"
        prop="title"
        :rules="[
          { required: true, trigger: 'blur', message: '请输入权限名称' },
        ]"
      >
        <el-input
          v-model="permission.title"
          placeholder="请输入权限名称"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="permission.description"
          type="textarea"
          rows="5"
          placeholder="请输入权限相关描述或备注"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="Check"
          :loading="loading"
          @click="onSubmit"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updatePermission } from '@/api/permission'

defineOptions({ name: 'FormPermission' })
const props = defineProps({
  initPermission: {
    type: Object,
    default: () => ({}),
  },
})
const emit = defineEmits(['success'])

const formRef = ref<any>()
const loading = ref(false)
const permission = ref<Record<string, any>>({
  id: 0,
  title: '',
  description: '',
})

watch(
  () => props.initPermission,
  (val) => {
    permission.value = val
  },
  { immediate: true },
)

const onSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    loading.value = true
    const target = { ...permission.value }
    if (permission.value.id > 0) {
      const res: any = await updatePermission(target)
      if (res.status === 200) {
        ElMessage.success('修改成功')
        resetFields()
        emit('success', res.data)
      } else {
        ElMessage.error(res.data.message)
      }
    }
    loading.value = false
  })
}

const clearValidate = () => {
  formRef.value?.clearValidate()
}
const resetFields = () => {
  formRef.value?.resetFields()
}
const reset = () => {
  resetFields()
  clearValidate()
}

defineExpose({ onSubmit, clearValidate, resetFields, reset })
</script>