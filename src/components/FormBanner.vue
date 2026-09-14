<template>
  <div class="com-form-banner">
    <el-form
      ref="formRef"
      label-position="top"
      label-width="80px"
      :model="banner"
    >
      <el-form-item
        label="图片"
        prop="path"
        :rules="[
          { required: true, message: '请上传轮播图图片', trigger: 'blur' },
        ]"
      >
        <UploadImage
          :action="'/api/v1/upload/banner'"
          :image="assetUrl(banner.path)"
          :error-image="'/static/images/banner.png'"
          @success="success"
        />
      </el-form-item>
      <el-form-item label="名称" prop="title">
        <el-input
          v-model="banner.title"
          clearable
          placeholder="请输入轮播图名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="链接" prop="url">
        <el-input
          v-model="banner.url"
          clearable
          placeholder="请输入链接地址，链接地址为空点击轮播图不会跳转"
        ></el-input>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="类型" prop="type">
            <el-select
              v-model="banner.type"
              clearable
              placeholder="请选择轮播图类型"
            >
              <el-option
                v-for="opt in bannerTypeOptions"
                :key="'type-' + opt.value"
                :label="opt.label"
                :value="opt.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="排序(值越大越靠前)" prop="sort">
            <el-input-number
              v-model="banner.sort"
              :min="0"
              :step="1"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否启用" prop="enable">
            <el-switch
              v-model="banner.enable"
              style="display: block; margin-top: 8px"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="描述">
        <el-input
          v-model="banner.description"
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
import UploadImage from './UploadImage.vue'
import { createBanner, updateBanner } from '@/api/banner'
import { bannerTypeOptions } from '@/utils/enum'
import { assetUrl } from '@/utils/asset'

defineOptions({ name: 'FormBanner' })
const props = defineProps({
  initBanner: {
    type: Object,
    default: () => ({}),
  },
})
const emit = defineEmits(['success'])

const formRef = ref<any>()
const loading = ref(false)
const banner = ref<Record<string, any>>({})

watch(
  () => props.initBanner,
  (val) => {
    banner.value = { ...val }
    if (!banner.value.type) banner.value.type = 0
  },
  { immediate: true },
)

const onSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    loading.value = true
    const target: Record<string, any> = { ...banner.value }
    if (banner.value.id > 0) {
      const res: any = await updateBanner(target)
      if (res.status === 200) {
        ElMessage.success('修改成功')
        resetFields()
        emit('success', res.data)
      } else {
        ElMessage.error(res.data.message)
      }
    } else {
      const res: any = await createBanner(target)
      if (res.status === 200) {
        ElMessage.success('添加成功')
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
  banner.value = {
    id: 0,
    title: '',
    sort: 0,
    description: '',
    path: '',
    type: 0,
    enable: true,
    url: '',
  }
}
const reset = () => {
  resetFields()
  clearValidate()
}
const success = (res: any) => {
  banner.value.path = res?.data?.path || res?.path || ''
}

defineExpose({ onSubmit, clearValidate, resetFields, reset, success })
</script>