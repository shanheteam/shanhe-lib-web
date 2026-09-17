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
            <el-button
              type="warning"
              icon="Refresh"
              :disabled="selectedRow.length === 0"
              @click="batchSetStatus(0)"
              >批量嗅探</el-button
            >
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>

    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="spiderArticleLists"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        :actions-min-width="100"
        @selectRow="selectRow"
        @editRow="editRow"
        @deleteRow="deleteRow"
      >
        <template #actions="{ row }">
          <el-button link type="primary" size="small" icon="Reading" @click="viewDetails(row)">
            文章
          </el-button>
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
        ></el-pagination>
      </div>
    </el-card>

    <el-drawer
      v-model="formVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          :content="form.id ? '编辑文章列表页' : '新增文章列表页'"
          @back="formVisible = false"
        ></el-page-header>
      </template>
      <div style="padding: 0 20px">
        <el-form :model="form" label-position="top">
          <el-form-item label="批量链接" prop="url">
            <el-input
              v-model="form.url"
              :type="form.id > 0 ? 'text' : 'textarea'"
              :rows="5"
              :disabled="form.id > 0"
              placeholder="请输入文章列表页地址。新增时支持多行输入，每行一个链接。"
            ></el-input>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="启用浏览器渲染">
                <el-switch v-model="form.enable_browser"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="嗅探频率(天)">
                <el-input
                  v-model="form.frequency"
                  type="number"
                  min="0"
                  placeholder="请输入嗅探频率"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col v-if="form.id > 0" :span="8">
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="请选择状态">
                  <el-option
                    v-for="item in spiderArticleListStatusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="列表规则(HTML选择器，每行一个)">
            <el-input
              v-model="form.list_rules"
              type="textarea"
              :rows="3"
              placeholder="示例：.article-list > .news-list a"
            ></el-input>
          </el-form-item>

          <el-divider content-position="left">内容采集规则</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="标题规则(HTML选择器，每行一个)">
                <el-input
                  v-model="form.content_title_rules"
                  type="textarea"
                  :rows="3"
                  placeholder="示例：h1.article-title"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="内容规则(HTML选择器，每行一个)">
                <el-input
                  v-model="form.content_rules"
                  type="textarea"
                  :rows="3"
                  placeholder="示例：.article-content > #article-content"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="排除规则(HTML选择器，每行一个)">
                <el-input
                  v-model="form.content_exclude_rules"
                  type="textarea"
                  :rows="3"
                  placeholder="示例：script"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="替换规则(每行一条，格式：a => b)">
                <el-input
                  v-model="form.content_replace_rules"
                  type="textarea"
                  :rows="3"
                  placeholder="示例：原字符 => 新字符"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button
              type="primary"
              class="btn-block"
              icon="Check"
              :loading="loadingSubmit"
              @click="submitForm"
              >提交</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {
  batchSetSpiderArticleListStatus,
  createSpiderArticleList,
  deleteSpiderArticleList,
  getSpiderArticleList,
  listSpiderArticleList,
  updateSpiderArticleList,
} from '@/api/spiderarticle'
import { spiderArticleListStatusOptions } from '@/utils/enum'
import { createLatestGuard } from '@/utils/latest'
import { genLinkHTML, parseQueryIntArray } from '@/utils/utils'

defineOptions({ name: 'AdminSpiderArticleList' })

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const loadingSubmit = ref(false)
const formVisible = ref(false)
const search = ref<any>({ wd: '', page: 1, size: 10, status: [] })
const total = ref(0)
const selectedRow = ref<any[]>([])
const spiderArticleLists = ref<any[]>([])
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])

const getDefaultForm = () => ({
  id: 0,
  url: '',
  status: 0,
  frequency: 0 as number | string,
  enable_browser: false,
  list_rules: '',
  content_rules: '',
  content_title_rules: '',
  content_exclude_rules: '',
  content_replace_rules: '',
})
const form = ref<any>(getDefaultForm())

// 翻页/切筛选快速切换时丢弃过期响应
const spiderArticleListGuard = createLatestGuard()

async function fetchData() {
  const token = spiderArticleListGuard.start()
  loading.value = true
  const res: any = await listSpiderArticleList({
    ...search.value,
    order: 'status asc,id desc',
  })
  if (!spiderArticleListGuard.isLatest(token)) return
  loading.value = false
  if (res.status === 200) {
    const items: any[] = res.data.spider_article_list || []
    items.forEach((item) => {
      item.url_html = genLinkHTML(item.url, item.url)
    })
    spiderArticleLists.value = items
    total.value = res.data.total || 0
  } else {
    ElMessage.error(res.data.message)
  }
}

function initSearchForm() {
  searchFormFields.value = [
    { type: 'text', label: '关键字', name: 'wd', placeholder: '请输入链接关键字' },
    {
      type: 'select',
      label: '状态',
      name: 'status',
      placeholder: '请选择状态',
      multiple: true,
      options: spiderArticleListStatusOptions,
    },
  ]
}

function initTableFields() {
  const statusEnum: Record<string, any> = {}
  spiderArticleListStatusOptions.forEach((item) => {
    statusEnum[item.value] = item
  })
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    { prop: 'status', label: '状态', width: 90, type: 'enum', enum: statusEnum },
    { prop: 'url_html', label: '列表页链接', minWidth: 300, type: 'html' },
    { prop: 'total', label: '发现文章', width: 100, type: 'number' },
    { prop: 'enable_browser', label: '浏览器渲染', width: 100, type: 'bool' },
    { prop: 'frequency', label: '频率(天)', width: 90, type: 'number' },
    { prop: 'error', label: '错误', minWidth: 220 },
    { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
    { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
  ]
}

function handleSizeChange(size: number) {
  search.value.size = size
  router.push({ query: search.value })
}
function handlePageChange(page: number) {
  search.value.page = page
  router.push({ query: search.value })
}
function onSearch(params: any) {
  search.value = { ...search.value, ...params, page: 1 }
  router.push({ query: search.value })
}
function onCreate() {
  form.value = getDefaultForm()
  formVisible.value = true
}
async function editRow(row: any) {
  const res: any = await getSpiderArticleList({ id: row.id })
  if (res.status === 200) {
    form.value = { ...getDefaultForm(), ...res.data }
    formVisible.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}
function selectRow(rows: any[]) {
  selectedRow.value = rows
}
function viewDetails(row: any) {
  router.push({
    path: '/admin/spider/articledetail',
    query: { article_list_id: row.id },
  })
}

async function submitForm() {
  if (!form.value.url || !String(form.value.url).trim()) {
    ElMessage.error('请输入链接')
    return
  }
  loadingSubmit.value = true
  let res: any
  const isEdit = form.value.id > 0
  if (isEdit) {
    res = await updateSpiderArticleList({ ...form.value })
  } else {
    const req = {
      ...form.value,
      url: String(form.value.url)
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean),
      frequency: parseInt(form.value.frequency) || 0,
    }
    delete req.id
    delete req.status
    res = await createSpiderArticleList(req)
  }
  loadingSubmit.value = false
  if (res.status === 200) {
    ElMessage.success(isEdit ? '修改成功' : '新增成功')
    formVisible.value = false
    fetchData()
  } else {
    ElMessage.error(res.data.message)
  }
}

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}条】记录吗？`,
    '温馨提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      const res: any = await deleteSpiderArticleList({
        id: selectedRow.value.map((item) => item.id),
      })
      if (res.status === 200) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

function deleteRow(row: any) {
  ElMessageBox.confirm(`您确定要删除【${row.url}】吗？`, '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const res: any = await deleteSpiderArticleList({ id: row.id })
      if (res.status === 200) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

function batchSetStatus(status: number) {
  if (selectedRow.value.length === 0) {
    ElMessage.warning('请选择要操作的记录')
    return
  }
  const label = spiderArticleListStatusOptions[status]?.label
  ElMessageBox.confirm(
    `您确定要将选中的【${selectedRow.value.length}条】记录设置为【${label}】吗？`,
    '温馨提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      const res: any = await batchSetSpiderArticleListStatus({
        id: selectedRow.value.map((item) => item.id),
        status,
      })
      if (res.status === 200) {
        ElMessage.success('操作成功')
        fetchData()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

initSearchForm()
initTableFields()

watch(
  () => route.query,
  () => {
    search.value = {
      ...search.value,
      ...route.query,
      page: parseInt(route.query.page as string) || 1,
      size: parseInt(route.query.size as string) || 10,
      ...parseQueryIntArray(route.query, ['status', 'article_list_id']),
    }
    fetchData()
  },
  { immediate: true },
)
</script>
