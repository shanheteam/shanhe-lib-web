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

<style lang="scss">
.com-user-article {
  .article-filter-panel {
    padding: 20px 24px 14px;
    border: 1px solid #edf1f7;
    border-radius: 16px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%);
  }

  .article-filter-form__main {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .article-filter-form__keyword {
    flex: 1;
    margin-bottom: 0;

    .el-input__inner {
      height: 48px;
      border-radius: 12px;
      border-color: #edf1f7;
    }
  }

  .article-filter-form__actions {
    display: flex;
    gap: 12px;

    .el-button {
      min-width: 88px;
      height: 48px;
      border-radius: 10px;
      padding: 0 22px;
    }
  }

  .article-filter-form__advanced {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed #edf1f7;

    .el-form-item {
      margin-bottom: 0;
    }

    .el-date-editor {
      max-width: 360px;
    }
  }

  .article-filter-toggle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 14px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #409eff;
    font-size: 13px;
    cursor: pointer;
  }

  .article-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 24px 0 14px;
    color: #6b7280;
    font-size: 15px;

    .el-icon {
      color: #409eff;
    }

    strong {
      color: #409eff;
      font-size: 24px;
      font-weight: 700;
    }
  }

  .article-list__head {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(180px, 260px) 92px;
    column-gap: 18px;
    align-items: center;
  }

  .article-list.without-actions {
    .article-list__head,
    .article-row {
      grid-template-columns: minmax(0, 1.9fr) minmax(180px, 280px);
    }
  }

  .article-list__head {
    padding: 16px 22px;
    background-color: #f6f8fb;
    color: #4b5563;
    font-size: 14px;
    font-weight: 600;
  }

  .article-list__body {
    min-height: 120px;
  }

  .article-table {
    width: 100%;

    &::before {
      display: none;
    }

    .el-table__body-wrapper {
      overflow-x: hidden;
    }

    td {
      padding: 0;
      border-bottom: 1px solid #f1f4f8;
      vertical-align: top;
    }

    .cell {
      padding: 0;
    }

    tr:last-child td {
      border-bottom: 0;
    }
  }

  .article-cell {
    padding: 22px 0;
    padding-left: 10px;
  }

  .article-cell--info {
    padding-right: 18px;
  }

  .article-row__title {
    display: block;
    color: #1f2937;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.45;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      color: #409eff;
    }
  }

  .article-row__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 14px;
    margin-top: 10px;
    color: #8b95a7;
    font-size: 13px;

    span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }

  .article-cell--stats {
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: #6b7280;
    font-size: 14px;
    padding-right: 18px;
  }

  .article-row__stat-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;

    span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }

  .article-cell--actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding-right: 22px;

    .el-button {
      margin-left: 0;
      padding: 0;
      color: #409eff;
    }

    .el-button.is-danger {
      color: #f56c6c;
    }
  }

  .el-pagination {
    margin-top: 20px;
    text-align: right;
  }

  .article-column--stats {
    .el-tag {
      width: 72px;
      text-align: center;
    }
  }
}

@media screen and (max-width: 1200px) {
  .com-user-article {
    .article-list__head {
      grid-template-columns: minmax(0, 1fr) 180px 78px;
    }

    .article-list.without-actions {
      .article-list__head {
        grid-template-columns: minmax(0, 1fr) 180px;
      }
    }

    .article-table {
      .article-column--stats {
        width: 180px;
      }

      .article-column--actions {
        width: 78px;
      }
    }
  }
}

@media screen and (max-width: $mobile-width) {
  .com-user-article {
    .article-filter-panel {
      padding: 16px;
      border-radius: 14px;
    }

    .article-filter-form__main {
      flex-direction: column;
      align-items: stretch;
    }

    .article-filter-form__actions {
      width: 100%;

      .el-button {
        flex: 1;
      }
    }

    .article-filter-form__advanced {
      .el-date-editor {
        width: 100%;
        max-width: none;
      }
    }

    .article-summary {
      margin-top: 18px;

      strong {
        font-size: 20px;
      }
    }

    .article-list {
      border-radius: 14px;
    }

    .article-list__head {
      display: none;
    }

    .article-table {
      .el-table__body,
      .el-table__body tbody,
      .el-table__body tr,
      .el-table__body td {
        display: block;
        width: 100% !important;
      }

      .el-table__body-wrapper {
        overflow-x: visible;
      }

      .el-table__row {
        padding: 18px 16px;
        border-top: 1px solid #f1f4f8;
      }

      .el-table__row:first-child {
        border-top: 0;
      }

      td {
        border-bottom: 0;
      }

      .cell {
        overflow: visible;
      }
    }

    .article-cell {
      padding: 0;
    }

    .article-row__title {
      font-size: 16px;
      white-space: normal;
      line-clamp: 2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .article-cell--stats {
      padding-top: 14px;
      padding-right: 0;
    }

    .article-cell--actions {
      flex-direction: row;
      gap: 14px;
      padding-top: 14px;
      padding-right: 0;
    }

    .el-pagination {
      text-align: center;
    }
  }
}
</style>