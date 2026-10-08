// 防回潮检查：源文件与脚本必须对「同组 / 其他用户」可读（常规为 644，目录为 755）。
//
// 背景：本项目历史上出现过新增文件带 600 权限的情况。服务端由非 root 用户（PM2/www）
// 运行 ts-node 直接加载源码，权限过紧会在启动时抛 EACCES 并导致进程崩溃、nginx 返回 502，
// 表现为「前端一堆 CORS 报错」这种与真实原因无关的现象，排查成本很高。
// 新建文件时（编辑器/脚本/工具）容易默认带上 600，故在构建前统一拦截。
//
// 用法：node scripts/check-file-modes.mjs
import { readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const CLIENT = resolve(import.meta.dirname, '..')
const TARGETS = ['src', 'scripts', 'public', 'index.html']
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git'])

function walk(p, out = []) {
  let st
  try {
    st = statSync(p)
  } catch {
    return out
  }
  if (st.isDirectory()) {
    if (SKIP_DIRS.has(p.split('/').pop())) return out
    out.push({ p, mode: st.mode & 0o777, dir: true })
    for (const f of readdirSync(p)) walk(join(p, f), out)
  } else {
    out.push({ p, mode: st.mode & 0o777, dir: false })
  }
  return out
}

const violations = []
for (const t of TARGETS) {
  for (const e of walk(join(CLIENT, t))) {
    // 文件需 group+other 可读（0o044）；目录还需 group+other 可进入（0o011）
    const need = e.dir ? 0o011 : 0o044
    if ((e.mode & need) !== need) {
      const want = e.dir ? '755' : '644'
      violations.push(
        `${e.p.replace(CLIENT + '/', '')}  当前 ${e.mode.toString(8).padStart(3, '0')}，应为 ${want}`,
      )
    }
  }
}

if (violations.length) {
  console.error('[check-file-modes] 检查未通过：以下文件/目录权限过紧，部署用户可能无法读取')
  for (const v of violations) console.error(`  ${v}`)
  console.error('\n修复：chmod 644 <文件>  /  chmod 755 <目录>')
  process.exit(1)
}
console.log('[check-file-modes] 通过：源文件均为 644、目录均为 755')
