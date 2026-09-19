<template>
  <div class="com-form-attachment">
    <el-form
      ref="formRef"
      label-position="top"
      label-width="80px"
      :model="attachment"
    >
      <el-form-item
        label="名称"
        prop="name"
        :rules="[
          { required: true, trigger: 'blur', message: '请输入附件名称' },
        ]"
      >
        <el-input
          v-model="attachment.name"
          placeholder="请输入附件名称"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="是否合法">
        <el-switch
          v-model="attachment.enable"
          style="display: block"
          active-color="var(--app-color-switch-on)"
          inactive-color="var(--app-color-switch-off)"
          active-text="是"
          inactive-text="否"
        >
        </el-switch>
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="attachment.description"
          type="textarea"
          :rows="5"
          placeholder="请输入附件相关描述或备注"
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
import { updateAttachment } from '@/api/attachment'

defineOptions({ name: 'FormAttachment' })
const props = defineProps({
  initAttachment: {
    type: Object,
    default: () => ({}),
  },
})
const emit = defineEmits(['success'])

const formRef = ref<any>()
const loading = ref(false)
const attachment = ref<Record<string, any>>({
  id: 0,
  name: '',
  description: '',
})

watch(
  () => props.initAttachment,
  (val) => {
    attachment.value = val
  },
  { immediate: true },
)

const onSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    loading.value = true
    const target = { ...attachment.value }
    if (attachment.value.id > 0) {
      const res: any = await updateAttachment(target)
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