<template>
  <div>
    <el-card shadow="never" class="search-card">
      <FormSearch
        :fields="searchFormFields"
        :disabled-delete="selectedRows.length == 0"
        :loading="loading"
        :default-search="search"
        @onSearch="onSearch"
        @onCreate="onCreate"
        @onDelete="batchDelete"
      />
    </el-card>

    <el-card class="mgt-20px" shadow="never">
      <TableListV2
        :table-data="users"
        :loading="loading"
        :fields="listFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        :actions-min-width="100"
        @editRow="editRow"
        @viewRow="viewRow"
        @deleteRow="deleteRow"
        @selectRow="selectRow"
      >
        <template #actions="scope">
          <el-button
            link
            size="small"
            :icon="Setting"
            @click="setUser(scope.row)"
            >设置</el-button
          >
        </template>
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
    <el-drawer
      v-model="formUserVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          :content="user.id ? '设置用户' : '新增用户'"
          @back="formUserVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormUser
          ref="formUser"
          :init-user="user"
          :groups="groups"
          @success="success"
        />
      </div>
    </el-drawer>
    <el-drawer
      v-model="formUserProfileVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          content="编辑用户"
          @back="formUserProfileVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormUserProfile
          ref="formUserProfile"
          :init-user="user"
          :is-admin="true"
          @success="successProfile"
        />
      </div>
    </el-drawer>
    <el-drawer
      v-model="formDeleteUserVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          content="删除用户"
          @back="formDeleteUserVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormDeleteUser :users="selectedRows" @success="successDelete" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { Setting } from '@element-plus/icons-vue'
import { getUser, listUser } from '@/api/user'
import { listGroup } from '@/api/group'
import { parseQueryIntArray, genLinkHTML } from '@/utils/utils'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const search = ref<any>({
  wd: '',
  page: 1,
  status: [],
  group_id: [],
  size: 10,
})
const formUserVisible = ref(false)
const formUserProfileVisible = ref(false)
const formDeleteUserVisible = ref(false)
const groups = ref<any[]>([])
const users = ref<any[]>([])
const user = ref<any>({ id: 0 })
const total = ref(0)
const searchFormFields = ref<any[]>([])
const listFields = ref<any[]>([])
const selectedRows = ref<any[]>([])
const formUser = ref<any>()
const formUserProfile = ref<any>()

async function fetchList() {
  loading.value = true
  const res: any = await listUser(search.value)
  if (res.status === 200) {
    const list: any[] = res.data.user || []
    list.map((item: any) => {
      item.username_html = genLinkHTML(
        item.realname || item.user?.realname || item.username,
        `/user/${item.id}`)
      const groupsList = (item.group_id || []).map((id: any) => {
        const group = groups.value.find((g) => g.id === id)
        return group ? group.title : ''
      })
      item.group = groupsList.join(', ')
      return item
    })
    users.value = list
    total.value = res.data.total
  } else {
    ElMessage.error(res.data.message)
  }
  loading.value = false
}

async function fetchGroups() {
  const res: any = await listGroup({ field: ['id', 'title'] })
  if (res.status === 200) {
    groups.value = res.data.group
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

function onCreate() {
  formUserVisible.value = true
  nextTick(() => {
    formUser.value && formUser.value.reset()
  })
}

function setUser(row: any) {
  formUserVisible.value = true
  nextTick(() => {
    formUser.value && formUser.value.reset()
    user.value = { ...row }
  })
}

async function editRow(row: any) {
  const res: any = await getUser({ id: row.id })
  if (res.status !== 200) {
    ElMessage.error(res.data.message)
    return
  }
  formUserProfileVisible.value = true
  nextTick(() => {
    formUserProfile.value && formUserProfile.value.reset()
    user.value = { ...res.data }
  })
}

function viewRow(row: any) {
  router.push(`/user/${row.id}`)
}

function deleteRow(row: any) {
  formDeleteUserVisible.value = true
  selectedRows.value = [row]
}

function successDelete() {
  formDeleteUserVisible.value = false
  selectedRows.value = []
  fetchList()
}

function selectRow(rows: any[]) {
  selectedRows.value = rows
}

function success() {
  formUserVisible.value = false
  fetchList()
}

function successProfile() {
  formUserProfileVisible.value = false
  fetchList()
}

function batchDelete() {
  formDeleteUserVisible.value = true
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
      label: '用户组',
      name: 'group_id',
      placeholder: '请选择用户组',
      multiple: true,
      options: groups.value.map((item) => {
        return {
          label: item.title,
          value: item.id,
        }
      }),
    },
  ]
}

function initTableListFields() {
  if (listFields.value.length > 0) return
  listFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    {
      prop: 'avatar',
      label: '头像',
      width: 80,
      type: 'avatar',
      fixed: 'left',
    },
    {
      prop: 'username_html',
      label: '用户名',
      width: 150,
      fixed: 'left',
      type: 'html',
    },
    {
      prop: 'group',
      label: '用户组',
      width: 150,
    },
    { prop: 'doc_count', label: '文档', width: 80, type: 'number' },
    { prop: 'article_count', label: '文章', width: 80, type: 'number' },
    { prop: 'credit_count', label: '积分', width: 100, type: 'number' },
    { prop: 'follow_count', label: '关注', width: 80, type: 'number' },
    { prop: 'fans_count', label: '粉丝', width: 80, type: 'number' },
    { prop: 'favorite_count', label: '收藏', width: 80, type: 'number' },
    { prop: 'comment_count', label: '评论', width: 80, type: 'number' },
    { prop: 'realname', label: '姓名', width: 150 },
    {
      prop: 'remark',
      label: '备注',
      width: 250,
    },
    { prop: 'email', label: '邮箱', width: 200 },
    { prop: 'mobile', label: '电话', width: 200 },
    { prop: 'identity', label: '身份证', width: 250 },
    { prop: 'address', label: '地址', width: 250 },
    { prop: 'signature', label: '签名', width: 250 },
    { prop: 'created_at', label: '注册时间', width: 170, type: 'datetime' },
    { prop: 'register_ip', label: '注册IP', width: 160 },
    { prop: 'login_at', label: '最后登录', width: 170, type: 'datetime' },
    {
      prop: 'last_login_ip',
      label: '最后登录IP',
      width: 170,
    },
  ]
}

initTableListFields()

watch(
  () => route.query,
  async () => {
    search.value = {
      ...search.value,
      ...route.query,
      page: parseInt(route.query.page as string) || 1,
      size: parseInt(route.query.size as string) || 10,
      ...parseQueryIntArray(route.query, ['group_id', 'status']),
    }
    if (groups.value.length === 0) {
      await fetchGroups()
    }
    // 这里要执行下初始化，避免数据请求回来了，但是表格字段还没初始化，导致列表布局错乱
    await initTableListFields()
    initSearchForm()
    fetchList()
  },
  { immediate: true }
)
</script>
<style></style>