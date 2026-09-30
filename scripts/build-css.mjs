// 样式编译/合并脚本：
// 1. 编译 public/assets/css/components.scss（组件样式唯一来源）为 public/css/components.{hash}.css。
//    .vue 中禁止再写 <style>：历史实现会把抽取结果「覆盖」写入 components.css，一旦 .vue 里重新出现
//    <style>，产物就只剩那几行、全站组件样式在页面上消失。故此处检测到回流即报错退出，
//    既不改写 .vue，也不覆盖既有产物。
// 2. 编译公共样式（骨架样式 + tokens.scss + app.scss）为 public/css/app.{hash}.css（每次重建，内容不变则 hash 不变）。
// 3. 合并依赖 css（EP/vxe/wangeditor/markdown）为 public/css/vendor.{hash}.css（每次重建，内容不变则 hash 不变）。
// 输出文件名带内容 hash：配合 edgeone.json 对 /css/* 的一年强缓存，二次访问零重复下载，
// 同时内容变更时文件名变化、浏览器自动拉新，无缓存更新延迟。
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, copyFileSync, unlinkSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, extname, resolve } from 'node:path'
import { compileString } from 'sass'

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

// 生成的 css 文件名映射：name → /css/name.{hash}.css（末尾据此更新 index.html 的 <link>）
const cssLinks = {}

/** 写入 {name}.{hash8}.css，清理同名前缀的旧 hash 文件，返回 /css/ 相对 URL。 */
function emitCss(name, css) {
  const hash = createHash('md5').update(css).digest('hex').slice(0, 8)
  const file = `${name}.${hash}.css`
  writeFileSync(join(OUT_CSS, file), css)
  // 清理同名前缀的旧 hash 文件（保留不带 hash 的基础名，便于回滚/对照）
  for (const f of readdirSync(OUT_CSS)) {
    if (f !== file && new RegExp(`^${name}\\.[0-9a-f]{8}\\.css$`).test(f)) {
      unlinkSync(join(OUT_CSS, f))
    }
  }
  const url = `/css/${file}`
  cssLinks[name] = url
  return url
}

/** 把 index.html 中 /css/{vendor|app|components}.css 的引用更新为最新 hash 文件。 */
function updateIndexHtml() {
  const indexPath = join(CLIENT, 'index.html')
  const html = readFileSync(indexPath, 'utf8')
  const updated = html.replace(
    /\/css\/(vendor|app|components)(\.[0-9a-f]{8})?\.css/g,
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
const vendorFiles = [
  'node_modules/element-plus/dist/index.css',
  'node_modules/element-plus/theme-chalk/display.css',
  'node_modules/vxe-table/lib/style.css',
  'node_modules/vxe-pc-ui/lib/style.css',
  'node_modules/@wangeditor-next/editor/dist/css/style.css',
  'public/assets/css/markdown.css',
]
// vxe-pc-ui 的图标字体通过相对路径 url("./iconfont.*") 引用：字体与 css 同在 public/css/ 下，
// 相对路径保持不变即可解析，需把字体文件一并复制过去。
for (const f of readdirSync(join(CLIENT, 'node_modules', 'vxe-pc-ui', 'lib'))) {
  if (f.startsWith('iconfont.')) {
    copyFileSync(join(CLIENT, 'node_modules', 'vxe-pc-ui', 'lib', f), join(OUT_CSS, f))
  }
}
let vendorOut = ''
for (const vf of vendorFiles) {
  const p = join(CLIENT, vf)
  const css = readFileSync(p, 'utf8')
  vendorOut += `\n/* ===== ${vf} ===== */\n${css}\n`
}
emitCss('vendor', vendorOut.trimStart())
console.log('[build-css] vendor.css：6 个依赖/外部样式已合并')

// ===== 4. 同步 index.html 的 <link> 到最新 hash 文件 =====
updateIndexHtml()
