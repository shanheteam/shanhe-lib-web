/**
 * 站点地图反向代理（EdgeOne Pages Function）
 *
 * 路由：/functions/sitemap/[[default]].js  →  https://<前台域名>/sitemap/*
 * 作用：把 /sitemap/sitemap.xml 等请求在边缘转发到后端并原样返回，
 *       使前台页脚可以继续使用根相对路径 /sitemap/sitemap.xml（地址栏不变）。
 *
 * 为什么必须用 Function：站点地图文件由后端生成（写入本地磁盘 + OSS），
 * 前台是 EdgeOne Pages 的静态站，域名下并没有这个文件。而 Pages 的 edgeone.json
 * `rewrites` 只对静态资源、且只支持站内相对 destination —— 实测把 destination 写成
 * 外部绝对 URL 会返回 423（空响应体），因此只能用边缘函数做真正的反向代理。
 *
 * 前提：后端那份 sitemap/*.xml 必须是最新的。见 server/src/modules/config/config.controller.ts
 *       的 putSitemapFile —— OSS 启用时也会同时写本地磁盘，故 <API域名>/sitemap/* 是新的。
 *
 * 上游地址优先取 Pages 环境变量 VITE_API_BASE_URL，未配置时回退到生产 API 域名。
 */
const FALLBACK_UPSTREAM = 'https://apilib.shanhe.co'

export async function onRequestGet({ request, params, env }) {
  const base = String((env && env.VITE_API_BASE_URL) || FALLBACK_UPSTREAM).replace(/\/+$/, '')

  // [[default]] 捕获 /sitemap/ 之后的全部路径；不同版本可能给字符串或数组，两种都兼容
  const rest = params && params.default
  const sub = Array.isArray(rest) ? rest.join('/') : String(rest || '')
  const target = `${base}/sitemap/${sub}`

  let upstream
  try {
    upstream = await fetch(target, {
      method: 'GET',
      headers: { Accept: 'application/xml,text/xml,*/*' },
    })
  } catch (e) {
    return new Response('站点地图暂时不可用', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const headers = new Headers()
  headers.set(
    'Content-Type',
    upstream.headers.get('Content-Type') || 'application/xml; charset=utf-8',
  )
  // 站点地图只在后台「更新站点地图」或每日定时任务时变化，边缘缓存 10 分钟足够；
  // 需要立即生效时可在 EdgeOne 控制台清除该 URL 的缓存。
  headers.set('Cache-Control', 'public, max-age=600')

  return new Response(upstream.body, { status: upstream.status, headers })
}
