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
        @onDelete="batchDelete"
        @onSearch="onSearch"
      />
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :table-data="groups"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        :actions-min-width="200"
        @selectRow="selectRow"
        @deleteRow="deleteRow"
        @editRow="editRow"
      >
        <template #actions="scope">
          <el-tooltip content="网站管理后台管理功能授权" placement="top">
            <el-button
              link
              :icon="Coordinate"
              size="small"
              @click="setGroupPermission(scope.row)"
              >管理授权</el-button
            >
          </el-tooltip>
        </template>
      </TableListV2>
    </el-card>
    <TablePagination
      v-if="total > 0"
      :search="search"
      :total="total"
      @size-change="handleSizeChange"
      @page-change="handlePageChange"
    />
    <el-drawer
      v-model="formGroupVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          :content="group.id ? '编辑分组' : '新增分组'"
          @back="formGroupVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormGroup :init-group="group" @success="success" />
      </div>
    </el-drawer>

    <el-drawer
      :title="`【${group.title}】管理授权`"
      v-model="formGroupPermissionVisible"
    >
      <div style="padding: 0 20px">
        <FormGroupPermission
          ref="groupPermission"
          :group-id="group.id"
          @success="updateGroupPermissionSuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { Coordinate } from '@element-plus/icons-vue'
import { listGroup, deleteGroup, getGroup } from '@/api/group'
import { createLatestGuard } from '@/utils/latest'
import { useSearchNav } from '@/composables/useSearchNav'
import { useTablePagination } from '@/composables/useTablePagination'
import { useTableSelection } from '@/composables/useTableSelection'
import { useDeleteConfirm } from '@/composables/useDeleteConfirm'

const route = useRoute()

const loading = ref(false)
const formGroupVisible = ref(false)
const formGroupPermissionVisible = ref(false)
const search = ref<any>({
  wd: '',
  page: 1,
  size: 10,
})
const groups = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const { selectedRow, selectRow } = useTableSelection()
const group = ref<any>({})
const groupPermission = ref<any>()

// 翻页/切筛选快速切换时丢弃过期响应
const groupGuard = createLatestGuard()

async function fetchList() {
  const token = groupGuard.start()
  loading.value = true
  const res: any = await listGroup(search.value)
  if (!groupGuard.isLatest(token)) return
  if (res.status === 200) {
    const list: any[] = res.data.group
    try {
      for (let i = 0; i < list.length; i++) {
        list[i].disable_delete = list[i].user_count > 0 || list[i].is_default
      }
    } catch (error) {}
    groups.value = list || []
    total.value = res.data.total
  } else {
    ElMessage.error(res.data.message)
  }
  loading.value = false
}

const { handleSizeChange, handlePageChange } = useTablePagination(search)

function updateGroupPermissionSuccess() {
  formGroupPermissionVisible.value = false
}

const { onSearch } = useSearchNav(search, fetchList)

function onCreate() {
  initGroup()
  formGroupVisible.value = true
}

function setGroupPermission(row: any) {
  formGroupPermissionVisible.value = true
  nextTick(() => {
    groupPermission.value && groupPermission.value.resetChecked()
    group.value = row
  })
}

async function editRow(row: any) {
  const res: any = await getGroup({ id: row.id })
  if (res.status === 200) {
    group.value = res.data
    formGroupVisible.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}

function success() {
  formGroupVisible.value = false
  fetchList()
}

function deleteRow(row: any) {
  return confirmOne(row, `您是否要删除【${row.title}】分组？删除之后不可恢复！`, { title: '提示' })
}

const { confirmBatch, confirmOne } = useDeleteConfirm({
  remove: (ids) => deleteGroup({ id: ids }),
  onDone: fetchList,
})

function batchDelete() {
  return confirmBatch(selectedRow.value, `您是否要删除选择的【${selectedRow.value.length}个】分组?删除之后不可恢复！`, { title: '提示' })
}

function initGroup() {
  group.value = {
    id: 0,
    sort: 0,
    color: '#000000',
    title: '',
    is_display: true,
    enable_upload: false,
    enable_comment_approval: false,
    is_default: false,
  }
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
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    { prop: 'title', label: '名称', width: 150, fixed: 'left' },
    { prop: 'sort', label: '排序', width: 80, type: 'number' },
    { prop: 'user_count', label: '用户数', width: 80, type: 'number' },
    { prop: 'is_default', label: '默认组', width: 80, type: 'bool' },
    {
      prop: 'enable_upload',
      label: '允许上传文档',
      width: 120,
      type: 'bool',
    },
    {
      prop: 'enable_document_review',
      label: '文档需要审核',
      width: 120,
      type: 'bool',
    },
    {
      prop: 'enable_comment',
      label: '允许评论',
      width: 120,
      type: 'bool',
    },
    {
      prop: 'enable_comment_approval',
      label: '评论需审核',
      width: 120,
      type: 'bool',
    },
    {
      prop: 'enable_article',
      label: '允许发布文章',
      width: 120,
      type: 'bool',
    },
    {
      prop: 'enable_article_approval',
      label: '文章需要审核',
      width: 120,
      type: 'bool',
    },
    { prop: 'description', label: '描述', width: 250 },
    { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
    { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
  ]
}

initGroup()
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
