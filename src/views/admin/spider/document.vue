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
        <template #buttons>
          <el-form-item>
            <el-button-group>
              <template v-if="batchUpdating">
                <el-button
                  type="primary"
                  icon="Check"
                  :loading="loading"
                  @click="submitBatchUpdate"
                  >提交修改</el-button
                >
                <el-button type="warning" icon="Close" @click="cancelBatchUpdate"
                  >取消</el-button
                >
              </template>
              <el-button
                v-else
                type="primary"
                icon="Edit"
                :disabled="selectedRow.length === 0"
                @click="batchUpdate"
                >批量修改</el-button
              >
            </el-button-group>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :disabled="selectedRow.length === 0"
              icon="Download"
              @click="onDownload"
              >下载选中</el-button
            >
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :disabled="selectedRow.length === 0"
              icon="Finished"
              @click="onPublish"
              >发布选中</el-button
            >
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="spiderDocuments"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="false"
        :show-delete="true"
        :show-select="!batchUpdating"
        :actions-min-width="80"
        @selectRow="selectRow"
        @deleteRow="deleteRow"
      >
        <template #header="{ column }">
          <el-popover
            v-if="batchUpdating && (column.property === 'title' || column.field === 'title')"
            placement="bottom"
            :width="520"
            trigger="click"
          >
            <template #reference>
              <el-tooltip content="快捷操作">
                <el-button link type="primary" icon="Setting" size="small"></el-button>
              </el-tooltip>
            </template>
            <el-form label-position="top" size="small">
              <el-form-item label="引用(将指定字段内容填充到正式标题)">
                <el-select
                  v-model="titleForm.field"
                  placeholder="请选择"
                  clearable
                  style="width: 70%; margin-right: 8px"
                >
                  <el-option
                    v-for="item in [
                      { label: '文档链接', value: 'url' },
                      { label: '链接标题', value: 'title_from_href' },
                      { label: 'URL标题', value: 'title_from_url' },
                      { label: '附件标题', value: 'title_from_attachment' },
                      { label: '替换为空', value: 'empty' },
                    ]"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <el-button icon="Check" type="primary" @click="fillTitle">确定</el-button>
              </el-form-item>
              <el-form-item label="字符串替换">
                <el-row :gutter="10">
                  <el-col :span="10">
                    <el-input v-model="titleForm.search" placeholder="查找内容"></el-input>
                  </el-col>
                  <el-col :span="10">
                    <el-input v-model="titleForm.replace" placeholder="替换内容"></el-input>
                  </el-col>
                  <el-col :span="4">
                    <el-button type="primary" icon="Sort" @click="replaceTitle">替换</el-button>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-form>
          </el-popover>
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
      v-model="showPublishing"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          content="发布选中文档"
          @back="showPublishing = false"
        ></el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormPublishSpiderDocument
          v-if="showPublishing"
          :documents="selectedRow"
          @success="formSpiderDocumentSuccess"
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
  listSpiderDocument,
  deleteSpiderDocument,
  batchUpdateSpiderDocument,
} from '@/api/spiderdocument'
import { createLatestGuard } from '@/utils/latest'
import { genLinkHTML, parseQueryIntArray } from '@/utils/utils'
import { spiderDocumentStatusOptions } from '@/utils/enum'
import { useSettingStore } from '@/store/setting'

defineOptions({ name: 'AdminSpiderDocument' })

const route = useRoute()
const router = useRouter()
const settingStore = useSettingStore()

const loading = ref(false)
const showPublishing = ref(false)
const search = ref<any>({ wd: '', page: 1, status: [], size: 10 })
const titleForm = ref({ field: '', search: '', replace: '' })
const spiderDocuments = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])
const batchUpdating = ref(false)

function stripRow(item: any) {
  const newItem = { ...item }
  delete newItem.url_html
  delete newItem.editing
  delete newItem.disable_delete
  delete newItem._X_ROW_CHILD
  delete newItem._X_ROW_KEY
  delete newItem.children
  return newItem
}

// 翻页/切筛选快速切换时丢弃过期响应
const spiderDocumentGuard = createLatestGuard()

async function fetchData() {
  const token = spiderDocumentGuard.start()
  loading.value = true
  batchUpdating.value = false
  const res: any = await listSpiderDocument({
    ...search.value,
    order: 'status asc, id desc',
  })
  if (!spiderDocumentGuard.isLatest(token)) return
  if (res.status === 200) {
    const list: any[] = res.data.spider_document || []
    list.forEach((item) => {
      item.url_html = genLinkHTML(item.url, item.url)
      item.editing = false
      item.status = item.status || 0
      item.title = item.title || ''
      item.disable_delete = item.status === 1 || item.status === 2
    })
    spiderDocuments.value = list
    total.value = res.data.total
  } else {
    ElMessage.error(res.data.message)
  }
  loading.value = false
}

function fillTitle() {
  spiderDocuments.value.forEach((item) => {
    if (!item.editing) return
    if (titleForm.value.field === 'empty') {
      item.title = ''
      return
    }
    item.title = item[titleForm.value.field]
    const ext = item.ext || ''
    if (ext) {
      item.title = String(item.title || '').replace(new RegExp(ext, 'i'), '')
    }
  })
}

function replaceTitle() {
  spiderDocuments.value.forEach((item) => {
    if (!item.editing) return
    item.title = (item.title || '').replace(
      new RegExp(titleForm.value.search, 'g'),
      titleForm.value.replace,
    )
  })
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
  search.value = { ...search.value, ...params, page: 1 }
  router.push({ query: search.value })
}

function batchUpdate() {
  const idMap: Record<string, boolean> = {}
  selectedRow.value.forEach((item) => {
    idMap[item.id] = true
  })
  spiderDocuments.value = spiderDocuments.value.map((item) => {
    if (idMap[item.id]) item.editing = true
    return item
  })
  batchUpdating.value = true
}

function cancelBatchUpdate() {
  batchUpdating.value = false
  fetchData()
}

async function submitBatchUpdate() {
  const docs = spiderDocuments.value
    .filter((item) => item.editing)
    .map((item) => stripRow(item))
  loading.value = true
  const res: any = await batchUpdateSpiderDocument({ spider_document: docs })
  loading.value = false
  if (res.status === 200) {
    ElMessage.success('批量修改成功')
    batchUpdating.value = false
    fetchData()
  } else {
    ElMessage.error(res.data.message)
  }
}

function formSpiderDocumentSuccess() {
  showPublishing.value = false
  fetchData()
}

function onDownload() {
  ElMessageBox.confirm(
    `您确定要将选中的【${selectedRow.value.length}篇】文档加入到下载队列吗？`,
    '温馨提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
  ).then(async () => {
    const docs = selectedRow.value.map((item) => ({
      ...stripRow(item),
      status: 1,
    }))
    const res: any = await batchUpdateSpiderDocument({ spider_document: docs })
    if (res.status === 200) {
      ElMessage.success('加入下载队列成功')
      fetchData()
    } else {
      ElMessage.error(res.data.message)
    }
  })
}

function onPublish() {
  showPublishing.value = true
}

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}条】文档吗？删除之后不可恢复！`,
    '温馨提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await deleteSpiderDocument({ id: ids })
      if (res.status === 200) {
        ElMessage.success('删除成功')
        if (!batchUpdating.value) {
          fetchData()
        } else {
          spiderDocuments.value = spiderDocuments.value.filter(
            (item) => !ids.includes(item.id),
          )
          if (spiderDocuments.value.length === 0) fetchData()
        }
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

function deleteRow(row: any) {
  const name =
    row.title ||
    row.title_from_attachment ||
    row.title_from_href ||
    row.title_from_url ||
    row.url
  ElMessageBox.confirm(
    `您确定要删除文档【${name}】吗？删除之后不可恢复！`,
    '温馨提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      const res: any = await deleteSpiderDocument({ id: row.id })
      if (res.status === 200) {
        ElMessage.success('删除成功')
        if (!batchUpdating.value) {
          fetchData()
        } else {
          spiderDocuments.value = spiderDocuments.value.filter(
            (item) => item.id !== row.id,
          )
          if (spiderDocuments.value.length === 0) fetchData()
        }
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
    { type: 'text', label: '关键字', name: 'wd', placeholder: '请输入关键字' },
    {
      type: 'select',
      label: '状态',
      name: 'status',
      placeholder: '请选择状态',
      multiple: true,
      options: spiderDocumentStatusOptions,
    },
  ]
}

function initTableListFields() {
  const enumStatus: Record<string, any> = {}
  spiderDocumentStatusOptions.forEach((item) => {
    enumStatus[item.value] = item
  })
  const enumLanguage: Record<string, any> = {}
  ;(settingStore.settings.language || []).forEach((item: any) => {
    enumLanguage[item.code] = { label: item.language, value: item.code }
  })

  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    { prop: 'status', label: '状态', width: 130, type: 'enum', enum: enumStatus, editable: true },
    { prop: 'url_html', label: '文档链接', minWidth: 200, type: 'html' },
    { prop: 'language', label: '语言', width: 130, type: 'enum', enum: enumLanguage, editable: true },
    { prop: 'title', label: '正式标题', minWidth: 300, editable: true },
    { prop: 'title_from_href', label: '链接标题', minWidth: 200 },
    { prop: 'title_from_url', label: 'URL标题', minWidth: 200 },
    { prop: 'title_from_attachment', label: '附件标题', minWidth: 200 },
    { prop: 'price', label: '价格', width: 80 },
    { prop: 'size', label: '大小', width: 120, type: 'bytes' },
    { prop: 'ext', label: '扩展名', width: 80 },
    { prop: 'content_type', label: 'ContentType', width: 150 },
    { prop: 'error', label: '错误信息', minWidth: 120 },
    { prop: 'save_path', label: '存储路径', minWidth: 250 },
    { prop: 'user_id', label: '发布到用户', minWidth: 100, type: 'number' },
    { prop: 'category_id', label: '发布到分类', minWidth: 150 },
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
      ...parseQueryIntArray(route.query, ['status']),
    }
    fetchData()
  },
  { immediate: true },
)
</script>
