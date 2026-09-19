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
          <el-button
            type="primary"
            size="small"
            @click="router.push('/login')"
          >
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

<style lang="scss">
.page-post {
  min-height: calc(100vh - 150px);
  background-color: var(--app-bg-soft-3);
  border-radius: 12px;
}

// 主要内容区域
.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
  .form-article-container {
    padding: 0 !important;
    background-color: transparent !important;
  }

  // 顶部导航栏 - 简洁现代
  .top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 24px 0;
    border-bottom: 1px solid var(--el-border-color-light);
    margin-bottom: 32px;

    .breadcrumb {
      :deep(.el-breadcrumb) {
        .el-breadcrumb__item {
          .el-breadcrumb__inner {
            color: var(--el-text-color-regular);
            font-size: 14px;
            font-weight: 500;
            transition: color 0.3s ease;

            &:hover {
              color: var(--el-color-primary);
            }

            i {
              margin-right: 6px;
              color: var(--el-text-color-secondary);
            }
          }

          .el-breadcrumb__separator {
            color: var(--el-text-color-placeholder);
            margin: 0 8px;
          }
        }
      }
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .draft-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--el-text-color-secondary);
        background-color: var(--app-bg-soft);
        padding: 4px 12px;
        border-radius: 12px;
        border: 1px solid var(--el-border-color-light);

        i {
          font-size: 13px;
          color: var(--el-color-primary);
        }
      }

      .back-link {
        color: var(--el-text-color-regular);
        font-size: 14px;
        padding: 6px 12px;
        border-radius: 4px;
        transition: all 0.3s ease;

        &:hover {
          color: var(--el-color-primary);
          background-color: var(--app-bg-blue-weak);
        }

        i {
          margin-right: 6px;
        }
      }
    }
  }

  .permission-alert {
    margin-bottom: 24px;
    border-radius: 6px;
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 16px 20px;

    .top-nav {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      padding-bottom: 16px;
      margin-bottom: 20px;

      .nav-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .content-grid {
      .form-container {
        .page-title-area {
          margin-bottom: 20px;
          padding-bottom: 16px;

          .page-title {
            font-size: 20px;
          }

          .page-subtitle {
            font-size: 13px;
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 16px;

    .top-nav {
      .breadcrumb {
        :deep(.el-breadcrumb) {
          .el-breadcrumb__item {
            .el-breadcrumb__inner {
              font-size: 13px;
            }
          }
        }
      }

      .nav-actions {
        .back-link {
          font-size: 13px;
          padding: 4px 8px;
        }
      }
    }

    .content-grid {
      .form-container {
        .page-title-area {
          .page-title {
            font-size: 18px;
          }
        }
      }
    }
  }
}
</style>