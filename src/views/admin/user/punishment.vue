<template>
  <div>
    <el-card shadow="never" class="search-card">
      <FormSearch
        :fields="searchFormFields"
        :loading="loading"
        :show-create="true"
        :show-delete="false"
        :disabled-delete="selectedRow.length === 0"
        :default-search="search"
        @onSearch="onSearch"
        @onCreate="onCreate"
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
              :loading="loading"
            >
              <el-option
                v-for="user in users"
                :key="'userid' + user.id"
                :label="user.username"
                :value="user.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </template>
        <template #buttons>
          <el-form-item>
            <el-tooltip
              class="item"
              effect="dark"
              content="批量取消处罚"
              placement="top"
            >
              <el-button
                type="warning"
                :disabled="selectedRow.length === 0"
                :icon="Edit"
                @click="batchCancelPunishment"
                >批量取消</el-button
              >
            </el-tooltip>
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="punishments"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="false"
        :show-select="true"
        :actions-min-width="80"
        @selectRow="selectRow"
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
      v-model="formPunishmentVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #title>
        <el-page-header
          :content="punishment.id ? '编辑惩罚' : '新增惩罚'"
          @back="formPunishmentVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormPunishment
          ref="punishmentForm"
          :init-punishment="punishment"
          @success="formPunishmentSuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { Edit } from '@element-plus/icons-vue'
import {
  listPunishment,
  getPunishment,
  cancelPunishment,
} from '@/api/punishment'
import { genLinkHTML, parseQueryIntArray } from '@/utils/utils'
import { punishmentTypeOptions } from '@/utils/enum'
import { listUser } from '@/api/user'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formPunishmentVisible = ref(false)
const search = ref<any>({
  wd: '',
  page: 1,
  enable: [],
  size: 10,
  user_id: [],
})
const punishments = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])
const punishment = ref<any>({ id: 0 })
const users = ref<any[]>([])

async function remoteSearchUser(wd: string) {
  searchUser(wd)
}

async function searchUser(wd: string, userId: any[] = []) {
  const res: any = await listUser({
    page: 1,
    size: 10,
    wd,
    id: userId || [],
    field: ['id', 'username'],
  })
  if (res.status === 200) {
    users.value = res.data.user || []
  }
}

async function batchCancelPunishment() {
  try {
    await ElMessageBox.confirm(
      `您确定要取消选中的${selectedRow.value.length}条处罚吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    const ids = selectedRow.value.map((item) => item.id)
    const res: any = await cancelPunishment({ id: ids })
    if (res.status === 200) {
      ElMessage.success('批量取消成功')
      fetchList()
    } else {
      ElMessage.error(res.data.message)
    }
  } catch (error) {}
}

async function fetchList() {
  loading.value = true
  const res: any = await listPunishment(search.value)
  if (res.status === 200) {
    const list: any[] = res.data.punishment || []
    list.map((item: any) => {
      item.user_html = genLinkHTML(item.username, `/user/${item.user_id}`)
    })
    punishments.value = list
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
  search.value = {
    ...search.value,
    ...searchParams,
    user_id: search.value.user_id,
    page: 1,
  }
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
  punishment.value = { id: 0, type: [], enable: true }
  formPunishmentVisible.value = true
}

async function editRow(row: any) {
  const res: any = await getPunishment({ id: row.id })
  if (res.status === 200) {
    punishment.value = res.data
    formPunishmentVisible.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}

function formPunishmentSuccess() {
  formPunishmentVisible.value = false
  fetchList()
}

function selectRow(rows: any[]) {
  selectedRow.value = rows
}

function initSearchForm() {
  searchFormFields.value = [
    {
      type: 'select',
      label: '类型',
      name: 'type',
      placeholder: '请选择惩罚类型',
      multiple: true,
      options: punishmentTypeOptions,
    },
    {
      type: 'text',
      label: '关键字',
      name: 'wd',
      placeholder: '请输入关键字',
    },
  ]
}

function initTableListFields() {
  const enumOptions: Record<string, any> = {}
  punishmentTypeOptions.map((item) => {
    enumOptions[item.value] = item
  })

  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    {
      prop: 'enable',
      label: '启用处罚',
      width: 80,
      type: 'bool',
    },
    {
      prop: 'type',
      label: '类型',
      minWidth: 120,
      type: 'enum',
      enum: enumOptions,
    },
    {
      prop: 'user_html',
      label: '用户',
      minWidth: 150,
      type: 'html',
    },
    { prop: 'end_time', label: '截止时间', width: 170, type: 'datetime' },
    { prop: 'reason', label: '原因', minWidth: 250 },
    { prop: 'remark', label: '备注', minWidth: 250 },
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
      ...parseQueryIntArray(route.query, ['user_id']),
    }
    fetchList()
  },
  { immediate: true }
)

// 初始化已有选中的用户
if (search.value.user_id.length > 0) {
  searchUser('', search.value.user_id)
}
</script>
<style></style>