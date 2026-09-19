<template>
  <div class="com-form-navigation">
    <el-form
      ref="formRef"
      label-position="top"
      label-width="80px"
      :model="navigation"
    >
      <!-- 下拉菜单选择一级分类 -->
      <el-form-item
        v-if="!(navigation.id > 0 && navigation.fixed)"
        label="上级导航"
      >
        <el-select
          v-model="navigation.parent_id"
          :filterable="true"
          :clearable="true"
          placeholder="请选择上级导航"
        >
          <el-option
            v-for="item in trees"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="名称"
        prop="title"
        :rules="[{ required: true, trigger: 'blur', message: '请输入名称' }]"
      >
        <el-input
          v-model="navigation.title"
          placeholder="请输入名称"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="地址" prop="href">
        <el-input
          v-model="navigation.href"
          placeholder="请输入导航地址，如 https://mnt.ltd"
          clearable
          :disabled="navigation.fixed"
        ></el-input>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序(值越大越靠前)">
            <el-input-number
              v-model.number="navigation.sort"
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
              v-model="navigation.enable"
              style="display: block"
              active-color="var(--app-color-switch-on)"
              inactive-color="var(--app-color-switch-off)"
              active-text="是"
              inactive-text="否"
            >
            </el-switch> </el-form-item
        ></el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="颜色">
            <el-color-picker
              v-model="navigation.color"
              show-alpha
              clearable
              placeholder="请选择颜色"
            ></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="打开方式">
            <!-- 即 target -->
            <el-select
              v-model="navigation.target"
              placeholder="请选择打开方式"
              clearable
            >
              <el-option
                v-for="item in targetOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select> </el-form-item
        ></el-col>
      </el-row>

      <el-form-item label="描述">
        <el-input
          v-model="navigation.description"
          type="textarea"
          :rows="3"
          placeholder="请输入导航相关描述或备注"
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
import type { PropType } from 'vue'
import { ElMessage } from 'element-plus'
import { createNavigation, updateNavigation } from '@/api/navigation'

defineOptions({ name: 'FormNavigation' })
const props = defineProps({
  initNavigation: {
    type: Object,
    default: () => ({}),
  },
  trees: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
})
const emit = defineEmits(['success'])

const formRef = ref<any>()
const loading = ref(false)
const navigation = ref<Record<string, any>>({})
const targetOptions = [
  { label: '当前页', value: '_self' },
  { label: '新标签页', value: '_blank' },
]

watch(
  () => props.initNavigation,
  (val) => {
    navigation.value = { ...val }
  },
  { immediate: true },
)

const onSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    loading.value = true
    const target: Record<string, any> = { ...navigation.value }
    if (target.parent_id && target.parent_id.length > 0) {
      target.parent_id = target.parent_id[target.parent_id.length - 1]
    }

    if (target.parent_id === undefined || target.parent_id === '') {
      target.parent_id = 0
    }

    if (navigation.value.id > 0) {
      const res: any = await updateNavigation(target)
      if (res.status === 200) {
        ElMessage.success('修改成功')
        resetFields()
        emit('success', res.data)
      } else {
        ElMessage.error(res.data.message)
      }
    } else {
      const res: any = await createNavigation(target)
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
  navigation.value = {
    id: 0,
    title: '',
    href: '',
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