import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { requireLogin } from '@/utils/utils'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    component: () => import('@/views/index.vue'),
  },
  { path: '/login', name: 'login', component: () => import('@/views/login.vue') },
  { path: '/register', name: 'register', component: () => import('@/views/register.vue') },
  { path: '/findpassword', name: 'findpassword', component: () => import('@/views/findpassword.vue') },
  { path: '/upload', name: 'upload', component: () => import('@/views/upload.vue') },
  { path: '/post', name: 'post', component: () => import('@/views/post.vue') },
  { path: '/search', name: 'search', component: () => import('@/views/search.vue') },
  { path: '/category', redirect: '/category/0' },
  { path: '/category/:id', name: 'category-id', component: () => import('@/views/category/_id.vue') },
  { path: '/document/:id', name: 'document-id', component: () => import('@/views/document/_id.vue') },
  {
    path: '/article',
    name: 'article',
    component: () => import('@/views/article/index.vue'),
    meta: { layout: 'article' },
  },
  {
    path: '/article/:id',
    name: 'article-id',
    component: () => import('@/views/article/_id.vue'),
    meta: { layout: 'article' },
  },
  {
    path: '/me',
    component: () => import('@/views/me.vue'),
    children: [
      { path: '', name: 'me', component: () => import('@/views/me/index.vue') },
      { path: 'article', name: 'me-article', component: () => import('@/views/me/article.vue') },
      { path: 'document', name: 'me-document', component: () => import('@/views/me/document.vue') },
      { path: 'download', name: 'me-download', component: () => import('@/views/me/download.vue') },
      { path: 'favorite', name: 'me-favorite', component: () => import('@/views/me/favorite.vue') },
      { path: 'password', name: 'me-password', component: () => import('@/views/me/password.vue') },
      { path: 'profile', name: 'me-profile', component: () => import('@/views/me/profile.vue') },
    ],
  },
  {
    path: '/user/:id',
    component: () => import('@/views/user/_id.vue'),
    children: [
      { path: '', name: 'user-id', component: () => import('@/views/user/_id/index.vue') },
      { path: 'article', name: 'user-id-article', component: () => import('@/views/user/_id/article.vue') },
      { path: 'document', name: 'user-id-document', component: () => import('@/views/user/_id/document.vue') },
    ],
  },
  // 管理后台
  {
    path: '/admin',
    component: () => import('@/views/admin/index.vue'),
    meta: { layout: 'admin' },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/dashboard.vue') },
      { path: 'document/category', name: 'admin-document-category', component: () => import('@/views/admin/document/category.vue') },
      { path: 'document/list', name: 'admin-document-list', component: () => import('@/views/admin/document/list.vue') },
      { path: 'document/language', name: 'admin-document-language', component: () => import('@/views/admin/document/language.vue') },
      { path: 'document/searchrecord', name: 'admin-document-searchrecord', component: () => import('@/views/admin/document/searchrecord.vue') },
      { path: 'document/recycle', name: 'admin-document-recycle', component: () => import('@/views/admin/document/recycle.vue') },
      { path: 'article/category', name: 'admin-article-category', component: () => import('@/views/admin/article/category.vue') },
      { path: 'article/list', name: 'admin-article-list', component: () => import('@/views/admin/article/list.vue') },
      { path: 'article/recycle', name: 'admin-article-recycle', component: () => import('@/views/admin/article/recycle.vue') },
      { path: 'article/set', name: 'admin-article-set', component: () => import('@/views/admin/article/set.vue') },
      { path: 'user/list', name: 'admin-user-list', component: () => import('@/views/admin/user/list.vue') },
      { path: 'user/group', name: 'admin-user-group', component: () => import('@/views/admin/user/group.vue') },
      { path: 'user/permission', name: 'admin-user-permission', component: () => import('@/views/admin/user/permission.vue') },
      { path: 'user/punishment', name: 'admin-user-punishment', component: () => import('@/views/admin/user/punishment.vue') },
      { path: 'comment', name: 'admin-comment', component: () => import('@/views/admin/comment.vue') },
      { path: 'report', name: 'admin-report', component: () => import('@/views/admin/report.vue') },
      { path: 'advertisement', name: 'admin-advertisement', component: () => import('@/views/admin/advertisement.vue') },
      { path: 'banner', name: 'admin-banner', component: () => import('@/views/admin/banner.vue') },
      { path: 'navigation', name: 'admin-navigation', component: () => import('@/views/admin/navigation.vue') },
      { path: 'friendlink', name: 'admin-friendlink', component: () => import('@/views/admin/friendlink.vue') },
      { path: 'attachment', name: 'admin-attachment', component: () => import('@/views/admin/attachment.vue') },
      { path: 'config/system', name: 'admin-config-system', component: () => import('@/views/admin/config/system.vue') },
      { path: 'config/display', name: 'admin-config-display', component: () => import('@/views/admin/config/display.vue') },
      { path: 'config/footer', name: 'admin-config-footer', component: () => import('@/views/admin/config/footer.vue') },
      { path: 'config/captcha', name: 'admin-config-captcha', component: () => import('@/views/admin/config/captcha.vue') },
      { path: 'config/security', name: 'admin-config-security', component: () => import('@/views/admin/config/security.vue') },
      { path: 'config/converter', name: 'admin-config-converter', component: () => import('@/views/admin/config/converter.vue') },
      { path: 'config/download', name: 'admin-config-download', component: () => import('@/views/admin/config/download.vue') },
      { path: 'config/score', name: 'admin-config-score', component: () => import('@/views/admin/config/score.vue') },
      { path: 'config/email', name: 'admin-config-email', component: () => import('@/views/admin/config/email.vue') },
      { path: 'config/search', name: 'admin-config-search', component: () => import('@/views/admin/config/search.vue') },
      { path: 'config/spider', name: 'admin-config-spider', component: () => import('@/views/admin/config/spider.vue') },
      { path: 'config/vip', name: 'admin-config-vip', component: () => import('@/views/admin/config/vip.vue') },
      { path: 'config/miniprogram', name: 'admin-config-miniprogram', component: () => import('@/views/admin/config/miniprogram.vue') },
      { path: 'config/oauth', name: 'admin-config-oauth', component: () => import('@/views/admin/config/oauth.vue') },
      { path: 'config/pay', name: 'admin-config-pay', component: () => import('@/views/admin/config/pay.vue') },
      { path: 'config/sms', name: 'admin-config-sms', component: () => import('@/views/admin/config/sms.vue') },
      { path: 'config/storage', name: 'admin-config-storage', component: () => import('@/views/admin/config/storage.vue') },
      { path: 'spider/url', name: 'admin-spider-url', component: () => import('@/views/admin/spider/url.vue') },
      { path: 'spider/articlelist', name: 'admin-spider-articlelist', component: () => import('@/views/admin/spider/articlelist.vue') },
      { path: 'spider/articledetail', name: 'admin-spider-articledetail', component: () => import('@/views/admin/spider/articledetail.vue') },
      { path: 'spider/document', name: 'admin-spider-document', component: () => import('@/views/admin/spider/document.vue') },
      { path: 'order', name: 'admin-order', component: () => import('@/views/admin/order.vue') },
      { path: 'user/sms', name: 'admin-user-sms', component: () => import('@/views/admin/user/sms.vue') },
      { path: 'user/vip', name: 'admin-user-vip', component: () => import('@/views/admin/user/vip.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', name: '404', component: () => import('@/views/404.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  const settingStore = useSettingStore()

  // 对应原 middleware/checkFront.js
  if (
    (to.name === 'login' || to.name === 'register') &&
    !(from.name === 'login' || from.name === 'register')
  ) {
    if (!to.query.redirect) {
      return { ...to, query: { ...to.query, redirect: from.fullPath } }
    }
  }

  // 加载站点配置
  if (!Object.keys(settingStore.settings.system || {}).length) {
    await settingStore.getSettings()
  }

  const settings = settingStore.settings
  const user = userStore.user || { id: 0 }
  const permissions = userStore.permissions || []

  if (requireLogin(settings, user, to, permissions)) {
    return { path: '/login' }
  }

  // /me 路由需要登录
  if (to.path.startsWith('/me') && !user.id) {
    return { path: '/login' }
  }

  // 对应原 middleware/auth.js（管理后台）
  if (to.meta.layout === 'admin' || to.matched.some((r) => r.meta.layout === 'admin')) {
    const token = userStore.token
    const allowPages = [...(userStore.allowPages || [])]
    if (!token || allowPages.length === 0) {
      return { path: '/' }
    }
    allowPages.push('/admin', '/admin/index', '/admin/dashboard', '/admin/navigation')
    let routePath = to.path
    if (routePath.endsWith('/')) routePath = routePath.slice(0, -1)
    if (!allowPages.includes(routePath)) {
      return { path: '/admin' }
    }
  }

  return true
})

// 设置页面标题
router.afterEach((to) => {
  const settingStore = useSettingStore()
  const sitename = settingStore.settings?.system?.sitename
  if (typeof document !== 'undefined') {
    document.title = sitename ? sitename : '魔豆文库'
  }
})

export default router