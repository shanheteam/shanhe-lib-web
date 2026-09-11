// table-drag 指令：按住鼠标左键可左右拖动 vxe-table 滚动内容
// 与原版 plugins/table-drag.js 一致
import type { Directive } from 'vue'

const throttle = (fn: (...args: any[]) => void, wait: number) => {
  let timer: any = null
  return (...args: any[]) => {
    if (timer) return
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, wait)
  }
}

const tableDrag: Directive = {
  mounted(el: HTMLElement) {
    const tableBody = el.querySelector('.vxe-table--body-wrapper') as HTMLElement | null
    if (!tableBody) return

    let startX = 0
    let startScrollLeft = 0
    let scrollLeft = 0
    let isDragging = false
    let deltaX = 0

    tableBody.setAttribute('title', '按住鼠标左键可左右拖动表格以滚动内容')
    setTimeout(() => {
      tableBody.removeAttribute('title')
    }, 3000)

    tableBody.addEventListener('mousedown', function (e: MouseEvent) {
      if (e.button !== 0) return
      startX = e.clientX
      isDragging = true
      tableBody.style.cursor = 'grabbing'
      try {
        startScrollLeft = tableBody.scrollLeft
      } catch (error) {}
    })

    tableBody.addEventListener(
      'mousemove',
      throttle(function (e: MouseEvent) {
        if (!isDragging) return
        deltaX = e.clientX - startX
        if (deltaX !== 0) tableBody.style.userSelect = 'none'
        try {
          const headerWrapper = tableBody.previousElementSibling as HTMLElement | null
          scrollLeft = startScrollLeft - deltaX
          const maxScroll = tableBody.scrollWidth
          if (scrollLeft >= maxScroll) scrollLeft = maxScroll
          if (scrollLeft < 0) scrollLeft = 0
          if (headerWrapper) headerWrapper.scrollLeft = scrollLeft
          tableBody.scrollLeft = scrollLeft
        } catch (error) {}
      }, 20),
    )

    const clearDrag = function () {
      isDragging = false
      tableBody.style.cursor = 'default'
      tableBody.style.userSelect = ''
      startScrollLeft = scrollLeft
    }
    document.addEventListener('mouseup', clearDrag)
  },
}

export default tableDrag