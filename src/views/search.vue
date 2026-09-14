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
          <div v-html="item.content"></div>
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
            v-html="item.content"
          ></div>
        </template>
      </el-col>
    </el-row>
    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'search_bottom'"
        :key="item.position + item.id"
        v-html="item.content"
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
  loading.value = true
  const res: any = await searchDocument(queryData)
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
  const res: any = await searchArticle(queryData)
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
  loading.value = true
  const res: any = await search(queryData)
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
<style lang="scss">
.layout-default:has(.page-search) {
  padding-top: 0;
  .el-main {
    padding-top: 0;
  }
}
.page-search {
  .logo {
    img {
      height: 40px;
    }
  }
  .el-dropdown-menu__item {
    padding: 0;
    .el-link {
      padding: 0 20px;
      img {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
    }
  }
}
.page-search {
  width: $max-width;
  & > .el-row {
    width: $default-width;
    max-width: $max-width;
    margin: 0 auto !important;
  }
  .header-links {
    padding: 0 10px;
    position: sticky;
    top: 0;
    z-index: 200;
    background: #fff;
    // 吸顶时与下方区域自然分隔
    border-bottom: 1px solid transparent;
    .el-link {
      line-height: 35px;
      margin-right: 10px;
    }
  }
  .search-box {
    padding: 18px 0 22px;
    margin-bottom: 20px;
    background: linear-gradient(180deg, #fff 0%, #f7f9fc 100%);
    border-bottom: 1px solid #edf1f7;
    width: 100%;
    & > .el-row {
      margin: 0 auto !important;
      width: $default-width;
      max-width: $max-width;
      display: flex;
      align-items: center;
    }
    .el-cascader {
      width: 110px;
      height: 38px;
      line-height: 38px;
      .el-input__inner {
        height: 38px;
        line-height: 38px;
        border: 0;
      }
    }
    .logo {
      display: flex;
      align-items: center;
      min-height: 64px;
      img {
        max-height: 52px;
      }
    }
    .search-form {
      .search-box-wrapper {
        border: 2px solid #4e9bff;
        border-radius: 26px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(64, 158, 255, 0.12);
        display: flex;
        align-items: center;
        background: #fff;
      }
      .search-form-shell {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .search-input {
        margin-top: 0;
      }
      .search-form-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 72px;
        padding: 4px 10px;
        border-radius: 999px;
        background: #eef4ff;
        color: #3a7be0;
        font-weight: 600;
      }
      .search-form-hint {
        color: #8a94a6;
      }
    }
    .search-type-select {
      &.el-select {
        width: 130px;
      }
      .el-select__wrapper {
        height: 52px;
        padding: 0 14px;
        border: 0;
        border-radius: 25px 0 0 25px;
        box-shadow: none;
        background: transparent;
      }
      .el-select__selected-item,
      .el-select__placeholder {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #243b53 !important;
        font-weight: 600;
      }
      .el-select__caret {
        right: 10px;
      }
    }
    .search-input {
      flex: 1;
      .el-input__wrapper {
        padding: 0;
        box-shadow: none;
        background: transparent;
      }
      .el-input__inner {
        height: 52px;
        line-height: 52px;
        border: 0;
        padding-left: 18px;
        background: transparent;
      }
      & > .el-input__inner {
        border-radius: 0 !important;
      }
      .el-input-group__prepend {
        border: 0;
        border-right: 1px solid #e4e7ed;
        border-radius: 0;
        padding: 0;
        background: transparent;
      }
      .el-input-group__append {
        border: 0;
        border-radius: 0;
        padding: 0;
        background: transparent;
      }
      .btn-search {
        position: relative;
        width: 140px;
        height: 52px;
        padding: 0;
        border: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #5ba7ff 0%, #409eff 100%);
        font-size: 18px;
        font-weight: 600;
        color: #fff;
        .el-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }
  }
  .scroll {
    overflow: auto;
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #ccc;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 3px;
    }
  }
  .search-right {
    a {
      display: inline-block;
      line-height: 30px;
      margin-right: 10px;
    }
  }
  .emptyblock {
    height: 1px;
  }
  .search-main {
    .el-card__header {
      font-weight: normal;
      font-size: 15px;
      line-height: 20px;
      padding: 10px 20px;
    }

    .el-card__body {
      padding-top: 0;
      padding-bottom: 10px;
      min-height: 540px;
    }
  }
  .search-left {
    .el-card {
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }
    .el-card__header {
      color: white;
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
      padding: 15px 20px;
      border-radius: 8px 8px 0 0;
      border-bottom: none;
      .clearfix {
        display: flex;
        justify-content: space-between;
        align-items: center;
        span {
          display: flex;
          align-items: center;
          &:before {
            content: '🔍';
            margin-right: 8px;
            font-size: 18px;
          }
        }
        .filter-count {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
        }
      }
    }
    .el-card__body {
      padding: 20px;
      background-color: #fafbfc;
    }
    .filter-section {
      margin-bottom: 20px;
      background: white;
      border-radius: 12px;
      padding: 15px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      &:last-child {
        margin-bottom: 0;
      }
      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
        padding-bottom: 16px;
        padding-top: 2px;
        border-bottom: 1px solid #ecf0f1;
        position: relative;
        display: flex;
        align-items: center;
        i {
          margin-right: 6px;
          color: #667eea;
        }
        &:after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 30px;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }
      }
      .filter-options {
        .filter-option {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px;
          font-size: 13px;
          text-decoration: none;
          border-radius: 4px;
          margin-bottom: 4px;
          position: relative;
          &.el-link--primary {
            font-weight: 500;
          }
          &.el-link--default {
            color: #5a6c7d;
            &:hover {
              color: #667eea;
            }
          }
          .option-text {
            flex: 1;
            display: flex;
            align-items: center;
          }
          .option-check {
            margin-left: 8px;
            font-size: 14px;
            color: white;
          }
          img {
            width: 18px;
            height: 18px;
            margin-right: 6px;
            vertical-align: middle;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
          }
        }
      }
    }
    .filter-actions {
      margin-top: 20px;
      text-align: center;
      padding: 15px;
      background: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      .clear-filters-btn {
        color: #f56565;
        font-size: 12px;
        padding: 8px 16px;
        border: 1px solid #f56565;
        border-radius: 4px;
        transition: all 0.2s ease;
        &:hover {
          background: #f56565;
          color: white;
        }
      }
    }
  }
  .search-tips {
    font-size: 14px;
    margin-top: 10px;
    color: #999;
    .el-link {
      position: relative;
      top: -2px;
    }
  }
  .search-filter {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    .el-dropdown {
      margin-right: 0;
    }
    .el-dropdown {
      display: inline-flex;
      align-items: center;
    }
    .el-button--text {
      display: inline-flex;
      align-items: center;
      color: #6b7a88;
      .el-icon {
        margin-left: 4px;
        vertical-align: middle;
      }
      &:hover {
        color: #409eff;
      }
    }
    img {
      width: 14px;
      height: 14px;
      position: relative;
      top: 1px;
    }
  }
}

@media screen and (max-width: $mobile-width) {
  .page-search {
    .search-box {
      padding: 12px 0 16px;
      margin-bottom: 15px;
      background: #fff;
      .search-form {
        width: 100% !important;
        padding-top: 70px;
      }
      .search-form-shell {
        gap: 0;
      }
      .search-type-select {
        &.el-select {
          width: 86px;
        }
        .el-select__wrapper {
          height: 44px;
          padding: 0 24px 0 12px;
          border-radius: 12px 0 0 12px;
          box-shadow: none;
          background: transparent;
        }
      }
      .search-input {
        .el-input__inner {
          height: 44px;
          line-height: 44px;
          border-radius: 12px 0 0 12px;
          padding-left: 12px;
          box-shadow: none;
        }
        .el-input-group__prepend,
        .el-input-group__append {
          box-shadow: none;
          border-radius: 12px 0 0 12px;
        }
        .el-input-group__append {
          border-radius: 0 12px 12px 0;
        }
        .btn-search {
          width: 88px;
          height: 44px;
          padding: 0;
          font-size: 15px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 0 12px 12px 0;
        }
      }
    }

    .search-left {
      display: none; // 移动端隐藏左侧过滤
    }

    .search-left-col {
      padding-left: 0 !important;
      padding-right: 0 !important;
      width: 100%;
      a {
        display: inline-block;
        padding: 0 10px;
        line-height: 30px;
        font-size: 13px;
      }
    }
    .search-main {
      width: 100% !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      .el-card__body {
        min-height: unset;
      }
      .search-result li {
        padding-top: 0;
      }
      .el-card__header {
        font-size: 12px;
        .el-button--mini {
          font-size: 13px;
        }
      }
    }
    .search-filter {
      .el-dropdown {
        margin-right: 7px;
      }
    }
    .search-right {
      width: 100% !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-top: 15px;
    }

    // 移动端显示原来的筛选条件在头部
    .search-main .search-filter {
      .el-dropdown {
        margin-right: 5px;
        margin-bottom: 5px;
      }
      // 在移动端恢复所有筛选条件
      .mobile-filters {
        .el-dropdown {
          margin-right: 5px;
          margin-bottom: 5px;
        }
        .el-button--text {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 12px;
          &:hover {
            background: #e9ecef;
          }
        }
      }
    }
  }
}

// 大屏幕优化
@media screen and (min-width: 1400px) {
  .page-search {
    .search-left {
      .filter-section {
        .filter-options {
          .filter-option {
            padding: 10px 15px;
            font-size: 14px;
          }
        }
      }
    }
  }
}

// 平板适配
@media screen and (max-width: 1024px) and (min-width: 768px) {
  .page-search {
    .search-left {
      .el-card__body {
        padding: 15px;
      }
      .filter-section {
        padding: 12px;
        margin-bottom: 20px;
        h4 {
          font-size: 14px;
        }
        .filter-options {
          .filter-option {
            padding: 6px 10px;
            font-size: 12px;
          }
        }
      }
    }
  }
}
.filter-options {
  max-height: 320px;
  overflow: auto;
}
.header {
  display: flex;
  justify-content: space-between;
}
/* 左右侧栏吸顶固定：使用 sticky 保持列在文档流内，避免 JS fixed 造成的翻页错位 */
.search-left,
.search-right {
  position: sticky;
  top: 105px;
  align-self: flex-start;
  height: fit-content;
}
.search-box {
  position: sticky;
  top: 35px;
  z-index: 100;
}
</style>