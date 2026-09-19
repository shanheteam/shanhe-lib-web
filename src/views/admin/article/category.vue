<template>
  <div>
    <el-card shadow="never" class="search-card">
      <FormSearch
        :fields="searchFormFields"
        :loading="loading"
        :show-create="true"
        :show-delete="true"
        :disabled-delete="selectedRow.length === 0"
        @onSearch="onSearch"
        @onCreate="onCreate"
        @onDelete="batchDelete"
      />
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :table-data="trees"
        :loading="loading"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        :tree-props="{ childrenField: 'children' }"
        @selectRow="selectRow"
        @editRow="editRow"
        @deleteRow="deleteRow"
      />
    </el-card>
    <el-drawer
      v-model="formVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          :content="category.id ? '编辑分类' : '新增分类'"
          @back="formVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormCategory
          ref="categoryForm"
          :init-category="category"
          :trees="trees"
          :type="1"
          @success="formCategorySuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useCategoryStore } from '@/store/category'
import * as categoryApi from '@/api/category'
import { categoryToTrees, parseQueryIntArray } from '@/utils/utils'

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()

const loading = ref(false)
const formVisible = ref(false)
const search = ref<any>({
  wd: '',
  status: [],
})
const categories = ref<any[]>([])
const trees = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])
const category = ref<any>({ id: 0, title: '', cover: '', sort: '', icon: '' })
const categoryTypeArticle = [1]

async function fetchList() {
  loading.value = true
  const res: any = await categoryApi.listCategory({
    ...search.value,
    type: categoryTypeArticle,
  })
  if (res.status === 200) {
    let categoryList: any[] = res.data.category || []
    categoryList = categoryList.map((item: any) => {
      item.disable_delete = item.doc_count > 0
      return item
    })
    categories.value = categoryList
    trees.value = categoryToTrees(categoryList)
    total.value = res.data.total
  } else {
    ElMessage.error(res.data.message)
  }
  loading.value = false
}

function onSearch(searchParams: any) {
  search.value = { ...searchParams, ...search.value, page: 1 }
  if (
    location.pathname + location.search ===
    router.resolve({
      query: search.value,
    }).href
  ) {
    fetchList()
  } else {
    router.push({
      query: search.value,
    })
  }
}

function onCreate() {
  category.value = {
    id: 0,
    enable: true,
    title: '',
    cover: '',
    icon: '',
    parent_id: 0,
    sort: 0,
  }
  formVisible.value = true
}

async function editRow(row: any) {
  const res: any = await categoryApi.getCategory({ id: row.id })
  if (res.status === 200) {
    category.value = { cover: '', icon: '', ...res.data }
    formVisible.value = true
  } else {
    ElMessage.error(res.data.message || '查询失败')
  }
}

function formCategorySuccess() {
  formVisible.value = false
  categoryStore.getCategories()
  fetchList()
}

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}个】分类吗？本次删除会连同子分类一起删除，删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await categoryApi.deleteCategory({ id: ids })
      if (res.status === 200) {
        ElMessage.success('删除成功')
        fetchList()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

function deleteRow(row: any) {
  ElMessageBox.confirm(
    `您确定要删除分类【${row.title}】吗？本次删除会连同子分类一起删除，删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await categoryApi.deleteCategory({ id: row.id })
      if (res.status === 200) {
        ElMessage.success('删除成功')
        fetchList()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

function selectRow(rows: any[]) {
  selectedRow.value = rows
}

function initSearchForm() {
  searchFormFields.value = [
    {
      type: 'text',
      label: '关键字',
      name: 'wd',
      placeholder: '请输入关键字',
    },
    {
      type: 'select',
      label: '状态',
      name: 'enable',
      placeholder: '请选择状态',
      multiple: true,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  ]
}

function initTableListFields() {
  if (tableListFields.value.length > 0) {
    return
  }
  tableListFields.value = [
    { prop: 'title', label: '名称', minWidth: 120, fixed: 'left' },
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    {
      prop: 'enable',
      label: '是否启用',
      width: 80,
      type: 'bool',
    },
    {
      prop: 'show_description',
      label: '显示描述',
      width: 80,
      type: 'bool',
    },
    {
      prop: 'sort',
      label: '排序',
      width: 80,
      type: 'number',
    },
    { prop: 'icon', label: '图标', width: 48, type: 'image' },
    { prop: 'cover', label: '封面', width: 100, type: 'image' },
    { prop: 'doc_count', label: '文章数', width: 80, type: 'number' },
    { prop: 'description', label: '分类描述', minWidth: 200 },
    { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
    { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
  ]
}

initSearchForm()

watch(
  () => route.query,
  async () => {
    search.value = {
      ...search.value,
      ...route.query,
      ...parseQueryIntArray(route.query, ['enable']),
    }
    await initTableListFields()
    fetchList()
  },
  { immediate: true }
)
</script>
