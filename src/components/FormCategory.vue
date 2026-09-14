<template>
  <div class="com-form-category">
    <el-form
      ref="formRef"
      label-position="top"
      label-width="80px"
      :model="category"
    >
      <el-form-item label="上级分类">
        <el-cascader
          v-model="category.parent_id"
          :options="trees"
          :filterable="true"
          :props="{
            checkStrictly: true,
            expandTrigger: 'hover',
            label: 'title',
            value: 'id',
          }"
          clearable
          placeholder="请选择上级分类"
        ></el-cascader>
      </el-form-item>
      <!-- 创建的时候，不支持上传封面。因为创建的时候，支持批量创建 -->
      <el-form-item
        v-if="
          category.id > 0 &&
          (!category.parent_id ||
            category.parent_id === 0 ||
            category.parent_id.length === 0)
        "
        label="分类图标(请上传长宽比为1:1的小图片)"
        class="form-item-cover"
      >
        <UploadImage
          :action="'/api/v1/upload/category'"
          :image="assetUrl(category.icon)"
          :width="'48px'"
          @success="successUploadIcon"
        />
      </el-form-item>
      <el-form-item
        v-if="
          category.id > 0 &&
          (!category.parent_id ||
            category.parent_id === 0 ||
            category.parent_id.length === 0)
        "
        label="分类封面(一级分类才需要上传)"
        class="form-item-cover"
      >
        <UploadImage
          :action="'/api/v1/upload/category'"
          :image="assetUrl(category.cover)"
          :width="'180px'"
          @success="successUpload"
        />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item
            label="名称"
            prop="title"
            :rules="[
              { required: true, trigger: 'blur', message: '请输入名称' },
            ]"
          >
            <el-input
              v-model="category.title"
              :placeholder="
                category.id > 0
                  ? '请输入分类名称'
                  : '请输入分类名称，多个分类名称换行输入，重复的分类名称自动跳过...'
              "
              :type="category.id > 0 ? 'text' : 'textarea'"
              :rows="5"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="排序(值越大越靠前)">
            <el-input-number
              v-model.number="category.sort"
              clearable
              :min="0"
              :step="1"
              placeholder="请输入排序值"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item v-if="initCategory.id > 0" label="描述" prop="description">
        <el-input
          v-model="category.description"
          :type="'textarea'"
          description="请输入描述，支持换行"
          :rows="5"
          clearable
        ></el-input>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否启用">
            <el-switch
              v-model="category.enable"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch> </el-form-item
        ></el-col>
        <el-col v-if="initCategory.id > 0" :span="12">
          <el-form-item label="显示分类描述">
            <el-switch
              v-model="category.show_description"
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
import UploadImage from './UploadImage.vue'
import { createCategory, updateCategory } from '@/api/category'
import { assetUrl } from '@/utils/asset'

defineOptions({ name: 'FormCategory' })
const props = defineProps({
  initCategory: {
    type: Object,
    default: () => ({
      id: 0,
      title: '',
      sort: 0,
      enable: false,
      cover: '',
      icon: '',
    }),
  },
  trees: {
    type: Array,
    default: () => [],
  },
  type: {
    // 0: 文档分类 1: 文章分类
    type: Number,
    default: 0,
  },
})
const emit = defineEmits(['success'])

const formRef = ref<any>()
const loading = ref(false)
const category = ref<Record<string, any>>({
  id: 0,
  title: '',
  sort: 0,
  enable: false,
  cover: '',
  icon: '',
})

watch(
  () => props.initCategory,
  (val) => {
    if (!val.sort) val.sort = 0
    if (!val.cover) val.cover = ''
    if (!val.icon) val.icon = ''
    category.value = { ...val }
  },
  { immediate: true },
)

const onSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    loading.value = true
    const target: Record<string, any> = { ...category.value, type: props.type }
    if (target.parent_id) {
      if (typeof target.parent_id === 'object') {
        target.parent_id = target.parent_id[target.parent_id.length - 1]
      }
    } else {
      target.parent_id = 0
    }

    if (category.value.id > 0) {
      if (
        target.parent_id > 0 ||
        (typeof target.parent_id === 'object' && target.parent_id.length > 0)
      ) {
        target.cover = ''
      }

      const res: any = await updateCategory(target)
      if (res.status === 200) {
        ElMessage.success('修改成功')
        resetFields()
        emit('success', res.data)
      } else {
        ElMessage.error(res.data.message)
      }
    } else {
      const res: any = await createCategory(target)
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
  category.value = { title: '', cover: '', sort: 0, ...props.initCategory }
}
const reset = () => {
  resetFields()
  clearValidate()
}
const successUpload = (res: any) => {
  category.value.cover = res.data.path
}
const successUploadIcon = (res: any) => {
  category.value.icon = res.data.path
}

defineExpose({ onSubmit, clearValidate, resetFields, reset, successUpload, successUploadIcon })
</script>
<style lang="scss">
.com-form-category {
  .form-item-cover {
    .el-form-item__content {
      line-height: 1;
    }
  }
}
</style>