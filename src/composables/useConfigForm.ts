import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { listConfig } from '@/api/config'

/**
 * 后台「系统配置」各页面的公共逻辑：按分类拉取配置项列表并渲染 FormConfig。
 *
 * 此前 admin/config 下 16 个页面各自复制了一份完全相同的 loading/configs 状态与 loadConfig，
 * 只有 activeName（配置分类）不同，改动需同步十几处。
 *
 * 用法：
 *   const { configs, loading } = useConfigForm('score')
 * 模板仍为：
 *   <el-card shadow="never" v-loading="loading">
 *     <FormConfig v-if="configs.length > 0" :init-configs="configs" />
 *   </el-card>
 */
export function useConfigForm(category: string) {
  const configs = ref<any[]>([])
  const loading = ref(false)

  async function loadConfig() {
    loading.value = true
    const res: any = await listConfig({ category: [category] })
    if (res.status === 200) {
      configs.value = res.data.config || []
    } else {
      configs.value = []
      ElMessage.error(res.data.message)
    }
    loading.value = false
  }

  onMounted(() => {
    loadConfig()
  })

  return { configs, loading, loadConfig }
}
