<template>
  <div class="com-form-update-articles-category">
    <el-form ref="formEl" label-position="top" label-width="80px" :model="form">
      <el-form-item
        label="新文章分类"
        prop="category_id"
        :rules="[
          { required: true, trigger: 'blur', message: '请选择新的文章分类' },
        ]"
      >
        <el-cascader
          v-model="form.category_id"
          :options="categoryTrees"
          :filterable="true"
          :props="{
            checkStrictly: true,
            expandTrigger: 'hover',
            label: 'title',
            value: 'id',
          }"
          clearable
          placeholder="请选择新的文章分类"
        ></el-cascader>
      </el-form-item>
      <el-form-item label="文章列表" class="document-list">
        <ArticleSimpleList :articles="articles" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="Check"
          @click="setArticlesCategory"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { setArticlesCategory as setArticlesCategoryApi } from '@/api/article'

defineOptions({ name: 'FormUpdateArticlesCategory' })
const props = defineProps({
  categoryTrees: {
    type: Array,
    default: () => [],
  },
  articles: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['success'])

const formEl = ref<any>()
const form = ref<Record<string, any>>({
  category_id: [],
  article_id: [],
})

const setArticlesCategory = () => {
  formEl.value.validate((valid: boolean) => {
    if (valid) {
      ElMessageBox.confirm('您确定要批量修改文章分类吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          form.value.article_id = (props.articles as any[]).map((item) => item.id)
          const res: any = await setArticlesCategoryApi(form.value)
          if (res.status === 200) {
            ElMessage.success('修改成功')
            emit('success', res.data)
          }
        })
        .catch(() => {})
    }
  })
}
</script>
