<template>
  <div class="com-user-article">
    <div class="article-filter-panel">
      <el-form
        :model="query"
        class="article-filter-form"
        @submit.prevent
      >
        <div class="article-filter-form__main">
          <el-form-item class="article-filter-form__keyword">
            <el-input
              v-model="query.wd"
              placeholder="搜索文章标题..."
              clearable
              size="default"
              :prefix-icon="Search"
              @keydown.enter="onSearch"
            ></el-input>
          </el-form-item>
          <div class="article-filter-form__actions">
            <el-button
              type="primary"
              size="default"
              icon="Search"
              :loading="loading"
              @click="onSearch"
            >
              搜索
            </el-button>
          </div>
        </div>
        <div v-show="showAdvancedFilters" class="article-filter-form__advanced">
          <el-form-item>
            <el-date-picker
              v-model="query.created_at"
              type="datetimerange"
              :picker-options="datetimePickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
              size="default"
              value-format="yyyy-MM-dd HH:mm:ss"
            >
            </el-date-picker>
          </el-form-item>
        </div>
        <button
          type="button"
          class="article-filter-toggle"
          @click="toggleAdvancedFilters"
        >
          <el-icon v-if="showAdvancedFilters"><ArrowUp /></el-icon>
          <el-icon v-else><ArrowDown /></el-icon>
          <span>{{ showAdvancedFilters ? '收起筛选' : '展开筛选' }}</span>
        </button>
      </el-form>
    </div>

    <div class="article-summary">
      <el-icon><Tickets /></el-icon>
      <span
        >共 <strong>{{ total }}</strong> 篇文章</span
      >
    </div>

    <div
      class="article-list"
      :class="{ 'without-actions': !canManageArticles }"
    >
      <div class="article-list__body">
        <el-table
          v-loading="loading"
          :data="articles"
          row-key="id"
          class="article-table"
          empty-text=""
        >
          <el-table-column
            min-width="360"
            label="文章"
            class-name="article-column--info"
          >
            <template #default="scope">
              <div class="article-cell article-cell--info">
                <el-tooltip :content="scope.row.title" placement="top-start">
                  <router-link
                    target="_blank"
                    :to="`/article/${scope.row.identifier || scope.row.id}`"
                    class="article-row__title"
                  >
                    {{ scope.row.title }}
                  </router-link>
                </el-tooltip>
                <div class="article-row__meta">
                  <span>
                    <el-icon><Clock /></el-icon>
                    {{ formatRelativeTime(scope.row.created_at) }}
                  </span>
                  <span>{{ formatDatetime(scope.row.created_at) }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            min-width="140"
            label="统计信息"
            class-name="article-column--stats"
          >
            <template #default="scope">
              <div class="article-cell article-cell--stats">
                <div class="article-row__stat-line">
                  <span
                    ><el-icon><View /></el-icon>
                    {{ scope.row.view_count || 0 }}</span
                  >
                  <span
                    ><el-icon><ChatDotRound /></el-icon>
                    {{ scope.row.comment_count || 0 }}</span
                  >
                  <span
                    ><el-icon><Star /></el-icon>
                    {{ scope.row.favorite_count || 0 }}</span
                  >
                </div>
                <el-tag
                  v-if="showPrivateData"
                  :type="filterStatus(scope.row.status).type"
                  size="small"
                  effect="plain"
                >
                  {{ filterStatus(scope.row.status).label }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="canManageArticles"
            width="92"
            class-name="article-column--actions"
            label="操作"
          >
            <template #default="scope">
              <div class="article-cell article-cell--actions">
                <el-button
                  link
                  icon="EditPen"
                  size="small"
                  @click="updateArticle(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  icon="Delete"
                  class="is-danger"
                  size="small"
                  @click="deleteArticle(scope.row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="暂无文章"></el-empty>
          </template>
        </el-table>
      </div>
    </div>

    <el-pagination
      v-if="total > 0"
      :current-page="query.page"
      :page-size="query.size"
      :layout="
        isMobile
          ? 'total, prev, pager, next'
          : 'total, prev, pager, next, jumper'
      "
      :pager-count="isMobile ? 5 : 7"
      :small="isMobile"
      :total="total"
      class="mgt-20px"
      @current-change="pageChange"
    >
    </el-pagination>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Tickets,
  Clock,
  View,
  ChatDotRound,
  Star,
  ArrowUp,
  ArrowDown,
} from '@element-plus/icons-vue'
import { listArticle, searchArticle, deleteArticle } from '@/api/article'
import { formatDatetime, formatRelativeTime } from '@/utils/utils'
import { createLatestGuard } from '@/utils/latest'
import { datetimePickerOptions, articleStatusOptions } from '@/utils/enum'
import { useUserStore } from '@/store/user'

defineOptions({ name: 'UserArticle' })
const props = defineProps({
  userId: {
    type: Number,
    required: true,
  },
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)
const permissions = computed(() => userStore.permissions)

const articleStatusOptionsMap: Record<number, any> = {}
articleStatusOptions.forEach((item: any) => {
  articleStatusOptionsMap[item.value] = item
})

const articles = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const showAdvancedFilters = ref(false)
const query = ref<Record<string, any>>({
  page: parseInt(route.query.page as string) || 1,
  size: 10,
  wd: route.query.wd || '',
  created_at: [],
})

const canManageArticles = computed(() => props.userId === user.value.id)
const showPrivateData = computed(
  () => props.userId === user.value.id || permissions.value.length > 0,
)

watch(
  () => route.query,
  () => {
    query.value = {
      wd: route.query.wd || '',
      page: parseInt(route.query.page as string) || 1,
      size: parseInt(route.query.size as string) || 10,
      created_at: Array.isArray(route.query.created_at)
        ? route.query.created_at
        : [],
    }
    getArticles()
  },
  { immediate: true },
)

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

const buildQuery = () => {
  const q: Record<string, any> = {
    page: query.value.page,
    size: query.value.size,
  }

  if (query.value.wd) {
    q.wd = query.value.wd
  }

  if (
    Array.isArray(query.value.created_at) &&
    query.value.created_at.length === 2
  ) {
    q.created_at = query.value.created_at
  }

  return q
}

const updateArticle = (row: any) => {
  router.push({
    path: '/post',
    query: { identifier: row.identifier },
  })
}

const onSearch = () => {
  query.value.page = 1
  router.push({
    path: route.path,
    query: buildQuery(),
  })
}

// 翻页/筛选快速切换时丢弃过期响应（原来用 loading 互斥，会直接丢掉最新一次请求）
const articleGuard = createLatestGuard()

async function getArticles() {
  if (props.userId === 0) return
  const token = articleGuard.start()
  loading.value = true
  let res: any
  if (query.value.wd) {
    res = await searchArticle({
      ...query.value,
      user_id: props.userId,
    })
  } else {
    res = await listArticle({
      ...query.value,
      user_id: props.userId,
    })
  }

  if (!articleGuard.isLatest(token)) return
  if (res.status === 200) {
    articles.value = res.data.article || []
    total.value = res.data.total || 0
  }
  loading.value = false
}

const pageChange = (page: number) => {
  router.push({
    query: { ...buildQuery(), page },
  })
}

const deleteArticleRow = (row: any) => {
  ElMessageBox.confirm(`您确定要删除文章《${row.title}》吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const res: any = await deleteArticle({ id: row.id })
    if (res.status === 200) {
      ElMessage({
        type: 'success',
        message: '删除成功!',
      })
      getArticles()
    }
  })
}

const filterStatus = (status: any) => {
  return (
    articleStatusOptionsMap[status || 0] || {
      value: status,
      label: '待审核',
      type: 'info',
    }
  )
}
</script>
