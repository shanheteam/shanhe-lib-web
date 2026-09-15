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
                :label="user.realname || user.username"
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
        :loading="loading"
        :table-data="sms"
        :fields="tableListFields"
        :show-actions="false"
        :show-view="false"
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
import { listSms } from '@/api/sms'
import { listUser } from '@/api/user'
import { genLinkHTML, parseQueryIntArray } from '@/utils/utils'
import { smsTypeOptions, smsStatusOptions, smsProviderOptions } from '@/utils/enum'

defineOptions({ name: 'AdminUserSms' })

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const userLoading = ref(false)
const search = ref<any>({ wd: '', page: 1, size: 10, user_id: [] })
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const users = ref<any[]>([])
const sms = ref<any[]>([])

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
    field: ['id', 'username'],
  })
  userLoading.value = false
  if (res.status === 200) {
    users.value = res.data.user || []
  }
}

async function fetchList() {
  loading.value = true
  const res: any = await listSms(search.value)
  if (res.status === 200) {
    const list: any[] = res.data.sms || []
    list.forEach((item) => {
      if (item.user_id) {
        item.user_html = genLinkHTML(
          item.realname || item.user?.realname || item.username,
          `/user/${item.user_id}`)
      } else {
        item.user_html = '-'
      }
    })
    sms.value = list
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
    { type: 'select', label: '类型', name: 'type', placeholder: '请选择短信类型', multiple: true, options: smsTypeOptions },
    { type: 'select', label: '状态', name: 'status', placeholder: '请选择短信发送状态', multiple: true, options: smsStatusOptions },
    { type: 'text', label: '手机号', name: 'mobile', placeholder: '请输入手机号码' },
  ]
}

function initTableListFields() {
  const toMap = (options: any[]) => {
    const m: Record<string, any> = {}
    options.forEach((item) => {
      m[item.value] = item
    })
    return m
  }
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    { prop: 'type', label: '类型', width: 100, type: 'enum', enum: toMap(smsTypeOptions) },
    { prop: 'status', label: '状态', width: 100, type: 'enum', enum: toMap(smsStatusOptions) },
    { prop: 'user_html', label: '用户', minWidth: 150, type: 'html' },
    { prop: 'mobile', label: '手机', width: 130 },
    { prop: 'code', label: '验证码', minWidth: 80 },
    { prop: 'ip', label: 'IP', minWidth: 120 },
    { prop: 'provider', label: '短信服务', width: 120, type: 'enum', enum: toMap(smsProviderOptions) },
    { prop: 'error', label: '错误信息', minWidth: 150 },
    { prop: 'response', label: '发送结果', minWidth: 250 },
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
      ...parseQueryIntArray(route.query, ['user_id', 'status', 'type']),
    }
    fetchList()
  },
  { immediate: true },
)

if ((search.value.user_id || []).length > 0) {
  searchUser('', search.value.user_id)
}
</script>
<style></style>
