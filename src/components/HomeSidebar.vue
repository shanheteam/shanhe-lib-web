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
            <el-button class="register-btn" @click="showRegDialog = true">注册</el-button>
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

    <!-- 热门文档 -->
    <aside v-if="hotDocuments.length" class="sidebar-card latest-updates">
      <el-card shadow="never">
        <template #header>
          <h3 class="card-title">
            <el-icon><TrendCharts /></el-icon>
            热门文档
          </h3>
        </template>
        <div class="updates-list">
          <router-link
            v-for="doc in hotDocuments.slice(0, 8)"
            :key="'hot-' + doc.id"
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

    <!-- 注册提示弹窗 -->
    <el-dialog v-model="showRegDialog" title="注册账号" width="420" :close-on-click-modal="true">
      <div style="text-align: center; padding: 10px 0">
        <p style="margin-bottom: 16px; color: var(--el-text-color-regular)">
          山河大学图书馆不支持注册，请前往山河大学学籍系统注册。
        </p>
        <el-button type="primary" @click="goRegister">前往注册</el-button>
      </div>
    </el-dialog>
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
  TrendCharts,
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
    hotDocuments?: any[]
  }>(),
  {
    latestDocuments: () => [],
    hotDocuments: () => [],
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
const showRegDialog = ref(false)

const goRegister = () => {
  showRegDialog.value = false
  window.open('https://user.shanhe.co/?libreg', '_blank')
}

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
