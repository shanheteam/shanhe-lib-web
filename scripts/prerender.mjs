/**
 * 构建期预渲染：把文章/文档详情页渲染成静态 HTML。
 *
 * 为什么需要：本项目是纯客户端渲染的 SPA，`<title>` / `description` / `og:*` 全部由
 * router/index.ts 的 afterEach 守卫与各详情页的 setPageMeta 在**运行时**注入。
 * 因此不执行 JS 的抓取方（百度、微信/QQ 分享卡片等）只能读到 index.html 的兜底标题。
 * 本脚本在构建后驱动无头浏览器逐页渲染，把带正确 meta 的 HTML 落盘为静态文件，
 * EdgeOne Pages 便会直接命中这些文件（静态资源优先于 SPA 回退）。
 *
 * 用法：
 *   npm run prerender            # 全量预渲染
 *   npm run prerender -- --dry-run   # 只收集 URL 并打印输出路径，不启动浏览器
 *   npm run prerender -- --limit=50  # 只渲染前 50 个（调试用）
 *
 * 前置条件：
 *   1. 已执行 `npm run build`（dist/ 存在）
 *   2. 后端可访问（默认 https://apilib.shanhe.co，可用 PRERENDER_API 覆盖）
 *   3. 已安装 puppeteer-core（`npm i -D puppeteer-core`），且本机有 Chrome
 *      —— 用 puppeteer-core 而非 puppeteer 是为了复用本机 Chrome，免下载 Chromium
 *
 * 环境变量：
 *   PRERENDER_API   后端地址，默认 https://apilib.shanhe.co
 *   PRERENDER_SITE  前端站点地址，用于从 sitemap 中筛出本站 URL，默认 https://lib.shanhe.co
 *   CHROME_PATH     Chrome 可执行文件路径，默认 macOS 上的 Google Chrome
 *
 * ⚠️ 内容更新后需要重新执行本脚本（sitemap 变了、或详情页内容变了），
 *    再重新部署 dist/。可在后台「更新站点地图」后接一个构建钩子来自动化。
 *
 * 注意：**不要**把本脚本挂进默认的 `npm run build` —— 它依赖后端可访问与外网，
 * 会让构建变慢且容易失败。CI 里单独跑一步更稳。
 */
import { createServer } from 'node:http'
import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { join, resolve, extname, dirname } from 'node:path'

const CLIENT = resolve(import.meta.dirname, '..')
const DIST = join(CLIENT, 'dist')

const API = (process.env.PRERENDER_API || 'https://apilib.shanhe.co').replace(/\/+$/, '')
const SITE = (process.env.PRERENDER_SITE || 'https://lib.shanhe.co').replace(/\/+$/, '')
const CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const limitArg = args.find((a) => a.startsWith('--limit='))
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : 0

/** 只预渲染详情页；列表页/静态页由守卫的静态 meta 处理即可 */
const TARGET_PREFIXES = ['/article/', '/document/']

function collectSitemapUrls(xml, out) {
  for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) out.push(m[1])
  return out
}

async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  return res.text()
}

/** 从后端 sitemap 汇总全部详情页 URL（sitemap 已含全量文档/文章，无需另调业务接口） */
async function collectTargetUrls() {
  const indexXml = await fetchText(`${API}/sitemap/sitemap.xml`)
  const files = collectSitemapUrls(indexXml, [])
  const urls = []
  for (const file of files) {
    // 索引里的地址可能指向站点域名（由 EdgeOne Pages Function 代理）或后端域名，统一改写到后端
    const backendUrl = `${API}/sitemap/${file.split('/sitemap/').pop()}`
    try {
      collectSitemapUrls(await fetchText(backendUrl), urls)
    } catch (e) {
      console.warn(`[prerender] 跳过 ${backendUrl}：${e.message}`)
    }
  }
  const seen = new Set()
  const targets = []
  for (const u of urls) {
    if (!u.startsWith(SITE)) continue // 只处理本站 URL
    const path = u.slice(SITE.length).replace(/\/+$/, '')
    if (!TARGET_PREFIXES.some((p) => path.startsWith(p))) continue
    if (seen.has(path)) continue
    seen.add(path)
    targets.push(path)
  }
  return LIMIT > 0 ? targets.slice(0, LIMIT) : targets
}

/** 静态服务 dist/，未命中文件回退 index.html（与线上 SPA 行为一致） */
function startStaticServer() {
  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.xml': 'application/xml',
    '.txt': 'text/plain; charset=utf-8',
  }
  return new Promise((ok) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
      let file = join(DIST, urlPath)
      if (!existsSync(file) || statSync(file).isDirectory()) {
        const withIndex = join(file, 'index.html')
        file = existsSync(withIndex) ? withIndex : join(DIST, 'index.html')
      }
      res.setHeader('Content-Type', MIME[extname(file)] || 'application/octet-stream')
      res.end(readFileSync(file))
    })
    server.listen(0, '127.0.0.1', () => ok({ server, port: server.address().port }))
  })
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('[prerender] 未找到 dist/，请先执行 npm run build')
    process.exit(1)
  }
  // 关键前置校验：必须用**生产环境变量**构建，否则 bundle 里内联的 API 地址可能是
  // http://127.0.0.1:xxxx，无头浏览器取不到数据 → 标题永远停在兜底值，
  // 却仍然「成功」落盘一堆错误 HTML（静默失效）。
  // 注意：必须扫描**全部** js 产物。入口名虽然形如 index-*.js，但同目录还有大量
  // 同名模式的路由 chunk，只取第一个会漏检（本防护最初就因此静默失效过）。
  let local = null
  for (const f of readdirSync(join(DIST, 'assets'))) {
    if (!f.endsWith('.js')) continue
    const hit = readFileSync(join(DIST, 'assets', f), 'utf8').match(
      /https?:\/\/(?:127\.0\.0\.1|localhost):\d+/,
    )
    if (hit) {
      local = hit
      break
    }
  }
  {
    if (local) {
      console.error(
        `[prerender] 构建产物里内联的 API 地址是本地地址（${local[0]}），` +
          '无头浏览器将取不到数据，预渲染会产出错误的 HTML。\n' +
          '  请改用生产环境变量重新构建，例如：\n' +
          '    VITE_API_BASE_URL=https://apilib.shanhe.co npm run build',
      )
      process.exit(1)
    }
  }
  console.log(`[prerender] 后端 ${API}，站点 ${SITE}`)
  const targets = await collectTargetUrls()
  console.log(`[prerender] 待预渲染详情页：${targets.length} 个`)
  if (targets.length === 0) {
    console.warn('[prerender] 没有可预渲染的 URL —— 检查 sitemap 是否已生成、PRERENDER_SITE 是否正确')
    return
  }

  if (DRY_RUN) {
    console.log('[prerender] --dry-run，仅列出前 20 条及输出路径：')
    for (const t of targets.slice(0, 20)) {
      console.log(`  ${t}  →  dist${t}/index.html`)
    }
    return
  }

  if (!existsSync(CHROME)) {
    console.error(
      `[prerender] 未找到 Chrome：${CHROME}\n` +
        '  请安装 Google Chrome，或用 CHROME_PATH 指定可执行文件路径。',
    )
    process.exit(1)
  }
  let puppeteer
  try {
    puppeteer = (await import('puppeteer-core')).default
  } catch {
    console.error('[prerender] 未安装 puppeteer-core，请执行：npm i -D puppeteer-core')
    process.exit(1)
  }

  const { server, port } = await startStaticServer()
  const origin = `http://127.0.0.1:${port}`
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  let okCount = 0
  let failCount = 0
  try {
    for (const [i, path] of targets.entries()) {
      const page = await browser.newPage()
      try {
        await page.goto(origin + path, { waitUntil: 'networkidle2', timeout: 30000 })
        // 详情页标题在接口数据到达后才注入，等它变成「… - 站点名」再落盘；
        // 超时则按当前内容保存，避免整批中断。
        await page
          .waitForFunction(
            (site) => document.title && !site.endsWith(document.title.trim()),
            { timeout: 15000 },
            SITE,
          )
          .catch(() => {})
        const html = await page.content()
        const outFile = join(DIST, path, 'index.html')
        mkdirSync(dirname(outFile), { recursive: true })
        writeFileSync(outFile, html)
        okCount++
        if ((i + 1) % 20 === 0) console.log(`[prerender] 进度 ${i + 1}/${targets.length}`)
      } catch (e) {
        failCount++
        console.warn(`[prerender] 失败 ${path}：${e.message}`)
      } finally {
        await page.close()
      }
    }
  } finally {
    await browser.close()
    server.close()
  }
  console.log(`[prerender] 完成：成功 ${okCount}，失败 ${failCount}`)
  if (failCount > 0) process.exitCode = 1
}

main().catch((e) => {
  console.error('[prerender] 执行失败：', e)
  process.exit(1)
})
