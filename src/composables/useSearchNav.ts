import { useRouter } from 'vue-router'
import type { Ref } from 'vue'

/**
 * 后台列表页的搜索提交：把查询条件写回路由 query。
 * 目标地址与当前地址一致时直接刷新列表（避免重复导航到同一路由），否则跳转。
 *
 * 原先 15 个后台列表页各自复制了一份完全相同的实现（banner/comment/report/navigation/
 * attachment/group/permission/searchrecord/document.list/document.recycle/article.list/
 * article.recycle/article.category/user.list/user.punishment）。
 *
 * 注意：另有 3 个页面（advertisement / friendlink / document.language）存在同一函数但
 * if/else 分支相反，行为不同，**不要**一并改用本 composable（详见代码审查记录）。
 *
 * 用法（需在 search / fetchList 声明之后调用）：
 *   const { onSearch } = useSearchNav(search, fetchList)
 */
export function useSearchNav(search: Ref<any>, fetchList: () => void) {
  const router = useRouter()

  function onSearch(searchParams: any) {
    search.value = { ...search.value, ...searchParams, page: 1 }
    if (
      location.pathname + location.search ===
      router.resolve({
        query: search.value,
      }).href
    ) {
      fetchList()
    } else {
      router.push({
        query: search.value,
      })
    }
  }

  return { onSearch }
}
