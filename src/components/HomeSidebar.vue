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
            <el-button type="primary" class="login-btn" @click="openLoginDialog('login')">登录</el-button>
            <el-button class="register-btn" @click="openLoginDialog('register')">注册</el-button>
          </div>
        </template>
      </el-card>
    </aside>

    <!-- 快捷入口（桌面端显示在最新文档上方；移动端移入主列文档推荐上方，见 index.vue） -->
    <quick-links class="sidebar-quick-links" />

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

    <!-- 下载最多 -->
    <aside v-if="downloadDocuments.length" class="sidebar-card latest-updates">
      <el-card shadow="never">
        <template #header>
          <h3 class="card-title">
            <el-icon><Download /></el-icon>
            下载最多
          </h3>
        </template>
        <div class="updates-list">
          <router-link
            v-for="doc in downloadDocuments.slice(0, 8)"
            :key="'download-' + doc.id"
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
  TrendCharts,
  Download,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { getSignedToday, signToday } from '@/api/user'
import UserAvatar from '@/components/UserAvatar.vue'
import QuickLinks from '@/components/QuickLinks.vue'
import { openLoginDialog } from '@/utils/login'
import { DEFAULT_CREDIT_NAME } from '@/utils/credit'

defineOptions({ name: 'HomeSidebar' })

const props = withDefaults(
  defineProps<{
    latestDocuments?: any[]
    hotDocuments?: any[]
    downloadDocuments?: any[]
  }>(),
  {
    latestDocuments: () => [],
    hotDocuments: () => [],
    downloadDocuments: () => [],
  }
)

const userStore = useUserStore()
const settingStore = useSettingStore()

const user = computed(() => userStore.currentUser)
const creditName = computed(
  () => settingStore.settings.system?.credit_name || DEFAULT_CREDIT_NAME
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
