import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as documentApi from '@/api/document'

/**
 * 文档评分逻辑：提交评分 + 拉取我的评分。
 * getDocumentId: 返回当前文档 id；isLoggedIn: 判断用户是否已登录。
 */
export function useDocumentScore(
  getDocumentId: () => number,
  isLoggedIn: () => boolean
) {
  const score = ref<any>(null)
  const disabledScore = ref(false)

  async function setDocumentScore() {
    if (!score.value) {
      return
    }
    const res: any = await documentApi.setDocumentScore({
      document_id: getDocumentId(),
      score: score.value * 100,
    })
    if (res.status === 200) {
      ElMessage.success('提交评分成功')
      disabledScore.value = true
    } else {
      ElMessage.error(res.data.message)
    }
  }

  async function getDocumentScore() {
    // 判断用户是否已登录
    if (!isLoggedIn()) {
      return
    }
    const res: any = await documentApi.getDocumentScore({
      document_id: getDocumentId(),
    })
    if (res.status === 200) {
      const s = res.data.score / 100 || null
      score.value = s
      if (s) disabledScore.value = true
    }
  }

  return { score, disabledScore, setDocumentScore, getDocumentScore }
}