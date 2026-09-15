<template>
  <div class="com-global-header">
    <template v-if="advertisements.length > 0">
      <div v-for="item in advertisements" :key="'header-ad-' + item.id">
        <div
          v-if="item.position == 'global_top'"
          :key="item.position + item.id"
          v-html="item.content"
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
                <span class="mobile-username">{{ user.realname || user.username }}</span>
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
          <router-link v-else to="/login" class="header-login-btn">
            <el-button type="primary" round>
              <el-icon style="color: #fff; font-size: 1.2em"><User /></el-icon>
              登录
            </el-button>
          </router-link>
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
            @click="goToLink('/login')"
          >
            <UserAvatar :size="38" :user="user" class="user-avatar" />
            <span v-if="user.id > 0">{{ user.realname || user.username }}</span>
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
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { useCategoryStore } from '@/store/category'

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
  await userStore.logout()
  location.reload()
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
    settingStore.getSettings(),
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

onMounted(() => {
  window.addEventListener('focus', handleWindowFocus)
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', handleWindowFocus)
  window.removeEventListener('scroll', handleScroll)
})

init()
</script>
<style lang="scss">
.com-global-header {
  .el-header {
    padding: 0;
    background: #fff;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 100;
    overflow: hidden;
    border-bottom: 1px solid $background-grey-light;
    transition: transform 0.3s ease, box-shadow 0.3s ease,
      background-color 0.3s ease;

    &.is-scrolled {
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
    }

    &.is-hidden {
      transform: translateY(-100%);
    }

    .logo,
    .login {
      &.is-active {
        border-color: transparent !important;
      }
      > a {
        display: inline-flex;
        align-items: center;
        height: 70px;
      }
      img {
        height: 42px;
      }
    }
    & > div.header-inner {
      margin: 0 auto;
      // width: $default-width;
      max-width: $max-width;
      display: flex;
      align-items: center;
    }
    .el-menu--horizontal > .el-sub-menu .el-sub-menu__title {
      padding-top: 1px;
      height: 70px;
      line-height: 70px;
      font-size: 15px;
      font-weight: 500 !important;
      color: unset;
    }
    .el-menu.el-menu--horizontal {
      border-bottom: 0;
      // width: $default-width;
      flex: 1;
      min-width: 0;
      .float-right {
        padding-right: 15px;
        a {
          padding: 0 15px;
        }
      }
    }
    .menu-drawer {
      margin-left: auto;
    }
    .header-user {
      display: flex;
      align-items: center;
      height: 70px;
      padding: 0 15px;
      flex-shrink: 0;
      .el-dropdown-link {
        display: inline-flex;
        align-items: center;
        height: 70px;
        font-weight: 400;
        font-size: 1.2em;
        cursor: pointer;
        .nav-user-avatar {
          margin-right: 6px;
        }
      }
      .header-login-btn {
        display: inline-flex;
        align-items: center;
        height: auto;
        line-height: normal;
        padding: 0;
      }
      .mobile-search-btn {
        display: none;
      }
    }
    .header-search {
      display: flex;
      align-items: center;
      height: 70px;
      padding: 0 8px;
      flex-shrink: 0;
      &.nav-searchbox-large {
        .el-input {
          width: 300px;
        }
      }
      .el-input {
        width: 200px;
      }
    }
    a {
      text-decoration: none;
      height: 70px;
      line-height: 70px;
      display: inline-block;
      // padding: 0 20px;
      padding: 0 15px;
      font-size: 15px;
      // font-weight: normal;
    }
    .el-menu-item {
      padding: 0;
      color: #333;
      font-weight: bold;
      height: 70px;
      line-height: 70px;
      [class^='el-icon-'] {
        font-size: 15px;
        margin-right: 2px;
      }
      & > span {
        position: relative;
        top: -1px;
      }
      &.is-active {
        color: #6095f7;
      }
    }

    .search-input {
      cursor: pointer;

      .el-input__inner {
        border-radius: 20px;
        background-color: $background-grey-light;
        cursor: pointer;
        &:focus {
          background-color: #fff;
        }
      }
    }
  }

  .search-modal-overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 100px;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(6px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;

    &.show {
      opacity: 1;
      visibility: visible;
    }
  }

  .search-modal {
    width: calc(100% - 32px);
    max-width: 560px;
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
    transform: translateY(-18px) scale(0.96);
    transition: all 0.3s ease;

    .search-modal-overlay.show & {
      transform: translateY(0) scale(1);
    }
  }

  .search-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    border-bottom: 1px solid #f0f1f2;

    h3 {
      margin: 0;
      font-size: 18px;
      color: #303133;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: 8px;
      background: #f5f7fa;
      color: #909399;
      cursor: pointer;

      &:hover {
        color: #606266;
      }
    }
  }

  .search-modal-body {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;

    .search-modal-input {
      flex: 1;

      .el-input__inner {
        height: 44px;
        border-radius: 12px;
      }
    }

    .search-submit-btn {
      min-width: 96px;
      height: 44px;
      border-radius: 12px;
    }
  }

  .search-modal-footer {
    padding: 0 20px 18px;
    color: #909399;
    font-size: 13px;
    text-align: center;
  }
}

@media screen and (max-width: $mobile-width) {
  .com-global-header {
    .nav-menu {
      flex: none !important;
      .el-menu-item:not(.logo) {
        display: none !important;
      }
    }
    .header-search {
      display: none !important;
    }
    .header-user {
      position: absolute;
      right: 8px;
      top: 0;
      z-index: 10;
      padding: 0;
      margin-left: 0;
      height: 70px;
      .el-dropdown-link {
        display: flex;
        align-items: center;
        gap: 6px;
        height: auto;
        font-size: 14px;
        cursor: pointer;
        .mobile-username {
          display: inline;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .nav-user-avatar {
          margin-right: 0;
        }
        .el-icon {
          display: none;
        }
      }
      .header-login-btn {
        .el-button {
          height: 36px;
          padding: 0 16px;
          font-size: 14px;
        }
      }
    }
    .search-modal-overlay {
      padding-top: 70px;
      padding-right: 16px;
      padding-left: 16px;
    }

    .search-modal-body {
      flex-direction: column;

      .search-submit-btn {
        width: 100%;
      }
    }
  }
}
</style>
<style lang="scss">
.com-mobile-nav {
  .mobile-nav-title {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;
    border-bottom: 1px solid #ebedf0;
    color: #333;
    font-size: 14px;
  }
  .mobile-nav-items {
    list-style: none;
    margin: 0;
    padding: 0 16px 8px 40px;
    border-bottom: 1px solid #ebedf0;
    li {
      padding: 8px 0;
    }
  }
}
</style>