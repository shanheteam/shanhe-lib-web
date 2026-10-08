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
        :table-data="navigations"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        :tree-props="{ childrenField: 'children' }"
        @selectRow="selectRow"
        @editRow="editRow"
        @deleteRow="deleteRow"
      />
    </el-card>
    <TablePagination
      :search="search"
      :total="total"
      @size-change="handleSizeChange"
      @page-change="handlePageChange"
    />
    <el-drawer
      v-model="formNavigationVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          :content="navigation.id ? '编辑导航' : '新增导航'"
          @back="formNavigationVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormNavigation
          ref="navigationForm"
          :init-navigation="navigation"
          :trees="navigations"
          @success="formNavigationSuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import {
  listNavigation,
  deleteNavigation,
  getNavigation,
} from '@/api/navigation'
import { createLatestGuard } from '@/utils/latest'
import { genLinkHTML, parseQueryIntArray, categoryToTrees } from '@/utils/utils'
import { useSearchNav } from '@/composables/useSearchNav'
import { useTablePagination } from '@/composables/useTablePagination'
import { useTableSelection } from '@/composables/useTableSelection'
import { useDeleteConfirm } from '@/composables/useDeleteConfirm'

const route = useRoute()

const loading = ref(false)
const formNavigationVisible = ref(false)
const search = ref<any>({
  wd: '',
  page: 1,
  enable: [],
  size: 10,
})
const navigations = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const { selectedRow, selectRow } = useTableSelection()
const navigation = ref<any>({ id: 0 })
const navigationForm = ref<any>()

// 翻页/切筛选快速切换时丢弃过期响应
const navigationGuard = createLatestGuard()

async function fetchList() {
  const token = navigationGuard.start()
  loading.value = true
  const res: any = await listNavigation(search.value)
  if (!navigationGuard.isLatest(token)) return
  if (res.status === 200) {
    const list: any[] = res.data.navigation || []
    list.map((item: any) => {
      if (item.href) {
        item.href_html = genLinkHTML(item.href, item.href)
        if (item.color) {
          // 增加链接颜色
          item.href_html = item.href_html.replace(
            '<a',
            `<a style="color:${item.color}" `
          )
        }
      } else {
        item.href_html = '-'
      }

      item.disable_delete = item.fixed
      return item
    })

    const trees = categoryToTrees(list, false)
    navigations.value = trees
    total.value = res.data.total
  } else {
    ElMessage.error(res.data.message)
  }
  loading.value = false
}

const { handleSizeChange, handlePageChange } = useTablePagination(search)

const { onSearch } = useSearchNav(search, fetchList)

function onCreate() {
  navigation.value = { id: 0 }
  formNavigationVisible.value = true
  nextTick(() => {
    navigationForm.value && navigationForm.value.reset()
  })
}

async function editRow(row: any) {
  const res: any = await getNavigation({ id: row.id })
  if (res.status === 200) {
    navigation.value = res.data
    formNavigationVisible.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}

function formNavigationSuccess() {
  formNavigationVisible.value = false
  fetchList()
}

const { confirmBatch, confirmOne } = useDeleteConfirm({
  remove: (ids) => deleteNavigation({ id: ids }),
  onDone: fetchList,
})

function batchDelete() {
  return confirmBatch(selectedRow.value, `您确定要删除选中的【${selectedRow.value.length}条】导航吗？会连带着子导航一起删除，删除之后不可恢复！`)
}

function deleteRow(row: any) {
  return confirmOne(row, `您确定要删除导航【${row.title}】吗？会连带着子导航一起删除，删除之后不可恢复！`)
}

function initSearchForm() {
  searchFormFields.value = [
    {
      type: 'text',
      label: '关键字',
      name: 'wd',
      placeholder: '请输入关键字',
    },
  ]
}

function initTableListFields() {
  tableListFields.value = [
    {
      prop: 'title',
      label: '名称',
      minWidth: 200,
      fixed: 'left',
      type: 'html',
    },
    {
      prop: 'enable',
      label: '启用',
      width: 80,
      type: 'bool',
    },
    { prop: 'href_html', label: '链接', minWidth: 200, type: 'html' },
    { prop: 'target', label: '打开方式', width: 80 },
    { prop: 'sort', label: '排序', width: 80, type: 'number' },
    { prop: 'description', label: '描述', minWidth: 200 },
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
