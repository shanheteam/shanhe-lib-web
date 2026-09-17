// v-safe-html 指令：与 v-html 用法一致，但渲染前经 DOMPurify 过滤。
// 直接使用 v-html 会把后端返回/用户提交的内容当作 HTML 执行，
// 搜索结果、评论、用户动态、文章正文等场景均存在存储型 XSS 风险。
import DOMPurify from 'dompurify'
import type { Directive } from 'vue'

// 在 DOMPurify 默认安全策略之上补充：允许 target（外链新窗口）并强制补全 rel，
// 避免富文本中的外链通过 window.opener 反向控制当前页面。
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node instanceof Element && node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer nofollow')
  }
})

const SANITIZE_OPTIONS = {
  ADD_ATTR: ['target'],
  // 样式表标签本身无脚本能力，但会破坏整站布局，直接移除
  FORBID_TAGS: ['style'],
}

/** 过滤 HTML 字符串，返回可安全渲染的内容 */
export function sanitizeHtml(html: unknown): string {
  if (html === null || html === undefined) return ''
  return DOMPurify.sanitize(String(html), SANITIZE_OPTIONS) as unknown as string
}

const safeHtml: Directive<HTMLElement, unknown> = {
  mounted(el, binding) {
    el.innerHTML = sanitizeHtml(binding.value)
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      el.innerHTML = sanitizeHtml(binding.value)
    }
  },
}

export default safeHtml