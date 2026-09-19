<template>
  <div class="page page-index">
    <section class="hero-search">
      <el-carousel
        :interval="3000"
        arrow="always"
        :height="isMobile ? '250px' : '420px'"
        @change="changeCarousel"
      >
        <a
          v-for="(banner, index) in banners"
          :key="'banner-' + banner.id"
          :href="banner.url || 'javascript:;'"
          :target="banner.url ? '_blank' : ''"
          :title="banner.title"
        >
          <el-carousel-item
            :style="
              'background: url(' +
              assetUrl(carouselIndexes.indexOf(index) > -1 ? banner.path : '') +
              ') center center no-repeat;'
            "
          ></el-carousel-item>
        </a>
      </el-carousel>
      <div class="hero-mask"></div>
      <div class="hero-content">
        <el-form :model="search" class="search-form" @submit.prevent>
          <el-form-item>
            <el-input
              v-model="search.wd"
              size="large"
              placeholder="搜索文档、文章"
              @keyup.enter="onSearch"
            >
              <template #prefix
                ><el-icon><Search /></el-icon
              ></template>
            </el-input>
          </el-form-item>
          <el-form-item v-if="recommendWords.length" class="search-word-row">
            <router-link
              v-for="word in recommendWords"
              :key="'kw-' + word"
              target="_blank"
              class="search-keyword"
              :to="{
                path: '/search',
                query: { wd: word },
              }"
            >
              {{ word }}
            </router-link>
          </el-form-item>
        </el-form>
      </div>
    </section>

    <div v-if="notices.length > 0" class="notice-board-section">
      <div class="notice-board-inner">
        <el-card shadow="never">
          <notice-board :notices="notices" />
        </el-card>
      </div>
    </div>

    <div class="page-shell">
      <el-row :gutter="24">
        <el-col :span="16" :xs="24" class="home-left">
      <section class="section-block recommend-section">
        <div class="section-header">
          <div class="recommend-header-wrap">
            <div class="recommend-heading">
              <h2>文档推荐</h2>
              <button
                class="recommend-refresh"
                type="button"
                @click="changeRecommendBatch"
              >
                <el-icon><RefreshRight /></el-icon>
                <span>换一批</span>
              </button>
            </div>
            <div class="recommend-links">
              <router-link to="/upload" class="nuxt-link" target="_blank">
                <span><el-icon><Upload /></el-icon> 上传文档</span>
              </router-link>
              <span class="text-muted">|</span>
              <router-link to="/post" class="nuxt-link" target="_blank">
                <span><el-icon><Edit /></el-icon> 发布文章</span>
              </router-link>
            </div>
          </div>
        </div>
        <div class="recommend-grid">
          <template v-if="loadingRecommend">
            <div
              v-for="item in 8"
              :key="'recommend-skeleton-' + item"
              class="recommend-card recommend-card-skeleton"
            >
              <el-skeleton animated>
                <template #template>
                  <div class="recommend-cover-skeleton">
                    <el-skeleton-item variant="image" />
                  </div>
                  <el-skeleton-item
                    variant="h3"
                    class="recommend-title-skeleton"
                  />
                  <el-skeleton-item
                    variant="text"
                    class="recommend-meta-skeleton recommend-meta-skeleton-author"
                  />
                  <el-skeleton-item
                    variant="text"
                    class="recommend-meta-skeleton"
                  />
                </template>
              </el-skeleton>
            </div>
          </template>
          <router-link
            v-for="item in displayedRecommends"
            v-else
            :key="'recommend-' + item.id"
            :to="`/document/${item.uuid}`"
            target="_blank"
            class="recommend-card"
          >
            <div class="recommend-cover-wrap">
              <document-cover
                :document="item"
                :lazy="false"
                :width="isMobile ? 88 : 118"
                :show-ext="true"
              />
            </div>
            <div class="recommend-title hover-link">{{ item.title }}</div>
            <div class="recommend-author">
              <el-icon><User /></el-icon>
              {{ getRecommendAuthor(item) }}
            </div>
            <div class="recommend-category">
              {{
                item.category && item.category.length > 0
                  ? item.category[0].title
                  : '文档资源'
              }}
              {{
                item.category && item.category.length > 1
                  ? '· ' + item.category[1].title
                  : ''
              }}
            </div>
          </router-link>
        </div>
      </section>

      <section class="section-block latest-section">
        <div class="section-header">
          <div>
            <h2>最新内容</h2>
          </div>
        </div>
        <div class="latest-grid">
          <template v-if="loadingLatest">
            <div
              v-for="panel in 2"
              :key="'latest-skeleton-panel-' + panel"
              class="latest-panel latest-panel-skeleton"
            >
              <div class="panel-header panel-header-skeleton">
                <div class="panel-title-skeleton-wrap">
                  <el-skeleton-item
                    variant="image"
                    class="panel-icon-skeleton"
                  />
                  <el-skeleton-item variant="h3" class="panel-title-skeleton" />
                </div>
                <el-skeleton-item variant="text" class="panel-more-skeleton" />
              </div>
              <div
                v-for="item in 8"
                :key="'latest-skeleton-row-' + panel + '-' + item"
                class="latest-item latest-item-skeleton"
              >
                <el-skeleton-item variant="text" class="latest-rank-skeleton" />
                <el-skeleton-item variant="text" class="latest-text-skeleton" />
                <el-skeleton-item variant="text" class="latest-date-skeleton" />
              </div>
            </div>
          </template>

          <template v-else>
            <div class="latest-panel">
              <div class="panel-header">
                <div class="panel-title">
                  <span class="panel-icon doc-icon"
                    ><el-icon><Document /></el-icon
                  ></span>
                  <strong>文档资料</strong>
                </div>
                <router-link to="/category" target="_blank" class="panel-more">
                  查看更多 <el-icon><ArrowRight /></el-icon>
                </router-link>
              </div>
              <router-link
                v-for="(doc, index) in latestDocuments.slice(0, 8)"
                :key="'latest-doc-' + doc.id"
                :to="`/document/${doc.uuid}`"
                target="_blank"
                class="latest-item hover-link"
              >
                <span
                  class="latest-rank"
                  :class="index > 2 ? 'latest-rank-older' : ''"
                  >{{ index + 1 }}</span
                >
                <span class="latest-text">{{ doc.title }}</span>
                <span class="latest-date">{{
                  formatDate(doc.created_at)
                }}</span>
              </router-link>
            </div>

            <div class="latest-panel">
              <div class="panel-header">
                <div class="panel-title">
                  <span class="panel-icon article-icon"
                    ><el-icon><Notebook /></el-icon
                  ></span>
                  <strong>{{ articleName }}</strong>
                </div>
                <router-link to="/article" target="_blank" class="panel-more">
                  查看更多 <el-icon><ArrowRight /></el-icon>
                </router-link>
              </div>
              <router-link
                v-for="(article, index) in articles.slice(0, 8)"
                :key="'latest-article-' + article.id"
                :to="`/article/${article.identifier || article.id}`"
                target="_blank"
                class="latest-item hover-link"
              >
                <span
                  class="latest-rank"
                  :class="index > 2 ? 'latest-rank-older' : ''"
                  >{{ index + 1 }}</span
                >
                <span class="latest-text">{{ article.title }}</span>
                <span class="latest-date">{{
                  formatDate(article.created_at)
                }}</span>
              </router-link>
            </div>
          </template>
        </div>
      </section>

      <section class="section-block categories-section">
        <div class="section-header">
          <div>
            <h2>分类浏览</h2>
          </div>
        </div>
        <div class="category-grid">
          <div
            v-for="category in featuredCategories"
            :key="'category-' + category.id"
            class="category-card"
          >
            <div class="category-top">
              <router-link
                class="category-main-link"
                :to="`/category/${category.id}`"
                target="_blank"
              >
                <span class="category-badge">
                  <img
                    :src="assetUrl(category.icon) || '/static/images/logo-icon.png'"
                    :alt="category.title"
                  />
                </span>
                <span class="category-main-text">
                  <strong>{{ category.title }}</strong>
                  <small>{{ category.doc_count || 0 }} 篇文档</small>
                </span>
              </router-link>
              <router-link
                class="category-more"
                :to="`/category/${category.id}`"
                target="_blank"
              >
                查看更多
              </router-link>
            </div>
            <div class="category-children">
              <router-link
                v-for="(child, index) in category.children"
                v-show="index < 9"
                :key="'child-' + child.id"
                :to="`/category/${child.id}`"
                target="_blank"
                class="category-child"
              >
                <span>{{ child.title }}</span>
                <small>{{ child.doc_count || 0 }}篇</small>
              </router-link>
            </div>
          </div>
        </div>
      </section>
        </el-col>
        <el-col :span="8" :xs="24" class="home-right">
          <home-sidebar
            :latest-documents="latestDocuments"
            :hot-documents="hotDocuments"
            :download-documents="downloadDocuments"
            :comment-documents="commentDocuments"
          />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { listBanner } from '@/api/banner'
import { listDocument } from '@/api/document'
import { listArticle } from '@/api/article'
import { useSettingStore } from '@/store/setting'
import { useCategoryStore } from '@/store/category'
import { assetUrl } from '@/utils/asset'

const settingStore = useSettingStore()
const categoryStore = useCategoryStore()

const settings = computed(() => settingStore.settings)
const navigations = computed(() => settingStore.navigations)
const categoryTrees = computed(() => categoryStore.categoryTrees)

const banners = ref<any[]>([])
const recommends = ref<any[]>([])
const latestDocuments = ref<any[]>([])
const hotDocuments = ref<any[]>([])
const downloadDocuments = ref<any[]>([])
const commentDocuments = ref<any[]>([])
const loadingRecommend = ref(true)
const loadingLatest = ref(true)
const search = ref<{ wd: string }>({ wd: '' })
const carouselIndexes = ref<number[]>([0])
const articles = ref<any[]>([])
const notices = ref<any[]>([])
const recommendBatch = ref(0)

const articleName = computed(() => {
  const nav = navigations.value.find((nav: any) => nav.href === '/article')
  return nav ? nav.title : '最新文章'
})
const recommendWords = computed(() =>
  (settings.value.system.recommend_words || []).slice(0, 4)
)
const recommendBatchCount = computed(() =>
  Math.max(Math.ceil(recommends.value.length / 8), 1)
)
const displayedRecommends = computed(() => {
  if (!recommends.value.length) return []
  const start = recommendBatch.value * 8
  return recommends.value.slice(start, start + 8)
})
const featuredCategories = computed(() => {
  const hideEmpty = settings.value.display.hide_category_without_document
  return (categoryTrees.value || [])
    .filter((item: any) => item.enable && !item.type)
    .filter((item: any) => (hideEmpty ? item.doc_count > 0 : true))
    .map((item: any) => ({
      ...item,
      children: (item.children || []).filter((child: any) => {
        if (!child.enable) return false
        return hideEmpty ? child.doc_count > 0 : true
      }),
    }))
})

async function loadBanner() {
  const res: any = await listBanner({
    enable: true,
    field: ['id', 'title', 'path', 'url'],
    type: 0,
  })
  if (res.status === 200) {
    banners.value = res.data.banner || []
  }
}

function onSearch() {
  if (search.value.wd) {
    location.href = '/search?wd=' + encodeURIComponent(search.value.wd)
  }
}

async function getArticles() {
  const res: any = await listArticle({
    page: 1,
    size: 8,
  })
  if (res.status === 200) {
    articles.value = res.data.article || []
  }
}

async function getRecommendDocuments() {
  loadingRecommend.value = true
  try {
    const res: any = await listDocument({
      is_recommend: true,
      order: 'recommend_at desc',
      limit: 24,
    })
    if (res.status === 200) {
      recommends.value = res.data.document || []
      recommendBatch.value = 0
    }
  } finally {
    loadingRecommend.value = false
  }
}

async function getLatestDocuments() {
  const res: any = await listDocument({
    field: ['id', 'title', 'uuid', 'created_at'],
    order: 'id desc',
    limit: 8,
  })
  if (res.status === 200) {
    latestDocuments.value = res.data.document || []
  }
}

async function getHotDocuments() {
  const res: any = await listDocument({
    field: ['id', 'title', 'uuid', 'created_at'],
    order: 'view_count desc',
    limit: 8,
  })
  if (res.status === 200) {
    hotDocuments.value = res.data.document || []
  }
}

async function getDownloadDocuments() {
  const res: any = await listDocument({
    field: ['id', 'title', 'uuid', 'created_at'],
    order: 'download_count desc',
    limit: 8,
  })
  if (res.status === 200) {
    downloadDocuments.value = res.data.document || []
  }
}

async function getCommentDocuments() {
  const res: any = await listDocument({
    field: ['id', 'title', 'uuid', 'created_at'],
    order: 'comment_count desc',
    limit: 8,
  })
  if (res.status === 200) {
    commentDocuments.value = res.data.document || []
  }
}

async function getLatestContent() {
  loadingLatest.value = true
  try {
    await Promise.all([
      getLatestDocuments(),
      getHotDocuments(),
      getDownloadDocuments(),
      getCommentDocuments(),
      getArticles(),
    ])
  } finally {
    loadingLatest.value = false
  }
}

async function loadNotices() {
  // 公告栏是纵向轮播的标题列表，取少量即可，避免首屏拉取上百条文章
  const res: any = await listArticle({
    page: 1,
    size: 10,
    is_notice: [1],
  })
  if (res.status === 200) {
    notices.value = res.data.article || []
  }
}

function changeCarousel(index: number) {
  const arr = carouselIndexes.value
  if (!arr.includes(index)) {
    arr.push(index)
  }
  carouselIndexes.value = arr
}

function changeRecommendBatch() {
  if (recommendBatchCount.value <= 1) return
  recommendBatch.value = (recommendBatch.value + 1) % recommendBatchCount.value
}

function getRecommendAuthor(item: any) {
  return (
    item.realname ||
    (item.user && item.user.realname) ||
    '未知作者'
  )
}

function formatDate(value: any) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

onMounted(() => {
  Promise.all([
    loadBanner(),
    getRecommendDocuments(),
    getLatestContent(),
    loadNotices(),
  ])
})
</script>
