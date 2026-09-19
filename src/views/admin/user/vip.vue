<template>
  <div>
    <el-card shadow="never" class="search-card">
      <FormSearch
        :fields="searchFormFields"
        :loading="loading"
        :show-create="false"
        :show-delete="false"
        :default-search="search"
        @onSearch="onSearch"
      >
        <template #inputs>
          <el-form-item label="用户">
            <el-select
              v-model="search.user_id"
              filterable
              multiple
              remote
              reserve-keyword
              placeholder="请输入用户名"
              :remote-method="remoteSearchUser"
              :loading="userLoading"
            >
              <el-option
                v-for="user in users"
                :key="'userid' + user.id"
                :label="user.realname || '未命名用户'"
                :value="user.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :table-data="listData"
        :fields="tableListFields"
        :show-actions="false"
        :show-view="false"
        :loading="loading"
        :show-edit="false"
        :show-delete="false"
        :show-select="false"
        :actions-min-width="80"
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { listUserVip } from '@/api/uservip'
import { listUser } from '@/api/user'
import { vipTypeOptions } from '@/utils/enum'
import { createLatestGuard } from '@/utils/latest'
import { parseQueryIntArray, genLinkHTML } from '@/utils/utils'

defineOptions({ name: 'AdminUserVip' })

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const userLoading = ref(false)
const search = ref<any>({ page: 1, size: 10, user_id: [] })
const listData = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const users = ref<any[]>([])

function remoteSearchUser(wd: string) {
  searchUser(wd)
}

async function searchUser(wd: string, userId: any[] = []) {
  userLoading.value = true
  const res: any = await listUser({
    page: 1,
    size: 10,
    wd,
    id: userId || [],
    field: ['id', 'realname'],
  })
  userLoading.value = false
  if (res.status === 200) {
    users.value = res.data.user || []
  }
}

// 翻页/切筛选快速切换时丢弃过期响应
const userVipGuard = createLatestGuard()

async function fetchList() {
  const token = userVipGuard.start()
  loading.value = true
  const res: any = await listUserVip(search.value)
  if (!userVipGuard.isLatest(token)) return
  if (res.status === 200) {
    const data: any[] = res.data.user_vip || []
    data.forEach((item) => {
      item.username_html = genLinkHTML(
        item.realname || item.user?.realname || '未命名用户',
        `/user/${item.user_id}`)
    })
    listData.value = data
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
function onSearch(params: any) {
  search.value = { ...search.value, ...params, user_id: search.value.user_id, page: 1 }
  router.push({ query: search.value })
}

function initSearchForm() {
  searchFormFields.value = [
    { type: 'select', label: '类型', name: 'type', placeholder: '请选择VIP类型', multiple: true, options: vipTypeOptions },
  ]
}

function initTableListFields() {
  const typeEnum: Record<string, any> = {}
  vipTypeOptions.forEach((item) => {
    typeEnum[item.value] = item
  })
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    { prop: 'type', label: 'VIP类型', width: 100, type: 'enum', enum: typeEnum },
    { prop: 'username_html', label: '用户', minWidth: 120, type: 'html' },
    { prop: 'discount', label: '折扣(折)', minWidth: 120 },
    { prop: 'download', label: '专享下载(次)', minWidth: 140, type: 'number' },
    { prop: 'download_used', label: '已用专享下载(次)', minWidth: 150, type: 'number' },
    { prop: 'times', label: '下载频次(次/天)', minWidth: 150 },
    { prop: 'joined_at', label: '加入时间', width: 170, type: 'datetime' },
    { prop: 'expired_at', label: '过期时间', width: 170, type: 'datetime' },
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
      ...parseQueryIntArray(route.query, ['type', 'user_id']),
    }
    fetchList()
  },
  { immediate: true },
)

if ((search.value.user_id || []).length > 0) {
  searchUser('', search.value.user_id)
}
</script>
