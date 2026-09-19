<template>
  <div class="page-admin-article">
    <el-card shadow="never" class="search-card">
      <FormSearch
        :fields="searchFormFields"
        :loading="loading"
        :show-create="false"
        :show-delete="false"
        :disabled-delete="selectedRow.length === 0"
        :default-search="search"
        @onSearch="onSearch"
      >
        <template #buttons>
          <el-form-item>
            <el-button
              type="success"
              :icon="RefreshLeft"
              :disabled="selectedRow.length === 0"
              @click="batchRecover"
              >恢复选中</el-button
            >
          </el-form-item>
          <el-form-item>
            <el-button
              type="warning"
              :icon="Close"
              :disabled="selectedRow.length === 0"
              @click="batchDelete"
              >删除选中</el-button
            >
          </el-form-item>
          <el-form-item>
            <el-button
              type="danger"
              :disabled="selectedRow.length > 0"
              :icon="Delete"
              @click="clearAll"
              >清空回收站</el-button
            >
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="articles"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="false"
        :show-delete="true"
        :show-select="true"
        @selectRow="selectRow"
        @deleteRow="deleteRow"
      >
        <template #actions="scope">
          <el-button
            link
            :icon="RefreshLeft"
            size="small"
            @click="recoverRow(scope.row)"
            >恢复</el-button
          >
        </template>
      </TableListV2>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <div class="text-right">
        <el-pagination
          background
          :current-page="search.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="search.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        >
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { RefreshLeft, Close, Delete } from '@element-plus/icons-vue'
import {
  listRecycleArticle,
  restoreRecycleArticle,
  deleteRecycleArticle,
  emptyRecycleArticle,
} from '@/api/article'
import { listCategory } from '@/api/category'
import { createLatestGuard } from '@/utils/latest'
import { genLinkHTML, categoryToTrees } from '@/utils/utils'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formArticleVisible = ref(false)
const search = ref<any>({
  wd: '',
  page: 1,
  status: [],
  size: 10,
})
const articles = ref<any[]>([])
const total = ref(0)
const trees = ref<any[]>([])
const categoryMap = ref<Record<string, any>>({})
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])
const formArticlesCategoryVisible = ref(false)
const categoryArticles = ref<any[]>([])

function batchRecover() {
  ElMessageBox.confirm(
    `您确定要从回收站中恢复选中的【${selectedRow.value.length}篇】文章吗？`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await restoreRecycleArticle({ id: ids })
      if (res.status === 200) {
        ElMessage.success('恢复成功')
        fetchList()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要从回收站中删除选中的【${selectedRow.value.length}篇】文章吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await deleteRecycleArticle({ id: ids })
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
    `您确定要从回收站中删除文章【${row.title}】吗？删除之后不可恢复！`,
    '告警',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await deleteRecycleArticle({ id: [row.id] })
      if (res.status === 200) {
        ElMessage.success('删除成功')
        fetchList()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

function recoverRow(row: any) {
  ElMessageBox.confirm(`您确定要恢复文章【${row.title}】吗？`, '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
  })
    .then(async () => {
      const res: any = await restoreRecycleArticle({ id: [row.id] })
      if (res.status === 200) {
        ElMessage.success('恢复成功')
        fetchList()
      } else {
        ElMessage.error(res.data.message || '操作失败')
      }
    })
    .catch(() => {})
}

function clearAll() {
  ElMessageBox.confirm(
    '您确定要永久删除回收站中的所有文章吗？清空之后不可恢复，请慎重操作！',
    '风险提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error',
    }
  )
    .then(async () => {
      const res: any = await emptyRecycleArticle()
      if (res.status === 200) {
        ElMessage.success('清空成功')
        fetchList()
      } else {
        ElMessage.error(res.data.message || '操作失败')
      }
    })
    .catch(() => {})
}

async function fetchCategories() {
  const res: any = await listCategory({
    field: ['id', 'parent_id', 'title'],
    type: [1], // 筛选文章分类
  })
  if (res.status === 200) {
    let categories: any[] = res.data.category || []
    categories = categories.map((item: any) => {
      item.disable_delete = item.doc_count > 0
      return item
    })

    const categoryMapTemp: Record<string, any> = {}
    categories.forEach((item: any) => {
      categoryMapTemp[item.id] = item
    })
    categoryMap.value = categoryMapTemp
    trees.value = categoryToTrees(categories, false)
    total.value = res.data.total
    await initSearchForm()
  } else {
    ElMessage.error(res.data.message)
  }
}

// 翻页/切筛选快速切换时丢弃过期响应
const articleRecycleGuard = createLatestGuard()

async function fetchList() {
  const token = articleRecycleGuard.start()
  loading.value = true
  const res: any = await listRecycleArticle(search.value)
  if (!articleRecycleGuard.isLatest(token)) return
  if (res.status === 200) {
    const list: any[] = res.data.article || []
    list.map((item: any) => {
      item.title_html = genLinkHTML(item.title, `/article/${item.identifier}`)
      return item
    })
    articles.value = list
    total.value = res.data.total
  } else {
    ElMessage.error(res.data.message)
  }
  loading.value = false
}

function handleSizeChange(val: number) {
  search.value.size = val
  router.push({
    query: search.value,
  })
}

function handlePageChange(val: number) {
  search.value.page = val
  router.push({
    query: search.value,
  })
}

function onSearch(searchParams: any) {
  search.value = { ...search.value, ...searchParams, page: 1 }
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
      type: 'cascader',
      label: '分类',
      name: 'category_id',
      placeholder: '请选择分类',
      trees: trees.value,
    },
  ]
}

function initTableListFields() {
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    {
      prop: 'title_html',
      label: '标题',
      minWidth: 150,
      fixed: 'left',
      type: 'html',
    },
    { prop: 'identifier', label: '标识', width: 200 },
    { prop: 'view_count', label: '浏览', width: 80, type: 'number' },
    {
      prop: 'category',
      label: '分类',
      minWidth: 180,
      type: 'category',
    },
    { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
    { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
    { prop: 'deleted_at', label: '删除时间', width: 170, type: 'datetime' },
  ]
}

function batchUpdateArticlesCategory() {
  categoryArticles.value = selectedRow.value
  formArticlesCategoryVisible.value = true
}

initTableListFields()

watch(
  () => route.query,
  async () => {
    search.value = {
      ...search.value,
      ...route.query,
      page: parseInt(route.query.page as string) || 1,
      size: parseInt(route.query.size as string) || 10,
    }
    // 需要先加载分类数据
    if (trees.value.length === 0) {
      await fetchCategories()
    }
    fetchList()
  },
  { immediate: true }
)
</script>
