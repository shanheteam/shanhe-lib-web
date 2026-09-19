<template>
  <div>
    <el-card shadow="never" class="search-card">
      <FormSearch
        :fields="searchFormFields"
        :loading="loading"
        :show-create="true"
        :show-delete="true"
        :disabled-delete="selectedRow.length === 0"
        :default-search="search"
        @onSearch="onSearch"
        @onCreate="onCreate"
        @onDelete="batchDelete"
      >
        <template #buttons>
          <el-form-item>
            <el-tooltip content="批量将链接设置为待嗅探状态">
              <el-button
                :disabled="selectedRow.length === 0"
                type="warning"
                icon="Refresh"
                @click="batchSetStatus(0)"
                >批量嗅探</el-button
              >
            </el-tooltip>
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="spiderUrls"
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
      v-model="formSpiderUrlVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          :content="spiderUrl.id ? '编辑链接' : '新增链接'"
          @back="formSpiderUrlVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormSpiderUrl
          ref="spiderUrlForm"
          :init-spider-url="spiderUrl"
          @success="formSpiderUrlSuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {
  listSpiderUrl,
  deleteSpiderUrl,
  getSpiderUrl,
  batchSetSpiderUrlStatus,
} from '@/api/spiderurl'
import { createLatestGuard } from '@/utils/latest'
import { genLinkHTML, parseQueryIntArray } from '@/utils/utils'
import { spiderUrlStatusOptions } from '@/utils/enum'

defineOptions({ name: 'AdminSpiderUrl' })

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formSpiderUrlVisible = ref(false)
const search = ref<any>({ wd: '', page: 1, status: [], size: 10 })
const spiderUrls = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])
const spiderUrl = ref<any>({ id: 0 })
const spiderUrlForm = ref<any>()

// 翻页/切筛选快速切换时丢弃过期响应
const spiderUrlGuard = createLatestGuard()

async function fetchList() {
  const token = spiderUrlGuard.start()
  loading.value = true
  const res: any = await listSpiderUrl(search.value)
  if (!spiderUrlGuard.isLatest(token)) return
  if (res.status === 200) {
    const list: any[] = res.data.spider_url || []
    list.forEach((item: any) => {
      item.url_html = genLinkHTML(item.url, item.url)
    })
    spiderUrls.value = list
    total.value = res.data.total
  } else {
    ElMessage.error(res.data.message)
  }
  loading.value = false
}

function handleSizeChange(val: number) {
  search.value.size = val
  router.push({ query: search.value })
}

function handlePageChange(val: number) {
  search.value.page = val
  router.push({ query: search.value })
}

function onSearch(searchParams: any) {
  search.value = { ...search.value, ...searchParams, page: 1 }
  router.push({ query: search.value })
}

function onCreate() {
  spiderUrl.value = { id: 0 }
  formSpiderUrlVisible.value = true
  nextTick(() => {
    spiderUrlForm.value && spiderUrlForm.value.reset()
  })
}

async function editRow(row: any) {
  const res: any = await getSpiderUrl({ id: row.id })
  if (res.status === 200) {
    spiderUrl.value = res.data
    formSpiderUrlVisible.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}

function formSpiderUrlSuccess() {
  formSpiderUrlVisible.value = false
  fetchList()
}

function batchSetStatus(status: number) {
  if (selectedRow.value.length === 0) {
    ElMessage.warning('请选择要操作的链接')
    return
  }
  const ids = selectedRow.value.map((item) => item.id)
  const label = spiderUrlStatusOptions[status]?.label
  ElMessageBox.confirm(
    `您确定要将选中的【${selectedRow.value.length}条】链接设置为【${label}】状态吗？`,
    '温馨提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      const res: any = await batchSetSpiderUrlStatus({ id: ids, status })
      if (res.status === 200) {
        ElMessage.success('操作成功')
        fetchList()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}条】链接吗？删除之后不可恢复！`,
    '温馨提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await deleteSpiderUrl({ id: ids })
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
    `您确定要删除链接【${row.url}】吗？删除之后不可恢复！`,
    '温馨提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      const res: any = await deleteSpiderUrl({ id: row.id })
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
    { type: 'text', label: '关键字', name: 'wd', placeholder: '请输入关键字' },
    {
      type: 'select',
      label: '状态',
      name: 'status',
      placeholder: '请选择状态',
      multiple: true,
      options: spiderUrlStatusOptions,
    },
  ]
}

function initTableListFields() {
  const statusEnum: Record<string, any> = {}
  spiderUrlStatusOptions.forEach((item) => {
    statusEnum[item.value] = item
  })
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    { prop: 'status', label: '状态', width: 90, type: 'enum', enum: statusEnum },
    { prop: 'url_html', label: '链接', minWidth: 250, type: 'html' },
    { prop: 'total', label: '发现文档', width: 100, type: 'number' },
    { prop: 'enable_browser', label: '浏览器渲染', width: 100, type: 'bool' },
    { prop: 'frequency', label: '检测频率(天)', width: 110, type: 'number' },
    { prop: 'level', label: '嗅探层级', width: 90, type: 'number' },
    { prop: 'url_prefix', label: '链接前缀', minWidth: 260 },
    { prop: 'include_url_keywords', label: '包含关键字', minWidth: 150 },
    { prop: 'exclude_url_keywords', label: '排除关键字', minWidth: 150 },
    { prop: 'error', label: '错误', minWidth: 150 },
    { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
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
  { immediate: true },
)
</script>
