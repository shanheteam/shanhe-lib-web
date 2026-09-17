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
      />
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="advertisements"
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
      v-model="formAdvertisementVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          :content="advertisement.id ? '编辑广告' : '新增广告'"
          @back="formAdvertisementVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormAdvertisement
          ref="advertisementForm"
          :init-advertisement="advertisement"
          @success="formAdvertisementSuccess"
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
  listAdvertisement,
  deleteAdvertisement,
  getAdvertisement,
} from '@/api/advertisement'
import { createLatestGuard } from '@/utils/latest'
import { genLinkHTML, parseQueryIntArray } from '@/utils/utils'
import { advertisementPositions } from '@/utils/enum'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formAdvertisementVisible = ref(false)
const search = ref<any>({
  wd: '',
  page: 1,
  enable: [],
  size: 10,
})
const advertisements = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])
const advertisement = ref<any>({ id: 0 })
const advertisementForm = ref<any>()

// 翻页/切筛选快速切换时丢弃过期响应
const advertisementGuard = createLatestGuard()

async function fetchList() {
  const token = advertisementGuard.start()
  loading.value = true
  const res: any = await listAdvertisement(search.value)
  if (!advertisementGuard.isLatest(token)) return
  if (res.status === 200) {
    const list: any[] = res.data.advertisement || []
    list.map((item: any) => {
      item.title_html = genLinkHTML(item.title, item.link)
    })
    advertisements.value = list
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
    router.push({
      query: search.value,
    })
  } else {
    fetchList()
  }
}

function onCreate() {
  advertisement.value = { id: 0 }
  formAdvertisementVisible.value = true
  nextTick(() => {
    advertisementForm.value && advertisementForm.value.reset()
  })
}

async function editRow(row: any) {
  const res: any = await getAdvertisement({ id: row.id })
  if (res.status === 200) {
    advertisement.value = res.data
    formAdvertisementVisible.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}

function formAdvertisementSuccess() {
  formAdvertisementVisible.value = false
  fetchList()
}

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}条】广告吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await deleteAdvertisement({ id: ids })
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
    `您确定要删除广告【${row.title}】吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await deleteAdvertisement({ id: row.id })
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
  const positions: any[] = []
  advertisementPositions.map((item: any) => {
    positions.push(...item.children)
  })
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
    {
      type: 'select',
      label: '位置',
      name: 'position',
      placeholder: '请选择位置',
      multiple: true,
      options: positions,
    },
  ]
}

function initTableListFields() {
  const positions: Record<string, any> = {}
  advertisementPositions.map((item: any) => {
    ;(item.children || []).map((child: any) => {
      positions[child.value] = child
    })
  })
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number' },
    {
      prop: 'enable',
      label: '状态',
      width: 80,
      type: 'bool',
    },
    {
      prop: 'position',
      label: '广告位',
      width: 200,
      type: 'enum',
      enum: positions,
    },
    {
      prop: 'title',
      label: '广告名称',
      minWidth: 150,
    },
    { prop: 'remark', label: '广告备注', minWidth: 250 },
    { prop: 'start_time', label: '开始时间', width: 170, type: 'datetime' },
    { prop: 'end_time', label: '截止时间', width: 170, type: 'datetime' },
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
      ...parseQueryIntArray(route.query, ['enable']),
    }
    fetchList()
  },
  { immediate: true }
)
</script>
<style></style>