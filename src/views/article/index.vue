<template>
  <div class="page page-article-index">
    <el-row :gutter="20">
      <el-col class="hidden-xs-only" :span="4">
        <article-navbar class="fixed-left" />
        <div>&nbsp;</div>
      </el-col>
      <el-col :span="14" :xs="24" class="main-list">
        <el-breadcrumb
          v-if="activeCate.id"
          style="margin-bottom: 10px"
          separator="/"
          class="hidden-xs-only"
        >
          <el-breadcrumb-item>
            <router-link to="/"><i class="fa fa-home"></i> 首页</router-link>
          </el-breadcrumb-item>
          <el-breadcrumb-item>
            <router-link to="/article">全部内容</router-link>
          </el-breadcrumb-item>
          <el-breadcrumb-item
            v-for="item in breadcrumbs"
            :key="'bread1-' + item.id"
          >
            <el-dropdown v-if="item.children.length > 0">
              <span class="el-dropdown-link">
                {{ item.title
                }}<el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu class="breadcrumb-dropdown">
                  <el-dropdown-item
                    v-for="ss in item.children.filter((x) => x.type)"
                    :key="'s1-' + ss.id"
                  >
                    <router-link
                      class="el-link el-link--default block"
                      :class="{
                        'el-link--primary': ss.id === item.id,
                      }"
                      :to="`/article?category_id=${ss.id}`"
                      >{{ ss.title }}</router-link
                    ></el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <span v-else>{{ item.title }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
        <el-tabs
          v-model="activeCate.idStr"
          type="border-card"
          class="hidden-sm-and-up"
          @tab-click="changeTabs"
        >
          <el-tab-pane label="全部文章" name=""></el-tab-pane>
          <el-tab-pane
            v-for="cate in categoryTrees.filter((item) => item.type === 1)"
            :key="'pane-' + cate.id"
            :label="cate.title"
            :name="`${cate.id}`"
          ></el-tab-pane>
        </el-tabs>
        <el-card shadow="never">
          <template #header>
            <router-link
              class="el-link el-link--default"
              :class="{
                'el-link--primary':
                  route.query.tab === 'latest' || !route.query.tab,
              }"
              :to="`?category_id=${route.query.category_id || ''}&tab=latest`"
              >最新发布</router-link
            >
            <router-link
              class="el-link el-link--default"
              :class="{
                'el-link--primary': route.query.tab === 'popular',
              }"
              :to="`?category_id=${route.query.category_id || ''}&tab=popular`"
              >热门文章</router-link
            >
            <router-link to="/post">
              <el-button
                size="small"
                type="primary"
                style="float: right; margin-top: -4px"
                ><el-icon><Plus /></el-icon>发布文章</el-button
              >
            </router-link>
          </template>
          <div
            v-if="
              activeCate.description &&
              activeCate.show_description &&
              (query.page === 1 || !query.page)
            "
            class="cate-description"
          >
            {{ activeCate.description }}
          </div>
          <article-list-skeleton
            v-if="loading && articles.length === 0 && query.page === 1"
          />
          <article-list v-else :articles="articles" />
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
      </el-col>
      <el-col :span="6" class="hidden-xs-only">
        <div class="fixed-right">
          <el-card shadow="never" class="recommend">
            <template #header>推荐</template>
            <div v-if="recommendArticles.length > 0">
              <ArticleSimpleList
                v-loading="recommend.loading"
                :articles="recommendArticles"
              ></ArticleSimpleList>
              <el-button
                v-if="recommend.totalPage > 1"
                link
                class="mgb-5px"
                @click="getRecommendArticles"
                ><el-icon><Refresh /></el-icon>换一批</el-button
              >
            </div>
            <el-empty v-else> </el-empty>
          </el-card>
          <ArticleFooter class="mgt-20px" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listArticle } from '@/api/article'
import { useSettingStore } from '@/store/setting'
import { useCategoryStore } from '@/store/category'

const route = useRoute()
const router = useRouter()
const settingStore = useSettingStore()
const categoryStore = useCategoryStore()

const settings = computed(() => settingStore.settings)
const navigations = computed(() => settingStore.navigations)
const categoryMap = computed(() => categoryStore.categoryMap || {})
const categoryTrees = computed(() => categoryStore.categoryTrees || [])
const categories = computed(() => categoryStore.categories || [])

const total = ref(0)
const size = 10
const query = ref<any>({
  page: 1,
})
const recommend = ref<any>({
  page: 1,
  size: 8,
  totalPage: 1,
  loading: false,
})
const recommendArticles = ref<any[]>([])
const articles = ref<any[]>([])
const breadcrumbs = ref<any[]>([])
const activeCate = ref<any>({
  id: 0,
  title: '全部文章',
  description: '',
  idStr: '',
})
const loading = ref(false)
const title = ref('')

const articleName = computed(() => {
  const nav = navigations.value.find((nav: any) => nav.href === '/article')
  return nav ? nav.title : '文章资讯'
})

function setActiveCate() {
  const cateId = route.query.category_id || undefined
  let active: any = { title: '全部文章', id: 0 }
  if (cateId) {
    active = categoryMap.value[cateId as string] || active
  }
  active.idStr = active.id.toString()
  activeCate.value = active
  setBreadcrumbs()
}

function pageChange(page: number) {
  query.value.page = page
  router.push({
    path: route.path,
    query: {
      ...route.query,
      ...query.value,
    },
  })
}

function setBreadcrumbs() {
  const crumbs: any[] = []
  let category: any = { children: [], ...categoryMap.value[activeCate.value.id] }
  if (category.id) {
    // 查询当前分类的兄弟分类
    category.children = filterCategoryChildren(category)
    crumbs.push(category)
    while (category.parent_id) {
      category = { children: [], ...categoryMap.value[category.parent_id] }
      if (category.id) {
        category.children = filterCategoryChildren(category)
        crumbs.splice(0, 0, category)
      }
    }
  }
  const titles: string[] = []
  crumbs.forEach((x) => {
    titles.push(x.title)
  })
  title.value = titles.join(' · ')
  breadcrumbs.value = crumbs
}

function filterCategoryChildren(category: any) {
  try {
    return categories.value.filter((x: any) => {
      return x.parent_id === category.id && x.type === 1 && x.enable
    })
  } catch (error) {}
  return []
}

async function getArticles() {
  const res: any = await listArticle({
    size,
    page: query.value.page,
    category_id: route.query.category_id || undefined,
    order: route.query.tab === 'popular' ? 'view_count desc' : '',
    status: 1, // 审核通过的文章
  })
  if (res.status !== 200) {
    ElMessage.error(res.data.message || '获取文章列表失败')
    return
  }
  articles.value = res.data.article || []
  total.value = res.data.total || 0
}

async function getRecommendArticles() {
  loading.value = true
  const res: any = await listArticle({
    page: recommend.value.page,
    size: recommend.value.size,
    is_recommend: true,
    status: 1, // 审核通过的文章
  })
  loading.value = false
  if (res.status !== 200) {
    ElMessage.error(res.data.message || '获取推荐文章失败')
    return
  }
  const nextPage = recommend.value.page + 1
  recommend.value.totalPage = Math.ceil(res.data.total / recommend.value.size)
  if (nextPage > recommend.value.totalPage) {
    recommend.value.page = 1
  } else {
    recommend.value.page = nextPage
  }
  recommendArticles.value = res.data.article || []
}

function changeTabs(tab: any) {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      category_id: tab.name,
      page: 1,
    },
  })
}

watch(
  () => [route.query.page, route.query.category_id, route.query.tab],
  () => {
    const page = route.query.page || 1
    query.value.page = parseInt(page as string) || 1
    setActiveCate()
    getArticles()
  },
  { immediate: true }
)

onMounted(async () => {
  await Promise.all([getRecommendArticles()])
})

onBeforeUnmount(() => {})
</script>

<style lang="scss">
.page-article-index {
  .el-tabs--border-card > .el-tabs__header {
    padding: 0 10px;
    border-bottom: 0 !important;
  }
  .el-tabs__item.is-active {
    border-top-left-radius: 4px !important;
    border-top-right-radius: 4px !important;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    margin-top: 2px !important;
  }
  .article-footer {
    .el-card__body {
      padding: 0;
    }
  }

  .el-card__body {
    padding-top: 0;
    padding-bottom: 0;
    .el-pagination {
      padding: 20px 0;
      border-top: 1px dashed #efefef;
    }
  }

  .cate-description {
    padding: 10px 0;
    color: #909399;
    line-height: 170%;
    font-size: 13px;
    word-break: break-all;
    border: 1px dashed #ddd;
    padding: 10px;
    border-radius: 4px;
    margin: 10px -10px 0;
  }

  .popular {
    .el-card__body {
      padding-top: 10px;
    }
    a {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: normal;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px dashed #efefef;
      &:last-of-type {
        border-bottom: 0;
      }
    }
  }

  .main-list {
    .el-card__header {
      .el-link--default {
        display: inline-block;
        margin-right: 20px;
      }
    }
  }
  .fixed-left {
    width: 185px;
    position: fixed;
  }

  .fixed-right {
    position: fixed;
    width: 285px;
  }
}

@media screen and (max-width: $mobile-width) {
  .page-article-index {
    .el-col {
      width: 100%;
    }
    .popular {
      margin-top: 15px;
    }
  }
  .el-tabs--border-card {
    border: 0;
    .el-tabs__content {
      display: none;
    }
  }
}
</style>