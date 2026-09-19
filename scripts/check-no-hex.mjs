// 防回潮检查：hex 色值只允许出现在 tokens.scss（设计令牌）中。
// 扫描 src 下所有 .vue / .scss 文件：
//   - .scss：仅 tokens.scss 允许含 hex，其余全文件检查
//   - .vue：只检查 CSS 语境区域（<style> 块、style 属性、颜色类属性、SVG fill），
//            JS 数据/canvas 色值（如 echarts 配置）不受限
// 用法：node scripts/check-no-hex.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../src')
const TOKENS_FILE = 'tokens.scss'

const HEX_BARE = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])/g

function walk(d) {
  const out = []
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (f === 'node_modules' || f === 'dist' || f === 'font-awesome-4.7.0') continue
    const s = statSync(p)
    if (s.isDirectory()) out.push(...walk(p))
    else if (extname(p) === '.vue' || extname(p) === '.scss') out.push(p)
  }
  return out
}

// 提取 .vue 中 CSS 语境区域（与迁移 codemod 保持一致的边界逻辑）
function findRegions(src) {
  const regions = []
  const push = (start, end) => regions.push([start, end])
  let m
  const reStyle = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
  while ((m = reStyle.exec(src))) {
    const start = m.index + m[0].indexOf('>') + 1
    push(start, start + m[1].length)
  }
  const reAttr = /(?:^|[\s:])style\s*=\s*("[^"]*"|'[^']*')/g
  while ((m = reAttr.exec(src))) {
    const eq = m.index + m[0].indexOf('=')
    push(eq + 2, eq + 1 + m[1].length)
  }
  const reColorAttr = /(?:active-color|inactive-color|text-color|color|fill)\s*=\s*("[^"]*"|'[^']*')/g
  while ((m = reColorAttr.exec(src))) {
    const eq = m.index + m[0].indexOf('=')
    push(eq + 2, eq + 1 + m[1].length)
  }
  const reBind = /v-bind:style\s*=\s*("[^"]*"|'[^']*')/g
  while ((m = reBind.exec(src))) {
    const eq = m.index + m[0].indexOf('=')
    push(eq + 2, eq + 1 + m[1].length)
  }
  regions.sort((a, b) => a[0] - b[0])
  const merged = []
  for (const [s, e] of regions) {
    if (merged.length && s <= merged[merged.length - 1][1]) {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e)
    } else {
      merged.push([s, e])
    }
  }
  return merged
}

function lineNo(src, index) {
  return src.slice(0, index).split('\n').length
}

const violations = []
for (const file of walk(ROOT)) {
  const rel = file.replace(ROOT + '/', '')
  if (rel.endsWith(TOKENS_FILE)) continue // 设计令牌：唯一允许含 hex 的文件
  const src = readFileSync(file, 'utf8')
  const targets = []
  if (extname(file) === '.scss') {
    targets.push([0, src.length]) // 整文件
  } else {
    for (const [s, e] of findRegions(src)) targets.push([s, e])
  }
  for (const [s, e] of targets) {
    const seg = src.slice(s, e)
    for (const m of seg.matchAll(HEX_BARE)) {
      violations.push(`${rel}:${lineNo(src, s + m.index)}  ${m[0]}`)
    }
  }
}

if (violations.length) {
  console.error('[check-no-hex] 发现硬编码 hex 色值（只允许出现在 tokens.scss）：')
  for (const v of violations) console.error(`  ${v}`)
  process.exit(1)
}
console.log('[check-no-hex] 通过：src 下 CSS 语境无硬编码 hex（tokens.scss 为唯一配色来源）')
