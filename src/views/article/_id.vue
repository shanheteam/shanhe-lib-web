<template>
  <div class="page page-article">
    <el-row :gutter="20">
      <el-col :span="18" :xs="24">
        <el-card shadow="never">
          <template #header>
            <div>
              <h1>
                <template v-if="article.id > 0">
                  <template v-if="article.status != 1">
                    (
                    <span v-if="article.status == 2" class="text-danger"
                      >审核拒绝</span
                    >
                    <span v-else class="text-warning">待审核</span>
                    )
                  </template>
                </template>
                {{ article.title }}
                <img
                  v-if="article.recommend_at"
                  class="icon-recommend"
                  src="/static/images/recommend.png"
                  alt="推荐"
                />
                <div
                  v-if="
                    user.id > 0 &&
                    (accessDelete ||
                      accessRecommend ||
                      accessUpdate ||
                      accessForbiden)
                  "
                  class="actions"
                >
                  <el-button
                    v-if="accessDelete"
                    link
                    @click="deleteArticle"
                    ><el-icon><Delete /></el-icon>删除文章</el-button
                  >
                  <router-link
                    v-if="accessUpdate"
                    :to="`/post?identifier=${article.identifier}`"
                  >
                    <el-button link
                      ><el-icon><Edit /></el-icon>编辑文章</el-button
                    >
                  </router-link>
                  <template>
                    <!-- 管理员权限 -->
                    <el-dropdown v-if="accessForbiden" @command="checkArticle">
                      <span class="el-dropdown-link">
                        <el-button link
                          ><el-icon><DocumentChecked /></el-icon
                          >文章审批</el-button
                        >
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="pass"
                            >审核通过</el-dropdown-item
                          >
                          <el-dropdown-item command="reject"
                            >审核拒绝</el-dropdown-item
                          >
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                    <el-dropdown
                      v-if="accessRecommend"
                      @command="recommendArticle"
                    >
                      <span class="el-dropdown-link">
                        <el-button link
                          ><i class="fa fa-thumbs-up"></i> 推荐设置</el-button
                        >
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="cancel"
                            >取消推荐</el-dropdown-item
                          >
                          <el-dropdown-item command="recommend"
                            >推荐文章</el-dropdown-item
                          >
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </template>
                </div>
              </h1>
              <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                  <router-link to="/"><i class="fa fa-home"></i> 首页</router-link>
                </el-breadcrumb-item>
                <el-breadcrumb-item>
                  <router-link to="/article">文章</router-link>
                </el-breadcrumb-item>
                <template v-if="breadcrumbs.length < 3">
                  <el-breadcrumb-item
                    v-for="breadcrumb in breadcrumbs"
                    :key="'bread-' + breadcrumb.id"
                  >
                    <router-link :to="`/article?category_id=${breadcrumb.id}`">
                      {{ breadcrumb.title }}
                    </router-link>
                  </el-breadcrumb-item>
                </template>
                <template v-else>
                  <el-breadcrumb-item>
                    <router-link :to="`/article?category_id=${breadcrumbs[0].id}`">
                      {{ breadcrumbs[0].title }}
                    </router-link>
                  </el-breadcrumb-item>
                  <el-breadcrumb-item>...</el-breadcrumb-item>
                  <el-breadcrumb-item>
                    <router-link
                      :to="`/article?category_id=${
                        breadcrumbs[breadcrumbs.length - 1].id
                      }`"
                      >{{ breadcrumbs[breadcrumbs.length - 1].title }}</router-link
                    >
                  </el-breadcrumb-item>
                </template>
                <el-breadcrumb-item>文章详情</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
          </template>
          <div class="help-block text-muted article-info hidden-xs-only">
            <span
              ><el-icon><View /></el-icon>
              {{ article.view_count || 0 }} 阅读</span
            >
            <span
              ><el-icon><Star /></el-icon>
              {{ article.favorite_count || 0 }} 收藏</span
            >
            <span
              ><el-icon><ChatDotSquare /></el-icon>
              {{ article.comment_count || 0 }} 评论</span
            >
            <span class="float-right"
              ><el-icon><Clock /></el-icon>
              <span class="hidden-xs-only">发布:</span
              >{{ formatRelativeTime(article.created_at) }}
            </span>
          </div>
          <div v-if="article.id > 0" class="hidden-sm-and-up">
            <!-- 展示文章作者信息 -->
            <div class="m-userinfo">
              <div>
                <router-link :to="'/user/' + article.user_id">
                  <UserAvatar :size="32" :user="article.user" />
                </router-link>
              </div>
              <div class="user-profile">
                <router-link
                  class="el-link el-link--default"
                  :to="'/user/' + article.user_id"
                >
                  <strong>{{ article.user.username }}</strong>
                </router-link>
                <div>
                  <small class="help-block">
                    发布于 {{ formatRelativeTime(article.created_at) }}
                  </small>
                </div>
              </div>
              <div class="article-info">
                <span
                  ><el-icon><View /></el-icon>
                  {{ article.view_count || 0 }}</span
                >
                <span>
                  <el-icon><Star /></el-icon>
                  {{ article.favorite_count || 0 }}
                </span>
                <span>
                  <el-icon><ChatDotSquare /></el-icon>
                  {{ article.comment_count || 0 }}
                </span>
              </div>
            </div>
          </div>
          <article class="mgt-20px markdown-body">
            <el-alert
              v-if="article.status === 2 && article.reject_reason"
              title="审核拒绝原因"
              type="error"
            >
              {{ article.reject_reason }}
            </el-alert>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div
              ref="viewer"
              data-slate-editor
              v-html="article.content"
            ></div>
            <div v-if="!article.id" style="min-height: 100vh"></div>
          </article>
          <div v-if="article.source || article.source_url" class="source">
            <el-divider content-position="left">来源</el-divider>
            <div>
              <span>{{ article.source }}</span>
              <a
                v-if="article.source_url"
                :href="article.source_url"
                target="_blank"
                rel="noopener noreferrer"
                >{{ article.source_url }}</a
              >
            </div>
          </div>
          <el-row v-if="article.id > 0" class="btn-actions">
            <el-col :span="12">
              <share-box :title="article.title" />
            </el-col>
            <el-col :span="12" class="text-right">
              <el-button
                v-if="favorite.id > 0"
                type="primary"
                @click="deleteFavorite"
                ><el-icon><StarFilled /></el-icon>取消收藏</el-button
              >
              <el-button
                v-else
                type="primary"
                :size="isMobile ? 'medium' : 'large'"
                @click="createFavorite"
                ><el-icon><Star /></el-icon>收藏文章</el-button
              >
            </el-col>
          </el-row>
        </el-card>
        <el-card shadow="never" class="mgt-20px">
          <FormComment
            :document-id="Number(article.id)"
            :type="1"
            class="mgt-20px"
            @success="commentSuccess"
          />
          <CommentList
            v-if="article.id > 0"
            ref="commentList"
            :document-id="Number(article.id)"
            :type="1"
          />
        </el-card>
      </el-col>
      <el-col :span="6" :xs="24" class="article-right">
        <el-card shadow="never" class="hidden-xs-only">
          <template #header>分享用户</template>
          <user-card
            :hide-actions="true"
            :type="'article'"
            :user="article.user"
          />
        </el-card>
        <el-card
          v-if="relatedArticles.length > 0"
          ref="relArt"
          shadow="never"
          class="mgt-20px article-list"
        >
          <template #header>相关文章</template>
          <article-simple-list
            :articles="relatedArticles"
          ></article-simple-list>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as articleApi from '@/api/article'
import * as favoriteApi from '@/api/favorite'
import { categoryToTrees, formatRelativeTime } from '@/utils/utils'
import { useSettingStore } from '@/store/setting'
import { useCategoryStore } from '@/store/category'
import { useUserStore } from '@/store/user'
import { isMobile } from '@/utils/responsive'
import CommentList from '@/components/CommentList.vue'

const route = useRoute()
const router = useRouter()
const settingStore = useSettingStore()
const categoryStore = useCategoryStore()
const userStore = useUserStore()

const settings = computed(() => settingStore.settings)
const navigations = computed(() => settingStore.navigations)
const categoryMap = computed(() => categoryStore.categoryMap || {})
const categoryTrees = computed(() => categoryStore.categoryTrees || [])
const categories = computed(() => categoryStore.categories || [])
const user = computed(() => userStore.user || { id: 0 })
const permissions = computed(() => userStore.permissions || [])

const article = ref<any>({ user: {} })
const favorite = ref<any>({ id: 0 })
const breadcrumbs = ref<any[]>([])
const relatedArticles = ref<any[]>([])
const cardWidth = ref(0)
const cardOffsetTop = ref(0)

const viewer = ref<any>(null)
const relArt = ref<any>(null)
const commentList = ref<any>(null)

const articleName = computed(() => {
  const nav = navigations.value.find((nav: any) => nav.href === '/article')
  return nav ? nav.title : '文章资讯'
})

const accessUpdate = computed(() => {
  if (user.value.id === article.value.user_id) {
    return true
  }
  return (
    permissions.value.filter((item: any) =>
      item.path.endsWith('UpdateArticle')
    ).length > 0
  )
})
const accessDelete = computed(() => {
  if (user.value.id === article.value.user_id) {
    return true
  }
  return (
    permissions.value.filter((item: any) =>
      item.path.endsWith('DeleteArticle')
    ).length > 0
  )
})
const accessRecommend = computed(() => {
  return (
    permissions.value.filter((item: any) =>
      item.path.endsWith('RecommendArticles')
    ).length > 0
  )
})
const accessForbiden = computed(() => {
  return (
    permissions.value.filter((item: any) =>
      item.path.endsWith('UpdateArticle')
    ).length > 0
  )
})

function getEl(refVal: any): any {
  if (!refVal) return null
  // 模板 ref：取 .value（目标未渲染时为 null）
  if (refVal.value !== undefined) {
    if (refVal.value == null) return null
    const v = refVal.value
    return v.$el ? v.$el : v
  }
  return refVal.$el ? refVal.$el : refVal
}

async function getArticle() {
  const res: any = await articleApi.getArticle({
    identifier: route.params.id,
  })
  if (res.status !== 200) {
    router.replace('/404')
    return
  }
  const articleData: any = {
    favorite_count: 0,
    user: {},
    ...res.data,
  }

  const crumbs: any[] = []
  const trees = categoryToTrees(articleData.category || [])
  if (trees.length > 0) {
    crumbs.push(trees[0])
    while (trees[0].children && trees[0].children.length > 0) {
      trees[0] = trees[0].children[0]
      crumbs.push(trees[0])
    }
  }
  breadcrumbs.value = crumbs
  article.value = articleData
  getRelatedArticles()

  nextTick(() => {
    setTimeout(() => {
      try {
        // 如果是移动端，则直接返回
        if (isMobile.value) return
        const viewerEl = getEl(viewer)
        const viewerInstance = viewerEl && viewerEl.$viewer
        if (!viewerInstance) return
        viewerInstance.options.url = 'src' // 设置图片地址，之前已经全局设置为了data-source，不过只在移动端应用。这里的修改是为了PC端应用
        viewerInstance.update()
      } catch (error) {}
    }, 1000) // 设置延迟，等待内容渲染完成
  })
}

async function getRelatedArticles() {
  const res: any = await articleApi.getRelatedArticles({
    identifier: article.value.identifier,
  })
  if (res.status === 200) {
    relatedArticles.value = res.data.article || []
  }
}

async function getFavorite() {
  if (!user.value.id) {
    return
  }
  const res: any = await favoriteApi.getFavorite({
    document_id: article.value.id,
    type: 1,
  })
  if (res.status === 200) {
    favorite.value = res.data
  }
}

async function createFavorite() {
  if (!user.value.id) {
    ElMessage.error('请先登录')
    return
  }
  const res: any = await favoriteApi.createFavorite({
    document_id: article.value.id,
    type: 1,
  })
  if (res.status === 200) {
    favorite.value = res.data
    article.value.favorite_count++
    ElMessage.success('收藏成功')
  } else {
    ElMessage.error(res.data.message || '收藏失败')
  }
}

function commentSuccess() {
  const cl = commentList.value
  if (cl && cl.getComments) cl.getComments()
}

function handleScroll() {
  const scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop
  try {
    const relArtEl = getEl(relArt)
    if (relArtEl) {
      if (cardWidth.value === 0) {
        cardWidth.value = relArtEl.offsetWidth
        cardOffsetTop.value = relArtEl.offsetTop
      }

      if (scrollTop > cardOffsetTop.value) {
        relArtEl.style.position = 'fixed'
        relArtEl.style.top = '60px'
        relArtEl.style.zIndex = '999'
        relArtEl.style.width = `${cardWidth.value}px`
      } else {
        // 重置固定定位样式（不要使用 style = null，会销毁 CSSStyleDeclaration 对象导致后续报错）
        relArtEl.style.position = ''
        relArtEl.style.top = ''
        relArtEl.style.zIndex = ''
        relArtEl.style.width = ''
      }
    }
  } catch (error) {
    console.log('handleScroll relArt', error)
  }
}

async function deleteFavorite() {
  if (!user.value.id) {
    ElMessage.error('请先登录')
    return
  }
  const res: any = await favoriteApi.deleteFavorite({ id: favorite.value.id })
  if (res.status === 200) {
    favorite.value = { id: 0 }
    article.value.favorite_count--
    ElMessage.success('取消收藏成功')
  } else {
    ElMessage.error(res.data.message || '取消收藏失败')
  }
}

function deleteArticle() {
  ElMessageBox.confirm('此操作将删除该文章, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const res: any = await articleApi.deleteArticle({
        id: article.value.id,
      })
      if (res.status === 200) {
        ElMessage.success('删除成功')
        router.push('/article')
      } else {
        ElMessage.error(res.data.message || '删除失败')
      }
    })
    .catch(() => {})
}

async function recommendArticle(command: string) {
  const res: any = await articleApi.recommendArticles({
    article_id: [article.value.id],
    is_recommend: command === 'recommend',
  })
  if (res.status === 200) {
    ElMessage.success('操作成功')
    getArticle()
  } else {
    ElMessage.error(res.data.message)
  }
}

async function checkArticle(command: string) {
  const res: any = await articleApi.checkArticles({
    article_id: [article.value.id],
    status: command === 'pass' ? 1 : 2,
  })
  if (res.status === 200) {
    ElMessage.success('操作成功')
    getArticle()
  } else {
    ElMessage.error(res.data.message)
  }
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  if (categories.value.length === 0) {
    await categoryStore.getCategories()
  }
  await getArticle()
  await getFavorite()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss">
.page-article {
  .el-breadcrumb {
    margin-top: 15px;
    .el-breadcrumb__inner a,
    .el-breadcrumb__inner.is-link {
      color: #666;
    }
    .el-breadcrumb__item:last-child .el-breadcrumb__inner {
      color: #777;
    }
    .el-breadcrumb__inner a:hover,
    .el-breadcrumb__inner.is-link:hover {
      color: #409eff;
    }
  }
  .el-card__header {
    h1 {
      font-size: 24px;
      font-weight: 400;
      margin: 0;
      color: #111;
      .icon-recommend {
        height: 30px;
        vertical-align: middle;
      }
    }
  }
  [data-w-e-type='todo'] {
    input {
      margin-right: 5px;
    }
  }
  .article-info {
    font-size: 13px;
    span {
      margin-right: 10px;
      &.float-right {
        margin-right: 0;
      }
    }
  }
  .article-list {
    .el-card__body {
      padding-top: 10px;
    }
    a {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px dashed #efefef;
    }
  }
  article {
    line-height: 180%;
    // min-height: 300px;
    word-wrap: break-word;
    img {
      max-width: 100% !important;
      cursor: zoom-in;
      height: auto !important;
      &:hover {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border-radius: 4px !important;
        overflow: hidden;
      }
    }
    .w-e-text-container [data-slate-editor] blockquote {
      border-left-width: 4px !important;
    }
    blockquote {
      padding: 10px;
      color: #777;
      font-size: 0.95em;
      background-color: #f6f8fa;
    }
  }
  .m-userinfo {
    display: flex;
    align-items: center;
    color: #999;
    .user-profile {
      margin-left: 10px;
      position: relative;
      top: -4px;
    }
    small {
      font-size: 12px;
    }
    .article-info {
      margin-top: 15px;
      color: #999;
      font-size: 12px;
      flex: 1;
      text-align: right;
      span {
        margin-right: 0;
        margin-left: 10px;
      }
    }
  }
  @media screen and (max-width: 768px) {
    .article-list {
      position: relative !important;
      width: 100% !important;
      top: 0 !important;
    }
  }
  .source {
    font-size: 15px;
    color: #555;
    background-color: #f9f9f9;
    padding: 1px 15px 15px;
    border-radius: 6px;
    margin: 10px 0;
    a {
      // margin-left: 10px;
      color: #409eff;
      word-break: break-all;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>