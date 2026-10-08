import { ElMessage, ElMessageBox } from 'element-plus'

type DialogType = 'warning' | 'info' | 'error' | 'success'

/**
 * 统一的「删除确认」弹窗。
 * 此前同样的 3 行 options 在 27 个文件里复制了 44 次。
 */
export function confirmWarning(
  message: string,
  dialog: { title?: string; type?: DialogType } = {},
) {
  return ElMessageBox.confirm(message, dialog.title ?? '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: dialog.type ?? 'warning',
  })
}

/**
 * 后台删除 / 批量删除的统一交互：确认 → 调接口 → 提示 → 刷新列表。
 *
 * 原先 17 个后台列表页各自复制了一份 batchDelete（22 行）与 deleteRow（21 行），
 * 差异只在接口名与提示文案上。
 *
 * 行为与原实现逐条对齐（含细节）：
 *  · 用户点「取消」或接口抛错时静默返回 —— 对应原来的 `.catch(() => {})`；
 *  · `res.status === 200` 才提示成功并刷新，否则展示 `res.data.message`；
 *  · 传入的 ids 为空数组时不弹窗（原实现由调用方 map 后自然为空，但确认层仍会弹，
 *    这里显式短路，避免空选中也弹窗）。
 *
 * 用法：
 *   const { confirmBatch, confirmOne } = useDeleteConfirm({
 *     remove: (ids) => deleteBanner({ id: ids }),
 *     onDone: fetchList,
 *   })
 *   function batchDelete() { return confirmBatch(selectedRow.value, `…${selectedRow.value.length}…`) }
 *   function deleteRow(row: any) { return confirmOne(row, `…${row.title}…`) }
 * 同一页面两个弹窗的标题/类型可能不同（如 document/recycle.vue 一个是 info 一个是 warning），
 * 故 dialog 参数按调用传递，而非在工厂配置里统一指定。
 */
export function useDeleteConfirm(opts: {
  /** 调用删除接口；ids 恒为数组（后端 positiveNumberArray 同时兼容标量与数组） */
  remove: (ids: number[]) => Promise<any>
  /** 删除成功后的刷新动作 */
  onDone: () => void
  /** 成功提示文案，默认「删除成功」 */
  successText?: string
  /** 弹窗标题，默认「温馨提示」 */
  title?: string
  /** 弹窗类型，默认 'warning' */
  type?: DialogType
}) {
  async function run(ids: number[], message: string, dialog?: { title?: string; type?: DialogType }) {
    if (!ids.length) return
    await confirmWarning(message, { title: dialog?.title ?? opts.title, type: dialog?.type ?? opts.type })
      .then(async () => {
        const res: any = await opts.remove(ids)
        if (res.status === 200) {
          ElMessage.success(opts.successText ?? '删除成功')
          opts.onDone()
        } else {
          ElMessage.error(res.data.message)
        }
      })
      .catch(() => {})
  }

  return {
    /** 批量删除：message 里通常包含选中条数 */
    confirmBatch: (rows: any[], message: string, dialog?: { title?: string; type?: DialogType }) =>
      run((rows || []).map((r) => Number(r.id)).filter((id) => id > 0), message, dialog),
    /** 单条删除 */
    confirmOne: (row: any, message: string, dialog?: { title?: string; type?: DialogType }) =>
      run(Number(row?.id) > 0 ? [Number(row.id)] : [], message, dialog),
  }
}
