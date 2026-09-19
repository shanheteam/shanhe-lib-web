<template>
  <div>
    <el-alert
      v-if="search.article_list_id"
      type="info"
      :closable="false"
      class="mgb-20px"
      :title="`当前仅查看列表源 #${search.article_list_id} 发现的文章`"
    >
      <el-button link type="primary" @click="clearSourceFilter">清除筛选</el-button>
    </el-alert>

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
            <el-button
              type="primary"
              icon="Download"
              :disabled="selectedRow.length === 0"
              @click="joinCollectQueue"
              >加入采集队列</el-button
            >
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="Finished"
              :disabled="selectedRow.length === 0"
              @click="openPublishDrawer"
              >发布选中</el-button
            >
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>

    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="spiderArticleDetails"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        :actions-min-width="170"
        @selectRow="selectRow"
        @editRow="editRow"
        @deleteRow="deleteRow"
      >
        <template #actions="{ row }">
          <el-button
            v-if="row.article_id"
            link
            type="primary"
            icon="Link"
            size="small"
            @click="openPublishedArticle(row)"
            >已发布</el-button
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
        ></el-pagination>
      </div>
    </el-card>

    <el-drawer
      v-model="detailVisible"
      direction="rtl"
      :size="isMobile ? '100%' : '65%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header content="文章详情" @back="detailVisible = false"></el-page-header>
      </template>
      <div style="padding: 0 20px 20px">
        <el-form :model="detailForm" label-position="top">
          <el-row :gutter="20">
            <el-col :span="16">
              <el-form-item label="标题">
                <el-input v-model="detailForm.title"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="状态">
                <el-select
                  v-model="detailForm.status"
                  :disabled="detailForm.status > 4"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in filteredStatusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="来源名称">
                <el-input v-model="detailForm.source"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="来源链接">
                <el-input v-model="detailForm.url">
                  <template #append>
                    <el-button :loading="crawling" icon="Van" @click="onCrawlArticle">
                      采集文章
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="摘要">
            <el-input
              v-model="detailForm.description"
              type="textarea"
              :rows="3"
            ></el-input>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="标题规则(HTML选择器，每行一个)">
                <el-input
                  v-model="detailForm.content_title_rules"
                  type="textarea"
                  :rows="4"
                  placeholder="示例：h1.article-title"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="内容规则(HTML选择器，每行一个)">
                <el-input
                  v-model="detailForm.content_rules"
                  type="textarea"
                  :rows="4"
                  placeholder="示例：.article-content"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="排除规则(HTML选择器，每行一个)">
                <el-input
                  v-model="detailForm.content_exclude_rules"
                  type="textarea"
                  :rows="4"
                  placeholder="示例：script"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="替换规则(每行一条，格式：a ==> b)">
                <el-input
                  v-model="detailForm.content_replace_rules"
                  type="textarea"
                  :rows="4"
                  placeholder="示例：原标题 ==> &#10;来源：本站 ==> "
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="文章内容">
            <RichEditor
              v-model="detailForm.content"
              :height="560"
              placeholder="请输入文章 HTML 内容"
            />
          </el-form-item>
          <el-form-item class="mgt-20px">
            <el-button type="primary" :loading="loadingSubmit" icon="Check" @click="saveDetail">
              保存
            </el-button>
            <el-button icon="Close" @click="detailVisible = false">关闭</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <el-drawer
      v-model="publishVisible"
      direction="rtl"
      :size="isMobile ? '95%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header content="发布选中文章" @back="publishVisible = false"></el-page-header>
      </template>
      <div style="padding: 0 20px 20px">
        <el-form :model="publishForm" label-position="top">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户ID">
                <el-input-number v-model="publishForm.user_id"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发布到分类">
                <el-cascader
                  v-model="publishForm.category_id"
                  :options="categoryTrees"
                  :props="categoryProps"
                  clearable
                  filterable
                  style="width: 100%"
                ></el-cascader>
              </el-form-item>
            </el-col>
          </el-row>
          <el-alert
            type="warning"
            title="只有采集成功且标题、内容均不为空的文章会进入发布队列"
            show-icon
          ></el-alert>
          <el-table :data="selectedRow" height="320" class="mgt-20px">
            <el-table-column label="发布条件" width="90">
              <template #default="scope">
                <el-tag
                  v-if="
                    scope.row.status === 3 &&
                    scope.row.title &&
                    scope.row.content
                  "
                  type="success"
                  size="small"
                  >满足</el-tag
                >
                <el-tag v-else type="danger" size="small">不满足</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="title" label="标题"></el-table-column>
          </el-table>
          <el-form-item class="mgt-20px">
            <el-button type="primary" :loading="loadingSubmit" @click="submitPublish">
              提交发布
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { listCategory } from '@/api/category'
import {
  batchUpdateSpiderArticleDetail,
  deleteSpiderArticleDetail,
  getSpiderArticleDetail,
  listSpiderArticleDetail,
  updateSpiderArticleDetail,
} from '@/api/spiderarticle'
import { crawlArticle } from '@/api/article'
import RichEditor from '@/components/RichEditor.vue'
import { createLatestGuard } from '@/utils/latest'
import { categoryToTrees, genLinkHTML, parseQueryIntArray } from '@/utils/utils'
import { spiderArticleDetailStatusOptions } from '@/utils/enum'
import { STORAGE_KEYS } from '@/utils/storage'

defineOptions({ name: 'AdminSpiderArticleDetail' })

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const loadingSubmit = ref(false)
const crawling = ref(false)
const detailVisible = ref(false)
const publishVisible = ref(false)
const search = ref<any>({ wd: '', page: 1, size: 10, status: [], article_list_id: 0 })
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const total = ref(0)
const selectedRow = ref<any[]>([])
const spiderArticleDetails = ref<any[]>([])
const detailForm = ref<any>({})
const publishForm = ref<any>({
  user_id: Number(localStorage.getItem(STORAGE_KEYS.USER_ID)) || 0,
  category_id: [],
})
const categoryTrees = ref<any[]>([])
const categoryProps = {
  checkStrictly: true,
  expandTrigger: 'hover',
  label: 'title',
  value: 'id',
}

const filteredStatusOptions = computed(() =>
  spiderArticleDetailStatusOptions.filter((o) =>
    detailForm.value.status > 4 ? true : o.value <= 4,
  ),
)

function initSearchForm() {
  searchFormFields.value = [
    { type: 'text', label: '关键字', name: 'wd', placeholder: '请输入标题或链接' },
    {
      type: 'select',
      label: '状态',
      name: 'status',
      placeholder: '请选择状态',
      multiple: true,
      options: spiderArticleDetailStatusOptions,
    },
  ]
}

function initTableFields() {
  const statusEnum: Record<string, any> = {}
  spiderArticleDetailStatusOptions.forEach((item) => {
    statusEnum[item.value] = item
  })
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    { prop: 'status', label: '状态', width: 100, type: 'enum', enum: statusEnum },
    { prop: 'title', label: '标题', minWidth: 300 },
    { prop: 'url_html', label: '来源链接', minWidth: 260, type: 'html' },
    { prop: 'source', label: '来源', width: 150 },
    { prop: 'published_at', label: '发布时间', width: 170, type: 'datetime' },
    { prop: 'article_id', label: '发布文章ID', width: 110, type: 'number' },
    { prop: 'error', label: '错误', minWidth: 200 },
    { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
    { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
  ]
}

async function fetchCategories() {
  const res: any = await listCategory({
    field: ['id', 'parent_id', 'title'],
    type: [1],
  })
  if (res.status === 200) {
    categoryTrees.value = categoryToTrees(res.data.category || [], false)
  }
}

async function onCrawlArticle() {
  crawling.value = true
  const req: any = {
    url: detailForm.value.url,
    mode: 1,
    exclude: detailForm.value.content_exclude_rules,
    replace: detailForm.value.content_replace_rules,
    select: detailForm.value.content_rules,
    title_selector: detailForm.value.content_title_rules,
  }
  if ((detailForm.value.content_rules || '').trim() === '') {
    req.select = ''
    req.mode = 0
  }
  const res: any = await crawlArticle(req)
  crawling.value = false
  if (res.status !== 200) {
    ElMessage.error(res.data.message)
    detailForm.value.error = res.data.message
    detailForm.value.status = 4
  } else {
    detailForm.value = {
      ...detailForm.value,
      title: res.data.title,
      content: res.data.content,
      source: res.data.source,
      description: res.data.description,
      keywords: res.data.keywords,
      status: 3,
    }
    ElMessage.success('采集成功')
  }
}

// 翻页/切筛选快速切换时丢弃过期响应
const spiderArticleDetailGuard = createLatestGuard()

async function fetchData() {
  const token = spiderArticleDetailGuard.start()
  loading.value = true
  const res: any = await listSpiderArticleDetail({
    ...search.value,
    order: 'status asc,id desc',
  })
  if (!spiderArticleDetailGuard.isLatest(token)) return
  loading.value = false
  if (res.status === 200) {
    const items: any[] = res.data.spider_article_detail || []
    items.forEach((item) => {
      item.url_html = genLinkHTML(item.url, item.url)
      item.disable_delete = [1, 2, 6].includes(item.status)
    })
    spiderArticleDetails.value = items
    total.value = res.data.total || 0
  } else {
    ElMessage.error(res.data.message)
  }
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
function clearSourceFilter() {
  const query = { ...search.value, page: 1 }
  delete query.article_list_id
  router.push({ path: route.path, query })
}
function selectRow(rows: any[]) {
  selectedRow.value = rows
}

async function editRow(row: any) {
  const res: any = await getSpiderArticleDetail({ id: row.id })
  if (res.status === 200) {
    detailForm.value = { ...res.data }
    detailVisible.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}

function openPublishedArticle(row: any) {
  window.open(`/admin/article/set?id=${row.article_id}`, '_blank')
}

async function saveDetail() {
  loadingSubmit.value = true
  const res: any = await updateSpiderArticleDetail({ ...detailForm.value })
  loadingSubmit.value = false
  if (res.status === 200) {
    ElMessage.success('保存成功')
    detailVisible.value = false
    fetchData()
  } else {
    ElMessage.error(res.data.message)
  }
}

function joinCollectQueue() {
  ElMessageBox.confirm(
    `您确定要将选中的【${selectedRow.value.length}篇】文章加入采集队列吗？`,
    '温馨提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      const docs = selectedRow.value.map((item) => ({
        id: item.id,
        status: 1,
        title: item.title,
        content: item.content,
        description: item.description,
        keywords: item.keywords,
        source: item.source,
        content_rules: item.content_rules,
        content_title_rules: item.content_title_rules,
        content_exclude_rules: item.content_exclude_rules,
        content_replace_rules: item.content_replace_rules,
        enable_browser: item.enable_browser,
      }))
      const res: any = await batchUpdateSpiderArticleDetail({
        spider_article_detail: docs,
      })
      if (res.status === 200) {
        ElMessage.success('加入采集队列成功')
        fetchData()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

function openPublishDrawer() {
  publishVisible.value = true
}

async function submitPublish() {
  if (!publishForm.value.user_id) {
    ElMessage.error('请输入用户ID')
    return
  }
  if (publishForm.value.category_id.length === 0) {
    ElMessage.error('请选择发布分类')
    return
  }
  const docs = selectedRow.value
    .map((item) => ({
      id: item.id,
      status: item.status === 3 ? 5 : item.status,
      user_id: publishForm.value.user_id,
      category_id: JSON.stringify(publishForm.value.category_id),
      title: item.title,
      content: item.content,
      description: item.description,
      keywords: item.keywords,
      source: item.source,
      content_rules: item.content_rules,
      content_title_rules: item.content_title_rules,
      content_exclude_rules: item.content_exclude_rules,
      content_replace_rules: item.content_replace_rules,
      enable_browser: item.enable_browser,
    }))
    .filter((item) => item.status === 5 && item.title && item.content)

  if (docs.length === 0) {
    ElMessage.error('没有满足发布条件的文章')
    return
  }

  loadingSubmit.value = true
  const res: any = await batchUpdateSpiderArticleDetail({
    spider_article_detail: docs,
  })
  loadingSubmit.value = false
  if (res.status === 200) {
    localStorage.setItem(STORAGE_KEYS.USER_ID, String(publishForm.value.user_id))
    ElMessage.success('加入发布队列成功')
    publishVisible.value = false
    fetchData()
  } else {
    ElMessage.error(res.data.message)
  }
}

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}篇】文章吗？`,
    '温馨提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      const res: any = await deleteSpiderArticleDetail({
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
  ElMessageBox.confirm(`您确定要删除【${row.title || row.url}】吗？`, '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const res: any = await deleteSpiderArticleDetail({ id: row.id })
      if (res.status === 200) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

initSearchForm()
initTableFields()
fetchCategories()

watch(
  () => route.query,
  () => {
    search.value = {
      ...search.value,
      ...route.query,
      page: parseInt(route.query.page as string) || 1,
      size: parseInt(route.query.size as string) || 10,
      article_list_id: parseInt(route.query.article_list_id as string) || 0,
      ...parseQueryIntArray(route.query, ['status']),
    }
    fetchData()
  },
  { immediate: true },
)
</script>
