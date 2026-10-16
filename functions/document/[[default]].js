/**
 * 文档详情页 SEO meta 边缘注入（EdgeOne Pages Function）
 *
 * 路由：functions/document/[[default]].js  →  https://<前台域名>/document/*
 *
 * 前台是纯 SPA，返回给"不执行 JS"的爬虫（百度、微信/QQ 分享卡片等）永远只有带兜底标题的
 * index.html 空壳。本函数在边缘拦下详情页请求，同步取后端标题/关键词/描述，注入 <title>、
 * description、og:*、canonical 后返回；浏览器拿到的仍是同一个 SPA 外壳，客户端路由守卫随后
 * 会用真实数据覆盖这些标签，二者不冲突。
 *
 * 为什么不用构建期预渲染：EdgeOne Pages 每次部署都会重跑构建命令，而构建容器没有 Chrome，
 * 无头渲染不可用。边缘函数在请求时取数注入，任何一次部署都自动生效且不依赖浏览器。
 *
 * 取数失败或文档不存在（后端错误体为 {code,message}，无 title）时，原样返回外壳，保证页面可用。
 * 说明：入口文件按 EdgeOne 约定写成自包含（不对称逻辑不跨文件 import，避免部署期解析风险）。
 */
const FALLBACK_UPSTREAM = 'https://apilib.shanhe.co'
const FALLBACK_SITE = 'https://lib.shanhe.co'
const DEFAULT_SITENAME = '图书馆 - 山河大学'
/** 详情页只在内容变化时才过期，边缘缓存 10 分钟（与 sitemap 函数一致） */
const CACHE_CONTROL = 'public, max-age=600'

// SPA 外壳在同一 worker 实例内只取一次；失败不缓存，下次请求重试
let shellPromise = null
function getShell(request) {
  if (!shellPromise) {
    // 只请求 /index.html：它不匹配本函数的 /document/* 路由，不会递归进入函数
    shellPromise = fetch(new URL('/index.html', request.url))
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`shell ${res.status}`))))
      .catch((err) => {
        shellPromise = null
        throw err
      })
  }
  return shellPromise
}

const escapeHtml = (value) =>
  String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** 覆盖兜底 <title>，并向 <head> 追加 meta/og/canonical */
function injectMeta(html, meta) {
  const { title, description, keywords, canonical, image } = meta
  const tags = []
  if (description) {
    tags.push(`<meta name="description" content="${escapeHtml(description)}">`)
    tags.push(`<meta property="og:description" content="${escapeHtml(description)}">`)
    tags.push(`<meta name="twitter:description" content="${escapeHtml(description)}">`)
  }
  if (keywords) tags.push(`<meta name="keywords" content="${escapeHtml(keywords)}">`)
  tags.push(`<meta property="og:title" content="${escapeHtml(title)}">`)
  tags.push(`<meta name="twitter:title" content="${escapeHtml(title)}">`)
  tags.push('<meta property="og:type" content="article">')
  tags.push('<meta property="og:locale" content="zh_CN">')
  if (image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(image)}">`)
    tags.push(`<meta name="twitter:image" content="${escapeHtml(image)}">`)
  }
  tags.push(`<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`)
  if (canonical) {
    tags.push(`<link rel="canonical" href="${escapeHtml(canonical)}">`)
    tags.push(`<meta property="og:url" content="${escapeHtml(canonical)}">`)
  }
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace('</head>', `${tags.join('')}</head>`)
}

const htmlResponse = (html) =>
  new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': CACHE_CONTROL,
    },
  })

/** 取文档详情 meta；参数与前端 getDocument 完全一致（id 与 uuid 一起传） */
async function fetchDocumentMeta(base, id) {
  const numeric = /^\d+$/.test(id)
  const query = `id=${numeric ? id : 0}&uuid=${encodeURIComponent(id)}&with_author=true&with_all_content=false`
  const res = await fetch(`${base}/api/v1/document?${query}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data && data.title ? data : null
}

export async function onRequestGet({ request, params, env }) {
  const base = String((env && env.VITE_API_BASE_URL) || FALLBACK_UPSTREAM).replace(/\/+$/, '')
  const site = String((env && env.SITE_ORIGIN) || FALLBACK_SITE).replace(/\/+$/, '')

  // [[default]] 捕获 /document/ 之后的路径片段；不同版本可能给字符串或数组
  const rest = params && params.default
  const id = (Array.isArray(rest) ? rest.join('/') : String(rest || '')).replace(/^\/+|\/+$/g, '')

  let shell
  try {
    shell = await getShell(request)
  } catch (err) {
    console.error(`[document-seo] 取外壳失败：${err && err.message}`)
    const assets = env && env.ASSETS
    return assets ? assets.fetch(request) : new Response('', { status: 502 })
  }

  // /document 本身或空路径：无需注入
  if (!id) return htmlResponse(shell)

  const meta = await fetchDocumentMeta(base, id).catch(() => null)
  if (!meta) return htmlResponse(shell)

  return htmlResponse(
    injectMeta(shell, {
      title: `${meta.title} - ${DEFAULT_SITENAME}`,
      description: meta.description || '',
      keywords: meta.keywords || '',
      canonical: `${site}/document/${id}`,
      // 文档详情页前端也未设分享图，这里保持一致
      image: '',
    }),
  )
}
