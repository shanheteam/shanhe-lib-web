/**
 * 文章详情页 SEO meta 边缘注入（EdgeOne Pages Function）
 *
 * 路由：functions/article/[[default]].js  →  https://<前台域名>/article/*
 *
 * 与 document 路由同源同套路（原因与取舍见该文件的头部注释）：前台是纯 SPA，爬虫拿到的是
 * 带兜底标题的空壳，这里在边缘取后端数据注入标题/描述/og/canonical。
 * 取不到文章时原样返回外壳，保证页面可用。
 * 说明：入口文件按 EdgeOne 约定写成自包含（不对称逻辑不跨文件 import，避免部署期解析风险）。
 */
const FALLBACK_UPSTREAM = 'https://apilib.shanhe.co'
const FALLBACK_SITE = 'https://lib.shanhe.co'
const DEFAULT_SITENAME = '图书馆 - 山河大学'
/** 文章无独立封面，分享图复用站点 logo（与前端 article 详情页一致） */
const DEFAULT_LOGO_PATH = '/static/images/logo.png'
const CACHE_CONTROL = 'public, max-age=600'

// SPA 外壳在同一 worker 实例内只取一次；失败不缓存，下次请求重试
let shellPromise = null
function getShell(request) {
  if (!shellPromise) {
    // 只请求 /index.html：它不匹配本函数的 /article/* 路由，不会递归进入函数
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

/** 取文章详情 meta；identifier 即 /article/<identifier> 的路径片段 */
async function fetchArticleMeta(base, id) {
  const query = `identifier=${encodeURIComponent(id)}&with_author=true`
  const res = await fetch(`${base}/api/v1/article?${query}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data && data.title ? data : null
}

export async function onRequestGet({ request, params, env }) {
  const base = String((env && env.VITE_API_BASE_URL) || FALLBACK_UPSTREAM).replace(/\/+$/, '')
  const site = String((env && env.SITE_ORIGIN) || FALLBACK_SITE).replace(/\/+$/, '')

  // [[default]] 捕获 /article/ 之后的路径片段；不同版本可能给字符串或数组
  const rest = params && params.default
  const id = (Array.isArray(rest) ? rest.join('/') : String(rest || '')).replace(/^\/+|\/+$/g, '')

  let shell
  try {
    shell = await getShell(request)
  } catch (err) {
    console.error(`[article-seo] 取外壳失败：${err && err.message}`)
    const assets = env && env.ASSETS
    return assets ? assets.fetch(request) : new Response('', { status: 502 })
  }

  // /article 列表或空路径：无需注入
  if (!id) return htmlResponse(shell)

  const meta = await fetchArticleMeta(base, id).catch(() => null)
  if (!meta) return htmlResponse(shell)

  return htmlResponse(
    injectMeta(shell, {
      title: `${meta.title} - ${DEFAULT_SITENAME}`,
      description: meta.description || '',
      keywords: meta.keywords || '',
      canonical: `${site}/article/${id}`,
      image: `${site}${DEFAULT_LOGO_PATH}`,
    }),
  )
}
