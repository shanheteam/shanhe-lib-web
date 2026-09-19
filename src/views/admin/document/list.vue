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
            <el-tooltip
              class="item"
              effect="dark"
              content="将转换失败的文档一键重置为待转换状态，以便重新转换"
              placement="top"
            >
              <el-button type="warning" :icon="Refresh" @click="reconvertDocument"
                >失败重转</el-button
              >
            </el-tooltip>
          </el-form-item>
          <el-form-item>
            <el-dropdown
              :disabled="selectedRow.length === 0"
              @command="approveDocument"
            >
              <el-button
                type="warning"
                :icon="CircleCheck"
                :disabled="selectedRow.length === 0"
              >
                批量审批
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <!-- 文档变为待转换 -->
                  <el-dropdown-item :command="0">审核通过</el-dropdown-item>
                  <!-- 文档状态变为拒绝 -->
                  <el-dropdown-item :command="7">审核拒绝</el-dropdown-item>
                  <!-- 文档状态变为待审核 -->
                  <el-dropdown-item :command="6">变为待审</el-dropdown-item>
                  <el-dropdown-item :command="4" divided>禁用文档</el-dropdown-item>
                  <!-- 表示已转换 -->
                  <el-dropdown-item :command="2">启用文档</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-form-item>
          <el-form-item>
            <el-tooltip
              class="item"
              effect="dark"
              content="批量修改选中的文档分类"
              placement="top"
            >
              <el-button
                type="success"
                :disabled="selectedRow.length === 0"
                :icon="Edit"
                @click="batchUpdateDocumentsCategory"
                >批量分类</el-button
              >
            </el-tooltip>
          </el-form-item>
          <el-form-item>
            <el-dropdown
              :disabled="selectedRow.length === 0"
              @command="batchRecommend"
            >
              <el-button
                type="warning"
                :icon="CircleCheck"
                :disabled="selectedRow.length === 0"
              >
                批量推荐
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="1">设为推荐</el-dropdown-item>
                  <el-dropdown-item :command="0">取消推荐</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-form-item>
          <el-form-item>
            <el-tooltip
              class="item"
              effect="dark"
              content="批量更新文档所属语言"
              placement="top"
            >
              <el-button
                type="primary"
                :disabled="selectedRow.length === 0"
                :icon="Edit"
                @click="batchUpdateDocumentsLanguage"
                >批量语言</el-button
              >
            </el-tooltip>
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="documents"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        :actions-min-width="100"
        @editRow="editRow"
        @viewRow="viewRow"
        @selectRow="selectRow"
        @deleteRow="deleteRow"
      >
        <template #actions="scope">
          <el-tooltip
            v-if="scope.row.convert_error && scope.row.status === 3"
            class="item"
            effect="dark"
            placement="top"
          >
            <template #content>
              <div class="tooltip-box">
                {{ scope.row.convert_error }}
              </div>
            </template>
            <el-button
              link
              size="small"
              class="text-warning"
              :icon="Warning"
              >转换失败原因</el-button
            >
          </el-tooltip>
          <el-button
            link
            size="small"
            :icon="CircleCheck"
            @click="recommendDocument(scope.row)"
            >推荐</el-button
          >
          <el-button
            v-if="
              scope.row.status === 6 ||
              scope.row.status === 7 ||
              scope.row.status === 4
            "
            link
            :icon="Download"
            class="text-warning"
            @click="download2review(scope.row)"
            >下载审核</el-button
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
      v-model="formVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header content="编辑文档" @back="formVisible = false">
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormUpdateDocument
          :category-trees="trees"
          :init-document="document"
          :is-admin="true"
          @success="formSuccess"
        />
      </div>
    </el-drawer>
    <el-drawer
      v-model="formDocumentsCategoryVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          content="批量分类"
          @back="formDocumentsCategoryVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormUpdateDocumentsCategory
          v-if="formDocumentsCategoryVisible"
          :category-trees="trees"
          :documents="categoryDocuments"
          @success="formSuccess"
        />
      </div>
    </el-drawer>
    <el-drawer
      v-model="formDocumentsLanguageVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          content="批量设置语言"
          @back="formDocumentsLanguageVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormUpdateDocumentsLanguage
          v-if="formDocumentsLanguageVisible"
          :documents="languageDocuments"
          @success="formSuccess"
        />
      </div>
    </el-drawer>
    <el-drawer
      v-model="formDocumentRecommendVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          content="推荐设置"
          @back="formDocumentRecommendVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormDocumentRecommend
          :init-document="document"
          @success="formSuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { Refresh, CircleCheck, Edit, Warning, Download } from '@element-plus/icons-vue'
import { useSettingStore } from '@/store/setting'
import { listCategory } from '@/api/category'
import {
  deleteDocument,
  getDocument,
  listDocument,
  setDocumentReconvert,
  checkDocument,
  downloadDocumentToBeReviewed,
  setDocumentRecommend,
} from '@/api/document'
import { listLanguage } from '@/api/language'
import { createLatestGuard } from '@/utils/latest'
import {
  categoryToTrees,
  parseQueryIntArray,
  parseQueryBoolArray,
  genLinkHTML,
} from '@/utils/utils'
import { documentStatusOptions, boolOptions } from '@/utils/enum'

const route = useRoute()
const router = useRouter()
const settingStore = useSettingStore()

const loading = ref(false)
const formVisible = ref(false)
const formDocumentRecommendVisible = ref(false)
const search = ref<any>({
  page: 1,
  size: 10,
})
const documents = ref<any[]>([])
const trees = ref<any[]>([])
const categoryMap = ref<Record<string, any>>({})
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])
const document = ref<any>({ id: 0 })
const formDocumentsCategoryVisible = ref(false)
const categoryDocuments = ref<any[]>([])
const formDocumentsLanguageVisible = ref(false)
const languageDocuments = ref<any[]>([])
const languages = ref<any[]>([])

async function fetchLanguages() {
  const res: any = await listLanguage({
    field: ['language', 'code'],
    enable: 1,
    page: 1,
    size: 1000,
  })
  if (res.status === 200) {
    languages.value = res.data.language || []
  } else {
    ElMessage.error(res.data.message)
  }
}

async function fetchCategories() {
  const res: any = await listCategory({ field: ['id', 'parent_id', 'title'] })
  if (res.status === 200) {
    let categories: any[] = res.data.category || []
    categories = categories.map((item: any) => {
      item.disable_delete = item.doc_count > 0
      return item
    })

    const categoryMapTemp: Record<string, any> = {}
    categories.forEach((item: any) => {
      categoryMapTemp[item.id] = item
    })
    categoryMap.value = categoryMapTemp
    trees.value = categoryToTrees(categories, false)
    total.value = res.data.total
  } else {
    ElMessage.error(res.data.message)
  }
}

// 翻页/切筛选快速切换时丢弃过期响应
const documentGuard = createLatestGuard()

async function fetchList() {
  const token = documentGuard.start()
  loading.value = true
  const searchParams = { ...search.value }
  if (
    searchParams.category_id &&
    typeof searchParams.category_id === 'object'
  ) {
    searchParams.category_id =
      searchParams.category_id[searchParams.category_id.length - 1]
  }
  const res: any = await listDocument(searchParams)
  if (!documentGuard.isLatest(token)) return
  if (res.status === 200) {
    const docs: any[] = res.data.document || []
    docs.forEach((item: any) => {
      item.disable_delete = item.status === 1
      item.title_html = genLinkHTML(item.title, `/document/${item.uuid}`)
      item.username_html = genLinkHTML(
        item.realname || item.user?.realname || '未命名用户',
        `/user/${item.user_id}`)
    })

    documents.value = docs
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
  // 新增，跳转到前台文档上传页面
  const routeUrl = router.resolve({
    path: '/upload',
  })
  window.open(routeUrl.href, '_blank')
}

async function reconvertDocument() {
  const res: any = await setDocumentReconvert()
  if (res.status === 200) {
    ElMessage.success('提交成功，请耐心等待重新转换')
    fetchList()
  } else {
    ElMessage.error(res.data.message || '操作失败')
  }
}

function viewRow(row: any) {
  // 查看，跳转到前台文档详情页面
  const routeUrl = router.resolve({
    path: '/document/' + row.uuid,
  })
  window.open(routeUrl.href, '_blank')
}

async function editRow(row: any) {
  const res: any = await getDocument({ id: row.id, with_all_content: true })
  if (res.status === 200) {
    document.value = res.data
    formVisible.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}

async function recommendDocument(row: any) {
  const res: any = await getDocument({ id: row.id })
  if (res.status === 200) {
    document.value = res.data
    formDocumentRecommendVisible.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}

function formSuccess() {
  formVisible.value = false
  formDocumentRecommendVisible.value = false
  formDocumentsCategoryVisible.value = false
  formDocumentsLanguageVisible.value = false
  fetchList()
}

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}个】文档吗？删除之后将会进入到回收站，可以在回收站中恢复。`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await deleteDocument({ id: ids })
      if (res.status === 200) {
        ElMessage.success('删除成功')
        fetchList()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

function batchRecommend(cmd: number) {
  const tips = cmd === 1 ? '设为推荐' : '取消推荐'
  const typ = cmd === 1 ? 2 : 0
  ElMessageBox.confirm(
    `您确定要将选中的【${selectedRow.value.length}个】文档【${tips}】吗？请仔细检查，以免误操作。`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await setDocumentRecommend({
        id: selectedRow.value.map((item) => item.id),
        type: typ,
      })
      if (res.status === 200) {
        ElMessage.success('操作成功')
        fetchList()
        return
      }
      ElMessage.error(res.data.message || '操作失败')
    })
    .catch(() => {})
}

function batchUpdateDocumentsCategory() {
  categoryDocuments.value = selectedRow.value
  formDocumentsCategoryVisible.value = true
}

function batchUpdateDocumentsLanguage() {
  languageDocuments.value = selectedRow.value
  formDocumentsLanguageVisible.value = true
}

function deleteRow(row: any) {
  ElMessageBox.confirm(
    `您确定要删除文档【${row.title}】吗？删除之后将会进入到回收站，可以在回收站中恢复。`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await deleteDocument({ id: row.id })
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

async function approveDocument(cmd: number) {
  ElMessageBox.confirm(
    `您确定要将选中的【${selectedRow.value.length}个】文档状态变更为【${documentStatusOptions[cmd].label}】吗？请仔细检查，以免误操作。`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await checkDocument({
        id: selectedRow.value.map((item) => item.id),
        status: cmd,
      })
      if (res.status === 200) {
        ElMessage.success('审批成功')
        fetchList()
        return
      }
      ElMessage.error(res.data.message || '审批失败')
    })
    .catch(() => {})
}

function initSearchForm() {
  const languageOptions: any[] = []
  ;(languages.value || []).map((item: any) => {
    languageOptions.push({ label: item.language, value: item.code })
  })
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
      name: 'status',
      placeholder: '请选择状态',
      multiple: true,
      options: documentStatusOptions,
    },
    {
      type: 'select',
      label: '语言',
      name: 'language',
      placeholder: '请选择语言',
      multiple: true,
      options: languageOptions,
    },
    {
      type: 'select',
      label: '推荐',
      name: 'is_recommend',
      placeholder: '请选择推荐状态',
      multiple: true,
      options: boolOptions,
    },
    // 级联
    {
      type: 'cascader',
      label: '分类',
      name: 'category_id',
      placeholder: '请选择分类',
      trees: trees.value,
    },
  ]
}

async function download2review(row: any) {
  const res: any = await downloadDocumentToBeReviewed({ id: row.id })
  if (res.status === 200) {
    // 后端返回相对路径 /download/<jwt>，需拼上后端域名，否则会被当前前端域名解析导致 404
    const base = import.meta.env.VITE_API_BASE_URL || ''
    const url = res.data.url.startsWith('/') ? base + res.data.url : res.data.url
    location.href = url
  } else {
    ElMessage.error(res.data.message)
  }
}

function initTableListFields() {
  const statusMap: Record<string, any> = {}
  documentStatusOptions.forEach((item) => {
    statusMap[item.value] = item
  })

  const languageMap: Record<string, any> = {}
  ;(settingStore.settings.language || []).forEach((item: any) => {
    languageMap[item.code] = { label: item.language, value: item.code }
  })

  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    {
      prop: 'title_html',
      label: '文档',
      minWidth: 200,
      fixed: 'left',
      type: 'html',
    },
    { prop: 'ext', label: '扩展名', width: 70 },
    { prop: 'username_html', label: '上传者', width: 120, type: 'html' },
    {
      prop: 'status',
      label: '状态',
      width: 120,
      type: 'enum',
      enum: statusMap,
    },
    {
      prop: 'language',
      label: '语言',
      width: 120,
      type: 'enum',
      enum: languageMap,
    },
    {
      prop: 'category',
      label: '分类',
      minWidth: 180,
      type: 'category',
    },
    { prop: 'size', label: '大小', width: 100, type: 'bytes' },
    { prop: 'pages', label: '页数', width: 80, type: 'number' },
    { prop: 'price', label: '价格', width: 80, type: 'number' },
    { prop: 'download_count', label: '下载', width: 70, type: 'number' },
    { prop: 'view_count', label: '浏览', width: 70, type: 'number' },
    { prop: 'favorite_count', label: '收藏', width: 70, type: 'number' },
    { prop: 'comment_count', label: '评论', width: 70, type: 'number' },
    { prop: 'keywords', label: '关键字', minWidth: 200 },
    { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
    { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
    {
      prop: 'recommend_at',
      label: '推荐时间',
      width: 170,
      type: 'datetime',
    },
  ]
}

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
      ...parseQueryIntArray(route.query, ['category_id', 'status']),
      ...parseQueryBoolArray(route.query, ['is_recommend']),
    }

    // 需要先加载语言数据
    if ((languages.value || []).length === 0) {
      await fetchLanguages()
    }

    // 需要先加载分类数据
    if (trees.value.length === 0) {
      await fetchCategories()
    }

    initSearchForm()
    await fetchList()
  },
  { immediate: true }
)
</script>
