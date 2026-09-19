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
        @onCreate="onCreate"
        @onDelete="batchDelete"
      >
        <template #buttons>
          <el-dropdown
            :disabled="selectedRow.length === 0"
            @command="checkComment"
          >
            <el-button type="primary" :disabled="selectedRow.length === 0">
              批量审批
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="1">审核通过</el-dropdown-item>
                <el-dropdown-item :command="2">审核拒绝</el-dropdown-item>
                <el-dropdown-item :command="0">变为待审</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="comments"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        :actions-min-width="160"
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
      v-model="formCommentVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header content="评论编审" @back="formCommentVisible = false">
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormCommentCheck
          v-if="comment.id > 0"
          ref="formComment"
          :comment="comment"
          @success="formCommentSuccess"
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
  listComment,
  deleteComment,
  getComment,
  checkComment,
} from '@/api/comment'
import { createLatestGuard } from '@/utils/latest'
import { parseQueryIntArray, genLinkHTML } from '@/utils/utils'
import { categoryTypeOptions } from '@/utils/enum'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formCommentVisible = ref(false)
const search = ref<any>({
  wd: '',
  page: 1,
  status: [],
  size: 10,
  order: 'id desc',
})
const comments = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])
const comment = ref<any>({ id: 0 })

// 翻页/切筛选快速切换时丢弃过期响应
const commentGuard = createLatestGuard()

async function fetchList() {
  const token = commentGuard.start()
  loading.value = true
  const res: any = await listComment({
    ...search.value,
    with_document_title: true,
  })
  if (!commentGuard.isLatest(token)) return
  if (res.status === 200) {
    comments.value = (res.data.comment || []).map((item: any) => {
      item.realname = item.user?.realname || '匿名'
      item.document_title_html = genLinkHTML(
        item.document_title,
        item.type === 1
          ? `/article/${item.document_uuid}`
          : `/document/${item.document_uuid}`
      )
      item.username_html = genLinkHTML(item.realname, `/user/${item.user_id}`)
      return item
    })
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

function onCreate() {
  comment.value = { id: 0 }
  formCommentVisible.value = true
}

async function editRow(row: any) {
  const res: any = await getComment({ id: row.id })
  if (res.status === 200) {
    comment.value = res.data
    formCommentVisible.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}

function formCommentSuccess() {
  formCommentVisible.value = false
  fetchList()
}

async function approveComment(cmd: number) {
  const res: any = await checkComment({
    id: selectedRow.value.map((item) => item.id),
    status: cmd,
  })
  if (res.status === 200) {
    ElMessage.success('审批成功')
    fetchList()
    return
  }
  ElMessage.error(res.data.message || '审批失败')
}

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}条】评论吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await deleteComment({ id: ids })
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
  ElMessageBox.confirm(`您确定要删除该评论吗？删除之后不可恢复！`, '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const res: any = await deleteComment({ id: row.id })
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
      label: '类型',
      name: 'type',
      placeholder: '请选择评论类型',
      multiple: true,
      options: categoryTypeOptions,
    },
    {
      type: 'select',
      label: '状态',
      name: 'status',
      placeholder: '请选择状态',
      multiple: true,
      options: [
        { label: '审核拒绝', value: 2 },
        { label: '审核通过', value: 1 },
        { label: '待审核', value: 0 },
      ],
    },
  ]
}

function initTableListFields() {
  const typeMap: Record<string, any> = {}
  categoryTypeOptions.map((item) => {
    typeMap[item.value] = item
    return item
  })
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    {
      prop: 'status',
      label: '状态',
      width: 80,
      type: 'enum',
      fixed: 'left',
      enum: {
        2: { label: '审核拒绝', value: 2, type: 'danger' },
        1: { label: '审核通过', value: 1, type: 'success' },
        0: { label: '待审核', value: 0 },
      },
    },
    {
      prop: 'type',
      width: 80,
      label: '类型',
      type: 'enum',
      enum: typeMap,
    },
    {
      prop: 'document_title_html',
      label: '标题',
      minWidth: 150,
      type: 'html',
    },
    { prop: 'content', label: '评论内容', minWidth: 150 },
    { prop: 'username_html', label: '评论人', minWidth: 150, type: 'html' },
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
      ...parseQueryIntArray(route.query, ['status', 'type']),
    }
    fetchList()
  },
  { immediate: true }
)
</script>
