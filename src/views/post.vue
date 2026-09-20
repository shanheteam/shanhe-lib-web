<template>
  <div class="page page-post">
    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 顶部导航栏 -->
      <div class="top-nav">
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item :to="{ path: '/' }">
            <el-icon><House /></el-icon>
            首页
          </el-breadcrumb-item>
          <el-breadcrumb-item>
            {{ article.id > 0 ? '编辑文章' : '发布文章' }}
          </el-breadcrumb-item>
        </el-breadcrumb>

        <div class="nav-actions">
          <div v-if="article.id > 0" class="draft-status">
            <el-icon><Edit /></el-icon>
            <span>编辑中</span>
          </div>
          <el-button
            link
            class="back-link"
            @click="back"
          >
            <el-icon><Back /></el-icon>
            返回
          </el-button>
        </div>
      </div>

      <!-- 权限检查提示 -->
      <el-alert
        v-if="!canIPublish && !loading"
        title="无权限提示"
        type="warning"
        :closable="false"
        show-icon
        class="permission-alert"
      >
        <template #title>
          <span>你暂时无法发布文章</span>
        </template>
        <p>请先登录账号，或联系管理员开通文章发布权限。</p>
        <div style="margin-top: 12px">
          <el-button type="primary" size="small" @click="openLoginDialog('login')">
            前往登录
          </el-button>
          <el-button type="default" size="small" @click="router.push('/')">
            返回首页
          </el-button>
        </div>
      </el-alert>

      <!-- 主内容网格 -->
      <div v-if="canIPublish" class="content-grid">
        <!-- 表单容器 -->
        <div class="form-container">
          <form-article
            v-loading="loading"
            :init-article="article"
            :category-trees="trees"
            :can-i-publish="canIPublish"
            @success="success"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { openLoginDialog } from '@/utils/login'
import { useCategoryStore } from '@/store/category'
import { getArticle } from '@/api/article'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const categoryStore = useCategoryStore()

const loading = ref(true)
const article = ref<any>({
  title: '',
  identifier: '',
  keywords: '',
  description: '',
  content: '',
  id: 0,
  category_id: [],
})

const user = computed(() => userStore.user)
const groups = computed(() => userStore.groups)
const categoryTrees = computed(() => categoryStore.categoryTrees)
const trees = computed(() =>
  categoryTrees.value.filter((item: any) => item.type === 1)
)
const canIPublish = computed(() => {
  if (!user.value || user.value.id <= 0) return false
  return groups.value.some((group: any) => group.enable_article)
})

const getArticleById = async () => {
  const identifier = route.query.identifier
  if (!identifier) {
    return
  }
  const res: any = await getArticle({ identifier })
  if (res.status !== 200) {
    ElMessage.error(res.data.message || '获取文章失败')
    return
  }
  article.value = res.data
}

const success = (a: any) => {
  router.push(`/article/${a.identifier}`)
}

const back = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

onMounted(async () => {
  await userStore.getUserGroups()
  await Promise.all([getArticleById(), categoryStore.getCategories()])
  loading.value = false
})
</script>
