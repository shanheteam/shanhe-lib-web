<template>
  <div class="com-global-header">
    <template v-if="advertisements.length > 0">
      <div v-for="item in advertisements" :key="'header-ad-' + item.id">
        <div
          v-if="item.position == 'global_top'"
          :key="item.position + item.id"
          v-safe-html="item.content"
        ></div>
      </div>
    </template>
    <el-header
      v-if="route.name !== 'search' || isMobile"
      :height="'70px'"
      :class="{
        'is-scrolled': isScrolled,
        'is-hidden': !isHeaderVisible,
      }"
    >
      <div class="header-inner">
        <el-menu :default-active="activePath" mode="horizontal" class="nav-menu">
          <el-menu-item class="logo" index="/">
            <router-link to="/"
              ><img
                :src="settings.system.logo || '/static/images/logo.png'"
                :alt="settings.system.sitename"
            /></router-link>
          </el-menu-item>
          <template v-for="item in navigations.filter((item) => item.enable)">
            <template v-if="item.fixed">
              <el-menu-item
                v-if="item.href == '/'"
                :key="'nav-index-' + item.id"
                index="/"
                class="hidden-xs-only"
              >
                <router-link to="/">{{ item.title || '首页' }}</router-link>
              </el-menu-item>
              <el-menu-item
                v-else-if="item.href == '/category'"
                :key="'nav-category-' + item.id"
                index="/category"
                class="hidden-xs-only"
              >
                <el-popover
                  ref="popover0"
                  width="520"
                  trigger="hover"
                  :open-delay="600"
                  :disabled="categories.filter((x) => !x.type).length === 0"
                >
                  <CategoryCard
                    :type="0"
                    @close="closePopover('popover0')"
                  ></CategoryCard>
                  <template #reference>
                    <router-link to="/category">{{
                      item.title || '文库资料'
                    }}</router-link>
                  </template>
                </el-popover>
              </el-menu-item>
              <el-menu-item
                v-else-if="item.href == '/article'"
                :key="'nav-article-' + item.id"
                index="/article"
                class="hidden-xs-only"
              >
                <el-popover
                  ref="popover1"
                  width="520"
                  trigger="hover"
                  :open-delay="600"
                  :disabled="
                    categories.filter((x) => x.type === 1).length === 0
                  "
                >
                  <CategoryCard
                    :type="1"
                    @close="closePopover('popover1')"
                  ></CategoryCard>
                  <template #reference>
                    <router-link to="/article">{{
                      item.title || '文章资讯'
                    }}</router-link>
                  </template>
                </el-popover>
              </el-menu-item>
              <NavigationLink
                v-else
                :key="'nav-fixed-else-' + item.id"
                :navigation="item"
                :hidden-x-s="true"
              />
            </template>
            <template v-else>
              <el-sub-menu
                v-if="item.children && item.children.length > 0"
                :key="'nav-' + item.id"
                :index="`nav-${item.id}`"
                class="hidden-xs-only"
              >
                <template #title>{{ item.title }}</template>
                <NavigationLink
                  v-for="child in item.children || []"
                  :key="'child-' + child.id"
                  :hidden-x-s="true"
                  :navigation="child"
                />
              </el-sub-menu>
              <NavigationLink
                v-else
                :key="'nav1-' + item.id"
                :navigation="item"
                :hidden-x-s="true"
              />
            </template>
          </template>
        </el-menu>
        <div class="header-search hidden-xs-only"
          :class="navigations.length <= 2 ? 'nav-searchbox-large' : ''"
        >
          <el-input
            class="search-input"
            size="large"
            readonly
            :placeholder="
              route.path.startsWith('/article') ? '搜索文章...' : '搜索文档...'
            "
            @click="openSearchModal"
          >
            <template #suffix>
              <el-icon class="el-input__icon" @click="openSearchModal">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="header-user">
          <template v-if="user.id > 0">
            <el-dropdown :trigger="isMobile ? 'click' : 'hover'" @command="handleDropdown">
              <span class="el-dropdown-link">
                <UserAvatar class="nav-user-avatar" :user="user" :size="36" />
                <span class="mobile-username">{{ user.realname || '未命名用户' }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="sign.id > 0" disabled
                    ><i class="fa fa-calendar-check-o"></i>
                    今日已签到</el-dropdown-item
                  >
                  <el-dropdown-item v-else command="sign"
                    ><i class="fa fa-calendar-plus-o"></i>
                    每日签到</el-dropdown-item
                  >
                  <el-dropdown-item command="ucenter"
                    ><i class="fa fa-home"></i> 个人主页</el-dropdown-item
                  >
                  <el-dropdown-item command="me"
                    ><i class="fa fa-user-o"></i> 个人中心</el-dropdown-item
                  >
                  <el-dropdown-item command="upload"
                    ><el-icon class="dropdown-upload"><Upload /></el-icon
                    >上传文档</el-dropdown-item
                  >
                  <el-dropdown-item command="post"
                    ><el-icon><Plus /></el-icon>&nbsp;发布文章</el-dropdown-item
                  >
                  <el-dropdown-item v-if="allowPages.length > 0" command="admin">
                    <el-icon><Box /></el-icon>&nbsp;管理后台</el-dropdown-item
                  >
                  <el-dropdown-item command="logout"
                    ><i class="fa fa-sign-out"></i> 退出登录</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <div v-else class="header-login-btn">
            <el-button type="primary" round @click="showLoginDialog">
              <el-icon style="color: var(--el-color-white); font-size: 1.2em"><User /></el-icon>
              登录
            </el-button>
          </div>
        </div>
      </div>
    </el-header>
    <el-drawer
      v-model="menuDrawerVisible"
      size="60%"
      :with-header="false"
      class="menu-drawer-box"
    >
      <el-input
        class="search-input"
        size="large"
        placeholder="搜索文档..."
        readonly
        @click="openSearchModal"
      >
        <template #suffix>
          <el-icon class="el-input__icon" @click="openSearchModal">
            <Search />
          </el-icon>
        </template>
      </el-input>
      <ul class="navs">
        <li>
          <div
            class="el-link el-link--default login-link"
            @click="openLoginDialog()"
          >
            <UserAvatar :size="38" :user="user" class="user-avatar" />
            <span v-if="user.id > 0">{{ user.realname || '未命名用户' }}</span>
            <span v-else>登录注册</span>
          </div>
        </li>
        <template v-if="user.id > 0">
          <li class="mgt-20px">
            <el-button
              v-if="sign.id > 0"
              :key="'sign-' + sign.id"
              class="btn-block"
              type="success"
              size="default"
              disabled
            >
              <i class="fa fa-calendar-check-o" aria-hidden="true"></i>
              今日已签到
            </el-button>
            <el-button
              v-else
              :key="'sign-0'"
              class="btn-block"
              type="success"
              size="default"
              @click="signToday"
            >
              <i class="fa fa-calendar-plus-o"></i>
              每日签到</el-button
            >
          </li>
          <li>
            <div
              class="el-link el-link--default"
              @click="goToLink(`/user/${user.id}`)"
            >
              <i class="fa fa-home"></i> &nbsp;个人主页
            </div>
          </li>
          <li>
            <div class="el-link el-link--default" @click="goToLink(`/me`)">
              <i class="fa fa-user-o"></i> &nbsp;个人中心
            </div>
          </li>
          <li>
            <div class="el-link el-link--default" @click="goToLink(`/upload`)">
              <el-icon><Upload /></el-icon> &nbsp;上传文档
            </div>
          </li>
          <li>
            <div class="el-link el-link--default" @click="goToLink(`/post`)">
              <el-icon><Plus /></el-icon> &nbsp;发布文章
            </div>
          </li>
          <li>
            <router-link to="/admin" class="el-link el-link--default"
              ><el-icon><Box /></el-icon> &nbsp;管理后台</router-link
            >
          </li>
          <li>
            <div class="el-link el-link--default" @click="logout">
              <i class="fa fa-sign-out"></i> &nbsp;退出登录
            </div>
          </li></template
        >
      </ul>
      <div class="com-mobile-nav">
        <div
          class="mobile-nav-title"
          @click="activeCollapse = activeCollapse === 'categories' ? '' : 'categories'"
        >
          <el-icon><Document /></el-icon>&nbsp;
          <span>{{
            navigations.filter(
              (item) => item.enable && item.fixed && item.href === '/category'
            )[0]?.title || '文库资料'
          }}</span>
        </div>
        <ul
          v-show="activeCollapse === 'categories' && navigations.filter((item) => item.enable && item.fixed && item.href === '/category').length > 0"
          class="mobile-nav-items"
        >
          <li
            v-for="item in categoryDocumentTrees"
            :key="'collapse-sub-cate-' + item.id"
          >
            <div
              class="el-link el-link--default"
              @click="goToLink(`/category/${item.id}`)"
            >
              {{ item.title }}
            </div>
          </li>
        </ul>
        <div
          class="mobile-nav-title"
          @click="activeCollapse = activeCollapse === 'article' ? '' : 'article'"
        >
          <el-icon><Tickets /></el-icon>&nbsp;
          <span>{{
            navigations.filter(
              (item) => item.enable && item.fixed && item.href === '/article'
            )[0]?.title || '文章资讯'
          }}</span>
        </div>
        <ul
          v-show="activeCollapse === 'article' && navigations.filter((item) => item.enable && item.fixed && item.href === '/article').length > 0"
          class="mobile-nav-items"
        >
          <li
            v-for="item in categoryArticleTrees"
            :key="'collapse-sub-cate-' + item.id"
          >
            <div
              class="el-link el-link--default"
              @click="goToLink(`/article?category_id=${item.id}`)"
            >
              {{ item.title }}
            </div>
          </li>
        </ul>
      </div>
      <el-menu :default-active="route.path" class="el-menu-mobile">
        <template
          v-for="item in navigations.filter(
            (item) =>
              item.enable &&
              !(
                item.href === '/' ||
                item.href === '/category' ||
                item.href === '/article'
              )
          )"
        >
          <el-sub-menu
            v-if="item.children && item.children.length > 0"
            :key="'nav-' + item.id"
            :index="`nav-${item.id}`"
          >
            <template #title>{{ item.title }}</template>
            <NavigationLink
              v-for="child in item.children || []"
              :key="'child-' + child.id"
              :navigation="child"
            />
          </el-sub-menu>
          <NavigationLink v-else :key="'nav1-' + item.id" :navigation="item" />
        </template>
      </el-menu>
    </el-drawer>

    <!-- OAuth 登录对话框 -->
    <el-dialog
      v-model="loginDialogVisible"
      :show-close="true"
      width="720px"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      class="oauth-login-dialog"
    >
      <div class="oauth-login-body">
        <div class="uc-acct-login">
          <el-divider>山河大学账号密码登录</el-divider>
          <div class="uc-acct-form">
            <el-input v-model="ucForm.username" placeholder="学号 / 手机号 / 邮箱" clearable @keyup.enter="submitUcLogin" />
            <el-input v-model="ucForm.password" type="password" show-password placeholder="密码" @keyup.enter="submitUcLogin" />
            <el-button type="primary" class="uc-acct-submit" :loading="ucLoginLoading" @click="submitUcLogin">登录</el-button>
          </div>
        </div>
        <div v-if="regMode" class="uc-reg-wrap">
          <el-divider>山河大学账号注册</el-divider>
          <iframe :src="ucRegisterUrl" class="uc-reg-iframe" title="山河大学账号注册" />
          <div class="uc-reg-row">
            <el-button class="uc-reg-back" size="small" @click="backToLogin">返回登录</el-button>
          </div>
        </div>
        <div v-else class="uc-reg-switch">
          <span>还没有山河大学账号？</span>
          <el-button type="primary" link @click="switchToRegister">立即注册</el-button>
        </div>
      </div>
    </el-dialog>

    <div
      class="search-modal-overlay"
      :class="{ show: searchModalVisible }"
      @click="closeSearchModal"
    >
      <div class="search-modal" @click.stop>
        <div class="search-modal-header">
          <h3>搜索</h3>
          <button class="close-btn" type="button" @click="closeSearchModal">
            <el-icon><Close /></el-icon>
          </button>
        </div>
        <div class="search-modal-body">
          <el-input
            ref="searchModalInput"
            v-model="search.wd"
            class="search-modal-input"
            size="large"
            :placeholder="searchPlaceholder"
            @keydown.enter="onSearch"
          >
            <template #prefix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
          <el-button
            type="primary"
            class="search-submit-btn"
            :disabled="!search.wd"
            :icon="Search"
            @click="onSearch"
          >
            搜索
          </el-button>
        </div>
        <div class="search-modal-footer">按 Enter 键快速搜索</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  ArrowDown,
  Upload,
  Plus,
  Box,
  Operation,
  Document,
  Tickets,
  Search,
  Close,
} from '@element-plus/icons-vue'
import { getSignedToday as getSignedTodayApi, signToday as signTodayApi } from '@/api/user'
import { getAdvertisementByPosition } from '@/api/advertisement'
import { advertisementPositions } from '@/utils/enum'
import { categoryToTrees, requireLogin } from '@/utils/utils'
import { generateRandomString, generateCodeChallenge, savePkceParams } from '@/utils/pkce'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { useCategoryStore } from '@/store/category'
import { getOauths } from '@/api/oauth'
import { passwordLogin } from '@/api/oauth'
import { OAUTH_TYPE_CUSTOM } from '@/utils/oauth'
import { OPEN_LOGIN_EVENT, openLoginDialog } from '@/utils/login'

defineOptions({ name: 'GlobalHeader' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const settingStore = useSettingStore()
const categoryStore = useCategoryStore()

const settings = computed(() => settingStore.settings)
const navigations = computed(() => settingStore.navigations)
const categories = computed(() => categoryStore.categories)
const user = computed(() => userStore.user)
const allowPages = computed(() => userStore.allowPages)
const permissions = computed(() => userStore.permissions)

const search = ref<Record<string, any>>({
  wd: '',
  type: route.path.startsWith('/article') ? 1 : 0,
})
const categoryDocumentTrees = ref<any[]>([])
const categoryArticleTrees = ref<any[]>([])
const menuDrawerVisible = ref(false)
const sign = ref<Record<string, any>>({ id: 0 })
const activeCollapse = ref('categories')
const activePath = ref('/')
const searchModalVisible = ref(false)
const isScrolled = ref(false)
const isHeaderVisible = ref(true)
const lastScrollTop = ref(0)

const advertisements = ref<any[]>([])
const searchModalInput = ref<any>()
const popover0 = ref<any>()
const popover1 = ref<any>()

// OAuth 登录弹窗
const loginDialogVisible = ref(false)
const oauths = ref<any[]>([])
const oauthLoading = ref<number>(0)
const ucLoginLoading = ref(false)
const ucForm = ref<{ username: string; password: string }>({ username: '', password: '' })

const searchPlaceholder = computed(() =>
  search.value.type === 1 ? '搜索文章...' : '搜索文档...',
)

const getAdvertisements = async (page: string) => {
  const positions: string[] = []
  advertisementPositions.forEach((item: any) => {
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

const handleWindowFocus = () => {
  userStore.checkAndRefreshUser()
}

const handleScroll = () => {
  const currentScrollTop =
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0

  isScrolled.value = currentScrollTop > 10

  if (currentScrollTop > lastScrollTop.value && currentScrollTop > 100) {
    isHeaderVisible.value = false
  } else {
    isHeaderVisible.value = true
  }

  lastScrollTop.value = currentScrollTop
}

const syncSearchType = () => {
  search.value.type = route.path.startsWith('/article') ? 1 : 0
}

const openSearchModal = () => {
  syncSearchType()
  search.value.wd = ''
  searchModalVisible.value = true
  nextTick(() => {
    setTimeout(() => {
      searchModalInput.value?.focus()
    }, 300)
  })
}

const closeSearchModal = () => {
  searchModalVisible.value = false
}

const showMenuDrawer = () => {
  getSignedToday()
  menuDrawerVisible.value = true
}

const showLoginDialog = () => {
  loginDialogVisible.value = true
  // 并行加载 OAuth 列表；无 OAuth 时不影响邮箱登录
  getOauths()
    .then((res: any) => {
      if (res.status === 200 && res.data.oauths) {
        oauths.value = res.data.oauths.filter((o: any) => o.enable)
      }
    })
    .catch(() => {})
}

// 登录成功后自动关闭弹窗
watch(
  () => Number(userStore.user.id) || 0,
  (id) => {
    if (id > 0) loginDialogVisible.value = false
  },
)

// 山河大学（user-center）账号密码直接登录：调用 lib 后端 password-login，不经过授权页
// 弹窗内嵌入 user-center 注册页（同框转 user 注册）。注册成功会写入 .shanhe.co 共享 cookie，
// 由 ssoProbe 探测到后自动登录并关闭弹窗。
const ucRegisterUrl = 'https://user.shanhe.co/register'
const regMode = ref(false)
let regTimer: any = null
const switchToRegister = () => {
  regMode.value = true
  if (regTimer) clearInterval(regTimer)
  regTimer = setInterval(() => {
    ssoProbe()
    const logged = (userStore as any).getToken || (userStore as any).token
    if (logged) {
      if (regTimer) clearInterval(regTimer)
      regTimer = null
      regMode.value = false
      loginDialogVisible.value = false
      ElMessage.success('注册成功，已自动登录')
    }
  }, 2000)
}
const backToLogin = () => {
  regMode.value = false
  if (regTimer) clearInterval(regTimer)
  regTimer = null
}

const submitUcLogin = async () => {
  const username = ucForm.value.username.trim()
  const password = ucForm.value.password
  if (!username || !password) {
    ElMessage.warning('请输入山河大学账号和密码')
    return
  }
  ucLoginLoading.value = true
  try {
    const res: any = await passwordLogin({ username, password })
    if (res?.data?.token && res?.data?.user) {
      ucForm.value = { username: '', password: '' }
      loginDialogVisible.value = false
      ElMessage.success('登录成功')
      userStore.setUser(res.data.user)
      userStore.setToken(res.data.token)
      userStore.getUserPermissions()
      userStore.getUserGroups()
    } else {
      ElMessage.error(res?.data?.message || res?.message || '登录失败')
    }
  } catch (e: any) {
    console.error('[OAuth] password login error:', e)
    ElMessage.error(e?.data?.message || e?.message || '登录异常')
  } finally {
    ucLoginLoading.value = false
  }
}

// 授权码 + PKCE：打开弹窗到 provider 授权页，回调后由 lib 换 token
const handleOAuthLogin = async (oauth: any) => {
  if (!oauth.authorize_url_base) {
    ElMessage.error('该登录方式配置不完整')
    return
  }
  if (oauthLoading.value) return
  oauthLoading.value = oauth.type
  try {
    const codeVerifier = generateRandomString(64)
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    const state = generateRandomString(32)
    savePkceParams(codeVerifier, state)

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: oauth.client_id,
      redirect_uri: oauth.redirect_url,
      scope: oauth.scope || 'openid profile email',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    const authorizeUrl = `${oauth.authorize_url_base}?${params.toString()}`
    window.open(authorizeUrl, '_blank', 'width=520,height=640')
    // 短暂展示加载后还原，成功与否由回调消息通知
    setTimeout(() => {
      oauthLoading.value = 0
    }, 1500)
  } catch (e) {
    console.error('启动OAuth登录失败:', e)
    ElMessage.error('启动登录失败')
    oauthLoading.value = 0
  }
}

const handleOAuthMessage = (event: MessageEvent) => {
  if (event.data?.type === 'oauth-login-success') {
    ElMessage.success('登录成功')
    // 先从 localStorage 恢复 token 到内存 store，再刷新用户信息与用户组
    userStore.checkAndRefreshUser()
    userStore.getUser()
    userStore.getUserGroups()
  }
}

const resetActivePath = () => {
  const slice = route.path.split('/').slice(0, 2)
  let actvePath = slice.join('/')
  if (actvePath === '/document') {
    actvePath = '/category'
  }
  activePath.value = actvePath
}

const goToLink = (link: string) => {
  menuDrawerVisible.value = false
  router.push(link)
}

const closePopover = (name: string) => {
  nextTick(() => {
    try {
      const popover = name === 'popover0' ? popover0.value : popover1.value
      if (popover && typeof popover.hide === 'function') {
        popover.hide()
      }
    } catch (error) {
      // ignore
    }
  })
}

const getSignedToday = async () => {
  if (!user.value.id) {
    return
  }
  const res: any = await getSignedTodayApi()
  if (res.status === 200) {
    sign.value = res.data || sign.value
  }
}

const signToday = async () => {
  if (sign.value.id > 0) {
    ElMessage.warning('今日已签到')
    return
  }
  const res: any = await signTodayApi()
  if (res.status === 200) {
    const newSign = res.data || { id: 1 }
    sign.value = newSign
    userStore.getUser()
    ElMessage.success(
      `签到成功，获得 ${newSign.award || 0} ${
        settings.value.system.credit_name || '魔豆'
      }奖励`,
    )
  } else {
    ElMessage.error(res.message || res.data.message)
  }
}

const onSearch = () => {
  const wd = (search.value.wd || '').trim()
  if (!wd) return
  menuDrawerVisible.value = false
  searchModalVisible.value = false
  router.push({
    path: '/search',
    query: {
      wd,
      type: search.value.type,
    },
  })
  search.value.wd = ''
}

const logout = async () => {
  await userStore.logoutWithSso()
}

const handleDropdown = async (command: string) => {
  switch (command) {
    case 'sign':
      await signToday()
      break
    case 'logout':
      logout()
      break
    case 'upload':
      router.push('/upload')
      break
    case 'post':
      router.push('/post')
      break
    case 'ucenter':
      router.push(`/user/${user.value.id}`)
      break
    case 'me':
      router.push('/me')
      break
    case 'admin':
      router.push('/admin')
      break
    default:
      break
  }
}

watch(
  () => route.fullPath,
  (to, from) => {
    resetActivePath()
    syncSearchType()
    if (to !== from) {
      closeSearchModal()
    }
  },
)

watch(
  () => user.value.id,
  (value) => {
    if (value > 0) {
      getSignedToday()
    } else {
      sign.value = { id: 0 }
    }
  },
)

const init = async () => {
  resetActivePath()
  syncSearchType()
  await Promise.all([
    categoryStore.getCategories(),
    // 配置接口刚失败过时不再重复请求（否则会再次等待一次超时）
    settingStore.needFetchSettings() ? settingStore.getSettings() : Promise.resolve(),
    settingStore.listNavigation(),
    getAdvertisements('global'),
  ])
  await userStore.checkAndRefreshUser()

  if (user.value.id > 0) {
    await getSignedToday()
  }

  const trees = categoryToTrees(categories.value)
  categoryDocumentTrees.value = trees.filter((item: any) => {
    if (
      settings.value.display &&
      settings.value.display.hide_category_without_document
    ) {
      return item.enable && item.doc_count > 0 && !item.type
    }
    return item.enable && !item.type
  })

  categoryArticleTrees.value = trees.filter((item: any) => {
    return item.enable && item.type
  })

  if (requireLogin(settings.value, user.value, route, permissions.value)) {
    router.push('/login')
  }
}

// SSO：user-center 登出后 lib 后台静默退出（焦点/可见时探测共享 cookie，60s 定时兜底）
let ssoProbeTimer: ReturnType<typeof setInterval> | undefined
let ssoLastProbe = 0
const ssoProbe = () => {
  const now = Date.now()
  if (now - ssoLastProbe < 5000) return // 去抖 5s
  ssoLastProbe = now
  // 未登录 → 尝试静默建会话（user 登录 → lib 自动登录）；已登录 → 探测共享 cookie 是否已失效（lib 静默登出）
  if (userStore.token) void userStore.ssoSessionProbe()
  else void userStore.silentSsoCheck()
}
const handleVisibility = () => {
  if (!document.hidden) ssoProbe()
}

onMounted(() => {
  window.addEventListener('focus', handleWindowFocus)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('message', handleOAuthMessage)
  window.addEventListener(OPEN_LOGIN_EVENT, showLoginDialog)
  window.addEventListener('focus', ssoProbe)
  window.addEventListener('visibilitychange', handleVisibility)
  ssoProbeTimer = setInterval(() => {
    ssoProbe()
  }, 60000)
  ssoProbe() // user 已登录时静默建 lib 会话；本机已登录时探测共享 cookie
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', handleWindowFocus)
  window.removeEventListener('focus', ssoProbe)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('message', handleOAuthMessage)
  window.removeEventListener(OPEN_LOGIN_EVENT, showLoginDialog)
  window.removeEventListener('visibilitychange', handleVisibility)
  if (ssoProbeTimer) clearInterval(ssoProbeTimer)
  if (regTimer) clearInterval(regTimer)
})

init()
</script>
