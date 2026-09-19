<template>
  <div class="page page-search">
    <el-row class="header-links hidden-xs-only">
      <el-col :span="24">
        <router-link to="/" class="el-link el-link--default"
          ><i class="fa fa-home"></i> &nbsp;首页</router-link
        >
        <template v-for="item in navigations.filter((item) => item.enable)">
          <el-popover
            v-if="item.href === '/category'"
            :key="'/category' + item.id"
            width="520"
            trigger="hover"
            :disabled="categoryTrees.filter((x) => !x.type).length === 0"
          >
            <category-card :type="0"></category-card>
            <template #reference>
              <router-link
                class="el-link el-link--default"
                to="/category"
                >{{ item.title || '文库资料' }}</router-link
              >
            </template>
          </el-popover>
          <el-popover
            v-if="item.href === '/article'"
            :key="'/article' + item.id"
            width="520"
            trigger="hover"
            :disabled="categoryTrees.filter((x) => x.type === 1).length === 0"
          >
            <category-card :type="1"></category-card>
            <template #reference>
              <router-link class="el-link el-link--default" to="/article"
                >{{ item.title || '文章资讯' }}</router-link
              >
            </template>
          </el-popover>
        </template>
        <span class="float-right">
          <router-link to="/upload" class="el-link el-link--default"
            ><el-icon><Upload /></el-icon>&nbsp;上传文档</router-link
          >
          <router-link to="/post" class="el-link el-link--default"
            ><el-icon><Plus /></el-icon>&nbsp;发布文章</router-link
          >
          <router-link
            v-if="user.id > 0"
            :to="`/user/${user.id}`"
            class="el-link el-link--default"
            ><el-icon><User /></el-icon>&nbsp;会员中心</router-link
          >
          <router-link v-else class="el-link el-link--default" to="/login"
            ><el-icon><User /></el-icon>&nbsp;登录账户</router-link
          >
        </span>
      </el-col>
    </el-row>
    <div ref="searchBox" class="search-box">
      <el-row :gutter="20">
        <el-col :span="4" class="logo hidden-xs-only">
          <router-link to="/" :title="settings.system.sitename"
            ><img
              :src="settings.system.logo || '/static/images/logo.png'"
              style="max-width: 100%"
              :alt="settings.system.sitename"
          /></router-link>
        </el-col>
        <el-col :span="16" class="search-form">
          <div class="search-box-wrapper">
            <el-input
              v-model="query.wd"
              clearable
              class="search-input"
              size="large"
              :placeholder="searchPlaceholder"
              @keyup.enter="onSearch"
            >
              <template #prepend>
                <el-select
                  v-model="searchType"
                  class="search-type-select"
                  placeholder="请选择搜索类型"
                  @change="changeSearchType"
                >
                  <el-option
                    v-for="item in categoryTypeOptions"
                    :key="'st-' + item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </template>
              <template #append>
                <el-button
                  type="primary"
                  class="btn-search"
                  @click="onSearch"
                >
                  <el-icon><Search /></el-icon> 搜索
                </el-button>
              </template>
            </el-input>
          </div>
        </el-col>
      </el-row>
    </div>
    <el-row :gutter="20">
      <template v-for="item in advertisements">
        <el-col
          v-if="item.position == 'search_top'"
          :key="item.position + item.id"
          :span="24"
        >
          <div v-safe-html="item.content"></div>
        </el-col>
      </template>
      <!-- 左侧过滤条件 -->
      <el-col ref="searchLeft" :span="5" class="search-left hidden-xs-only">
        <!-- 文档分类 -->
        <div class="filter-section">
          <h4>
            <el-icon><FolderOpened /></el-icon>
            文档分类
          </h4>
          <div class="filter-options">
            <router-link
              v-for="item in [
                { id: 0, title: '全部分类' },
                ...categoryTrees.filter(
                  (item) =>
                    (!searchType && !item.type) ||
                    (searchType && item.type == searchType)
                ),
              ]"
              :key="'cate-' + item.id"
              class="el-link filter-option"
              :class="
                item.id == query.category_id
                  ? 'el-link--primary active'
                  : 'el-link--default'
              "
              :to="{
                query: {
                  ...route.query,
                  category_id: item.id,
                  page: 1,
                },
              }"
            >
              <span class="option-text">{{ item.title }}</span>
            </router-link>
          </div>
        </div>

        <!-- 文档语言 -->
        <div
          v-if="(settings.language || []).length > 0 && !searchType"
          class="filter-section"
        >
          <h4>
            <el-icon><Flag /></el-icon>
            文档语言
          </h4>
          <div class="filter-options">
            <router-link
              v-for="item in [
                { code: '', language: '全部语言' },
                ...(settings.language || []),
              ]"
              :key="'lang-' + item.code"
              class="el-link filter-option"
              :class="
                item.code == query.language
                  ? 'el-link--primary active'
                  : 'el-link--default'
              "
              :to="{
                query: {
                  ...route.query,
                  language: item.code,
                  page: 1,
                },
              }"
            >
              <span class="option-text">{{ item.language }}</span>
            </router-link>
          </div>
        </div>

        <!-- 文档格式 -->
        <div v-if="!searchType" class="filter-section">
          <h4>
            <el-icon><Document /></el-icon>
            文档格式
          </h4>
          <div class="filter-options">
            <router-link
              v-for="item in searchExts"
              :key="'se-' + item.value"
              class="el-link filter-option"
              :class="
                item.value == query.ext
                  ? 'el-link--primary active'
                  : 'el-link--default'
              "
              :to="{
                query: { ...route.query, ext: item.value, page: 1 },
              }"
            >
              <img
                v-if="item.value != 'all' && item.value != ''"
                :src="`/static/images/${item.value}_24.png`"
                :alt="`${item.label}文档`"
              />
              <span class="option-text">{{ item.label }}</span>
            </router-link>
          </div>
        </div>
        <!-- 清除筛选 -->
        <div v-if="hasActiveFilters()" class="filter-actions">
          <el-button
            link
            size="small"
            class="clear-filters-btn"
            @click="clearAllFilters"
          >
            <el-icon><RefreshLeft /></el-icon>
            清除所有筛选
          </el-button>
        </div>
      </el-col>

      <el-col ref="searchMain" :span="14" class="search-main">
        <el-card v-loading="loading" shadow="never">
          <template #header>
            <div class="header">
              <div class="search-tips hidden-xs-only">
                本次搜索耗时
                <span class="el-link el-link--danger">{{
                  spend || '0.000'
                }}</span>
                秒，为您找到相关结果约
                <span class="el-link el-link--danger">{{ total || 0 }}</span> 个.
              </div>
              <div class="search-filter">
                <!-- 移动端筛选（分类/语言/格式下拉已移除，请使用左侧栏筛选） -->
                <!-- 排序和时间范围 -->
                <el-dropdown class="hidden-xs-only" :show-timeout="showTimeout">
                  <el-button link :size="filterSize">
                    {{ filterSortName(query.sort)
                    }}<el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="item in searchSorts.filter(
                          (item) =>
                            !searchType ||
                            (searchType &&
                              item.value != 'pages' &&
                              item.value != 'size')
                        )"
                        :key="'ss-' + item.value"
                      >
                        <router-link
                          class="el-link el-link--default"
                          :class="
                            item.value == query.sort ? 'el-link--primary' : ''
                          "
                          :to="{
                            query: { ...route.query, sort: item.value, page: 1 },
                          }"
                          >{{ item.label }}</router-link
                        >
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-dropdown class="hidden-xs-only" :show-timeout="showTimeout">
                  <el-button link :size="filterSize">
                    {{ filterDurationName(query.duration) }}
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="item in durationOptions"
                        :key="'d-' + item.value"
                      >
                        <router-link
                          class="el-link el-link--default"
                          :class="
                            item.value == query.duration
                              ? 'el-link--primary'
                              : ''
                          "
                          :to="{
                            query: {
                              ...route.query,
                              duration: item.value,
                              page: 1,
                            },
                          }"
                          >{{ item.label }}</router-link
                        >
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </template>

          <!-- <div class="search-result-none">没有搜索到内容...</div> -->
          <div class="search-result">
            <search-result-article v-if="searchType === 1" :articles="articles" />
            <search-result-aggregation
              v-else-if="searchType === -1"
              :docs="aggDocs"
            />
            <search-result-document v-else :docs="docs" />
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
            @current-change="onPageChange"
          >
          </el-pagination>
        </el-card>
      </el-col>
      <el-col v-if="keywords.length > 0" :span="5" class="search-right">
        <div ref="searchRight" class="scroll">
          <el-card shadow="never">
            <template #header>
              <div class="clearfix">
                <span>相关搜索词</span>
              </div>
            </template>
            <router-link
              v-for="keyword in keywords"
              :key="'kw-' + keyword"
              rel="nofollow"
              :to="{
                path: '/search',
                query: {
                  wd: keyword,
                  page: 1,
                  size: 10,
                  type: searchType,
                },
              }"
              class="el-link el-link--default"
              >{{ keyword }}</router-link
            >
          </el-card>
        </div>
        <template v-for="item in advertisements">
          <div
            v-if="item.position == 'search_right'"
            :key="item.position + item.id"
            v-safe-html="item.content"
          ></div>
        </template>
      </el-col>
    </el-row>
    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'search_bottom'"
        :key="item.position + item.id"
        v-safe-html="item.content"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getStats } from '@/api/config'
import { searchDocument } from '@/api/document'
import { searchArticle } from '@/api/article'
import { search } from '@/api/search'
import { getIcon, genTimeDuration } from '@/utils/utils'
import { createLatestGuard } from '@/utils/latest'
import { categoryTypeOptions, advertisementPositions } from '@/utils/enum'
import { getAdvertisementByPosition } from '@/api/advertisement'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { useCategoryStore } from '@/store/category'
import { isMobile } from '@/utils/responsive'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const settingStore = useSettingStore()
const categoryStore = useCategoryStore()

const user = computed(() => userStore.user || { id: 0 })
const settings = computed(() => settingStore.settings)
const navigations = computed(() => settingStore.navigations)
const categoryTrees = computed(() => categoryStore.categoryTrees)

const loading = ref(false)
const query = ref<any>({
  wd: route.query.wd || '',
  page: 1,
  size: 10,
  ext: 'all',
  sort: 'default',
  category_id: 0,
  duration: 'all',
})
const searchExts = [
  { label: '全部格式', value: 'all' },
  { label: 'PDF', value: 'pdf' },
  { label: 'DOC', value: 'doc' },
  { label: 'PPT', value: 'ppt' },
  { label: 'XLS', value: 'xls' },
  { label: 'TXT', value: 'txt' },
  { label: '其他', value: 'other' },
]
const searchSorts = [
  { label: '默认排序', value: 'default' },
  { label: '最新排序', value: 'latest' },
  { label: '页数排序', value: 'pages' },
  { label: '大小排序', value: 'size' },
]
const durationOptions = [
  { label: '全部时间', value: 'all' },
  { label: '最近一天', value: 'day' },
  { label: '最近一周', value: 'week' },
  { label: '最近一个月', value: 'month' },
  { label: '最近三个月', value: 'three_month' },
  { label: '最近半年', value: 'half_year' },
  { label: '最近一年', value: 'year' },
]

// 搜索词/类型/分页快速切换时丢弃过期响应，避免旧结果覆盖新结果。
// 注意：必须在下方 immediate watch 之前初始化，否则 setup 同步阶段触发回调时仍处于 TDZ。
const searchGuard = createLatestGuard()

const docs = ref<any[]>([])
const aggDocs = ref<any[]>([])
const articles = ref<any[]>([])
const total = ref(0)
const spend = ref('')
const keywords = ref<any[]>([])
const stats = ref<any>({ document_count: '-' })
const searchType = ref(0)
const showTimeout = ref(50)
const advertisements = ref<any[]>([])

const searchBox = ref<any>(null)
const searchLeft = ref<any>(null)
const searchMain = ref<any>(null)
const searchRight = ref<any>(null)

const filterSize = computed(() => (isMobile.value ? 'small' : 'default'))
const searchPlaceholder = computed(() =>
  searchType.value === 1
    ? '搜索文章标题、摘要、标签'
    : searchType.value === -1
      ? '搜索文档、文章'
      : '搜索文档标题、标签、摘要'
)

function handleScroll() {
  // 列的吸顶固定由 CSS position: sticky 实现，无需 JS 手算 DOM 样式。
  // 原 JS fixed 方案会把列移出文档流，导致翻页 / 滚动态下左右错位。
}

watch(
  () => route.query,
  (val) => {
    const queryInit: any = {
      page: 1,
      size: 10,
      sort: 'default',
      ext: 'all',
      duration: 'all',
      ...val,
    }
    try {
      queryInit.category_id = parseInt(queryInit.category_id) || 0
    } catch (error) {
      console.log(error)
    }
    queryInit.page = parseInt(queryInit.page) || 1
    queryInit.size = parseInt(queryInit.size) || 10
    searchType.value = parseInt(queryInit.type) || 0
    query.value = queryInit
    execSearch()
  },
  { immediate: true, deep: true }
)

function onSearch() {
  router.push({
    path: '/search',
    query: {
      wd: query.value.wd,
      type: searchType.value,
      page: 1,
      size: 10,
      sort: 'default',
      ext: 'all',
      category_id: 0,
    },
  })
}

function onFilter() {
  router.push({
    path: '/search',
    query: {
      page: 1,
      size: 10,
      sort: 'default',
      ext: 'all',
      ...query.value,
    },
  })
}

function changeSearchType(value: any) {
  if (!query.value.wd) return
  total.value = 0
  router.push({
    path: '/search',
    query: {
      ...query.value,
      page: 1,
      size: 10,
      sort: 'default',
      type: value,
    },
  })
}

async function getStatsData() {
  const res: any = await getStats()
  if (res.status === 200) {
    stats.value = res.data
  }
}

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

function execSearch() {
  const queryData: any = { ...query.value }
  if (!queryData.category_id) {
    delete queryData.category_id
  }
  queryData.created_at = genTimeDuration(queryData.duration)
  delete queryData.duration
  if (searchType.value === 1) {
    execSearchArticle(queryData)
  } else if (searchType.value === -1) {
    execSearchAggregation(queryData)
  } else {
    execSearchDocument(queryData)
  }
}

async function execSearchDocument(queryData: any) {
  const token = searchGuard.start()
  loading.value = true
  const res: any = await searchDocument(queryData)
  if (!searchGuard.isLatest(token)) return
  loading.value = false
  if (res.status === 200) {
    total.value = res.data.total
    spend.value = res.data.spend
    const list = res.data.document || []
    const kws: any[] = []
    docs.value = list.map((doc: any) => {
      doc.score = doc.score || 300
      doc.score = doc.score / 100
      doc.icon = getIcon(doc.ext)
      try {
        doc.keywords.split(',').map((keyword: string) => {
          keyword = keyword.trim()
          if (keyword && !kws.includes(keyword)) {
            kws.push(keyword)
          }
          return keyword
        })
      } catch (error) {}
      return doc
    })
    keywords.value = kws
  }
  loading.value = false
}

async function execSearchArticle(queryData: any) {
  const token = searchGuard.start()
  const res: any = await searchArticle(queryData)
  if (!searchGuard.isLatest(token)) return
  if (res.status === 200) {
    total.value = res.data.total
    spend.value = res.data.spend
    const list = res.data.article || []
    const kws: any[] = []
    list.map((article: any) => {
      try {
        article.keywords.split(',').map((keyword: string) => {
          keyword = keyword.trim()
          if (keyword && !kws.includes(keyword)) {
            kws.push(keyword)
          }
          return keyword
        })
      } catch (error) {}
      return article
    })
    keywords.value = kws
    articles.value = list
  }
}

async function execSearchAggregation(queryData: any) {
  const token = searchGuard.start()
  loading.value = true
  const res: any = await search(queryData)
  if (!searchGuard.isLatest(token)) return
  loading.value = false
  if (res.status === 200) {
    total.value = res.data.total
    spend.value = res.data.spend
    const list = res.data.docs || []
    const kws: any[] = []
    aggDocs.value = list.map((doc: any) => {
      if (doc.doc_type === 0 && doc.ext) {
        doc.icon = getIcon(doc.ext)
      }
      try {
        ;(doc.keywords || '').split(',').map((keyword: string) => {
          keyword = keyword.trim()
          if (keyword && !kws.includes(keyword)) {
            kws.push(keyword)
          }
          return keyword
        })
      } catch (error) {}
      return doc
    })
    keywords.value = kws
  }
  loading.value = false
}

function onPageChange(page: number) {
  router.push({
    path: '/search',
    query: {
      ...query.value,
      page,
    },
  })
}

function filterCategoryName(id: any) {
  const category = categoryTrees.value.find((item: any) => item.id === id)
  return category ? category.title : '全部分类'
}

function filterLanguageName(code: any) {
  const item = (settings.value.language || []).find(
    (item: any) => item.code === code
  )
  return item ? item.language : '全部语言'
}

function filterSortName(value: any) {
  const sort = searchSorts.find((item) => item.value === value)
  return sort ? sort.label : '默认排序'
}

function filterDurationName(value: any) {
  const duration = durationOptions.find((item) => item.value === value)
  return duration ? duration.label : '全部时间'
}

function filterExtName(value: any) {
  const ext = searchExts.find((item) => item.value === value)
  return ext ? ext.label : '全部格式'
}

function getActiveFiltersCount() {
  let count = 0
  if (query.value.category_id && query.value.category_id !== 0) count++
  if (query.value.language && query.value.language !== '') count++
  if (
    query.value.ext &&
    query.value.ext !== 'all' &&
    query.value.ext !== ''
  )
    count++
  if (query.value.sort && query.value.sort !== 'default') count++
  if (query.value.duration && query.value.duration !== 'all') count++
  return count
}

function hasActiveFilters() {
  return getActiveFiltersCount() > 0
}

function clearAllFilters() {
  router.push({
    path: '/search',
    query: {
      wd: query.value.wd,
      type: searchType.value,
      page: 1,
      size: 10,
      sort: 'default',
      ext: 'all',
      category_id: 0,
      language: '',
      duration: 'all',
    },
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  getStatsData()
  getAdvertisements('search')
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
