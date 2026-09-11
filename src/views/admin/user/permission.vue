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
      />
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :table-data="listData"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :loading="loading"
        :show-edit="true"
        :show-delete="false"
        :show-select="false"
        :actions-min-width="80"
        @editRow="editRow"
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
        <el-page-header content="编辑附件" @back="formVisible = false">
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormPermission :init-permission="permission" @success="formSuccess" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { listPermission, getPermission } from '@/api/permission'
import { methodOptions } from '@/utils/enum'

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
const permission = ref<any>({})

async function fetchList() {
  loading.value = true
  const res: any = await listPermission(search.value)
  if (res.status === 200) {
    listData.value = res.data.permission
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
  const res: any = await getPermission({ id: row.id })
  if (res.status === 200) {
    permission.value = res.data
    formVisible.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}

function formSuccess() {
  formVisible.value = false
  fetchList()
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
      type: 'text',
      label: 'API',
      name: 'path',
      placeholder: '请输入API',
    },
    {
      type: 'select',
      label: 'Method',
      name: 'method',
      placeholder: '请选择Method',
      multiple: true,
      options: methodOptions,
    },
  ]
}

function initTableListFields() {
  const methodEnum: Record<string, any> = {
    GET: {
      label: 'GET',
      type: 'info',
    },
    POST: {
      label: 'POST',
      type: 'success',
    },
    GRPC: {
      label: 'GRPC',
      type: 'primary',
    },
    PUT: {
      label: 'PUT',
      type: 'warning',
    },
    DELETE: {
      label: 'DELETE',
      type: 'danger',
    },
  }
  tableListFields.value = [
    { prop: 'title', label: '名称', width: 240, fixed: 'left' },
    { prop: 'description', label: '描述', minWidth: 150 },
    {
      prop: 'method',
      label: 'Method',
      width: 80,
      type: 'enum',
      enum: methodEnum,
    },
    { prop: 'path', label: 'API', minWidth: 150 },
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
    }
    fetchList()
  },
  { immediate: true }
)
</script>
<style></style>