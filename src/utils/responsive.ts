import { ref } from 'vue'

// 全局响应式断点状态：由全局 mixin 统一维护，各组件共享同一份引用
export const isMobile = ref(false)
export const isPad = ref(false)
export const isPC = ref(true)

// 依据视口宽度更新断点状态
export function updateResponsive() {
  const width = document.body.clientWidth
  if (width < 768) {
    isMobile.value = true
    isPad.value = false
    isPC.value = false
  } else if (width < 992) {
    isMobile.value = false
    isPad.value = true
    isPC.value = false
  } else {
    isMobile.value = false
    isPad.value = false
    isPC.value = true
  }
}