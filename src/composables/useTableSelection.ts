import { ref } from 'vue'

/**
 * 后台列表页的表格行选择状态。
 *
 * 原先 17 个后台列表页各自声明 `const selectedRow = ref<any[]>([])` 并写一份
 * 完全相同的 `function selectRow(rows) { selectedRow.value = rows }`，
 * 统一到这里。抽出后页面里的用法不变：
 *   模板：:disabled-delete="selectedRow.length === 0"
 *   脚本：selectedRow.value.map(...)
 *
 * 用法：const { selectedRow, selectRow } = useTableSelection()
 */
export function useTableSelection() {
  const selectedRow = ref<any[]>([])

  function selectRow(rows: any[]) {
    selectedRow.value = rows
  }

  return { selectedRow, selectRow }
}
