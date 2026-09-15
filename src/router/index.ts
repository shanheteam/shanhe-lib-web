import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { requireLogin } from '@/utils/utils'

// 全局 SEURL meta 工具：设置页面标题与 description（供路由守卫及各详情页复用）
export function setPageMeta(title: string, description?: string, keywords?: string) {
  if (typeof document === 'undefined') return
  document.title = title
  const setMeta = (name: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.name = name
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }
  if (description) setMeta('description', description)
  if (keywords) setMeta('keywords', keywords)
  // 同步 Open Graph / Twitter 标题与描述
  const setProp = (property: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('property', property)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }
  setProp('og:title', title)
  setProp('twitter:title', title)
  if (description) {
    setProp('og:description', description)
    const tw = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')
    if (tw) tw.setAttribute('content', description)
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    component: () => import('@/views/index.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login.vue'),
    meta: { title: '登录', noindex: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/register.vue'),
    meta: { title: '注册', noindex: true },
  },
  {
    path: '/findpassword',
    name: 'findpassword',
    component: () => import('@/views/findpassword.vue'),
    meta: { title: '找回密码', noindex: true },
  },
  {
    path: '/upload',
    name: 'upload',
    component: () => import('@/views/upload.vue'),
    meta: { title: '上传文档' },
  },
  {
    path: '/post',
    name: 'post',
    component: () => import('@/views/post.vue'),
    meta: { title: '发布文章' },
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/search.vue'),
    meta: { title: '搜索', noindex: true },
  },
  { path: '/category', redirect: '/category/0' },
  {
    path: '/category/:id',
    name: 'category-id',
    component: () => import('@/views/category/_id.vue'),
    meta: { title: '分类' },
  },
  {
    path: '/document/:id',
    name: 'document-id',
    component: () => import('@/views/document/_id.vue'),
  },
  {
    path: '/article',
    name: 'article',
    component: () => import('@/views/article/index.vue'),
    meta: { layout: 'article', title: '文库资料' },
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
    meta: { title: '个人中心', noindex: true },
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
    meta: { title: '用户主页', noindex: true },
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
    meta: { layout: 'admin', title: '管理后台', noindex: true },
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

// 设置页面标题与 description
router.afterEach((to) => {
  const settingStore = useSettingStore()
  const sitename = settingStore.settings?.system?.sitename || '图书馆 - 山河大学'

  // 取最深层路由的 meta（父路由设置，子页未设置时继承父级）
  const matched = to.matched.filter((r) => r.meta && r.meta.title)
  const meta = matched.length ? matched[matched.length - 1].meta : {}

  // noindex：个人中心/后台/搜索等不索引页面加 <meta name="robots" content="noindex">
  const robotsEl = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
  if (meta.noindex) {
    if (robotsEl) robotsEl.setAttribute('content', 'noindex, nofollow')
    else {
      const el = document.createElement('meta')
      el.name = 'robots'
      el.content = 'noindex, nofollow'
      document.head.appendChild(el)
    }
  } else {
    if (robotsEl) robotsEl.remove()
  }

  const title = meta.title ? `${meta.title} - ${sitename}` : sitename
  setPageMeta(title, meta.description || sitename)
})

export default router