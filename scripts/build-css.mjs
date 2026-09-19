// 样式编译/抽取/合并脚本：
// 1. 抽取 src/**/*.vue 中的 <style> 块，经 sass 编译（注入 var.scss）合并为 public/css/components.css，
//    并从 .vue 中删除 <style> 块（幂等：无 style 则跳过，已生成的 components.css 保留不覆盖）。
// 2. 编译公共样式（骨架样式 + tokens.scss + app.scss）为 public/css/app.css（每次重建）。
// 3. 合并依赖 css（EP/vxe/wangeditor/markdown）为 public/css/vendor.css（每次重建）。
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, copyFileSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
import { compileString } from 'sass'

const CLIENT = resolve(import.meta.dirname, '..')
const SRC = join(CLIENT, 'src')
const CSS_SRC = join(CLIENT, 'public', 'assets', 'css')
const OUT_CSS = join(CLIENT, 'public', 'css')

const STYLE_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
// Vue SFC 特有选择器语法：抽取为公共 css 后失去 scoped 语义，改写为纯选择器
const VUE_SELECTORS = [
  [/::v-deep\(([^)]+)\)/g, '$1'],
  [/::v-slotted\(([^)]+)\)/g, '$1'],
  [/::v-global\(([^)]+)\)/g, '$1'],
  [/\/deep\/\s*/g, ' '],
  [/\s*>>>\s*/g, ' '],
  [/:deep\(([^)]+)\)/g, '$1'],
  [/:slotted\(([^)]+)\)/g, '$1'],
]

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

function cook(style) {
  let out = style
  for (const [re, rep] of VUE_SELECTORS) out = out.replace(re, rep)
  return out
}

mkdirSync(OUT_CSS, { recursive: true })

// ===== 1. 抽取组件样式 → components.css =====
const vueFiles = walk(SRC)
  .filter((p) => extname(p) === '.vue')
  .sort()
let componentCss = ''
let extracted = 0
for (const file of vueFiles) {
  const rel = file.replace(CLIENT + '/', '')
  const src = readFileSync(file, 'utf8')
  const blocks = [...src.matchAll(STYLE_RE)]
  if (!blocks.length) continue
  const chunk = blocks.map((m) => m[1]).join('\n')
  const css = compileScss(cook(chunk), rel)
  componentCss += `\n/* ===== ${rel} ===== */\n${css}\n`
  const cleaned = src.replace(STYLE_RE, '').replace(/\n{3,}/g, '\n\n').trim() + '\n'
  writeFileSync(file, cleaned)
  extracted++
}
if (componentCss) {
  writeFileSync(join(OUT_CSS, 'components.css'), componentCss.trimStart())
  console.log(`[build-css] components.css：抽取 ${extracted} 个 .vue 的 <style>，已生成并删除组件内样式块`)
} else {
  console.log('[build-css] components.css：无待抽取的 <style>（保留现有产物）')
}

// ===== 2. 公共样式 → app.css（骨架 + tokens + app.scss） =====
const skeleton = readFileSync(join(CSS_SRC, 'skeleton.css'), 'utf8')
const tokensCss = compileScss(readFileSync(join(CSS_SRC, 'tokens.scss'), 'utf8'), 'tokens.scss')
const appCss = compileScss(readFileSync(join(CSS_SRC, 'app.scss'), 'utf8'), 'app.scss')
let appOut = ''
if (skeleton) appOut += `/* ===== skeleton.css（首屏骨架） ===== */\n${skeleton}\n`
appOut += `/* ===== tokens.scss（设计令牌） ===== */\n${tokensCss}\n`
appOut += `/* ===== app.scss（全局样式） ===== */\n${appCss}\n`
writeFileSync(join(OUT_CSS, 'app.css'), appOut)
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
writeFileSync(join(OUT_CSS, 'vendor.css'), vendorOut.trimStart())
console.log('[build-css] vendor.css：6 个依赖/外部样式已合并')
