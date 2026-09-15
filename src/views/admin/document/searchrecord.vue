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
        @onDelete="batchDelete"
      >
        <template #buttons> </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="records"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="false"
        :show-delete="true"
        :show-select="true"
        :actions-min-width="100"
        @selectRow="selectRow"
        @deleteRow="deleteRow"
      >
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
import { deleteSearchRecord, listSearchRecord } from '@/api/searchrecord'
import { genLinkHTML } from '@/utils/utils'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const search = ref<any>({
  page: 1,
  size: 10,
})
const records = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])

async function fetchList() {
  loading.value = true
  const searchParams = { ...search.value }
  const res: any = await listSearchRecord(searchParams)
  loading.value = false
  if (res.status === 200) {
    const list: any[] = res.data.search_record || []
    list.forEach((item: any) => {
      item.username_html = '-'
      if (item.user_id > 0) {
        item.username_html = genLinkHTML(
          item.realname || item.user?.realname || '未命名用户',
          `/user/${item.user_id}`)
      }

      item.keywords_html = genLinkHTML(
        item.keywords,
        `/search?wd=${item.keywords}&page=${item.page}`
      )
    })

    records.value = list
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

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}条】搜索记录吗？删除之后将不可恢复。`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await deleteSearchRecord({ id: ids })
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
    `您确定要搜索记录【${row.keywords}(ID:${row.id})】吗？删除之后将不可恢复。`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await deleteSearchRecord({ id: row.id })
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
  const orderbyOptions = [
    {
      label: '最新排序',
      value: 'id desc',
    },
    {
      label: '最早排序',
      value: 'id asc',
    },
    {
      label: '结果数倒序排序',
      value: 'total desc',
    },
    {
      label: '结果数顺序排序',
      value: 'total asc',
    },
    {
      label: '耗时倒序排序',
      value: 'spend_time desc',
    },
    {
      label: '耗时顺序排序',
      value: 'spend_time asc',
    },
  ]
  searchFormFields.value = [
    {
      type: 'text',
      label: '关键字',
      name: 'keywords',
      placeholder: '请输入关键字',
    },
    {
      type: 'text',
      label: 'IP',
      name: 'ip',
      placeholder: '请输入IP地址',
    },
    {
      type: 'select',
      label: '排序',
      name: 'order',
      placeholder: '请选择状态',
      options: orderbyOptions,
    },
  ]
}

function initTableListFields() {
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    { prop: 'username_html', label: '用户', width: 120, type: 'html' },
    {
      prop: 'keywords_html',
      label: '关键字',
      minWidth: 150,
      type: 'html',
    },
    { prop: 'total', label: '结果数', width: 80, type: 'number' },
    { prop: 'page', label: '页码', width: 70 },
    { prop: 'ip', label: 'IP', width: 100 },
    { prop: 'spend_time', label: '耗时(秒)', width: 100, type: 'number' },
    { prop: 'created_at', label: '搜索时间', width: 170, type: 'datetime' },
    { prop: 'user_agent', label: '客户端', minWidth: 200, type: 'number' },
  ]
}

initSearchForm()
initTableListFields()

watch(
  () => route.query,
  async () => {
    const s = { ...search.value, ...route.query }
    s.page = parseInt(route.query.page as string) || 1
    s.size = parseInt(route.query.size as string) || 10
    s.wd = route.query.wd || ''
    search.value = {
      ...s,
    }
    await fetchList()
  },
  { immediate: true }
)
</script>
<style lang="scss" scoped>
.tooltip-box {
  max-width: 300px;
  word-break: break-all;
}
</style>