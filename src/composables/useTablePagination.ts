import { type Ref } from 'vue'
import { useRouter } from 'vue-router'

/**
 * 后台列表页分页回调。
 *
 * 原先 20 个后台列表页各自复制了一份完全相同的
 * handleSizeChange / handlePageChange（各 6 行），统一到这里。
 *
 * 两种模式对应页面既有行为，不要混用：
 *  · 'push'（默认，19 个页面）：把 page/size 写回 URL query，由页面的 route watcher 触发刷新。
 *  · 'fetch'（views/admin/document/language.vue）：不写 URL，直接调 fetchList()；
 *    且改变每页条数时会把页码重置为 1（该页原本就是如此）。
 *
 * 用法（模板里配合 <TablePagination> 组件）：
 *   const { handleSizeChange, handlePageChange } = useTablePagination(search)
 *   const { handleSizeChange, handlePageChange } = useTablePagination(search, { mode: 'fetch', fetchList })
 */
export function useTablePagination(
  search: Ref<any>,
  opts: { mode?: 'push' | 'fetch'; fetchList?: () => void } = {},
) {
  const router = useRouter()

  function handleSizeChange(val: number) {
    if (opts.mode === 'fetch') {
      search.value = { ...search.value, size: val, page: 1 }
      opts.fetchList?.()
      return
    }
    search.value.size = val
    router.push({ query: search.value })
  }

  function handlePageChange(val: number) {
    if (opts.mode === 'fetch') {
      search.value = { ...search.value, page: val }
      opts.fetchList?.()
      return
    }
    search.value.page = val
    router.push({ query: search.value })
  }

  return { handleSizeChange, handlePageChange }
}
