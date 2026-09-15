<template>
  <div>
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
        :table-data="documents"
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
import { listCategory } from '@/api/category'
import {
  clearRecycleDocument,
  deleteRecycleDocument,
  listRecycleDocument,
  recoverRecycleDocument,
} from '@/api/document'
import { categoryToTrees, parseQueryIntArray, genLinkHTML } from '@/utils/utils'
import { documentStatusOptions } from '@/utils/enum'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formVisible = ref(false)
const search = ref<any>({
  page: 1,
  size: 10,
})
const documents = ref<any[]>([])
const trees = ref<any[]>([])
const categoryMap = ref<Record<string, any>>({})
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])

async function fetchCategories() {
  const res: any = await listCategory({ field: ['id', 'parent_id', 'title'] })
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
    initSearchForm()
  } else {
    ElMessage.error(res.data.message)
  }
}

async function fetchList() {
  loading.value = true
  const searchParams = { ...search.value }
  if (
    searchParams.category_id &&
    typeof searchParams.category_id === 'object'
  ) {
    searchParams.category_id =
      searchParams.category_id[searchParams.category_id.length - 1]
  }
  const res: any = await listRecycleDocument(searchParams)
  loading.value = false
  if (res.status === 200) {
    const docs: any[] = res.data.document || []
    docs.forEach((item: any) => {
      item.title_html = genLinkHTML(item.title, `/document/${item.uuid}`)
      item.username_html = genLinkHTML(
        item.realname || item.user?.realname || item.username,
        `/user/${item.user_id}`)
    })

    documents.value = docs
    total.value = res.data.total
  } else {
    ElMessage.error(res.data.message)
  }
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

function recoverRow(row: any) {
  ElMessageBox.confirm(`您确定要恢复文档【${row.title}】吗？`, '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
  })
    .then(async () => {
      const res: any = await recoverRecycleDocument({ id: [row.id] })
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
    '您确定要永久删除回收站中的所有文档吗？清空之后不可恢复，请慎重操作！',
    '风险提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error',
    }
  )
    .then(async () => {
      const res: any = await clearRecycleDocument({ id: 0 })
      if (res.status === 200) {
        ElMessage.success('清空成功')
        fetchList()
      } else {
        ElMessage.error(res.data.message || '操作失败')
      }
    })
    .catch(() => {})
}

function batchRecover() {
  ElMessageBox.confirm(
    `您确定要从回收站中恢复选中的【${selectedRow.value.length}个】文档吗？`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await recoverRecycleDocument({ id: ids })
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
    `您确定要从回收站中删除选中的【${selectedRow.value.length}个】文档吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await deleteRecycleDocument({ id: ids })
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
    `您确定要从回收站中删除文档【${row.title}】吗？删除之后不可恢复！`,
    '告警',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await deleteRecycleDocument({ id: row.id })
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
      name: 'status',
      placeholder: '请选择状态',
      multiple: true,
      options: documentStatusOptions,
    },
    // 级联
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
  const statusMap: Record<string, any> = {}
  documentStatusOptions.forEach((item) => {
    statusMap[item.value] = item
  })
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    {
      prop: 'title_html',
      label: '名称',
      minWidth: 200,
      fixed: 'left',
      type: 'html',
    },
    { prop: 'username_html', label: '上传者', width: 120, type: 'html' },
    { prop: 'deleted_username', label: '删除者', width: 120 },
    { prop: 'deleted_at', label: '删除时间', width: 170, type: 'datetime' },
    {
      prop: 'status',
      label: '状态',
      width: 120,
      type: 'enum',
      enum: statusMap,
    },
    {
      prop: 'category',
      label: '分类',
      minWidth: 180,
      type: 'category',
    },
    { prop: 'pages', label: '页数', width: 80, type: 'number' },
    { prop: 'price', label: '价格', width: 80, type: 'number' },
    { prop: 'download_count', label: '下载', width: 80, type: 'number' },
    { prop: 'view_count', label: '浏览', width: 80, type: 'number' },
    { prop: 'favorite_count', label: '收藏', width: 80, type: 'number' },
    { prop: 'comment_count', label: '评论', width: 80, type: 'number' },
    { prop: 'keywords', label: '关键字', minWidth: 200 },
    { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
    { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
  ]
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
      ...parseQueryIntArray(route.query, ['category_id', 'status']),
    }

    // 需要先加载分类数据
    if (trees.value.length === 0) {
      await fetchCategories()
    }
    await fetchList()
  },
  { immediate: true }
)
</script>
<style></style>