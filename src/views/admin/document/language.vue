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
      >
        <template #buttons>
          <el-form-item>
            <el-dropdown
              :disabled="selectedRow.length === 0"
              @command="batchStatus"
            >
              <el-button type="warning" :disabled="selectedRow.length === 0">
                批量启用/禁用
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="true">启用</el-dropdown-item>
                  <el-dropdown-item :command="false">禁用</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="languages"
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
      v-model="formLanguageVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          :content="language.id ? '编辑语言' : '新增语言'"
          @back="formLanguageVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormLanguage
          :init-language="language"
          :visible="formLanguageVisible"
          @success="onSuccess"
          @close="formLanguageVisible = false"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {
  listLanguage,
  updateLanguageStatus,
  deleteLanguage,
} from '@/api/language'
import { parseQueryIntArray } from '@/utils/utils'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const search = ref<any>({
  wd: '',
  enable: [],
})
const languages = ref<any[]>([])
const language = ref<any>({})
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])
const formLanguageVisible = ref(false)
const total = ref(0)

async function fetchList() {
  loading.value = true
  const res: any = await listLanguage(search.value)
  if (res.status === 200) {
    languages.value = res.data.language || []
    total.value = res.data.total
  } else {
    ElMessage.error(res.data.message)
  }
  loading.value = false
}

function handleSizeChange(size: number) {
  search.value = { ...search.value, size, page: 1 }
  fetchList()
}

function handlePageChange(page: number) {
  search.value = { ...search.value, page }
  fetchList()
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
  language.value = {}
  formLanguageVisible.value = true
}

function deleteRow(row: any) {
  ElMessageBox.confirm(
    `您确定要删除语言【${row.language}】吗？删除之后不可恢复`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await deleteLanguage({ id: row.id })
      if (res.status === 200) {
        ElMessage.success('删除成功')
        fetchList()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

function batchDelete() {
  const ids = selectedRow.value.map((item) => item.id)
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}条】语言吗？删除之后不可恢复`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await deleteLanguage({ id: ids })
      if (res.status === 200) {
        ElMessage.success('删除成功')
        fetchList()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

async function update(status: boolean) {
  const ids = selectedRow.value.map((item) => item.id)
  const res: any = await updateLanguageStatus({ id: ids, enable: status })
  if (res.status === 200) {
    ElMessage.success('更新成功')
    fetchList()
  } else {
    ElMessage.error(res.data.message)
  }
}

function onSuccess() {
  formLanguageVisible.value = false
  fetchList()
}

function batchStatus(cmd: boolean) {
  update(cmd)
}

function editRow(row: any) {
  language.value = row
  formLanguageVisible.value = true
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
      prop: 'language',
      label: '语言',
      minWidth: 150,
    },
    { prop: 'code', label: '代码', minWidth: 150 },
    { prop: 'sort', label: '排序', width: 80, type: 'number' },
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
      ...parseQueryIntArray(route.query, ['enable']),
    }
    fetchList()
  },
  { immediate: true }
)
</script>

<style></style>