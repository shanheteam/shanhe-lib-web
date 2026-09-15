<template>
  <div class="com-home-sidebar">
    <!-- 用户面板 -->
    <aside class="sidebar-card user-panel">
      <el-card shadow="never">
        <template v-if="user.id">
          <div class="user-info">
            <div class="user-avatar">
              <user-avatar :size="60" :user="user" />
            </div>
            <div class="user-details">
              <h3 class="username">{{ user.realname || '未命名用户' }}</h3>
              <small class="signature">
                {{ user.signature || '暂无个性签名' }}
              </small>
            </div>
          </div>
          <div class="user-stats">
            <div class="stat-col">
              <div class="stat-value">{{ user.doc_count || 0 }}</div>
              <div class="stat-name">文档</div>
            </div>
            <div class="stat-col">
              <div class="stat-value">{{ user.article_count || 0 }}</div>
              <div class="stat-name">文章</div>
            </div>
            <div class="stat-col">
              <div class="stat-value">{{ user.credit_count || 0 }}</div>
              <div class="stat-name">{{ creditName }}</div>
            </div>
          </div>
          <div class="user-actions">
            <el-button
              v-if="!todaySign.id"
              type="success"
              class="sign-btn"
              :loading="signing"
              @click="signIn"
            >
              <el-icon><Calendar /></el-icon>
              签到
            </el-button>
            <el-button v-else type="success" plain disabled class="signed-btn">
              <el-icon><CircleCheck /></el-icon>
              已签到
            </el-button>
            <router-link class="me-link" to="/me">
              <el-button class="me-btn">
                <el-icon><User /></el-icon>
                个人中心
              </el-button>
            </router-link>
          </div>
        </template>
        <template v-else>
          <div class="guest-content">
            <div class="guest-avatar">
              <user-avatar :size="60" :user="{}" />
            </div>
            <div class="guest-text">
              <h3>欢迎访问 {{ siteName }}</h3>
              <p>登录后享受更多功能</p>
            </div>
          </div>
          <div class="guest-actions">
            <router-link class="guest-action-item" to="/login">
              <el-button type="primary" class="login-btn">登录</el-button>
            </router-link>
            <router-link class="guest-action-item" to="/register">
              <el-button class="register-btn">注册</el-button>
            </router-link>
          </div>
        </template>
      </el-card>
    </aside>

    <!-- 最新文档 -->
    <aside v-if="latestDocuments.length" class="sidebar-card latest-updates">
      <el-card shadow="never">
        <template #header>
          <h3 class="card-title">
            <el-icon><Clock /></el-icon>
            最新文档
          </h3>
        </template>
        <div class="updates-list">
          <router-link
            v-for="doc in latestDocuments.slice(0, 8)"
            :key="'latest-' + doc.id"
            :to="`/document/${doc.uuid}`"
            target="_blank"
            class="update-item"
          >
            <span class="update-title">{{ doc.title }}</span>
            <span class="update-time">{{ formatRelativeTime(doc.created_at) }}</span>
          </router-link>
        </div>
      </el-card>
    </aside>

    <!-- 快捷入口 -->
    <aside class="sidebar-card quick-links">
      <el-card shadow="never">
        <template #header>
          <h3 class="card-title">
            <el-icon><Link /></el-icon>
            快捷入口
          </h3>
        </template>
        <div class="links-grid">
          <router-link to="/upload" target="_blank" class="link-item">
            <el-icon><Upload /></el-icon>
            <span>上传文档</span>
          </router-link>
          <router-link to="/post" target="_blank" class="link-item">
            <el-icon><EditPen /></el-icon>
            <span>发布文章</span>
          </router-link>
          <router-link to="/category" target="_blank" class="link-item">
            <el-icon><Files /></el-icon>
            <span>浏览文档</span>
          </router-link>
          <router-link to="/article" target="_blank" class="link-item">
            <el-icon><Reading /></el-icon>
            <span>阅读文章</span>
          </router-link>
        </div>
      </el-card>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Calendar,
  CircleCheck,
  User,
  Clock,
  Link,
  Upload,
  EditPen,
  Files,
  Reading,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { getSignedToday, signToday } from '@/api/user'
import UserAvatar from '@/components/UserAvatar.vue'

defineOptions({ name: 'HomeSidebar' })

const props = withDefaults(
  defineProps<{
    latestDocuments?: any[]
  }>(),
  {
    latestDocuments: () => [],
  }
)

const userStore = useUserStore()
const settingStore = useSettingStore()

const user = computed(() => userStore.currentUser)
const creditName = computed(
  () => settingStore.settings.system?.credit_name || '积分'
)
const siteName = computed(
  () => settingStore.settings.system?.sitename || settingStore.settings.system?.title || ''
)

const todaySign = ref<{ id: number }>({ id: 0 })
const signing = ref(false)

async function loadTodaySign() {
  if (!user.value.id) return
  try {
    const res: any = await getSignedToday()
    if (res.status === 200) {
      todaySign.value = res.data || { id: 0 }
    }
  } catch (error) {
    // ignore
  }
}

async function signIn() {
  if (todaySign.value.id > 0 || signing.value) return
  signing.value = true
  try {
    const res: any = await signToday()
    if (res.status === 200) {
      todaySign.value = { id: res.data.id || 1 }
      const award = res.data.award || 0
      await userStore.getUser()
      ElMessage.success(
        award > 0 ? `签到成功，获得 ${award} 积分奖励` : '签到成功'
      )
    } else {
      ElMessage.error(res.data?.message || '签到失败')
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '签到失败，请稍后重试')
  } finally {
    signing.value = false
  }
}

function formatRelativeTime(dateStr: any) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  if (Number.isNaN(diff)) return ''
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  if (days === 0) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return hours === 0 ? '刚刚' : `${hours}小时前`
  }
  if (days < 7) return `${days}天前`
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

onMounted(() => {
  loadTodaySign()
})
</script>

<style lang="scss" scoped>
.com-home-sidebar {
  .sidebar-card {
    margin-bottom: 20px;

    .el-card {
      border-radius: 12px;
      border: 0;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);

      :deep(.el-card__header) {
        padding: 16px 18px 12px;
        border-bottom: 1px solid #eef2f6;

        .card-title {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0;
          color: #111827;
          font-size: 15px;
          font-weight: 600;
        }
      }

      :deep(.el-card__body) {
        padding: 16px 18px;
      }
    }
  }
}

// 用户面板
.user-panel {
  .user-info,
  .guest-content {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .user-avatar,
    .guest-avatar {
      margin-right: 14px;
      flex-shrink: 0;
    }

    .user-details,
    .guest-text {
      flex: 1;
      min-width: 0;

      .username,
      h3 {
        margin: 0 0 4px;
        color: #111827;
        font-size: 16px;
        font-weight: 600;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .signature,
      p {
        margin: 0;
        color: #7b8794;
        font-size: 12px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }

  .user-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 16px;
    padding: 14px 0;
    border-radius: 8px;
    background: #f8fafc;

    .stat-col {
      text-align: center;

      .stat-value {
        color: #2f7cf6;
        font-size: 18px;
        font-weight: 600;
      }

      .stat-name {
        margin-top: 2px;
        color: #7b8794;
        font-size: 12px;
      }
    }
  }

  .user-actions {
    display: flex;
    gap: 10px;

    .sign-btn,
    .me-btn {
      flex: 1;
    }

    .me-link {
      flex: 1;
      display: block;

      .me-btn {
        width: 100%;
      }
    }
  }

  .guest-actions {
    display: flex;
    gap: 10px;

    .guest-action-item {
      flex: 1;
      display: block;

      .login-btn,
      .register-btn {
        width: 100%;
      }
    }
  }
}

// 最新文档
.latest-updates {
  .updates-list {
    .update-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 11px 0;
      border-bottom: 1px dashed #edf2f7;
      color: #344054;
      text-decoration: none;

      &:last-child {
        border-bottom: 0;
      }

      .update-title {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 13px;
      }

      .update-time {
        flex-shrink: 0;
        color: #98a2b3;
        font-size: 12px;
      }

      &:hover .update-title {
        color: #2f7cf6;
      }
    }
  }
}

// 快捷入口
.quick-links {
  .links-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .link-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 8px;
      border-radius: 8px;
      background: #f8fafc;
      color: #344054;
      text-decoration: none;
      transition: all 0.2s ease;

      .el-icon {
        font-size: 22px;
      }

      span {
        font-size: 13px;
      }

      &:hover {
        background: #2f7cf6;
        color: #fff;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(47, 124, 246, 0.3);
      }
    }
  }
}
</style>