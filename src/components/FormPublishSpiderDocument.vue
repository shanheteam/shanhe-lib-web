<template>
  <div class="com-form-publish-spider-document">
    <el-form ref="formRef" :model="form" label-position="top">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="用户ID"
            prop="user_id"
            :rules="[{ required: true, message: '请输入用户ID', trigger: 'blur' }]"
          >
            <el-input-number v-model="form.user_id"></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="发布到分类"
            prop="category_id"
            :rules="[
              { required: true, message: '请选择发布到文档的分类', trigger: 'change' },
            ]"
          >
            <el-cascader
              v-model="form.category_id"
              :options="trees"
              :props="{
                checkStrictly: true,
                expandTrigger: 'hover',
                label: 'title',
                value: 'id',
              }"
              clearable
              filterable
              placeholder="请选择发布到文档的分类"
            ></el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文档价格" prop="price">
            <el-input-number v-model="form.price"></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文档语言(只对未指定语言文档有效)" prop="language">
            <el-select
              v-model="form.language"
              filterable
              clearable
              placeholder="请选择文档语言"
            >
              <el-option
                v-for="item in settingStore.settings.language"
                :key="item.code"
                :label="item.language"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="文档清单" prop="documents">
        <el-alert
          type="warning"
          title="只有【采集成功】且【标题不为空】的文档才能满足发布条件"
          show-icon
        ></el-alert>
        <el-table :data="documents" height="360">
          <el-table-column prop="status" label="发布条件" width="80">
            <template #default="scope">
              <el-tag
                v-if="scope.row.status === 3 && scope.row.title"
                type="success"
                size="small"
                >满足</el-tag
              >
              <el-tag v-else type="danger" size="small">不满足</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="language" label="语言" width="140">
            <template #default="scope">
              <el-select
                v-model="scope.row.language"
                filterable
                clearable
                placeholder="请选择"
                size="small"
              >
                <el-option
                  v-for="item in settingStore.settings.language"
                  :key="item.code"
                  :label="item.language"
                  :value="item.code"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题"></el-table-column>
          <el-table-column prop="size" label="大小" width="90">
            <template #default="scope">{{ formatBytes(scope.row.size) }}</template>
          </el-table-column>
          <el-table-column prop="ext" width="80" label="扩展名"></el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="Check"
          :disabled="
            documents.filter((item) => item.title && item.status === 3).length === 0
          "
          @click="batchUpdateSpiderDocuments"
          >提交发布</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listCategory } from '@/api/category'
import { batchUpdateSpiderDocument } from '@/api/spiderdocument'
import { formatBytes, categoryToTrees } from '@/utils/utils'
import { useSettingStore } from '@/store/setting'

defineOptions({ name: 'FormPublishSpiderDocument' })

const props = defineProps({
  documents: {
    type: Array as () => any[],
    default: () => [],
  },
})
const emit = defineEmits(['success'])

const settingStore = useSettingStore()
const formRef = ref<any>(null)
const trees = ref<any[]>([])
const form = ref<any>({
  user_id: Number(localStorage.getItem('user_id')) || 0,
  category_id: [],
  status: 5,
  price: 0,
  language: '',
})

async function fetchCategories() {
  const res: any = await listCategory({
    field: ['id', 'parent_id', 'title', 'type'],
    type: [0],
  })
  if (res.status === 200) {
    trees.value = categoryToTrees(res.data.category || [], false)
  }
}

function batchUpdateSpiderDocuments() {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    if (!form.value.user_id) {
      ElMessage.error('请输入用户ID')
      return
    }
    const docs = props.documents.map((item: any) => {
      const newItem = {
        ...item,
        status: item.status === 3 ? 5 : item.status,
        category_id: JSON.stringify(form.value.category_id),
        user_id: form.value.user_id,
        price: form.value.price || 0,
        language: item.language || form.value.language,
      }
      localStorage.setItem('user_id', String(form.value.user_id))
      delete newItem.url_html
      delete newItem.editing
      delete newItem.disable_delete
      delete newItem.children
      return newItem
    })

    const newDocs = docs.filter((item) => item.title && item.status === 5)
    if (newDocs.length === 0) {
      ElMessage.error('文档正式标题为空，无法发布')
      return
    }
    if (newDocs.length !== docs.length) {
      ElMessage.warning('已跳过部分标题为空的文档')
    }

    const res: any = await batchUpdateSpiderDocument({
      spider_document: newDocs,
    })
    if (res.status === 200) {
      ElMessage.success('加入发布队列成功')
      emit('success')
    } else {
      ElMessage.error(res.data.message)
    }
  })
}

onMounted(() => {
  fetchCategories()
})
</script>
