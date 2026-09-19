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
        :table-data="friendlinks"
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
      v-model="formFriendlinkVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          :content="friendlink.id ? '编辑友链' : '新增友链'"
          @back="formFriendlinkVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormFriendlink
          ref="friendlinkForm"
          :init-friendlink="friendlink"
          @success="formFriendlinkSuccess"
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
  listFriendlink,
  deleteFriendlink,
  getFriendlink,
} from '@/api/friendlink'
import { createLatestGuard } from '@/utils/latest'
import { genLinkHTML, parseQueryIntArray } from '@/utils/utils'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formFriendlinkVisible = ref(false)
const search = ref<any>({
  wd: '',
  page: 1,
  enable: [],
  size: 10,
})
const friendlinks = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])
const friendlink = ref<any>({ id: 0 })
const friendlinkForm = ref<any>()

// 翻页/切筛选快速切换时丢弃过期响应
const friendlinkGuard = createLatestGuard()

async function fetchList() {
  const token = friendlinkGuard.start()
  loading.value = true
  const res: any = await listFriendlink(search.value)
  if (!friendlinkGuard.isLatest(token)) return
  if (res.status === 200) {
    const list: any[] = res.data.friendlink || []
    list.map((item: any) => {
      item.title_html = genLinkHTML(item.title, item.link)
    })
    friendlinks.value = list
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
  friendlink.value = { id: 0 }
  formFriendlinkVisible.value = true
  nextTick(() => {
    friendlinkForm.value && friendlinkForm.value.reset()
  })
}

async function editRow(row: any) {
  const res: any = await getFriendlink({ id: row.id })
  if (res.status === 200) {
    friendlink.value = res.data
    formFriendlinkVisible.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}

function formFriendlinkSuccess() {
  formFriendlinkVisible.value = false
  fetchList()
}

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}条】友链吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await deleteFriendlink({ id: ids })
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
    `您确定要删除友链【${row.title}】吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await deleteFriendlink({ id: row.id })
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
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    {
      prop: 'enable',
      label: '状态',
      width: 80,
      type: 'bool',
      fixed: 'left',
    },
    {
      prop: 'title_html',
      label: '名称',
      minWidth: 150,
      fixed: 'left',
      type: 'html',
    },
    { prop: 'link', label: '链接', minWidth: 250 },
    { prop: 'sort', label: '排序', width: 80, type: 'number' },
    { prop: 'description', label: '描述', minWidth: 250 },
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
