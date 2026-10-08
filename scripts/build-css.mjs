// 样式编译/合并脚本：
// 1. 编译 public/assets/css/components.scss（组件样式唯一来源）为 public/css/components.css。
//    .vue 中禁止再写 <style>：历史实现会把抽取结果「覆盖」写入 components.css，一旦 .vue 里重新出现
//    <style>，产物就只剩那几行、全站组件样式在页面上消失。故此处检测到回流即报错退出，
//    既不改写 .vue，也不覆盖既有产物。
// 2. 编译公共样式（骨架样式 + tokens.scss + app.scss）为 public/css/app.css（每次重建，内容不变则版本号不变）。
// 3. 合并依赖 css（EP + markdown）为 public/css/vendor.css（每次重建，内容不变则版本号不变）。
//    后台专用的 vxe / wangeditor 样式不在其中，由组件按需 import（见步骤 3 注释）。
// 产物用「固定文件名 + 内容版本查询串」：
//   index.html 引用 /css/app.css?v=<内容哈希前 8 位>，edgeone.json 对 /css/* 仍是一年 immutable，
//   而 EdgeOne 的缓存键包含查询串（已实测：不同 ?v= 各自独立缓存），因此内容一变 URL 就变、
//   浏览器与 CDN 自动拉新；文件名单一稳定，public/css 下也不会再随构建增删 hash 文件。
//   （若改回固定名且去掉 ?v=，就必须同时把 /css/* 改成协商缓存，否则老访客一年拿不到新样式。）
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, unlinkSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, extname, resolve } from 'node:path'
import { compileString } from 'sass'
import { transformSync } from 'esbuild'

const CLIENT = resolve(import.meta.dirname, '..')
const SRC = join(CLIENT, 'src')
const CSS_SRC = join(CLIENT, 'public', 'assets', 'css')
const OUT_CSS = join(CLIENT, 'public', 'css')

// 仅用于回流检测（不再用于抽取）
const STYLE_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/i

const varScss = readFileSync(join(CSS_SRC, 'var.scss'), 'utf8')

function compileScss(src, tag) {
  try {
    return compileString(varScss + '\n' + src, { loadPaths: [CSS_SRC] }).css
  } catch (e) {
    console.error(`[build-css] 编译失败（${tag}）：${e.message}`)
    process.exit(1)
  }
}

function walk(d) {
  const out = []
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (f === 'node_modules' || f === 'dist') continue
    const s = statSync(p)
    if (s.isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}

mkdirSync(OUT_CSS, { recursive: true })

// 生成的 css 链接映射：name → /css/name.css?v={hash}（末尾据此更新 index.html 的 <link>）
const cssLinks = {}

/**
 * 以固定文件名写入 public/css/{name}.css，内容哈希只作为 ?v= 版本号，返回 /css/ 相对 URL。
 * 同时清理历史遗留的 {name}.{hash8}.css 产物（旧方案），避免仓库与产物目录里残留死文件。
 */
function emitCss(name, css) {
  // 压缩：sass 默认输出 expanded（带缩进与注释），三个产物都阻塞首屏。
  // 实测 components.css 136KB→109KB、app.css 11KB→7KB（gzip 合计约 −4.4KB）。
  // 用 esbuild 统一处理（Vite 自带依赖），它对 CSS 的压缩是保守的，不改语义。
  // 注意：分节注释 /* ===== ... ===== */ 会被去掉，已确认无脚本依赖这些标记。
  const minified = transformSync(css, { loader: 'css', minify: true }).code
  const hash = createHash('md5').update(minified).digest('hex').slice(0, 8)
  writeFileSync(join(OUT_CSS, `${name}.css`), minified)
  for (const f of readdirSync(OUT_CSS)) {
    if (new RegExp(`^${name}\\.[0-9a-f]{8}\\.css$`).test(f)) unlinkSync(join(OUT_CSS, f))
  }
  const url = `/css/${name}.css?v=${hash}`
  cssLinks[name] = url
  return url
}

/**
 * 把 index.html 中 /css/{vendor|app|components} 的引用更新为最新版本串。
 * 正则同时兼容三种历史形态，便于平滑迁移：
 *   /css/app.css  →  /css/app.abce745b.css（旧 hash 文件名）  →  /css/app.css?v=abce745b（当前）
 */
function updateIndexHtml() {
  const indexPath = join(CLIENT, 'index.html')
  const html = readFileSync(indexPath, 'utf8')
  const updated = html.replace(
    /\/css\/(vendor|app|components)(?:\.[0-9a-f]{8})?\.css(?:\?v=[0-9a-f]{8})?/g,
    (_, name) => cssLinks[name] ?? `/css/${name}.css`,
  )
  if (updated !== html) writeFileSync(indexPath, updated)
}

// ===== 1. 组件样式 → components.css（源：public/assets/css/components.scss）=====
// 回流检测：.vue 一旦出现 <style>，历史实现会覆盖产物并导致全站组件样式丢失，这里直接中止构建。
const vueFiles = walk(SRC)
  .filter((p) => extname(p) === '.vue')
  .sort()
const offenders = vueFiles.filter((p) => STYLE_RE.test(readFileSync(p, 'utf8')))
if (offenders.length) {
  console.error('[build-css] 检测到 .vue 中出现 <style> 块（组件样式须写在 public/assets/css/components.scss）：')
  for (const p of offenders) console.error(`  ${p.replace(CLIENT + '/', '')}`)
  console.error('[build-css] 本次构建已中止，未写入任何产物。')
  process.exit(1)
}
emitCss('components', compileScss(readFileSync(join(CSS_SRC, 'components.scss'), 'utf8'), 'components.scss'))
console.log('[build-css] components.css：已由 public/assets/css/components.scss 编译生成')

// ===== 2. 公共样式 → app.css（骨架 + tokens + app.scss） =====
const skeleton = readFileSync(join(CSS_SRC, 'skeleton.css'), 'utf8')
const tokensCss = compileScss(readFileSync(join(CSS_SRC, 'tokens.scss'), 'utf8'), 'tokens.scss')
const appCss = compileScss(readFileSync(join(CSS_SRC, 'app.scss'), 'utf8'), 'app.scss')
let appOut = ''
if (skeleton) appOut += `/* ===== skeleton.css（首屏骨架） ===== */\n${skeleton}\n`
appOut += `/* ===== tokens.scss（设计令牌） ===== */\n${tokensCss}\n`
appOut += `/* ===== app.scss（全局样式） ===== */\n${appCss}\n`
emitCss('app', appOut)
console.log('[build-css] app.css：骨架样式 + tokens.scss + app.scss 已生成')

// ===== 3. 依赖样式 → vendor.css =====
// 仅保留「公开页确实需要」的依赖样式。vxe-table / vxe-pc-ui / wangeditor 只在后台页与 /post 用到，
// 改由对应组件自行 import（见 TableListV2.vue、RichEditor.vue），由 Vite 切进各自的异步 chunk：
// 既避免所有公开页首屏渲染阻塞地加载用不到的样式（曾合计 639KB 原始 / 108KB gzip），
// 也让 vxe-table 样式里的 url("./iconfont.*") 交由 Vite 解析并产出字体（此前手工合并会导致字体 404）。
// markdown.css（Editor.md 预览样式，59KB）同理：.markdown-body 全站只用于文章详情页
// （src/views/article/_id.vue），已移入 src/assets/css/ 并由该视图 import，随文章路由异步加载。
const vendorFiles = [
  'node_modules/element-plus/dist/index.css',
  'node_modules/element-plus/theme-chalk/display.css',
]
let vendorOut = ''
for (const vf of vendorFiles) {
  const p = join(CLIENT, vf)
  const css = readFileSync(p, 'utf8')
  vendorOut += `\n/* ===== ${vf} ===== */\n${css}\n`
}
emitCss('vendor', vendorOut.trimStart())
console.log(`[build-css] vendor.css：${vendorFiles.length} 个依赖/外部样式已合并`)

// ===== 4. 同步 index.html 的 <link> 到最新 hash 文件 =====
updateIndexHtml()
