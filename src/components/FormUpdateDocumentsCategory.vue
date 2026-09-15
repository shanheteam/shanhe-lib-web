<template>
  <div class="com-form-update-documents-category">
    <el-form ref="formEl" label-position="top" label-width="80px" :model="form">
      <el-form-item
        label="新文档分类"
        prop="category_id"
        :rules="[
          { required: true, trigger: 'blur', message: '请选择新的文档分类' },
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
          placeholder="请选择新的文档分类"
        ></el-cascader>
      </el-form-item>
      <el-form-item label="文档列表" class="document-list">
        <DocumentSimpleList :target="'_blank'" :docs="documents" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="Check"
          @click="setDocumentsCategory"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { setDocumentsCategory as setDocumentsCategoryApi } from '@/api/document'

defineOptions({ name: 'FormUpdateDocumentsCategory' })
const props = defineProps({
  categoryTrees: {
    type: Array,
    default: () => [],
  },
  documents: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['success'])

const formEl = ref<any>()
const form = ref<Record<string, any>>({
  category_id: [],
  document_id: [],
})

const setDocumentsCategory = () => {
  formEl.value.validate((valid: boolean) => {
    if (valid) {
      ElMessageBox.confirm('您确定要批量修改文档分类吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          form.value.document_id = (props.documents as any[]).map((item) => item.id)
          const res: any = await setDocumentsCategoryApi(form.value)
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
<style lang="scss">
.com-form-update-documents-category {
  .document-list {
    ul,
    li {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    ul {
      max-height: 300px;
      overflow: auto;
    }
    li {
      line-height: 30px;
      color: #777;
    }
  }
}
</style>