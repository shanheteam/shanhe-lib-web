<template>
  <div class="page-admin-article">
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
              content="批量修改选中的文章分类"
              placement="top"
            >
              <el-button
                type="success"
                :disabled="selectedRow.length === 0"
                :icon="Edit"
                @click="batchUpdateArticlesCategory"
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
                type="primary"
                :icon="CircleCheck"
                :disabled="selectedRow.length === 0"
              >
                批量推荐
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="1">推荐选中</el-dropdown-item>
                  <el-dropdown-item :command="0">取消推荐</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-form-item>
          <el-form-item>
            <el-dropdown
              :disabled="selectedRow.length === 0"
              @command="batchCheeck"
            >
              <el-button
                type="warning"
                :icon="CircleCheck"
                :disabled="selectedRow.length === 0"
              >
                批量审核
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="status in articleStatusOptions"
                    :key="'status-' + status.value"
                    :command="status.value"
                    >设为{{ status.label }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-form-item>
          <el-form-item>
            <el-dropdown
              :disabled="selectedRow.length === 0"
              @command="batchNotice"
            >
              <el-button
                type="info"
                :icon="Bell"
                :disabled="selectedRow.length === 0"
              >
                批量公告
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="1">设为公告</el-dropdown-item>
                  <el-dropdown-item :command="0">取消公告</el-dropdown-item>
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
        :table-data="articles"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        @selectRow="selectRow"
        @editRow="editRow"
        @deleteRow="deleteRow"
      >
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
      v-model="formArticlesCategoryVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          content="批量分类"
          @back="formArticlesCategoryVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormUpdateArticlesCategory
          v-if="formArticlesCategoryVisible"
          :category-trees="trees"
          :articles="categoryArticles"
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
import { Edit, CircleCheck, Bell } from '@element-plus/icons-vue'
import {
  listArticle,
  deleteArticle,
  recommendArticles,
  checkArticles,
  noticeArticles,
} from '@/api/article'
import { listCategory } from '@/api/category'
import { articleStatusOptions } from '@/utils/enum'
import {
  genLinkHTML,
  categoryToTrees,
  parseQueryIntArray,
} from '@/utils/utils'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formArticleVisible = ref(false)
const search = ref<any>({
  wd: '',
  page: 1,
  status: [],
  size: 10,
})
const articles = ref<any[]>([])
const total = ref(0)
const trees = ref<any[]>([])
const categoryMap = ref<Record<string, any>>({})
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])
const selectedRow = ref<any[]>([])
const formArticlesCategoryVisible = ref(false)
const categoryArticles = ref<any[]>([])

async function batchRecommend(command: number) {
  const ids = selectedRow.value.map((item) => item.id)
  const res: any = await recommendArticles({
    article_id: ids,
    is_recommend: command === 1,
  })
  if (res.status === 200) {
    ElMessage.success('操作成功')
    fetchList()
  } else {
    ElMessage.error(res.data.message)
  }
}

async function batchCheeck(command: number) {
  const ids = selectedRow.value.map((item) => item.id)
  const res: any = await checkArticles({
    article_id: ids,
    status: command,
  })
  if (res.status === 200) {
    ElMessage.success('操作成功')
    fetchList()
  } else {
    ElMessage.error(res.data.message)
  }
}

async function batchNotice(command: number) {
  const ids = selectedRow.value.map((item) => item.id)
  const res: any = await noticeArticles({
    article_id: ids,
    is_notice: command === 1,
  })
  if (res.status === 200) {
    ElMessage.success('操作成功')
    fetchList()
  } else {
    ElMessage.error(res.data.message)
  }
}

async function fetchCategories() {
  const res: any = await listCategory({
    field: ['id', 'parent_id', 'title'],
    type: [1], // 筛选文章分类
  })
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
    await initSearchForm()
  } else {
    ElMessage.error(res.data.message)
  }
}

async function fetchList() {
  loading.value = true
  const res: any = await listArticle(search.value)
  if (res.status === 200) {
    const list: any[] = res.data.article || []
    list.map((item: any) => {
      item.title_html = genLinkHTML(item.title, `/article/${item.identifier}`)

      item.user_html = genLinkHTML(
        item.user.realname || item.user.username,
        `/user/${item.user_id}`)
      return item
    })
    articles.value = list
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
  router.push('/admin/article/set')
}

function editRow(row: any) {
  router.push(`/admin/article/set?id=${row.id}`)
}

function formSuccess() {
  formArticleVisible.value = false
  formArticlesCategoryVisible.value = false
  fetchList()
}

function batchDelete() {
  ElMessageBox.confirm(
    `您确定要删除选中的【${selectedRow.value.length}篇】文章吗？删除之后将会在回收站！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const ids = selectedRow.value.map((item) => item.id)
      const res: any = await deleteArticle({ id: ids })
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
  ElMessageBox.confirm(
    `您确定要删除文章【${row.title}】吗？删除之后不可恢复！`,
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await deleteArticle({ id: row.id })
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
      label: '状态',
      name: 'status',
      multiple: true,
      placeholder: '请选择状态',
      options: articleStatusOptions,
    },
    {
      type: 'cascader',
      label: '分类',
      name: 'category_id',
      placeholder: '请选择分类',
      trees: trees.value,
    },
  ]
}

function initTableListFields() {
  const statusEnum: Record<string, any> = {}
  articleStatusOptions.forEach((item) => {
    statusEnum[item.value] = item
  })
  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    {
      prop: 'title_html',
      label: '标题',
      minWidth: 150,
      fixed: 'left',
      type: 'html',
    },
    {
      prop: 'user_html',
      label: '作者',
      minWidth: 100,
      type: 'html',
    },
    { prop: 'identifier', label: '标识', width: 200 },
    { prop: 'view_count', label: '阅读', width: 80, type: 'number' },
    { prop: 'favorite_count', label: '收藏', width: 80, type: 'number' },
    { prop: 'comment_count', label: '评论', width: 80, type: 'number' },
    {
      prop: 'category',
      label: '分类',
      minWidth: 180,
      type: 'category',
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      type: 'enum',
      enum: statusEnum,
    },
    {
      prop: 'recommend_at',
      label: '推荐时间',
      width: 170,
      type: 'datetime',
    },
    { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
    { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
  ]
}

function batchUpdateArticlesCategory() {
  categoryArticles.value = selectedRow.value
  formArticlesCategoryVisible.value = true
}

initTableListFields()

watch(
  () => route.query,
  async () => {
    search.value = {
      ...search.value,
      ...route.query,
      ...parseQueryIntArray(route.query, ['status', 'category_id']),
      page: parseInt(route.query.page as string) || 1,
      size: parseInt(route.query.size as string) || 10,
    }
    // 需要先加载分类数据
    if (trees.value.length === 0) {
      await fetchCategories()
    }
    fetchList()
  },
  { immediate: true }
)
</script>
<style lang="scss">
.page-admin-article {
  .el-drawer__body {
    padding: 0 20px;
  }
}
</style>