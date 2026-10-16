import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as favoriteApi from '@/api/favorite'

/**
 * 文档收藏逻辑（收藏/取消收藏 + 收藏状态）。
 * documentId: 当前文档 id 的 ref；document: 文档响应式对象（含 favorite_count）。
 */
export function useDocumentFavorite(
  getDocumentId: () => number,
  getDocument: () => Record<string, any>
) {
  const favorite = ref<any>({ id: 0 })

  async function getFavorite() {
    const res: any = await favoriteApi.getFavorite({
      document_id: getDocumentId(),
    })
    if (res.status === 200) {
      favorite.value = res.data || { id: 0 }
    }
  }

  // 取消收藏
  async function deleteFavorite() {
    const res: any = await favoriteApi.deleteFavorite({ id: favorite.value.id })
    if (res.status === 200) {
      ElMessage.success('取消收藏成功')
      favorite.value = { id: 0 }
      getDocument().favorite_count--
    } else {
      ElMessage.error(res.data.message)
    }
  }

  // 添加收藏
  async function createFavorite() {
    const res: any = await favoriteApi.createFavorite({
      document_id: getDocumentId(),
    })
    if (res.status === 200) {
      ElMessage.success('收藏成功')
      favorite.value = res.data
      getDocument().favorite_count++
    } else {
      ElMessage.error(res.data.message)
    }
  }

  return { favorite, getFavorite, deleteFavorite, createFavorite }
}