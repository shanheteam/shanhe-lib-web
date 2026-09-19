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
              size="default"
              :prefix-icon="Search"
              @keydown.enter="onSearch"
            ></el-input>
          </el-form-item>
          <div class="document-filter-form__actions">
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
              size="default"
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
                    size="small"
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
                <el-rate :model-value="scope.row.score || 0.0" disabled></el-rate>
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
                link
                icon="EditPen"
                :loading="updating"
                size="small"
                @click="updateDocument(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                link
                icon="Delete"
                class="is-danger"
                size="small"
                @click="deleteDocumentRow(scope.row)"
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
import { createLatestGuard } from '@/utils/latest'
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

// 翻页/筛选快速切换时丢弃过期响应（原来用 loading 互斥，会直接丢掉最新一次请求）
// 注意：必须声明在下方 immediate watch 之前，否则 setup 同步触发回调时会因 TDZ 报错
const documentGuard = createLatestGuard()

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

async function getDocuments() {
  if (props.userId === 0) return
  const token = documentGuard.start()
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

  if (!documentGuard.isLatest(token)) return
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
