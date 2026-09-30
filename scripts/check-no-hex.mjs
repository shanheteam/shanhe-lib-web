// 防回潮检查（样式源头集中后的不变式）：
// 1. src/**/*.vue 中禁止出现 <style> 块 —— 组件样式必须写入 public/assets/css/components.scss，
//    防止组件样式回流到 .vue 内（回流同时会触发 build-css.mjs 步骤 1 中止构建）。
// 2. public/assets/css/*.scss 中，除 tokens.scss（设计令牌）外不允许出现裸 hex；
//    该目录包含组件样式源 components.scss，故组件样式同样受此约束。
//    public/css/*.css 为构建产物（由上述源经 scripts/build-css.mjs 生成），源头已受检，不重复检查。
// 用法：node scripts/check-no-hex.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'

const CLIENT = resolve(import.meta.dirname, '..')
const SRC = join(CLIENT, 'src')
const CSS_SRC = join(CLIENT, 'public', 'assets', 'css')
const TOKENS_FILE = 'tokens.scss'

const HEX_BARE = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])/g
const STYLE_TAG = /<style\b/i

function walk(d, skipDirs = []) {
  const out = []
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (skipDirs.includes(f)) continue
    const s = statSync(p)
    if (s.isDirectory()) out.push(...walk(p, skipDirs))
    else out.push(p)
  }
  return out
}

function lineNo(src, index) {
  return src.slice(0, index).split('\n').length
}

const violations = []

// 规则 1：.vue 禁止内联样式块
for (const file of walk(SRC, ['node_modules', 'dist'])) {
  if (extname(file) !== '.vue') continue
  const src = readFileSync(file, 'utf8')
  const m = STYLE_TAG.exec(src)
  if (m) {
    const rel = file.replace(SRC + '/', '')
    violations.push(`${rel}:${lineNo(src, m.index)}  禁止在 .vue 中写 <style>，样式须放入 public/css`)
  }
}

// 规则 2：公共 scss 源除 tokens.scss 外禁止裸 hex（font-awesome 为 vendor，跳过）
for (const file of walk(CSS_SRC)) {
  if (extname(file) !== '.scss') continue
  const rel = file.replace(CSS_SRC + '/', '')
  if (rel === TOKENS_FILE) continue
  const src = readFileSync(file, 'utf8')
  for (const m of src.matchAll(HEX_BARE)) {
    violations.push(`${rel}:${lineNo(src, m.index)}  ${m[0]}`)
  }
}

if (violations.length) {
  console.error('[check-no-hex] 检查未通过：')
  for (const v of violations) console.error(`  ${v}`)
  process.exit(1)
}
console.log('[check-no-hex] 通过：.vue 无内联样式；hex 仅允许出现在 tokens.scss（组件样式源 components.scss 已受检）')
