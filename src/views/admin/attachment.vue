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
        @onDelete="batchDelete"
      >
        <template #buttons>
          <el-form-item>
            <el-tooltip
              content="附件只能查看，不能直接删除，而是由系统直接管理，会随着相应数据的删除而自动删除。"
            >
              <el-button link :icon="InfoFilled"></el-button>
            </el-tooltip>
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="listData"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="false"
        :show-select="false"
        :actions-min-width="90"
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
      v-model="formVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header content="编辑附件" @back="formVisible = false">
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormAttachment :init-attachment="attachment" @success="formSuccess" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { InfoFilled } from '@element-plus/icons-vue'
import {
  listAttachment,
  deleteAttachment,
  getAttachment,
} from '@/api/attachment'
import { attachmentTypeOptions } from '@/utils/enum'
import { createLatestGuard } from '@/utils/latest'
import { parseQueryIntArray } from '@/utils/utils'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formVisible = ref(false)
const search = ref<any>({
  wd: '',
  page: 1,
  size: 10,
})
const listData = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])
const attachment = ref<any>({})

// 翻页/切筛选快速切换时丢弃过期响应
const attachmentGuard = createLatestGuard()

async function fetchList() {
  const token = attachmentGuard.start()
  loading.value = true
  const res: any = await listAttachment(search.value)
  if (!attachmentGuard.isLatest(token)) return
  if (res.status === 200) {
    listData.value = res.data.attachment
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

async function editRow(row: any) {
  const res: any = await getAttachment({ id: row.id })
  if (res.status === 200) {
    attachment.value = res.data
    formVisible.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}

function formSuccess() {
  formVisible.value = false
  fetchList()
}

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}个】附件吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await deleteAttachment({ id: ids })
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
    `您确定要删除附件【${row.name}】吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await deleteAttachment({ id: row.id })
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
      label: '附件类型',
      name: 'type',
      placeholder: '请选择附件类型',
      multiple: true,
      options: attachmentTypeOptions,
    },
    {
      type: 'select',
      label: '是否合法',
      name: 'enable',
      placeholder: '请选择是否合法',
      multiple: true,
      options: [
        { label: '是', value: 1 },
        { label: '否', value: 0 },
      ],
    },
  ]
}

function initTableListFields() {
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number' },
    { prop: 'type_name', label: '类型', width: 80 },
    { prop: 'name', label: '名称', minWidth: 200 },
    {
      prop: 'enable',
      label: '是否合法',
      width: 80,
      type: 'bool',
    },
    { prop: 'realname', label: '上传者', width: 120 },
    { prop: 'ip', label: 'IP', width: 120 },
    { prop: 'size', label: '大小', width: 90, type: 'bytes' },
    { prop: 'width', label: '宽', width: 90 },
    { prop: 'height', label: '高', width: 90 },
    { prop: 'ext', label: '扩展', width: 90 },
    { prop: 'hash', label: 'HASH', width: 290 },
    { prop: 'path', label: '存储路径', minWidth: 300 },
    { prop: 'description', label: '备注', width: 200 },
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
      ...parseQueryIntArray(route.query, ['enable', 'type']),
    }
    fetchList()
  },
  { immediate: true }
)
</script>
<style></style>