<template>
  <div class="wp-admin-container">
    <el-form
      ref="formArticle"
      label-position="top"
      label-width="80px"
      :model="article"
      class="wp-form"
    >
      <!-- 主内容区域 -->
      <div class="wp-main-layout">
        <!-- 左侧主要内容 -->
        <div class="wp-main-content">
          <!-- 标题输入 -->
          <div class="wp-title-section">
            <el-form-item
              prop="title"
              :rules="[
                { required: true, trigger: 'blur', message: '请输入文章标题' },
              ]"
            >
              <el-input
                v-model="article.title"
                placeholder="在此处添加标题"
                :disabled="!canIPublish"
                size="large"
                class="wp-title-input"
              />
            </el-form-item>
          </div>

          <!-- 内容编辑器 -->
          <div class="wp-editor-section">
            <el-form-item class="wp-editor-item">
              <RichEditor
                v-if="canIPublish"
                v-model="article.content"
                :height="1213"
                placeholder="请输入内容"
              />
              <div v-else class="wp-no-permission-editor">
                <div class="wp-no-permission-hint">
                  <el-icon><Lock /></el-icon>
                  <p>你未登录或没有权限发布文章</p>
                </div>
                <el-input
                  v-model="article.content"
                  type="textarea"
                  :rows="15"
                  :disabled="true"
                  placeholder="你未登录或没有权限发布文章"
                />
              </div>
            </el-form-item>
          </div>
        </div>
        <!-- 右侧边栏 -->
        <div class="wp-sidebar">
          <!-- 发布状态 -->
          <div class="wp-meta-box">
            <h3 class="wp-meta-title">发布</h3>
            <div class="wp-meta-content">
              <div class="wp-publish-actions">
                <el-button
                  type="primary"
                  :icon="loading ? 'Loading' : 'Check'"
                  :disabled="!canIPublish"
                  :loading="loading"
                  class="wp-publish-btn-sidebar"
                  @click="onSubmit"
                >
                  {{
                    canIPublish
                      ? article.id > 0
                        ? '更新文章'
                        : '发布文章'
                      : '你未登录或没有权限发布文章'
                  }}
                </el-button>
              </div>
            </div>
          </div>

          <!-- 分类设置 -->
          <div class="wp-meta-box">
            <h3 class="wp-meta-title">
              分类 <span class="text-danger">*</span>
            </h3>
            <div class="wp-meta-content">
              <el-form-item
                prop="category_id"
                :rules="[
                  {
                    required: true,
                    trigger: 'blur',
                    message: '请选择文章分类',
                  },
                ]"
              >
                <el-cascader
                  v-model="article.category_id"
                  :options="categoryTrees"
                  :disabled="!canIPublish"
                  :filterable="true"
                  :props="{
                    checkStrictly: true,
                    expandTrigger: 'hover',
                    label: 'title',
                    value: 'id',
                  }"
                  clearable
                  placeholder="选择分类"
                  style="width: 100%"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 标签 -->
          <div class="wp-meta-box">
            <h3 class="wp-meta-title">标签</h3>
            <div class="wp-meta-content">
              <el-form-item>
                <el-input
                  v-model="article.keywords"
                  :disabled="!canIPublish"
                  placeholder="添加标签，用逗号分隔"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 摘要 -->
          <div class="wp-meta-box">
            <h3 class="wp-meta-title">摘要</h3>
            <div class="wp-meta-content">
              <el-form-item>
                <el-input
                  v-model="article.description"
                  placeholder="请输入文章摘要描述（可选）"
                  type="textarea"
                  :disabled="!canIPublish"
                  :rows="3"
                  :autosize="{ minRows: 3, maxRows: 6 }"
                  show-word-limit
                  maxlength="500"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 来源信息 -->
          <div class="wp-meta-box">
            <h3 class="wp-meta-title">来源信息</h3>
            <div class="wp-meta-content">
              <el-form-item>
                <el-input
                  v-model="article.source"
                  placeholder="来源名称，如：xx网站名称"
                  :disabled="!canIPublish"
                />
              </el-form-item>
              <el-form-item>
                <el-input
                  v-model="article.source_url"
                  placeholder="来源地址，如：https://www.example.com"
                  :disabled="!canIPublish"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 管理员设置 -->
          <div v-if="isAdmin" class="wp-meta-box">
            <h3 class="wp-meta-title">管理设置</h3>
            <div class="wp-meta-content">
              <el-form-item label="审核状态">
                <el-select v-model="article.status" style="width: 100%">
                  <el-option
                    v-for="item in articleStatusOptions"
                    :key="'s-' + item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="推荐文章">
                <el-switch
                  v-model="article.is_recommend"
                  active-text="是"
                  inactive-text="否"
                  active-color="var(--el-color-success)"
                  inactive-color="var(--el-color-danger)"
                />
              </el-form-item>

              <el-form-item label="文章标识" prop="identifier">
                <el-input
                  v-model="article.identifier"
                  placeholder="文章标识（字母数字组合）"
                  :disabled="article.id > 0"
                  clearable
                />
              </el-form-item>

              <!-- 拒绝原因 -->
              <el-form-item
                v-if="article.status === 2"
                label="拒绝原因"
                prop="reject_reason"
              >
                <el-input
                  v-model="article.reject_reason"
                  placeholder="请输入拒绝原因"
                  type="textarea"
                  :rows="3"
                  show-word-limit
                  maxlength="200"
                />
              </el-form-item>
            </div>
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import { ElMessage } from 'element-plus'
import { createArticle, updateArticle } from '@/api/article'
import { articleStatusOptions } from '@/utils/enum'

defineOptions({ name: 'FormArticle' })

const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false,
  },
  canIPublish: {
    type: Boolean,
    default: false,
  },
  initArticle: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({
      title: '',
      identifier: '',
      keywords: '',
      description: '',
      content: '',
      id: 0,
      category_id: [],
      status: 0,
    }),
  },
  categoryTrees: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['success'])

const formArticle = ref<any>()
const loading = ref(false)

const article = ref<Record<string, any>>({
  title: '',
  identifier: '',
  keywords: '',
  description: '',
  content: '',
  id: 0,
  category_id: [],
  status: 0,
})

watch(
  () => props.initArticle,
  (val) => {
    if (val.recommend_at) val.is_recommend = true
    const target: Record<string, any> = { status: 0, ...val }
    if (props.isAdmin && !target.id) target.status = 1
    article.value = target
  },
  { immediate: true },
)

const onSubmit = () => {
  formArticle.value.validate(async (valid: boolean) => {
    if (!valid) {
      ElMessage.error('请填写标题或选择分类')
      return
    }
    loading.value = true
    const target = { ...article.value }
    if (article.value.id > 0) {
      const res: any = await updateArticle(target)
      if (res.status === 200) {
        ElMessage.success('修改成功')
        emit('success', target)
      } else {
        ElMessage.error(res.data.message)
      }
    } else {
      const res: any = await createArticle(target)
      if (res.status === 200) {
        ElMessage.success('新增成功')
        emit('success', res.data)
        article.value = res.data
      } else {
        ElMessage.error(res.data.message)
      }
    }
    loading.value = false
  })
}

defineExpose({ onSubmit })
</script>
