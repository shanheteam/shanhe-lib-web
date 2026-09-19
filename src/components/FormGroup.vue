<template>
  <div class="com-form-group">
    <el-form
      ref="formRef"
      label-position="top"
      label-width="80px"
      :model="group"
    >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item
            label="名称"
            prop="title"
            :rules="[
              { required: true, trigger: 'blur', message: '请输入名称' },
            ]"
          >
            <el-input
              v-model="group.title"
              placeholder="请输入名称"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="排序(值越大越靠前)">
            <el-input-number
              v-model.number="group.sort"
              clearable
              :min="0"
              :step="1"
              placeholder="请输入排序值"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否为默认用户组">
            <el-switch
              v-model="group.is_default"
              style="display: block"
              active-color="var(--app-color-switch-on)"
              inactive-color="var(--app-color-switch-off)"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="允许上传文档">
            <el-switch
              v-model="group.enable_upload"
              style="display: block"
              active-color="var(--app-color-switch-on)"
              inactive-color="var(--app-color-switch-off)"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="文档需要审核">
            <el-switch
              v-model="group.enable_document_review"
              style="display: block"
              active-color="var(--app-color-switch-on)"
              inactive-color="var(--app-color-switch-off)"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否允许评论">
            <el-switch
              v-model="group.enable_comment"
              style="display: block"
              active-color="var(--app-color-switch-on)"
              inactive-color="var(--app-color-switch-off)"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="评论需要审核">
            <el-switch
              v-model="group.enable_comment_approval"
              style="display: block"
              active-color="var(--app-color-switch-on)"
              inactive-color="var(--app-color-switch-off)"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="允许发布文章">
            <el-switch
              v-model="group.enable_article"
              style="display: block"
              active-color="var(--app-color-switch-on)"
              inactive-color="var(--app-color-switch-off)"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="文章需要审核">
            <el-switch
              v-model="group.enable_article_approval"
              style="display: block"
              active-color="var(--app-color-switch-on)"
              inactive-color="var(--app-color-switch-off)"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="描述">
        <el-input
          v-model="group.description"
          type="textarea"
          :rows="5"
          placeholder="请输入分组描述"
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
import { createGroup, updateGroup } from '@/api/group'

defineOptions({ name: 'FormGroup' })
const props = defineProps({
  initGroup: {
    type: Object,
    default: () => ({}),
  },
})
const emit = defineEmits(['success'])

const formRef = ref<any>()
const loading = ref(false)
const group = ref<Record<string, any>>({ sort: 0 })

watch(
  () => props.initGroup,
  (val) => {
    const target = { ...val }
    if (!target.sort) target.sort = 0
    group.value = target
  },
  { immediate: true },
)

const onSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    loading.value = true
    const target = { ...group.value }
    if (target.id > 0) {
      const res: any = await updateGroup(target)
      if (res.status === 200) {
        ElMessage.success('修改成功')
        emit('success')
      } else {
        ElMessage.error(res.data.message)
      }
    } else {
      const res: any = await createGroup(target)
      if (res.status === 200) {
        ElMessage.success('新增成功')
        emit('success')
      } else {
        ElMessage.error(res.data.message)
      }
    }
    loading.value = false
  })
}

defineExpose({ onSubmit })
</script>