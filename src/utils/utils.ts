// 通用工具函数，与原版 utils/utils.js 保持一致

// 格式化时间（原版 Date.prototype.Format）
function dateFormat(d: Date, fmt: string): string {
  const o: Record<string, number> = {
    'M+': d.getMonth() + 1,
    'd+': d.getDate(),
    'h+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds(),
    'q+': Math.floor((d.getMonth() + 3) / 3),
    S: d.getMilliseconds(),
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, String(d.getFullYear()).substr(4 - RegExp.$1.length))
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? String(o[k]) : ('00' + o[k]).substr(String(o[k]).length))
    }
  }
  return fmt
}

function formatTimeToStr(times: any, pattern?: string): string {
  let d = dateFormat(new Date(times), 'yyyy-MM-dd hh:mm:ss')
  if (pattern) d = dateFormat(new Date(times), pattern)
  return d
}

export function formatDatetime(time: any): string {
  if (typeof time === 'string' && time !== '') return formatTimeToStr(time, 'yyyy-MM-dd hh:mm:ss')
  return '-'
}
export function formatDate(time: any): string {
  if (typeof time === 'string' && time !== '') return formatTimeToStr(time, 'yyyy-MM-dd')
  return '-'
}

export function formatRelativeTime(time: any): string {
  if (!(typeof time === 'string' && time !== '')) return '刚刚'
  const timestamp = parseInt(String(new Date(time).getTime() / 1000))
  const now = parseInt(String(new Date().getTime() / 1000))
  const diff = now - timestamp
  const minute = 60
  const hour = minute * 60
  const day = hour * 24
  const month = day * 30

  const monthC = diff / month
  const dayC = diff / day
  const hourC = diff / hour
  const minC = diff / minute

  if (monthC > 12) return parseInt(String(monthC / 12)) + ' 年前'
  if (monthC >= 1) return parseInt(String(monthC)) + ' 月前'
  if (dayC >= 1) return parseInt(String(dayC)) + ' 天前'
  if (hourC >= 1) return parseInt(String(hourC)) + ' 小时前'
  if (minC >= 1) return parseInt(String(minC)) + ' 分钟前'
  return '刚刚'
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(dm)} ${sizes[i]}`
}

// categoryToTrees 分类转树形结构
export function categoryToTrees(categories: any[], withDisabled = true): any[] {
  const result: any[] = []
  const map: Record<string, any> = {}
  try {
    const cates = JSON.parse(JSON.stringify(categories || []))
    cates.forEach((item: any) => {
      // 分类 id 是 bigint，接口序列化后为字符串；而文档/文章的 category_id 为数字。
      // el-cascader 内部用 lodash isEqual 严格比较，类型不一致会导致已有分类无法回显。
      item.id = Number(item.id)
      if (withDisabled) item.disabled = !item.enable
      map[item.id] = item
    })
    cates.forEach((item: any) => {
      const parent = map[item.parent_id]
      if (parent) {
        if (parent.disabled) item.disabled = true
        ;(parent.children || (parent.children = [])).push(item)
      } else {
        if (!item.parent_id) result.push(item)
      }
    })
  } catch (error) {
    console.log(error)
  }
  return result
}

const extMapIcon: Record<string, string> = {
  '.pdf': 'pdf',
  '.doc': 'word',
  '.docx': 'word',
  '.rtf': 'word',
  '.wps': 'word',
  '.odt': 'word',
  '.dot': 'word',
  '.ppt': 'ppt',
  '.pptx': 'ppt',
  '.pps': 'ppt',
  '.ppsx': 'ppt',
  '.dps': 'ppt',
  '.odp': 'ppt',
  '.pot': 'ppt',
  '.xls': 'excel',
  '.xlsx': 'excel',
  '.et': 'excel',
  '.ods': 'excel',
  '.csv': 'excel',
  '.tsv': 'excel',
  '.txt': 'text',
  '.epub': 'epub',
  '.mobi': 'mobi',
  '.chm': 'chm',
  '.umd': 'umd',
}

export function getIcon(ext: string): string {
  return extMapIcon[ext] || 'other'
}

// 解析 $route.query 中的数组
export function parseQueryIntArray(query: any, keys: string[]): Record<string, number[]> {
  const result: Record<string, number[]> = {}
  keys.forEach((key) => {
    if (typeof query[key] === 'object') {
      result[key] = (query[key] || []).map((item: any) => parseInt(item))
    } else if (query[key]) {
      result[key] = [parseInt(query[key]) || 0]
    }
  })
  return result
}

export function parseQueryBoolArray(query: any, keys: string[]): Record<string, boolean[]> {
  const result: Record<string, boolean[]> = {}
  keys.forEach((key) => {
    if (typeof query[key] === 'object') {
      result[key] = (query[key] || []).map((item: any) => item === 'true')
    } else if (query[key]) {
      result[key] = [query[key] === 'true']
    }
  })
  return result
}

// 是否需要登录。针对关闭站点访问、或登录访问限制
export function requireLogin(settings: any, user: any, route: any, permissions: any[] = []): boolean {
  if (settings.security && settings.security.login_required && !user.id) {
    if (!(route.name === 'login' || route.name === 'register' || route.name === 'findpassword')) {
      return true
    }
  }
  if (settings.security && settings.security.is_close) {
    if (user.id === 0 && route.name !== 'login') return true
    if (user.id !== 0 && permissions.length === 0 && route.name !== 'login') return true
  }
  return false
}

export function genLinkHTML(title: string, href: string): string {
  return `<a href="${href}" target="_blank" class="el-link el-link--primary">${(title || '-')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')}</a>`
}

// 获取时间区间
export function genTimeDuration(duration: string): string[] {
  const fmt = 'yyyy-MM-dd hh:mm:ss'
  const start = new Date()
  switch (duration) {
    case 'day':
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      break
    case 'week':
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      break
    case 'month':
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 31)
      break
    case 'three_month':
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 92)
      break
    case 'half_year':
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 183)
      break
    case 'year':
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
      break
    default:
      return []
  }
  return [dateFormat(start, fmt), dateFormat(new Date(), fmt)]
}

export function genPrevPage(hash: string, pageNO: number, ext?: string, enableGZIP?: boolean): string {
  if (!ext) ext = '.svg'
  if (ext === '.svg' && enableGZIP) ext = '.gzip.svg'
  return `/view/page/${hash}/${pageNO}${ext}`
}