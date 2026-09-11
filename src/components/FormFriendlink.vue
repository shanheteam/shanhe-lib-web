<template>
  <div class="com-form-friendlink">
    <el-form
      ref="formRef"
      label-position="top"
      label-width="80px"
      :model="friendlink"
    >
      <el-form-item
        label="名称"
        prop="title"
        :rules="[{ required: true, trigger: 'blur', message: '请输入名称' }]"
      >
        <el-input
          v-model="friendlink.title"
          placeholder="请输入名称"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item
        label="地址"
        prop="link"
        :rules="[
          {
            required: true,
            trigger: 'blur',
            message: '请输入友链地址，如 https://mnt.ltd',
          },
        ]"
      >
        <el-input
          v-model="friendlink.link"
          placeholder="请输入友链地址，如 https://mnt.ltd"
          clearable
        ></el-input>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序(值越大越靠前)">
            <el-input-number
              v-model.number="friendlink.sort"
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
              v-model="friendlink.enable"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch> </el-form-item
        ></el-col>
      </el-row>

      <el-form-item label="描述">
        <el-input
          v-model="friendlink.description"
          type="textarea"
          rows="3"
          placeholder="请输入友链相关描述或备注"
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
import { createFriendlink, updateFriendlink } from '@/api/friendlink'

defineOptions({ name: 'FormFriendlink' })
const props = defineProps({
  initFriendlink: {
    type: Object,
    default: () => ({}),
  },
})
const emit = defineEmits(['success'])

const formRef = ref<any>()
const loading = ref(false)
const friendlink = ref<Record<string, any>>({})

watch(
  () => props.initFriendlink,
  (val) => {
    friendlink.value = { ...val }
  },
  { immediate: true },
)

const onSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    loading.value = true
    const target = { ...friendlink.value }
    if (friendlink.value.id > 0) {
      const res: any = await updateFriendlink(target)
      if (res.status === 200) {
        ElMessage.success('修改成功')
        resetFields()
        emit('success', res.data)
      } else {
        ElMessage.error(res.data.message)
      }
    } else {
      const res: any = await createFriendlink(target)
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
  friendlink.value = {
    id: 0,
    title: '',
    link: '',
    sort: 0,
    enable: true,
    description: '',
  }
}
const reset = () => {
  resetFields()
  clearValidate()
}

defineExpose({ onSubmit, clearValidate, resetFields, reset })
</script>