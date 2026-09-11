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
        @onCreate="onCreate"
        @onSearch="onSearch"
        @onDelete="batchDelete"
      />
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="listData"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        :actions-min-width="80"
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
      <template #title>
        <el-page-header
          :content="banner.id > 0 ? '编辑轮播图' : '新增轮播图'"
          @back="formVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormBanner
          ref="formBanner"
          :init-banner="banner"
          @success="formSuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { listBanner, deleteBanner, getBanner } from '@/api/banner'
import { bannerTypeOptions } from '@/utils/enum'
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
const banner = ref<any>({})
const formBanner = ref<any>()

async function fetchList() {
  loading.value = true
  const res: any = await listBanner(search.value)
  if (res.status === 200) {
    listData.value = res.data.banner
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
  banner.value = {}
  formVisible.value = true
  nextTick(() => {
    formBanner.value && formBanner.value.reset()
  })
}

async function editRow(row: any) {
  const res: any = await getBanner({ id: row.id })
  if (res.status === 200) {
    banner.value = res.data
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
    `您确定要删除选中的【${selectedRow.value.length}个】轮播图吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await deleteBanner({ id: ids })
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
    `您确定要删除轮播图【${row.title}】吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await deleteBanner({ id: row.id })
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
      label: '类型',
      name: 'type',
      placeholder: '请选择轮播图类型',
      multiple: true,
      options: bannerTypeOptions,
    },
    {
      type: 'select',
      label: '状态',
      name: 'enable',
      placeholder: '是否启用',
      multiple: true,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  ]
}

function initTableListFields() {
  const typeMap: Record<string, any> = {}
  bannerTypeOptions.forEach((item) => {
    typeMap[item.value] = item
  })
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number' },
    { prop: 'path', label: '轮播图', width: 360, type: 'image' },
    {
      prop: 'type',
      label: '类型',
      width: 120,
      type: 'enum',
      enum: typeMap,
    },
    {
      prop: 'enable',
      label: '是否启用',
      width: 80,
      type: 'bool',
    },
    { prop: 'title', label: '名称', minWidth: 150 },
    { prop: 'url', label: '链接', minWidth: 150, type: 'link' },
    { prop: 'sort', label: '排序', width: 80, type: 'number' },
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