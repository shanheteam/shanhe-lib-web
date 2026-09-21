import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { requireLogin } from '@/utils/utils'

// 相对资源路径转绝对 URL（社交平台抓取 Open Graph 图片要求绝对地址）
export function toAbsoluteUrl(p?: string | null): string {
  if (!p) return ''
  if (/^(https?:|data:|blob:)/i.test(p)) return p
  return window.location.origin + (p.startsWith('/') ? p : '/' + p)
}

// 全局 SEO meta 工具：设置页面标题、描述、关键词及社交分享标签（供路由守卫及各详情页复用）
// 全动态：SEO 元信息不再写死在 index.html，这里负责保证 name/property 标签"不存在则创建"，避免依赖静态初始标签
export function setPageMeta(
  title: string,
  description?: string,
  keywords?: string,
  ogImage?: string,
  ogUrl?: string,
) {
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
  const setProp = (property: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('property', property)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  // 固定社交身份标签（og 用 property、twitter 用 name），随每次 setPageMeta 保证存在
  setProp('og:locale', 'zh_CN')
  setProp('og:type', 'website')
  setMeta('twitter:card', 'summary')

  // 常规 SEO 标签
  if (description) setMeta('description', description)
  if (keywords) setMeta('keywords', keywords)

  // 标题/描述同步到 Open Graph 与 Twitter
  setProp('og:title', title)
  setMeta('twitter:title', title)
  if (description) {
    setProp('og:description', description)
    setMeta('twitter:description', description)
  }
  // 分享图：统一绝对 URL（由调用方经 toAbsoluteUrl 转换）
  if (ogImage) {
    setProp('og:image', ogImage)
    setMeta('twitter:image', ogImage)
  }
  if (ogUrl) setProp('og:url', ogUrl)
}

// 生成规范 URL（canonical）：origin + path，去掉 query/hash 与多余尾斜杠（首页保留根 "/"）
export function toCanonicalUrl(path: string): string {
  const clean = path.replace(/[?#].*$/, '')
  return window.location.origin + (clean === '/' ? '/' : clean.replace(/\/+$/, ''))
}

// upsert <link rel="canonical">；url 为空时移除该标签（用于 noindex 页清空残留）
export function setCanonical(url?: string) {
  if (typeof document === 'undefined') return
  const href = url || ''
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!href) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// 按 key 前缀移除已注入的 JSON-LD 节点（data-type="ldjson"）
export function removeJsonLd(keyPrefix: string) {
  if (typeof document === 'undefined') return
  document
    .querySelectorAll<HTMLScriptElement>('script[data-type="ldjson"]')
    .forEach((el) => {
      if ((el.getAttribute('data-key') || '').startsWith(keyPrefix)) el.remove()
    })
}

// 注入 JSON-LD 结构化数据（按 data-key 去重）；data 为 null 时移除该 key
export function upsertJsonLd(key: string, data: object | null) {
  if (typeof document === 'undefined') return
  const selector = `script[data-type="ldjson"][data-key="${key}"]`
  let el = document.querySelector<HTMLScriptElement>(selector)
  if (!data) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.setAttribute('type', 'application/ld+json')
    el.setAttribute('data-type', 'ldjson')
    el.setAttribute('data-key', key)
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
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
    path: '/oauth/callback',
    name: 'oauth-callback',
    component: () => import('@/views/oauth.vue'),
    meta: { title: 'OAuth登录', noindex: true },
  },
  // 与 admin 配置页提示的回调地址 /oauth/{类型名}（如 /oauth/wechat）对应，
  // 类型名由 oauth.vue 从路径参数解析；保留 /oauth/callback 兼容旧配置
  {
    path: '/oauth/:type',
    name: 'oauth-type',
    component: () => import('@/views/oauth.vue'),
    meta: { title: 'OAuth登录', noindex: true },
  },
  {
    path: '/upload',
    name: 'upload',
    component: () => import('@/views/upload.vue'),
    meta: { title: '上传文档', noindex: true },
  },
  {
    path: '/post',
    name: 'post',
    component: () => import('@/views/post.vue'),
    meta: { title: '发布文章', noindex: true },
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
  { path: '/:pathMatch(.*)*', name: '404', component: () => import('@/views/404.vue'), meta: { noindex: true } },
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

  // 加载站点配置（已有配置或刚失败过则跳过，避免配置接口异常时每次跳转都被超时请求阻塞）
  if (settingStore.needFetchSettings()) {
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
  const settings = settingStore.settings || {}
  const sitename = settings?.system?.sitename || '图书馆 - 山河大学'

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
  // Open Graph 站点名与分享图：站点名来自后台配置，分享图统一为绝对 URL。
  // index.html 已不再静态写入 og:site_name，故"不存在则创建"
  let ogSiteName = document.querySelector<HTMLMetaElement>('meta[property="og:site_name"]')
  if (!ogSiteName) {
    ogSiteName = document.createElement('meta')
    ogSiteName.setAttribute('property', 'og:site_name')
    document.head.appendChild(ogSiteName)
  }
  ogSiteName.setAttribute('content', sitename)
  const logo = settings?.system?.logo || '/static/images/logo.png'
  // canonical 与 JSON-LD：可索引页注入规范 URL，noindex 页清空残留触发下一路由再建
  const canonicalUrl = meta.noindex ? '' : toCanonicalUrl(to.path)
  setCanonical(canonicalUrl)
  // 文章详情 schema 由组件注入，这里统一清空（避免文章间跳转残留旧 article:* 节点）
  removeJsonLd('article')
  // 首页注入站点 WebSite + SearchAction 结构化数据
  if (to.path === '/') {
    upsertJsonLd('site', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: sitename,
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${window.location.origin}/search?wd={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    })
  } else {
    removeJsonLd('site')
  }
  setPageMeta(title, meta.description || sitename, undefined, toAbsoluteUrl(logo), canonicalUrl)
})

export default router