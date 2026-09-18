<template>
  <div class="page page-document">
    <el-row :gutter="20">
      <el-col :span="scaleSpan" :xs="24" class="doc-left">
        <el-card ref="docMain" shadow="never" class="doc-main">
          <template #header>
            <div class="clearfix">
              <h1 v-if="document.id > 0">
                <img
                  :src="`/static/images/${document.icon}_24.png`"
                  :alt="`${document.icon}文档`"
                />
                {{ document.title }}
                <img
                  v-if="document.recommend_at"
                  class="icon-recommend"
                  src="/static/images/recommend.png"
                  alt="推荐"
                />
                <el-popover
                  v-if="document.id > 0"
                  class="hidden-xs-only"
                  placement="bottom"
                  width="200"
                  trigger="hover"
                >
                  <div id="qrcode" ref="qrcode" class="qrcode text-center"></div>
                  <template #reference>
                    <span target="_blank" class="share-wechat">
                      <i class="fa fa-qrcode"></i>
                    </span>
                  </template>
                </el-popover>
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
                    v-if="accessUpdate"
                    link
                    :loading="showUpdating"
                    @click="showUpdateDocument"
                    ><el-icon><Edit /></el-icon>编辑文档</el-button
                  >
                  <el-button
                    v-if="accessDelete"
                    link
                    @click="deleteDocument"
                    ><el-icon><Delete /></el-icon>删除文档</el-button
                  >
                  <template>
                    <!-- 管理员权限 -->
                    <el-dropdown v-if="accessForbiden" @command="setForbiden">
                      <span class="el-dropdown-link">
                        <el-button link>文档启禁</el-button>
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="disable"
                            >禁用文档</el-dropdown-item
                          >
                          <el-dropdown-item command="enable"
                            >启用文档</el-dropdown-item
                          >
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                    &nbsp;
                    <el-dropdown v-if="accessRecommend" @command="setRecommend">
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
                            >推荐文档</el-dropdown-item
                          >
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </template>
                </div>
              </h1>
              <el-skeleton v-else animated>
                <template #template
                  ><el-skeleton-item variant="h1" style="width: 70%"
                /></template>
              </el-skeleton>
              <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                  <router-link to="/">
                    <el-icon><House /></el-icon> 首页
                  </router-link>
                </el-breadcrumb-item>
                <el-breadcrumb-item>
                  <router-link to="/category">全部文档</router-link>
                </el-breadcrumb-item>
                <template v-if="breadcrumbs.length < 3">
                  <el-breadcrumb-item
                    v-for="breadcrumb in breadcrumbs"
                    :key="'bread-' + breadcrumb.id"
                  >
                    <router-link :to="`/category/${breadcrumb.id}`">
                      {{ breadcrumb.title }}
                    </router-link>
                  </el-breadcrumb-item>
                </template>
                <template v-else>
                  <el-breadcrumb-item>
                    <router-link :to="`/category/${breadcrumbs[0].id}`">
                      {{ breadcrumbs[0].title }}
                    </router-link>
                  </el-breadcrumb-item>
                  <el-breadcrumb-item>...</el-breadcrumb-item>
                  <el-breadcrumb-item>
                    <router-link
                      :to="`/category/${breadcrumbs[breadcrumbs.length - 1].id}`"
                      >{{ breadcrumbs[breadcrumbs.length - 1].title
                      }}</router-link
                    >
                  </el-breadcrumb-item>
                </template>
                <el-breadcrumb-item>文档阅览</el-breadcrumb-item>
              </el-breadcrumb>
              <div class="float-right doc-info">
                <span>
                  <el-icon><Document /></el-icon>
                  {{ formatBytes(document.size) }}
                </span>
                <span>
                  <el-icon><Files /></el-icon>
                  {{ document.pages || '-' }} 页
                </span>
                <span v-if="settings.display.show_document_download_count">
                  <el-icon><Download /></el-icon>
                  {{ document.download_count || 0 }} 下载
                </span>
                <span v-if="settings.display.show_document_view_count">
                  <el-icon><View /></el-icon>
                  {{ document.view_count || 0 }} 浏览
                </span>
                <span>
                  <el-icon><ChatDotRound /></el-icon>
                  {{ document.comment_count || 0 }} 评论
                </span>
                <span v-if="settings.display.show_document_favorite_count">
                  <el-icon><Star /></el-icon>
                  {{ document.favorite_count || 0 }} 收藏
                </span>
                <span v-if="!settings.display.show_document_descriptions">
                  <el-rate
                    v-model="document.score"
                    disabled
                    show-score
                    text-color="#ff9900"
                    score-template="{value}"
                  ></el-rate>
                </span>
              </div>
            </div>
          </template>
          <template v-if="tips">
            <el-alert
              type="warning"
              effect="dark"
              :title="tips"
              show-icon
              :closable="false"
            ></el-alert>
            <div class="mgt-20px"></div>
          </template>

          <template v-for="item in advertisements">
            <div
              v-if="item.position == 'document_top'"
              :key="item.position + item.id"
              v-safe-html="item.content"
            ></div>
          </template>

          <el-descriptions
            v-if="settings.display.show_document_descriptions"
            class="document-descriptions"
            :column="isMobile ? 1 : 3"
            border
            direction="vertical"
          >
            <el-descriptions-item
              v-for="item in descriptions"
              :key="'desc-' + item.label"
              :span="item.name == 'description' ? 3 : 1"
              label-class-name="descriptions-label"
            >
              <template #label>
                <i :class="item.icon"></i>
                {{ item.label }}
              </template>
              <span v-if="item.name === 'score'">
                <el-rate
                  v-model="item.value"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                ></el-rate>
              </span>
              <div v-else-if="item.name === 'description'">
                <div v-if="item.value.length > 255">
                  <div
                    ref="description"
                    class="description"
                    :class="showContent ? 'description-lg' : ''"
                  >
                    {{ item.value }}
                  </div>
                  <div class="text-center">
                    <el-button
                      v-if="showContent"
                      link
                      size="small"
                      @click="toggleContent"
                      >收起内容</el-button
                    >
                    <el-button
                      v-else
                      link
                      size="small"
                      @click="toggleContent"
                      >展开内容</el-button
                    >
                  </div>
                </div>
                <div v-else class="description">{{ item.value }}</div>
              </div>
              <div v-else>{{ item.value }}</div>
            </el-descriptions-item>
          </el-descriptions>
          <el-descriptions
            v-if="
              settings.display.show_document_descriptions &&
              (document.source || document.source_url)
            "
            class="document-descriptions"
            border
            style="margin-top: -21px"
          >
            <el-descriptions-item label-class-name="descriptions-label">
              <template #label>
                <el-icon><Link /></el-icon>
                来源
              </template>
              <a
                v-if="document.source_url"
                :href="document.source_url"
                rel="nofollow"
                target="_blank"
                class="el-link el-link--default"
              >
                {{ document.source || document.source_url }}
              </a>
              <span v-else>
                {{ document.source }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
          <div ref="docPages" class="doc-pages" @contextmenu.prevent>
            <el-skeleton v-if="!document.id" animated>
              <template #template>
                <div style="background-color: #f6f6f6; padding: 5px">
                  <el-skeleton-item
                    variant="image"
                    style="width: 100%; height: 520px"
                  />
                  <div style="height: 5px"></div>
                  <el-skeleton-item
                    variant="image"
                    style="width: 100%; height: 520px"
                  />
                </div>
              </template>
            </el-skeleton>
            <div v-if="isMobile">
              <div v-for="(page, index) in pages" :key="index + page.src">
                <el-image
                  :src="assetUrl(page.src)"
                  :alt="page.alt"
                  :data-source="assetUrl(page.lazySrc)"
                  lazy
                  :preview-src-list="pages.map((p) => assetUrl(p.lazySrc))"
                  :initial-index="index"
                  preview-teleported
                  class="doc-page"
                  :style="{
                    width: pageWidth + 'px',
                    height: pageHeight + 'px',
                  }"
                ></el-image>
                <div
                  v-if="randomAdvertisement()"
                  class="doc-page"
                  v-safe-html="randomAdvertisement().content"
                ></div>
              </div>
            </div>
            <div v-else>
              <div v-for="(page, index) in pages" :key="index + page.src">
                <el-image
                  :src="assetUrl(page.src)"
                  :alt="page.alt"
                  :data-source="assetUrl(page.lazySrc)"
                  lazy
                  class="doc-page"
                  :style="{
                    width: pageWidth + 'px',
                    height: pageHeight + 'px',
                  }"
                ></el-image>
                <div
                  v-if="randomAdvertisement()"
                  class="doc-page"
                  v-safe-html="randomAdvertisement().content"
                ></div>
              </div>
            </div>
          </div>
          <div class="doc-page-more text-center">
            <div>下载文档到本地，方便使用</div>
            <el-button
              type="primary"
              :size="isMobile ? 'default' : ''"
              @click="showDownload"
              ><el-icon><Download /></el-icon>下载文档({{
                formatBytes(document.size)
              }})</el-button
            >
            <div v-if="document.preview - pages.length > 0">
              共 {{ document.pages }} 页， 还有
              {{ document.preview - pages.length }} 页可预览，
              <span class="el-link el-link--primary" @click="continueRead"
                >继续阅读</span
              >
            </div>
            <template v-else>
              <div v-if="document.pages != document.preview" class="text-muted">
                <small>
                  - 可预览页数已用完，剩余
                  {{ document.pages - document.preview }} 页请下载阅读 -
                </small>
              </div>
            </template>
          </div>
          <div class="moreinfo">
            <div class="share-info">
              本文档由
              <router-link
                :to="`/user/${document.user_id}`"
                class="el-link el-link--primary"
                >{{ document.user.realname || '未命名用户' }}</router-link
              >
              于
              <span class="text-muted">
                {{ formatDatetime(document.created_at) }}
              </span>
              上传分享
            </div>
            <div class="btn-actions">
              <el-button
                type="primary"
                :size="isMobile ? 'default' : ''"
                plain
                @click="showReport"
                ><el-icon><Warning /></el-icon>举报</el-button
              >
              <el-button
                v-if="favorite.id > 0"
                type="primary"
                plain
                class="float-right hidden-xs-only"
                @click="deleteFavorite"
                ><el-icon><StarFilled /></el-icon>取消收藏</el-button
              >
              <el-button
                v-else
                type="primary"
                class="float-right hidden-xs-only"
                @click="createFavorite"
                ><el-icon><Star /></el-icon>收藏</el-button
              >
            </div>
          </div>
        </el-card>
        <el-card
          v-if="isMobile && relatedDocuments.length > 0"
          shadow="never"
          class="mgt-20px relate-docs"
        >
          <template #header>相关文档</template>
          <document-simple-list
            :docs="isMobile ? relatedDocuments.slice(0, 5) : relatedDocuments"
            :show-popover="!isMobile"
          />
        </el-card>

        <template v-for="item in advertisements">
          <div
            v-if="item.position == 'document_bottom'"
            :key="item.position + item.id"
            v-safe-html="item.content"
          ></div>
        </template>

        <el-card
          v-if="document.id > 0"
          ref="commentBox"
          shadow="never"
          class="mgt-20px"
        >
          <div>
            <span v-if="disabledScore" class="score-tips">我的评分</span>
            <span v-else class="score-tips">文档评分</span>
            <el-rate
              v-model="score"
              :disabled="disabledScore"
              show-text
              :texts="[
                '该文档令人失望',
                '该文档不怎么样',
                '该文档一般般',
                '该文档很让我满意',
                '该文档非常棒',
              ]"
              @change="setDocumentScore"
            ></el-rate>
          </div>
          <FormComment
            :document-id="Number(document.id)"
            class="mgt-20px"
            @success="commentSuccess"
          />
          <CommentList ref="commentList" :document-id="Number(document.id)" />
        </el-card>
      </el-col>
      <el-col :span="24 - scaleSpan" class="hidden-xs-only document-author">
        <el-card shadow="never">
          <template #header>分享用户</template>
          <user-card :hide-actions="true" :user="document.user" />
        </el-card>
        <el-card
          v-if="relatedDocuments.length > 0"
          ref="relateDocs"
          shadow="never"
          class="mgt-20px relate-docs"
        >
          <template #header>相关文档</template>
          <div :style="`max-height: ${footerTop - 188}px;overflow-y: auto;`">
            <document-simple-list :docs="relatedDocuments" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div class="fixed-buttons">
      <el-card shadow="never">
        <el-row>
          <el-col :span="18">
            <el-button-group class="btn-actions">
              <el-tooltip v-if="isMobile" content="文档点评">
                <el-button @click="gotoComment"
                  ><el-icon><ChatDotRound /></el-icon
                ></el-button>
              </el-tooltip>
              <el-tooltip content="全屏阅读" class="hidden-xs-only">
                <el-button @click="fullscreen"
                  ><el-icon><FullScreen /></el-icon
                ></el-button>
              </el-tooltip>
              <el-tooltip :content="favorite.id > 0 ? '取消收藏' : '收藏文档'">
                <el-button
                  v-if="favorite.id > 0"
                  @click="deleteFavorite"
                  ><el-icon><StarFilled /></el-icon
                ></el-button>
                <el-button v-else @click="createFavorite"
                  ><el-icon><Star /></el-icon
                ></el-button>
              </el-tooltip>
              <el-tooltip content="缩小" class="hidden-xs-only">
                <el-button
                  :disabled="scaleSpan === 18"
                  @click="zoomOut"
                  ><el-icon><ZoomOut /></el-icon
                ></el-button>
              </el-tooltip>
              <el-tooltip content="放大" class="hidden-xs-only">
                <el-button
                  :disabled="scaleSpan === 24"
                  @click="zoomIn"
                  ><el-icon><ZoomIn /></el-icon
                ></el-button>
              </el-tooltip>
              <el-tooltip content="上一页" class="hidden-xs-only">
                <el-button
                  :disabled="currentPage === 1"
                  @click="prevPage"
                  ><el-icon><ArrowUp /></el-icon
                ></el-button>
              </el-tooltip>
              <el-tooltip content="当前页数/总页数" class="hidden-xs-only">
                <el-button>{{ currentPage }}/{{ document.pages }}</el-button>
              </el-tooltip>
              <el-tooltip content="下一页" class="hidden-xs-only">
                <el-button
                  :disabled="currentPage === document.preview"
                  @click="nextPage"
                  ><el-icon><ArrowDown /></el-icon
                ></el-button>
              </el-tooltip>
            </el-button-group>
            <el-button
              class="btn-comment hidden-xs-only"
              @click="gotoComment"
              ><el-icon><ChatDotRound /></el-icon>文档点评</el-button
            >
            <el-button-group class="float-right">
              <el-button type="primary" class="btn-coin">
                {{ document.price || 0 }}
                <span>{{ settings.system.credit_name || '魔豆' }}</span>
              </el-button>
              <el-button
                type="primary"
                @click="showDownload"
              >
                <el-icon><Download /></el-icon>
                下载文档
                <span class="hidden-xs-only"
                  >({{ formatBytes(document.size) }})</span
                >
              </el-button>
            </el-button-group>
          </el-col>
          <el-col :span="6" class="text-right hidden-xs-only">
            <el-button @click="scrollTop"><el-icon><Top /></el-icon>回到顶部</el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>
    <el-drawer
      v-model="reportVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :close-on-click-modal="false"
    >
      <template #header>
        <el-page-header content="举报文档" @back="reportVisible = false">
        </el-page-header>
      </template>
      <div style="padding: 0 20px">
        <FormReport
          ref="reportForm"
          :init-report="report"
          :is-admin="false"
          @success="formReportSuccess"
        />
      </div>
    </el-drawer>
    <el-drawer
      v-model="updateDocumentVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :close-on-click-modal="false"
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
          :init-document="updateDocument"
          :is-admin="false"
          @success="updateDocumentSuccess"
        />
      </div>
    </el-drawer>
    <el-dialog
      v-model="downloadVisible"
      title="文档下载"
      width="480px"
      :close-on-click-modal="false"
    >
      <form-download :document="document" @success="downloadSuccess" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import QRCode from 'qrcode'
import * as documentApi from '@/api/document'
import * as favoriteApi from '@/api/favorite'
import {
  formatDatetime,
  formatBytes,
  getIcon,
  genPrevPage,
  categoryToTrees,
} from '@/utils/utils'
import { documentStatusOptions, advertisementPositions } from '@/utils/enum'
import { getAdvertisementByPosition } from '@/api/advertisement'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { useCategoryStore } from '@/store/category'
import { assetUrl } from '@/utils/asset'
import { setPageMeta } from '@/router'
import FormDownload from '@/components/FormDownload.vue'
import CommentList from '@/components/CommentList.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const settingStore = useSettingStore()
const categoryStore = useCategoryStore()

const settings = computed(() => settingStore.settings)
const user = computed(() => userStore.user || { id: 0 })
const permissions = computed(() => userStore.permissions || [])
const categoryTrees = computed(() => categoryStore.categoryTrees)

// —— 响应式数据（对应原 data）——
const advertisements = ref<any[]>([])
const footerTop = ref(0)

const docs = ref<any[]>([])
const document = ref<any>({
  id: 0,
  score: 4.0,
  user: { id: 0 },
  attachment: { hash: '' },
})
const updateDocument = ref<any>({})
const showContent = ref(false)
const score = ref<any>(null)
const disabledScore = ref(false)
const downloadVisible = ref(false)

const routeId = route.params.id as string
const documentId = ref(routeId.length === 16 ? 0 : parseInt(routeId))
const documentUUID = ref(routeId || '')

const pages = ref<any[]>([])
const pagesPerRead = 10
const pageHeight = ref(0)
const pageWidth = ref(0)
const currentPage = ref(1)
const currentPageFullscreen = ref(1)
const breadcrumbs = ref<any[]>([])
const favorite = ref<any>({ id: 0 })
const scaleSpan = ref(18)
const loadingImage = '/static/images/loading.svg'
const reportVisible = ref(false)
const report = ref<any>({ document_id: 0, document_title: '', reason: 1 })
const relatedDocuments = ref<any[]>([])
const cardWidth = ref(0)
const cardOffsetTop = ref(0)
const tips = ref('')
const descriptions = ref<any[]>([])
const updateDocumentVisible = ref(false)
const metaDescription = ref('')
const showUpdating = ref(false)

// —— 模板 ref ——
const docMain = ref<any>(null)
const docPages = ref<any>(null)
const qrcode = ref<any>(null)
const description = ref<any>(null)
const commentBox = ref<any>(null)
const commentList = ref<any>(null)
const relateDocs = ref<any>(null)
const reportForm = ref<any>(null)

// —— computed（对应 mapGetters 后的派生值）——
const accessUpdate = computed(() => {
  if (user.value.id === document.value.user_id) return true
  return (
    permissions.value.filter((item: any) => item.path.endsWith('UpdateDocument'))
      .length > 0
  )
})
const accessDelete = computed(() => {
  if (user.value.id === document.value.user_id) return true
  return (
    permissions.value.filter((item: any) => item.path.endsWith('DeleteDocument'))
      .length > 0
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
    permissions.value.filter((item: any) => item.path.endsWith('UpdateDocument'))
      .length > 0
  )
})

// —— 公共方法 ——
function getEl(refVal: any): any {
  const v = refVal && refVal.value != null ? refVal.value : refVal
  return v && v.$el ? v.$el : v
}

function setFooterTop() {
  try {
    footerTop.value =
      window.document.querySelector('footer')?.getBoundingClientRect().top || 0
  } catch (error) {
    // ignore
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

function onResize() {
  calcPageSize()
}

function onScroll() {
  handleScroll()
  setFooterTop()
}

function updateDocumentSuccess() {
  updateDocumentVisible.value = false
  getDocument()
}

async function showUpdateDocument() {
  showUpdating.value = true
  await getDocument(true)
  updateDocumentVisible.value = true
  showUpdating.value = false
  const doc = { ...document.value }
  delete doc.icon
  updateDocument.value = doc
}

function setForbiden(command: string) {
  ElMessageBox.confirm(
    `您确定要${command === 'enable' ? '启用' : '禁用'}文档《${
      document.value.title
    }》吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const doc = { ...document.value }
      delete doc.icon
      if (command === 'enable') {
        doc.status = doc.pages > 0 ? 2 : 0 // 更新文档状态为启用状态
      } else {
        doc.status = 4 // 更新文档状态为禁用状态
      }
      const res: any = await documentApi.updateDocument(doc)
      if (res.status === 200) {
        ElMessage({ type: 'success', message: '操作成功!' })
        getDocument()
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

async function setRecommend(command: string) {
  let recommend = 1 // 推荐
  if (command === 'cancel') {
    recommend = 0 // 取消推荐
  }
  const res: any = await documentApi.setDocumentRecommend({
    id: [document.value.id],
    type: recommend,
  })
  if (res.status === 200) {
    ElMessage.success('操作成功')
    getDocument()
  } else {
    ElMessage.error(res.data.message)
  }
}

function toggleContent() {
  if (showContent.value) {
    nextTick(() => {
      try {
        const el = description.value
        const nodes = Array.isArray(el) ? el : [el]
        if (nodes[0]) nodes[0].scrollTo(0, 0)
      } catch (error) {
        console.log(error)
      }
    })
  }
  showContent.value = !showContent.value
}

function deleteDocument() {
  ElMessageBox.confirm(`您确定要删除文档《${document.value.title}》吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const res: any = await documentApi.deleteDocument({ id: document.value.id })
      if (res.status === 200) {
        ElMessage({ type: 'success', message: '删除成功!' })
        // 跳转到首页
        router.push('/')
      } else {
        ElMessage.error(res.data.message)
      }
    })
    .catch(() => {})
}

async function getDocument(withAllContent = false) {
  if (!documentId.value && !documentUUID.value) {
    router.replace('/404')
    return
  }

  const res: any = await documentApi.getDocument({
    id: documentId.value,
    uuid: documentUUID.value,
    with_author: !withAllContent, // 不需要获取作者信息
    with_all_content: withAllContent,
  })

  if (res.status !== 200) {
    ElMessage.error(res.data.message || res.message || '文档不存在')
    router.replace('/404')
    return
  }
  const doc: any = {
    user: document.value.user,
    ...res.data,
  }
  doc.score = parseFloat(doc.score) / 100 || 4.0

  if (!doc.preview || doc.preview >= doc.pages) {
    doc.preview = doc.pages
  }

  // 限定每次预览页数
  let preview = 2
  if (doc.preview < preview) {
    preview = doc.preview
  }

  // 限定预览页数，拼装图片链接
  const pgs: any[] = []
  for (let i = 1; i <= preview; i++) {
    const src = genPrevPage(
      doc.attachment.hash,
      i,
      doc.preview_ext,
      doc.enable_gzip
    )
    pgs.push({
      lazySrc: src,
      src,
      alt: `${doc.title} 第${i + 1}页`,
    })
  }

  const crumbs: any[] = []
  const trees = categoryToTrees(doc.category || [])
  if (trees.length > 0) {
    crumbs.push(trees[0])
    while (trees[0].children && trees[0].children.length > 0) {
      trees[0] = trees[0].children[0]
      crumbs.push(trees[0])
    }
  }
  breadcrumbs.value = crumbs
  doc.icon = getIcon(doc.ext)
  pages.value = pgs
  document.value = doc
  pageWidth.value = docPages.value ? docPages.value.offsetWidth : 0
  pageHeight.value = docPages.value
    ? (docPages.value.offsetWidth / doc.width) * doc.height
    : 0
  // SEURL：文档标题与描述
  const sitename = settingStore.settings?.system?.sitename || '图书馆 - 山河大学'
  setPageMeta(`${doc.title} - ${sitename}`, doc.description || doc.summary || '')

  if (doc.status !== 2) {
    // 2 为文档已转换成功，不需要展示提示
    documentStatusOptions.forEach((item: any) => {
      if (item.value === doc.status || (!doc.status && item.value === 0)) {
        tips.value = `当前文档【${item.label}】，暂时无法正常提供预览，建议您下载到本地进行阅读。`
      }
    })
  } else {
    tips.value = ''
  }

  let descriptionText = (doc.description || '-').trim()
  if (descriptionText) descriptionText = descriptionText + '...'
  metaDescription.value = descriptionText.replace(/ /g, '').substr(0, 200) // header meta 使用
  let language = doc.language
  ;(settings.value.language || []).forEach((item: any) => {
    if (item.code === doc.language) {
      language = item.language
    }
  })

  const item = language
    ? {
        label: '语言',
        value: language,
        icon: 'fa fa-language',
        name: 'language',
      }
    : {
        label: '上传',
        value: doc.user.realname || '未命名用户',
        icon: 'el-icon-user',
        name: 'username',
      }

  descriptions.value = [
    item,
    {
      label: '格式',
      value: doc.ext,
      icon: 'el-icon-document',
      name: 'ext',
    },
    {
      label: '评分',
      value: doc.score,
      icon: 'el-icon-star-on',
      name: 'score',
    },
    {
      label: '概览',
      value: doc.content || descriptionText,
      icon: 'el-icon-document',
      name: 'description',
    },
  ]
  nextTick(() => {
    genQrcode()
  })
}

function calcPageSize() {
  try {
    pageWidth.value = docPages.value ? docPages.value.offsetWidth : 0
    pageHeight.value = docPages.value
      ? (docPages.value.offsetWidth / document.value.width) *
        document.value.height
      : 0
  } catch (error) {
    // ignore
  }
}

function showReport() {
  report.value.document_id = document.value.id
  report.value.document_title = document.value.title
  reportVisible.value = true
}

function formReportSuccess() {
  reportVisible.value = false
}

function handleScroll() {
  const scrollTop =
    window.document.documentElement.scrollTop || window.document.body.scrollTop
  // 还有5像素的border
  let current = Math.round(scrollTop / (pageHeight.value + 5)) + 1
  if (current > pages.value.length) {
    current = pages.value.length
  }
  currentPage.value = current
  if (pages.value[current - 1]) {
    pages.value[current - 1].src = pages.value[current - 1].lazySrc
  }
  if (current < pages.value.length) {
    // 多加载一页
    pages.value[current].src = pages.value[current].lazySrc
  }
  // 右侧相关文档固定
  try {
    const relateDocsEl = getEl(relateDocs)
    if (relateDocsEl) {
      if (cardWidth.value === 0) {
        cardWidth.value = relateDocsEl.offsetWidth
        cardOffsetTop.value = relateDocsEl.offsetTop
      }

      if (scrollTop > cardOffsetTop.value) {
        relateDocsEl.style.position = 'fixed'
        relateDocsEl.style.top = '60px'
        relateDocsEl.style.zIndex = '999'
        relateDocsEl.style.width = `${cardWidth.value}px`
      } else {
        relateDocsEl.style = null
      }
    }
  } catch (error) {
    console.log('handleScroll relateDocs', error)
  }
}

function handleFullscreenScroll() {
  try {
    const docMainEl = getEl(docMain)
    const scrollTop = docMainEl.scrollTop
    if (scrollTop === 0) {
      // 当退出全屏的时候，会触发这个事件，但是scrollTop为0，所以直接返回，避免直接将当前页码重置为1
      return
    }
    let current = Math.round(scrollTop / (pageHeight.value + 5)) + 1
    if (current > pages.value.length) {
      current = pages.value.length
    }
    currentPageFullscreen.value = current
  } catch (error) {
    console.log(error)
  }
}

function scrollTop() {
  scrollTo(0)
}

function gotoComment() {
  try {
    scrollTo(getEl(commentBox).offsetTop)
  } catch (error) {
    console.log('gotoComment', error)
  }
}

function commentSuccess() {
  const cl = commentList.value
  if (cl && cl.getComments) cl.getComments()
}

async function showDownload() {
  await userStore.checkAndRefreshUser()
  downloadVisible.value = true
}

function downloadSuccess() {
  downloadVisible.value = false
  userStore.getUser()
}

async function getRelatedDocuments() {
  const res: any = await documentApi.getRelatedDocuments({
    id: document.value.id,
  })
  if (res.status === 200) {
    relatedDocuments.value = res.data.document || []
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    const page = currentPage.value - 1
    scrollToPage(page)
  }
}

function nextPage() {
  if (currentPage.value < document.value.preview) {
    const page = currentPage.value + 1
    if (page > pages.value.length) {
      continueRead()
    }
    scrollToPage(page)
  }
}

function scrollToPage(page: number) {
  const top = (page - 1) * pageHeight.value
  scrollTo(top)
}

function scrollTo(position: number) {
  window.document.scrollingElement?.scrollTo({
    top: position,
    behavior: 'smooth',
  })
  const docMainEl = getEl(docMain)
  if (docMainEl) {
    docMainEl.scrollTo({
      top: position,
      behavior: 'smooth',
    })
  }
}

function getDocMainWidth() {
  const el = getEl(docMain)
  return el ? el.offsetWidth : 0
}

// 缩小
function zoomOut() {
  if (scaleSpan.value > 18) {
    const page = currentPage.value
    scaleSpan.value -= 6
    nextTick(() => {
      zoomSetPage(page)
    })
  }
}

// 放大
function zoomIn() {
  if (scaleSpan.value < 24) {
    const page = currentPage.value
    scaleSpan.value += 6
    nextTick(() => {
      zoomSetPage(page)
    })
  }
}

function zoomSetPage(page: number) {
  const newPageWidth = getDocMainWidth() - 20 * 2 // 减去两个内边距（因为设置了border-box，所以两个border的宽度不计）
  const newPageHeight = (newPageWidth / pageWidth.value) * pageHeight.value
  pageWidth.value = newPageWidth
  pageHeight.value = newPageHeight
  nextTick(() => {
    scrollToPage(page)
  })
}

// 全屏
function fullscreen() {
  // 全屏前，将当前浏览的页码赋值到全屏时浏览的页码
  currentPageFullscreen.value = currentPage.value
  const el = getEl(docMain) as any
  if (el.requestFullscreen) {
    el.requestFullscreen()
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen()
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen()
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen()
  }
}

function fullscreenchange() {
  const page = currentPageFullscreen.value
  if (window.document.fullscreenElement) {
    // 全屏
    scaleSpan.value = 24
    pages.value = pages.value.map((item: any) => {
      item.src = item.lazySrc
      return item
    })
  } else {
    scaleSpan.value = 18
  }
  nextTick(() => {
    zoomSetPage(page)
  })
}

async function getFavorite() {
  const res: any = await favoriteApi.getFavorite({
    document_id: document.value.id,
  })
  if (res.status === 200) {
    favorite.value = res.data || { id: 0 }
  }
}

// 取消收藏
async function deleteFavorite() {
  const res: any = await favoriteApi.deleteFavorite({ id: favorite.value.id })
  if (res.status === 200) {
    ElMessage.success('取消收藏成功')
    favorite.value = { id: 0 }
    document.value.favorite_count--
  } else {
    ElMessage.error(res.data.message)
  }
}

// 添加收藏
async function createFavorite() {
  const res: any = await favoriteApi.createFavorite({
    document_id: document.value.id,
  })
  if (res.status === 200) {
    ElMessage.success('收藏成功')
    favorite.value = res.data
    document.value.favorite_count++
  } else {
    ElMessage.error(res.data.message)
  }
}

function continueRead() {
  const pagesPerReadVal =
    settings.value.display.pages_per_read || pagesPerRead
  let end = pages.value.length + pagesPerReadVal
  if (end > document.value.preview) {
    end = document.value.preview
  }
  let j = 0
  let startLazyLoad = 2
  if (window.document.fullscreenElement) startLazyLoad = 5
  for (let i = pages.value.length + 1; i <= end; i++) {
    j += 1
    const src = genPrevPage(
      document.value.attachment.hash,
      i,
      document.value.preview_ext,
      document.value.enable_gzip
    )
    pages.value.push({
      // 前两页，直接不要懒加载，如果非全屏
      src: j <= startLazyLoad ? src : loadingImage,
      lazySrc: src,
      alt: `${document.value.title} 第${i + 1}页`,
    })
  }
}

async function setDocumentScore() {
  if (!score.value) {
    return
  }
  const res: any = await documentApi.setDocumentScore({
    document_id: document.value.id,
    score: score.value * 100,
  })
  if (res.status === 200) {
    ElMessage.success('提交评分成功')
    disabledScore.value = true
  } else {
    ElMessage.error(res.data.message)
  }
}

async function getDocumentScore() {
  // 判断用户是否已登录
  let userId = 0
  try {
    userId = user.value.id || 0
  } catch (error) {
    // ignore
  }
  if (!userId) {
    return
  }
  const res: any = await documentApi.getDocumentScore({
    document_id: document.value.id,
  })
  if (res.status === 200) {
    const s = res.data.score / 100 || null
    score.value = s
    if (s) disabledScore.value = true
  }
}

async function genQrcode() {
  const el = qrcode.value
  if (!el) return
  // 把之前可能存在的二维码清空
  el.innerHTML = '<div style="margin-bottom:10px">手机扫码，畅享阅读</div>'
  const url = await QRCode.toDataURL(location.href, {
    width: 200,
    margin: 1,
    color: { dark: '#000', light: '#fff' },
  })
  const img = window.document.createElement('img')
  img.src = url
  el.appendChild(img)
}

function randomAdvertisement() {
  const list = advertisements.value.filter(
    (item: any) => item.position == 'document_between'
  )
  if (list.length > 0) {
    const index = Math.floor(Math.random() * list.length)
    return list[index]
  }
  return null
}

onMounted(async () => {
  setFooterTop()
  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onScroll)
  window.addEventListener('fullscreenchange', fullscreenchange)
  try {
    const docMainEl = getEl(docMain)
    if (docMainEl) {
      docMainEl.addEventListener('scroll', handleFullscreenScroll)
    }
  } catch (error) {
    console.log(error)
  }

  await getDocument()
  const requests: any[] = [
    getRelatedDocuments(),
    getDocumentScore(),
    getAdvertisements('document'),
  ]
  if (user.value.id) {
    requests.push(getFavorite())
  }
  Promise.all(requests)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('fullscreenchange', fullscreenchange)
  try {
    const docMainEl = getEl(docMain)
    if (docMainEl) {
      docMainEl.removeEventListener('scroll', handleFullscreenScroll)
    }
  } catch (error) {
    console.log(error)
  }
})
</script>

<style lang="scss">
.viewer-canvas > img {
  background-color: #fff;
}
.page-document {
  .doc-main {
    min-height: 90vh;
    overflow: auto;
  }
  .relate-docs {
    .el-card__body {
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }
  h1 {
    margin: 0;
    img {
      position: relative;
      top: 3px;
    }
    .fa-qrcode {
      color: #aaa;
      cursor: pointer;
      margin-left: 5px;
      font-size: 26px;
      top: 2px;
      position: relative;
      &:hover {
        color: unset;
      }
    }
    .actions {
      margin-bottom: -8px;
    }
    .icon-recommend {
      height: 26px;
    }
  }
  .el-breadcrumb {
    font-weight: normal;
    margin-top: 12px;
    color: #565656;
    .el-breadcrumb__inner a,
    .el-breadcrumb__inner.is-link {
      font-weight: normal;
    }
    .el-breadcrumb__separator[class*='icon'] {
      margin: 0 3px;
    }
    .el-breadcrumb__inner {
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 90px;
      display: inline-block;
    }
  }
  .doc-info {
    font-weight: normal;
    position: relative;
    top: -16px;
    font-size: 14px;
    color: #bbb;
    & > span {
      margin-left: 8px;
    }
    .el-rate {
      position: relative;
      top: -2px;
    }
    .el-icon {
      top: 2px;
      position: relative;
    }
  }
  .doc-pages {
    min-height: 640px;
    .doc-page {
      display: block;
      width: 100%;
      box-sizing: border-box;
      border: 5px solid $background-grey-light;
      border-bottom: 0;
      img {
        width: 100%;
        background-color: #fff;
      }
      .el-image__error {
        min-height: 360px;
      }
    }
  }
  .doc-page-more {
    padding: 30px 0;
    border: 5px solid $background-grey-light;
    color: #565656;
    .el-button {
      margin: 10px 0;
    }
  }
  .share-info {
    font-size: 15px;
    color: #666;
    margin: 15px 0;
    .el-link {
      top: -2px;
    }
  }

  .fixed-buttons {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    width: 100%;
    min-width: $min-width;
    background-color: #ecf0f1;
    height: 50px;
    [class*=' el-icon-'],
    [class^='el-icon-'] {
      font-weight: bold;
    }
    .el-card {
      border-radius: 0;
      background-color: transparent;
      width: $default-width;
      max-width: $max-width;
      margin: 0 auto;
      .el-card__body {
        padding: 0;
      }
      .el-button {
        border: 0;
        border-radius: 0;
        padding: 18px 20px;
      }
      .btn-comment {
        top: 1px;
        position: relative;
        background-color: transparent;
        &:hover {
          background-color: #ecf5ff;
        }
      }
      .btn-actions .el-button {
        background-color: transparent;
        &:hover {
          background-color: #ecf5ff;
        }
      }
      .btn-coin {
        background-color: transparent;
        color: #606266;
        cursor: auto;
      }
    }
  }
  .score-tips {
    position: relative;
    top: 3px;
    margin-right: 10px;
    color: #565656;
  }

  .document-descriptions {
    margin-bottom: 20px;
  }
  .descriptions-label {
    width: 80px;
  }
  .description {
    position: relative;
    max-height: 101px;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    line-height: 180%;
    // 只显示4行
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    &.description-lg {
      max-height: unset;
      display: block;
      max-height: 360px;
      overflow-y: auto;
    }
  }
}

@media screen and (max-width: $mobile-width) {
  .el-image-viewer__wrapper {
    .el-image-viewer__actions {
      .el-icon-refresh-left,
      .el-image-viewer__actions__divider,
      .el-icon-refresh-right {
        display: none;
      }
    }
    .el-image-viewer__canvas {
      display: block;
      overflow: auto;
      padding-top: 20px;
      .el-image-viewer__img {
        transform-origin: 0 0 !important;
      }
    }
  }

  .viewer-canvas > img {
    transform: scale(1.2) !important;
  }

  .page-document {
    .doc-left {
      width: 100% !important;
    }
    .doc-info {
      float: left;
      margin-top: 40px;
      & > span {
        margin-left: 0;
        margin-right: 8px;
        display: inline-block;
        margin-top: 5px;
      }
    }
    .doc-main {
      .el-card__body {
        padding-left: 0;
        padding-right: 0;
      }
    }
    .doc-pages {
      .doc-page {
        border-left: 0;
        border-right: 0;
      }
    }
    .doc-page-more {
      border-left: 0;
      border-right: 0;
    }
    .moreinfo {
      padding: 0 15px;
    }
    .fixed-buttons {
      min-width: 100%;
      .el-col-18 {
        width: 100% !important;
      }
      .btn-actions {
        padding-left: 5px;
      }
      .el-card .el-button {
        padding: 19px 15px;
      }
    }
  }
}
</style>