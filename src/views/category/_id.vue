<template>
  <div class="page page-category">
    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'list_nav_bottom'"
        :key="item.position + item.id"
        v-safe-html="item.content"
      ></div>
    </template>

    <el-card shadow="never" class="breadcrumb-card">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <router-link to="/"><i class="fa fa-home"></i> 首页</router-link>
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          <router-link to="/category">全部文档</router-link>
        </el-breadcrumb-item>
        <el-breadcrumb-item
          v-for="item in breadcrumbs"
          :key="'bread1-' + item.id"
        >
          <el-dropdown v-if="item.siblings.length > 0">
            <span class="el-dropdown-link">
              {{ item.title }}<el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu class="breadcrumb-dropdown">
                <el-dropdown-item
                  v-for="ss in item.siblings.filter((x) => !x.type)"
                  :key="'s1-' + ss.id"
                >
                  <router-link
                    class="el-link el-link--default block"
                    :class="{
                      'el-link--primary': ss.id === item.id,
                    }"
                    :to="`/category/${ss.id}`"
                    >{{ ss.title }}</router-link
                  ></el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span v-else>{{ item.title }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
      <div
        v-if="
          breadcrumbs.length > 0 &&
          breadcrumbs[breadcrumbs.length - 1].show_description &&
          breadcrumbs[breadcrumbs.length - 1].description
        "
        class="category-description mgt-20px"
      >
        {{ breadcrumbs[breadcrumbs.length - 1].description }}
      </div>
    </el-card>

    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'list_document_top'"
        :key="item.position + item.id"
        v-safe-html="item.content"
      ></div>
    </template>

    <div class="category-layout mgt-20px">
      <aside class="filter-sidebar">
        <div class="filter-sidebar-inner">
          <el-card shadow="never" class="filter-card">
            <template #header>
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Operation /></el-icon>
                  筛选条件
                </span>
              </div>
            </template>

            <div v-if="categoryChildren.length > 0" class="filter-group">
              <div class="filter-group-title">
                <el-icon><FolderOpened /></el-icon>
                分类
              </div>
              <div class="filter-links">
                <el-popover
                  v-for="child in categoryChildren"
                  :key="'tree-pop-' + child.id"
                  placement="top-start"
                  :title="child.title"
                  width="200"
                  trigger="hover"
                  :disabled="!child.description"
                  :content="child.description"
                >
                  <template #reference>
                    <router-link
                      :to="`/category/${child.id}`"
                      :title="child.title"
                      class="filter-link"
                      >{{ child.title }}</router-link
                    >
                  </template>
                </el-popover>
              </div>
            </div>

            <div class="filter-group">
              <div class="filter-group-title">
                <el-icon><Document /></el-icon>
                类型
              </div>
              <div class="filter-links">
                <router-link
                  v-for="item in exts"
                  :key="item.value"
                  :to="buildFilterLink('ext', item.value)"
                  class="filter-link"
                  :class="{
                    active:
                      item.value === (route.query.ext || '') ||
                      (!item.value && !route.query.ext),
                  }"
                  >{{ item.label }}</router-link
                >
              </div>
            </div>

            <div class="filter-group">
              <div class="filter-group-title">
                <el-icon><Wallet /></el-icon>
                费用
              </div>
              <div class="filter-links">
                <router-link
                  v-for="item in feeTypeOptions"
                  :key="item.value"
                  :to="buildFilterLink('fee_type', item.value)"
                  class="filter-link"
                  :class="{
                    active:
                      item.value === (route.query.fee_type || '') ||
                      (!item.value && !route.query.fee_type),
                  }"
                  >{{ item.label }}</router-link
                >
              </div>
            </div>

            <div
              v-if="(settings.language || []).length > 0"
              class="filter-group"
            >
              <div class="filter-group-title">
                <el-icon><CollectionTag /></el-icon>
                语言
              </div>
              <div class="filter-links">
                <router-link
                  :to="buildFilterLink('language', '')"
                  class="filter-link"
                  :class="{
                    active: !route.query.language,
                  }"
                  >不限</router-link
                >
                <router-link
                  v-for="item in settings.language"
                  :key="item.code"
                  :to="buildFilterLink('language', item.code)"
                  class="filter-link"
                  :class="{
                    active:
                      item.code === route.query.language ||
                      (!item.code && !route.query.language),
                  }"
                  >{{ item.language }}</router-link
                >
              </div>
            </div>
          </el-card>
        </div>
      </aside>

      <section class="doc-panel">
        <el-card shadow="never" class="doc-list">
          <template #header>
            <div class="doc-list-header">
              <div class="doc-list-toolbar">
                <div class="panel-title">
                  <el-icon><Sort /></el-icon>
                  排序方式
                </div>
                <div class="doc-total">
                  共 <span>{{ total }}</span> 个文档
                </div>
              </div>
              <el-tabs
                v-model="query.sort"
                class="sort-tabs"
                @tab-click="sortClick"
              >
                <el-tab-pane name="default">
                  <template #label
                    ><el-icon><CoffeeCup /></el-icon> 综合</template
                  >
                </el-tab-pane>
                <el-tab-pane name="latest">
                  <template #label
                    ><el-icon><Calendar /></el-icon> 最新</template
                  >
                </el-tab-pane>
                <el-tab-pane name="view">
                  <template #label><el-icon><View /></el-icon> 浏览</template>
                </el-tab-pane>
                <el-tab-pane name="recommend">
                  <template #label><el-icon><Aim /></el-icon> 推荐</template>
                </el-tab-pane>
                <el-tab-pane name="favorite">
                  <template #label><el-icon><Star /></el-icon> 收藏</template>
                </el-tab-pane>
                <el-tab-pane name="download">
                  <template #label
                    ><el-icon><Download /></el-icon> 下载</template
                  >
                </el-tab-pane>
                <el-tab-pane name="pages">
                  <template #label><el-icon><Files /></el-icon> 页数</template>
                </el-tab-pane>
              </el-tabs>
            </div>
          </template>
          <div class="doc-list-data">
            <document-list-skeleton v-if="loading"></document-list-skeleton>
            <document-list
              v-else-if="documents.length > 0"
              :documents="documents"
            />
            <div v-if="empty && documents.length === 0" class="no-data">
              <el-empty description="暂无数据"></el-empty>
            </div>
          </div>
          <el-pagination
            v-if="total > 0"
            :current-page="query.page"
            :page-size="size"
            :layout="
              isMobile
                ? 'total, prev, pager, next'
                : 'total, prev, pager, next, jumper'
            "
            :pager-count="isMobile ? 5 : 7"
            :small="isMobile"
            :total="total"
            @current-change="pageChange"
          >
          </el-pagination>
        </el-card>
      </section>
    </div>

    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'list_document_bottom'"
        :key="item.position + item.id"
        v-safe-html="item.content"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listDocument } from '@/api/document'
import { getIcon } from '@/utils/utils'
import { createLatestGuard } from '@/utils/latest'
import { advertisementPositions } from '@/utils/enum'
import { getAdvertisementByPosition } from '@/api/advertisement'
import { useSettingStore } from '@/store/setting'
import { useCategoryStore } from '@/store/category'

const route = useRoute()
const router = useRouter()
const settingStore = useSettingStore()
const categoryStore = useCategoryStore()

const settings = computed(() => settingStore.settings)
const categories = computed(() => categoryStore.categories || [])
const categoryMap = computed(() => categoryStore.categoryMap || {})

const advertisements = ref<any[]>([])

const query = ref<any>({
  id: 0,
  sort: 'default',
  page: 1,
})
const size = 10
const breadcrumbs = ref<any[]>([])
const categoryChildren = ref<any[]>([])
const documents = ref<any[]>([])
const categoryId = ref(parseInt(route.params.id as string) || 0)
const total = ref(0)
const loading = ref(false)
const empty = ref(false)
const title = ref('')
const exts = [
  { label: '不限', value: '' },
  { label: 'PDF', value: 'pdf' },
  { label: 'DOC', value: 'doc' },
  { label: 'PPT', value: 'ppt' },
  { label: 'XLS', value: 'xls' },
  { label: 'TXT', value: 'txt' },
  { label: '其它', value: 'other' },
]
const feeTypeOptions = [
  { label: '不限', value: '' },
  { label: '免费', value: 'free' },
  { label: '付费', value: 'charge' },
]

async function getAdvertisements(page: string) {
  const positions: string[] = []
  ;(advertisementPositions || []).forEach((item: any) => {
    if (item.value === page) {
      ;(item.children || []).forEach((child: any) => {
        positions.push(child.value)
      })
    }
  })
  const res: any = await getAdvertisementByPosition({ position: positions })
  if (res.status === 200) {
    advertisements.value = res.data.advertisement || []
  }
}

function refreshCategoryContext() {
  const crumbs: any[] = []
  let category: any = { siblings: [], ...categoryMap.value[categoryId.value] }

  if (category.id) {
    category.siblings = filterCategorySiblings(category)
    crumbs.push(category)

    while (category.parent_id) {
      category = { siblings: [], ...categoryMap.value[category.parent_id] }
      if (category.id) {
        category.siblings = filterCategorySiblings(category)
        crumbs.splice(0, 0, category)
      }
    }
  }

  title.value =
    crumbs.map((item) => item.title).join(' · ') || '全部文档'

  let children: any[] = []
  if (crumbs.length > 0) {
    children = categories.value.filter((item: any) => {
      if (
        settings.value.display &&
        settings.value.display.hide_category_without_document
      ) {
        return (
          item.parent_id === crumbs[crumbs.length - 1].id &&
          item.doc_count > 0 &&
          !item.type
        )
      }
      return item.parent_id === crumbs[crumbs.length - 1].id && !item.type
    })
  }

  if (
    children.length === 0 &&
    (!route.params.id || route.params.id === '0')
  ) {
    children = categories.value.filter((item: any) => {
      if (
        settings.value.display &&
        settings.value.display.hide_category_without_document
      ) {
        return item.doc_count > 0 && !item.type && !item.parent_id
      }
      return !item.type && !item.parent_id
    })
  }

  breadcrumbs.value = crumbs
  categoryChildren.value = children
}

function filterCategorySiblings(category: any) {
  try {
    return categories.value.filter((item: any) => {
      if (
        settings.value.display &&
        settings.value.display.hide_category_without_document
      ) {
        return item.parent_id === category.parent_id && item.doc_count > 0
      }
      return item.parent_id === category.parent_id
    })
  } catch (error) {}
  return []
}

function setQuery() {
  categoryId.value = parseInt(route.params.id as string) || 0
  query.value.id = categoryId.value
  query.value.sort = route.query.sort || 'default'
  query.value.page = parseInt(route.query.page as string) || 1
}

function buildFilterLink(field: string, value: string) {
  const queryData: any = {
    ...route.query,
    [field]: value,
    page: 1,
  }

  if (!queryData[field]) {
    delete queryData[field]
  }

  return {
    path: route.path,
    query: queryData,
  }
}

function sortClick(tab: any) {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      sort: tab.name,
      page: 1,
    },
  })
}

function pageChange(page: number) {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      sort: query.value.sort,
      page,
    },
  })
}

// 切换分类/排序/分页快速切换时丢弃过期响应
const documentGuard = createLatestGuard()

async function loadData() {
  const token = documentGuard.start()
  loading.value = true
  empty.value = false

  let order = 'id desc'
  let status: number[] = []

  switch (query.value.sort) {
    case 'latest':
      order = 'id desc'
      break
    case 'view':
      order = 'view_count desc'
      break
    case 'favorite':
      order = 'favorite_count desc'
      break
    case 'comment':
      order = 'comment_count desc'
      break
    case 'pages':
      order = 'pages desc'
      break
    case 'recommend':
      order = 'recommend_at desc'
      break
    case 'download':
      order = 'download_count desc'
      break
    default:
      status = [2]
      break
  }

  const res: any = await listDocument({
    order,
    status,
    page: query.value.page,
    size,
    category_id: categoryId.value || undefined,
    ext: route.query.ext,
    field: [
      'id',
      'title',
      'keywords',
      'description',
      'view_count',
      'favorite_count',
      'comment_count',
      'created_at',
      'size',
      'price',
      'pages',
      'ext',
      'score',
      'recommend_at',
      'uuid',
    ],
    fee_type: route.query.fee_type,
    language: route.query.language,
  })
  if (!documentGuard.isLatest(token)) return

  if (res.status === 200) {
    total.value = res.data.total
    const docs = res.data.document || []
    documents.value = docs.map((item: any) => {
      item.icon = getIcon(item.ext)
      item.score = parseFloat(item.score) / 100 || 4.0
      return item
    })
  }

  loading.value = false
  if (query.value.page === 1 && documents.value.length === 0) {
    empty.value = true
  }
}

watch(
  () => [
    route.params.id,
    route.query.sort,
    route.query.page,
    route.query.ext,
    route.query.fee_type,
    route.query.language,
  ],
  async () => {
    setQuery()
    refreshCategoryContext()
    await loadData()
  }
)

onMounted(async () => {
  if (categories.value.length === 0) {
    await categoryStore.getCategories()
  }
  setQuery()
  refreshCategoryContext()
  await Promise.all([loadData(), getAdvertisements('list')])
})

onBeforeUnmount(() => {})
</script>

<style lang="scss">
.page-category {
  .el-breadcrumb__inner {
    cursor: pointer !important;

    a {
      font-weight: normal;
    }
  }

  .breadcrumb-card,
  .filter-card,
  .doc-list {
    // border: 1px solid #e7edf4;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: none;
    background: #fff;
  }

  .breadcrumb-card {
    .el-card__header {
      border-bottom: 1px solid #eef3f8;
      padding: 16px 20px;
    }

    .el-card__body {
      padding: 18px 20px;
    }
  }

  .category-layout {
    display: flex;
    align-items: flex-start;
    gap: 20px;
  }

  .filter-sidebar {
    width: 300px;
    flex: 0 0 300px;
  }

  .filter-sidebar-inner {
    position: sticky;
    top: 80px;
  }

  .doc-panel {
    flex: 1;
    min-width: 0;
  }

  .panel-header,
  .doc-list-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .panel-header {
    padding-bottom: 0;
    border: 0;
  }

  .panel-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #5a6b7b;

    .el-icon {
      color: #409eff;
      font-size: 14px;
    }
  }

  .filter-card {
    .el-card__header {
      padding: 16px 18px;
      border-bottom: 1px solid #eef3f8;
      background: linear-gradient(180deg, #f9fbfe 0%, #f5f8fc 100%);
    }

    .el-card__body {
      padding: 18px;
    }
  }

  .filter-group {
    & + .filter-group {
      margin-top: 22px;
      padding-top: 22px;
      border-top: 1px dashed #e6edf5;
    }
  }

  .filter-group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    color: #607080;
    font-size: 14px;
    font-weight: 600;

    .el-icon {
      color: #8fb3d9;
      font-size: 13px;
    }
  }

  .filter-links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .filter-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 46px;
    padding: 0 12px;
    height: 30px;
    border-radius: 15px;
    border: 1px solid transparent;
    background: #f2f5f9;
    color: #6f7f90;
    font-size: 13px;
    line-height: 1;
    transition: all 0.2s ease;
    text-decoration: none;

    &:hover {
      color: #409eff;
      border-color: #cfe3fb;
      background: #f4f9ff;
    }

    &.active {
      background: #409eff;
      border-color: #409eff;
      color: #fff;
      box-shadow: 0 8px 16px rgba(64, 158, 255, 0.22);
    }
  }

  .category-description {
    border: 1px dashed #d8e4f2;
    background: #f9fbfe;
    margin: 0;
    padding: 14px 16px;
    border-radius: 10px;
    font-size: 14px;
    color: #7d8ea0;
    line-height: 1.8;
  }

  .doc-list {
    .el-card__header {
      padding: 18px 22px 14px;
      border-bottom: 1px solid #eef3f8;
    }

    .el-card__body {
      padding: 0 22px 22px;
    }
  }

  .doc-list-header {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .doc-total {
    color: #7f8c9b;
    font-size: 13px;

    span {
      color: #409eff;
      font-weight: 600;
    }
  }

  .sort-tabs {
    .el-tabs__header {
      margin: 0;
    }

    .el-tabs__nav-wrap {
      &::after {
        display: none;
      }
    }

    .el-tabs__active-bar {
      display: none;
    }

    .el-tabs__nav {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .el-tabs__item {
      height: 34px;
      line-height: 34px;
      padding: 0 14px !important;
      border-radius: 17px;
      color: #6f7f90;
      background: #f2f5f9;
      transition: all 0.2s ease;

      &:hover {
        color: #409eff;
      }

      &.is-active {
        color: #fff;
        background: #409eff;
        box-shadow: 0 8px 16px rgba(64, 158, 255, 0.22);
      }
    }
  }

  .doc-list-data {
    min-height: 320px;
    padding-top: 22px;

    .no-data {
      text-align: center;
      font-size: 14px;
      color: #aaa;
      padding: 40px 0 20px;
    }
  }
}

@media screen and (max-width: $mobile-width) {
  .page-category {
    .category-layout {
      flex-direction: column;
      gap: 16px;
    }

    .filter-sidebar,
    .doc-panel {
      width: 100%;
      flex: none;
    }

    .filter-sidebar-inner {
      position: static;
    }

    .breadcrumb-card {
      .el-card__header,
      .el-card__body {
        padding-left: 14px;
        padding-right: 14px;
      }
    }

    .filter-card,
    .doc-list {
      border-radius: 10px;
    }

    .filter-card {
      .el-card__header,
      .el-card__body {
        padding-left: 14px;
        padding-right: 14px;
      }
    }

    .doc-list {
      .el-card__header {
        padding: 14px 14px 12px;
      }

      .el-card__body {
        padding: 0 14px 16px;
      }
    }

    .doc-list-toolbar {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    .sort-tabs {
      .el-tabs__item {
        height: 32px;
        line-height: 32px;
        padding: 0 12px;
      }
    }
  }
}
</style>

<style scoped lang="scss">
.page-category {
  :deep(.com-document-list) {
    li {
      margin-bottom: 22px;
      padding-bottom: 22px;
      border-bottom: 1px solid #eef2f7;
    }

    h3 a {
      font-size: 19px;
      font-weight: 600;
      color: #2f3a45;
    }

    .doc-cover {
      .el-image {
        border: 1px solid #e8edf4;
        border-radius: 8px;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5);
      }
    }

    .doc-info {
      margin: 10px 0 10px;
      color: #8b98a7;
    }

    .doc-desc {
      color: #667587;
      line-height: 1.85;
    }
  }
}

@media screen and (max-width: $mobile-width) {
  .page-category {
    :deep(.com-document-list) {
      .doc-cover {
        width: 25%;
        padding-right: 5px !important;

        .el-image {
          border: 1px solid #efefef;
        }
      }

      .el-col-20 {
        width: 75%;
      }

      .doc-desc {
        width: 100%;
        font-size: 14px;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        height: 48px;
        line-height: 160%;
        padding-top: 8px;
      }

      .doc-info {
        font-size: 12px;

        .el-rate {
          float: right;
        }

        .float-right {
          float: left;
        }
      }
    }
  }
}
</style>