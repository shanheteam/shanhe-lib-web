<template>
  <div class="com-form-language">
    <el-form
      ref="formRef"
      label-position="top"
      label-width="80px"
      :model="language"
    >
      <el-form-item
        label="语言名称"
        prop="language"
        :rules="[
          { required: true, trigger: 'blur', message: '请输入语言名称' },
        ]"
      >
        <el-input
          v-model="language.language"
          placeholder="请输入语言名称，如：中文(简体)"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item
        label="语言代码"
        prop="code"
        :rules="[
          {
            required: true,
            trigger: 'blur',
            message: '请输入语言代码',
          },
          {
            //最大 8个字符长度
            max: 8,
            message: '最大8个字符长度',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="language.code"
          placeholder="请输入语言代码，如：zh-CN。建议遵循相应ISO标准"
          :disabled="language.id > 0"
          clearable
        ></el-input>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序(值越大越靠前)">
            <el-input-number
              v-model.number="language.sort"
              clearable
              :min="0"
              :step="1"
              placeholder="请输入排序值"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否启用">
            <el-switch
              v-model="language.enable"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch> </el-form-item
        ></el-col>
      </el-row>
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
import { createLanguage, updateLanguage } from '@/api/language'

defineOptions({ name: 'FormLanguage' })
const props = defineProps({
  initLanguage: {
    type: Object,
    default: () => ({}),
  },
})
const emit = defineEmits(['success'])

const formRef = ref<any>()
const loading = ref(false)
const language = ref<Record<string, any>>({})

watch(
  () => props.initLanguage,
  (val) => {
    language.value = { ...val }
  },
  { immediate: true },
)

const onSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    loading.value = true
    const target = { ...language.value }
    if (language.value.id > 0) {
      const res: any = await updateLanguage(target)
      if (res.status === 200) {
        ElMessage.success('修改成功')
        resetFields()
        emit('success', res.data)
      } else {
        ElMessage.error(res.data.message)
      }
    } else {
      const res: any = await createLanguage(target)
      if (res.status === 200) {
        ElMessage.success('新增成功')
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
  language.value = {
    id: 0,
    language: '',
    code: '',
    sort: 0,
    enable: true,
  }
}
const reset = () => {
  resetFields()
  clearValidate()
}

defineExpose({ onSubmit, clearValidate, resetFields, reset })
</script>