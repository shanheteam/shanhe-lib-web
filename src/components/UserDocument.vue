<template>
  <div class="com-user-document">
    <div class="document-filter-panel">
      <el-form
        :model="query"
        class="document-filter-form"
        @submit.prevent
      >
        <div class="document-filter-form__main">
          <el-form-item class="document-filter-form__keyword">
            <el-input
              v-model="query.wd"
              placeholder="搜索文档标题..."
              clearable
              size="medium"
              :prefix-icon="Search"
              @keydown.enter="onSearch"
            ></el-input>
          </el-form-item>
          <div class="document-filter-form__actions">
            <el-button
              type="primary"
              size="medium"
              icon="Search"
              :loading="loading"
              @click="onSearch"
            >
              搜索
            </el-button>
          </div>
        </div>
        <div
          v-show="showAdvancedFilters"
          class="document-filter-form__advanced"
        >
          <el-form-item>
            <el-date-picker
              v-model="query.created_at"
              type="datetimerange"
              :picker-options="datetimePickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
              size="medium"
              value-format="yyyy-MM-dd HH:mm:ss"
            >
            </el-date-picker>
          </el-form-item>
        </div>
        <button
          type="button"
          class="document-filter-toggle"
          @click="toggleAdvancedFilters"
        >
          <el-icon v-if="showAdvancedFilters"><ArrowUp /></el-icon>
          <el-icon v-else><ArrowDown /></el-icon>
          <span>{{ showAdvancedFilters ? '收起筛选' : '展开筛选' }}</span>
        </button>
      </el-form>
    </div>

    <div class="document-summary">
      <el-icon><Document /></el-icon>
      <span
        >共 <strong>{{ total }}</strong> 个文档</span
      >
    </div>

    <div
      class="document-list"
      :class="{ 'without-actions': !canManageDocuments }"
    >
      <el-table
        v-loading="loading"
        :data="docs"
        row-key="id"
        class="document-table"
      >
        <el-table-column
          :min-width="360"
          class-name="document-column--info"
          label="文档"
        >
          <template #default="scope">
            <div class="document-cell document-cell--info">
              <router-link
                target="_blank"
                :to="`/document/${scope.row.uuid || scope.row.id}`"
                class="document-row__cover"
              >
                <document-cover :width="88" :document="scope.row" />
              </router-link>
              <div class="document-row__content">
                <el-tooltip :content="scope.row.title" placement="top-start">
                  <router-link
                    target="_blank"
                    :to="`/document/${scope.row.uuid || scope.row.id}`"
                    class="document-row__title"
                  >
                    {{ scope.row.title }}
                  </router-link>
                </el-tooltip>
                <div class="document-row__meta">
                  <span>
                    <el-icon><Clock /></el-icon>
                    {{ formatRelativeTime(scope.row.created_at) }}
                  </span>
                  <span>{{ formatBytes(scope.row.size) }}</span>
                  <span>{{ scope.row.pages || '-' }} 页</span>
                  <el-tag
                    v-if="showPrivateData"
                    :type="filterStatus(scope.row.status).type"
                    size="mini"
                    effect="plain"
                  >
                    {{ filterStatus(scope.row.status).label }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          min-width="140"
          class-name="document-column--stats"
          label="统计数据"
        >
          <template #default="scope">
            <div class="document-cell document-cell--stats">
              <div class="document-row__stat-line">
                <span
                  v-if="
                    settings.display.show_document_view_count || showPrivateData
                  "
                  ><el-icon><View /></el-icon>
                  {{ scope.row.view_count || 0 }}</span
                >
                <span
                  v-if="
                    settings.display.show_document_download_count ||
                    showPrivateData
                  "
                  ><el-icon><Download /></el-icon>
                  {{ scope.row.download_count || 0 }}</span
                >
                <span
                  v-if="
                    settings.display.show_document_favorite_count ||
                    showPrivateData
                  "
                  ><el-icon><Star /></el-icon>
                  {{ scope.row.favorite_count || 0 }}</span
                >
              </div>
              <div class="document-row__rating">
                <el-rate :value="scope.row.score || 0.0" disabled></el-rate>
                <span class="document-row__rating-value">{{
                  formatScore(scope.row.score)
                }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="canManageDocuments"
          width="92"
          label="操作"
          class-name="document-column--actions"
        >
          <template #default="scope">
            <div class="document-cell document-cell--actions">
              <el-button
                type="text"
                icon="EditPen"
                :loading="updating"
                size="mini"
                @click="updateDocument(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                type="text"
                icon="Delete"
                class="is-danger"
                size="mini"
                @click="deleteDocument(scope.row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无文档"></el-empty>
        </template>
      </el-table>
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
    <el-drawer
      v-model="updateDocumentVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <template #header>
        <el-page-header
          content="编辑文档"
          @back="updateDocumentVisible = false"
        >
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormUpdateDocument
          :category-trees="categoryTrees"
          :init-document="document"
          :is-admin="false"
          @success="updateDocumentSuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Clock,
  View,
  Download,
  Star,
  ArrowUp,
  ArrowDown,
  Document,
} from '@element-plus/icons-vue'
import {
  deleteDocument,
  getDocument,
  listDocument,
  searchDocument,
} from '@/api/document'
import { formatBytes, formatRelativeTime, getIcon } from '@/utils/utils'
import { datetimePickerOptions, documentStatusOptions } from '@/utils/enum'
import { useUserStore } from '@/store/user'
import { useCategoryStore } from '@/store/category'
import { useSettingStore } from '@/store/setting'

defineOptions({ name: 'UserDocument' })
const props = defineProps({
  userId: {
    type: Number,
    required: true,
  },
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const categoryStore = useCategoryStore()
const settingStore = useSettingStore()
const user = computed(() => userStore.user)
const permissions = computed(() => userStore.permissions)
const categoryTrees = computed(() => categoryStore.categoryTrees)
const settings = computed(() => settingStore.settings)

const documentStatusOptionsMap: Record<number, any> = {}
documentStatusOptions.forEach((item: any) => {
  documentStatusOptionsMap[item.value] = item
})

const docs = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const updateDocumentVisible = ref(false)
const document = ref<Record<string, any>>({ id: 0 })
const updating = ref(false)
const showAdvancedFilters = ref(false)
const query = ref<Record<string, any>>({
  page: parseInt(route.query.page as string) || 1,
  size: 10,
  wd: route.query.wd || '',
  created_at: [],
})

const canManageDocuments = computed(() => props.userId === user.value.id)
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
    getDocuments()
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

const formatScore = (score: any) => {
  return Number(score || 0).toFixed(score ? 1 : 0)
}

const updateDocument = async (row: any) => {
  updating.value = true
  await getDocumentInfo(row.id)
  updating.value = false
  updateDocumentVisible.value = true
}

const getDocumentInfo = async (id: number) => {
  const res: any = await getDocument({ id, with_all_content: true })
  if (res.status === 200) {
    document.value = res.data || { id: 0 }
  }
}

const updateDocumentSuccess = () => {
  updateDocumentVisible.value = false
  getDocuments()
}

const onSearch = () => {
  query.value.page = 1
  router.push({
    path: route.path,
    query: buildQuery(),
  })
}

const getDocuments = async () => {
  if (props.userId === 0 || loading.value) return
  loading.value = true
  let res: any
  if (query.value.wd) {
    res = await searchDocument({
      ...query.value,
      user_id: props.userId,
    })
  } else {
    res = await listDocument({
      ...query.value,
      user_id: props.userId,
    })
  }

  if (res.status === 200) {
    const list = res.data.document || []
    list.map((item: any) => {
      item.score = item.score / 100 || 0.0
      try {
        item.icon = getIcon(item.ext)
      } catch (e) {
        item.icon = 'other'
      }
      return item
    })
    docs.value = list
    total.value = res.data.total || 0
  }
  loading.value = false
}

const pageChange = (page: number) => {
  router.push({
    query: { ...buildQuery(), page },
  })
}

const deleteDocumentRow = (row: any) => {
  ElMessageBox.confirm(`您确定要删除文档《${row.title}》吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const res: any = await deleteDocument({ id: row.id })
    if (res.status === 200) {
      ElMessage({
        type: 'success',
        message: '删除成功!',
      })
      getDocuments()
    }
  })
}

const filterStatus = (status: any) => {
  return (
    documentStatusOptionsMap[status] || {
      value: status,
      label: '未知',
      type: 'info',
    }
  )
}
</script>

<style lang="scss">
.com-user-document {
  .document-filter-panel {
    padding: 20px 24px 14px;
    border: 1px solid #edf1f7;
    border-radius: 16px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%);
  }

  .document-filter-form {
    position: relative;
  }

  .document-filter-form__main {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .document-filter-form__keyword {
    flex: 1;
    margin-bottom: 0;

    .el-input__inner {
      height: 48px;
      border-radius: 12px;
      border-color: #edf1f7;
      background-color: #fff;
    }
  }

  .document-filter-form__actions {
    display: flex;
    gap: 12px;

    .el-button {
      min-width: 88px;
      height: 48px;
      border-radius: 10px;
      padding: 0 22px;
    }
  }

  .document-filter-form__advanced {
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

  .document-filter-toggle {
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

  .document-summary {
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

  .document-list__head {
    display: grid;
    grid-template-columns: 36px minmax(0, 1.7fr) minmax(180px, 260px) 92px;
    column-gap: 18px;
    align-items: center;
  }

  .document-list.without-actions {
    .document-list__head,
    .document-row {
      grid-template-columns: 36px minmax(0, 1.9fr) minmax(180px, 280px);
    }
  }

  .document-list__head {
    padding: 16px 22px;
    background-color: #f6f8fb;
    color: #4b5563;
    font-size: 14px;
    font-weight: 600;
  }

  .document-list__body {
    min-height: 120px;
  }

  .document-table {
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

  .document-cell {
    padding: 16px 0 16px 10px;
  }

  .document-cell--select {
    display: flex;
    justify-content: center;
    padding-left: 12px;
  }

  .document-cell--info {
    display: flex;
    align-items: flex-start;
    min-width: 0;
    gap: 16px;
    padding-right: 18px;
  }

  .document-row__cover {
    width: 54px;
    min-width: 54px;
    height: 72px;
    border: 1px solid #edf1f7;
    border-radius: 8px;
    background: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
    }
  }

  .document-row__content {
    min-width: 0;
    padding-top: 4px;
  }

  .document-row__title {
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

  .document-row__meta {
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

  .document-cell--stats {
    color: #6b7280;
    font-size: 14px;
    padding-right: 18px;
  }

  .document-row__stat-line {
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

  .document-row__rating {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 12px;

    .el-rate {
      height: auto;
      line-height: 1;
    }

    .el-rate__icon {
      margin-right: 2px;
      font-size: 14px;
    }
  }

  .document-row__rating-value {
    color: #f59e0b;
    font-weight: 600;
  }

  .document-cell--actions {
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
}

@media screen and (max-width: 1200px) {
  .com-user-document {
    .document-list__head {
      grid-template-columns: 36px minmax(0, 1fr) 180px 78px;
    }

    .document-list.without-actions {
      .document-list__head {
        grid-template-columns: 36px minmax(0, 1fr) 180px;
      }
    }

    .document-table {
      .document-column--stats {
        width: 180px;
      }

      .document-column--actions {
        width: 78px;
      }
    }

    .document-row__title {
      font-size: 18px;
    }
  }
}

@media screen and (max-width: $mobile-width) {
  .com-user-document {
    .document-filter-panel {
      padding: 16px;
      border-radius: 14px;
    }

    .document-filter-form__main {
      flex-direction: column;
      align-items: stretch;
    }

    .document-filter-form__actions {
      width: 100%;

      .el-button {
        flex: 1;
      }
    }

    .document-filter-form__advanced {
      .el-date-editor {
        width: 100%;
        max-width: none;
      }
    }

    .document-summary {
      margin-top: 18px;

      strong {
        font-size: 20px;
      }
    }

    .document-list {
      border-radius: 14px;
    }

    .document-list__head {
      display: none;
    }

    .document-table {
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

    .document-column--select {
      display: none;
    }

    .document-cell {
      padding: 0;
    }

    .document-cell--info {
      gap: 12px;
      padding-right: 0;
    }

    .document-row__cover {
      width: 48px;
      min-width: 48px;
      height: 64px;
    }

    .document-row__title {
      font-size: 16px;
      white-space: normal;
      line-clamp: 2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .document-row__stats,
    .document-cell--actions {
      padding-left: 60px;
    }

    .document-cell--stats {
      padding-top: 14px;
      padding-right: 0;
      padding-left: 60px;
    }

    .document-cell--actions {
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