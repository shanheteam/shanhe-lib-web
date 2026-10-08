<template>
  <el-card shadow="never" class="mgt-20px">
    <div class="text-right">
      <el-pagination
        background
        :current-page="search.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="search.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="emit('sizeChange', $event)"
        @current-change="emit('pageChange', $event)"
      >
      </el-pagination>
    </div>
  </el-card>
</template>

<script setup lang="ts">
/**
 * 后台列表页底部分页卡片。
 *
 * 此前这段 14 行模板在 20 个后台列表页里逐字重复。本组件只负责渲染与派发事件，
 * 分页状态与导航逻辑由 `useTablePagination` 组合式函数承担（避免在子组件里修改 props）。
 *
 * 用法：
 *   <TablePagination :search="search" :total="total"
 *     @size-change="handleSizeChange" @page-change="handlePageChange" />
 */
defineOptions({ name: 'TablePagination' })

defineProps<{
  /** 列表查询条件对象，需含 page 与 size */
  search: Record<string, any>
  /** 记录总数 */
  total: number
}>()

const emit = defineEmits<{
  (e: 'sizeChange', size: number): void
  (e: 'pageChange', page: number): void
}>()
</script>
