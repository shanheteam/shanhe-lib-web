<template>
  <div>
    <el-card shadow="never" class="search-card">
      <FormSearch
        :fields="searchFormFields"
        :loading="loading"
        :show-create="false"
        :show-delete="true"
        :disabled-delete="selectedRow.length === 0"
        :default-search="search"
        @onSearch="onSearch"
        @onCreate="onCreate"
        @onDelete="batchDelete"
      />
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="reports"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        @selectRow="selectRow"
        @editRow="editRow"
        @deleteRow="deleteRow"
      />
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
    <el-drawer
      v-model="formReportVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          :content="report.id ? '编辑举报' : '新增举报'"
          @back="formReportVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormReport
          ref="reportForm"
          :init-report="report"
          :is-admin="true"
          @success="formReportSuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { listReport, deleteReport } from '@/api/report'
import { reportOptions } from '@/utils/enum'
import { parseQueryIntArray, genLinkHTML } from '@/utils/utils'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formReportVisible = ref(false)
const search = ref<any>({
  wd: '',
  page: 1,
  status: [],
  size: 10,
})
const reports = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])
const report = ref<any>({ id: 0 })
const reportForm = ref<any>()

async function fetchList() {
  loading.value = true
  const res: any = await listReport(search.value)
  if (res.status === 200) {
    const list: any[] = res.data.report || []
    list.map((item: any) => {
      item.username_html = genLinkHTML(item.username, `/user/${item.user_id}`)
      item.document_title_html = genLinkHTML(
        item.document_title,
        `/document/${item.document_uuid}`
      )
    })
    reports.value = list
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

function onCreate() {
  report.value = { id: 0 }
  formReportVisible.value = true
  nextTick(() => {
    reportForm.value && reportForm.value.reset()
  })
}

async function editRow(row: any) {
  report.value = row
  formReportVisible.value = true
}

function formReportSuccess() {
  formReportVisible.value = false
  fetchList()
}

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}条】举报吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await deleteReport({ id: ids })
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
    `您确定要删除对文档【${row.document_title}】的举报吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await deleteReport({ id: row.id })
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
      options: [
        { label: '已处理', value: 1 },
        { label: '未处理', value: 0 },
      ],
    },
  ]
}

function initTableListFields() {
  const reasonEnum: Record<string, any> = {}
  reportOptions.forEach((item) => {
    reasonEnum[item.value] = item
  })

  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    {
      prop: 'status',
      label: '是否已处理',
      width: 100,
      type: 'bool',
      fixed: 'left',
    },
    {
      prop: 'document_title_html',
      label: '文档',
      minWidth: 150,
      fixed: 'left',
      type: 'html',
    },
    {
      prop: 'reason',
      label: '举报原因',
      width: 80,
      type: 'enum',
      enum: reasonEnum,
    },
    {
      prop: 'username_html',
      label: '举报人',
      width: 100,
      type: 'html',
    },
    { prop: 'remark', label: '处理描述', minWidth: 150 },
    { prop: 'created_at', label: '举报时间', width: 170, type: 'datetime' },
    { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
  ]
}

initSearchForm()
initTableListFields()

watch(
  () => route.query,
  () => {
    search.value = {
      ...search.value,
      ...route.query,
      page: parseInt(route.query.page as string) || 1,
      size: parseInt(route.query.size as string) || 10,
      ...parseQueryIntArray(route.query, ['status']),
    }
    fetchList()
  },
  { immediate: true }
)
</script>
<style></style>