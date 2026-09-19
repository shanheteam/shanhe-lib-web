<template>
  <div class="com-form-update-documents-language">
    <el-form ref="formEl" label-position="top" label-width="80px" :model="form">
      <el-form-item
        label="文档语言"
        prop="language"
        :rules="[
          { required: true, trigger: 'blur', message: '请选择新的文档语言' },
        ]"
      >
        <el-select
          v-model="form.language"
          filterable
          placeholder="请选择新的文档语言"
        >
          <el-option
            v-for="item in settings.language"
            :key="item.code"
            :label="item.language"
            :value="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="文档列表" class="document-list">
        <DocumentSimpleList :target="'_blank'" :docs="documents" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="Check"
          @click="setDocumentsLanguage"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { setDocumentsLanguage as setDocumentsLanguageApi } from '@/api/document'
import { useSettingStore } from '@/store/setting'

defineOptions({ name: 'FormUpdateDocumentsLanguage' })
const props = defineProps({
  documents: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['success'])

const settingStore = useSettingStore()
const settings = computed(() => settingStore.settings)

const formEl = ref<any>()
const form = ref<Record<string, any>>({
  language: '',
  document_id: [],
})

const setDocumentsLanguage = () => {
  formEl.value.validate((valid: boolean) => {
    if (valid) {
      ElMessageBox.confirm('您确定要批量修改文档语言吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          form.value.document_id = (props.documents as any[]).map((item) => item.id)
          const res: any = await setDocumentsLanguageApi(form.value)
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
