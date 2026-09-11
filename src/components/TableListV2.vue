<template>
  <div class="com-table-list-v2 custom-vxe-table">
    <vxe-table
      v-table-drag
      resizable
      stripe
      :loading="loading"
      :data="tableData"
      :tree-config="treeProps"
      :row-config="{ isHover: true }"
      border="none"
      :checkbox-config="checkboxConfig"
      @checkbox-change="selectRow"
      @checkbox-all="selectRow"
    >
      <!-- 选择列 -->
      <vxe-column
        v-if="showSelect"
        type="checkbox"
        width="55"
        fixed="left"
        :check-method="selectable"
      ></vxe-column>

      <!-- 动态数据列 -->
      <vxe-column
        v-for="item in fields"
        :key="'field-' + item.prop"
        :field="item.prop"
        :title="item.label"
        :width="item.width"
        :min-width="item.minWidth"
        :fixed="item.fixed"
        :tree-node="item.prop === treeNode"
      >
        <template #default="{ row }">
          <!-- 头像 -->
          <el-avatar
            v-if="item.type === 'avatar'"
            :size="45"
            :src="row[item.prop]"
          >
            <img src="/static/images/blank.png" />
          </el-avatar>
          <!-- 数字 -->
          <span v-else-if="item.type === 'number'">{{
            row[item.prop] || '0'
          }}</span>
          <el-tag
            v-else-if="item.type === 'bool'"
            :type="row[item.prop] ? 'success' : 'danger'"
            effect="dark"
          >
            {{ row[item.prop] ? '是' : '否' }}</el-tag
          >
          <span v-else-if="item.type === 'bytes'">
            {{ formatBytes(row[item.prop]) }}
          </span>
          <!-- 枚举，键为数字 -->
          <span v-else-if="item.type === 'enum'">
            <el-tag
              v-if="item.enum[row[item.prop] || 0]"
              :type="item.enum[row[item.prop] || 0].type || 'info'"
              :effect="item.enum[row[item.prop] || 0].effect || 'dark'"
            >
              {{ item.enum[row[item.prop] || 0].label }}
            </el-tag>
            <span v-else>{{ row[item.prop] || '-' }}</span>
          </span>
          <span v-else-if="item.type === 'datetime'">
            {{ formatDatetime(row[item.prop]) || '0000-00-00 00:00:00' }}
          </span>
          <span v-else-if="item.type === 'color'">
            <span :style="{ color: row[item.prop] }">{{
              row[item.prop] || '-'
            }}</span>
          </span>
          <span v-else-if="['link', 'url'].includes(item.type)">
            <a :href="row[item.prop]" target="_blank">
              <el-icon><Link /></el-icon> {{ row[item.prop] }}</a
            >
          </span>
          <span v-else-if="item.type === 'image'">
            <!-- 因为table cell有个左右的10px内边距，所以需要调整下 -->
            <UploadImage
              v-if="row[item.prop]"
              :disabled="true"
              :image="row[item.prop]"
              :width="item.width ? item.width + 'px' : 'auto'"
              style="margin-left: -10px; margin-right: -10px"
            />
            <span v-else>-</span>
          </span>
          <span v-else-if="item.type === 'array'">
            <template v-if="row[item.prop]">
              <el-tag
                v-for="(value, idx) in row[item.prop]"
                :key="item.prop + idx"
                class="mgr-5px"
                >{{ value }}</el-tag
              >
            </template>
            <template v-else>{{ row[item.prop] || '-' }}</template>
          </span>
          <!-- 有层级的，用breadcrumb -->
          <span v-else-if="item.type === 'breadcrumb'">
            <template v-if="row[item.prop]">
              <el-breadcrumb :separator-icon="ArrowRight">
                <el-breadcrumb-item
                  v-for="(value, idx) in row[item.prop]"
                  :key="item.prop + idx"
                  >{{ value }}</el-breadcrumb-item
                >
              </el-breadcrumb>
            </template>
            <template v-else>{{ row[item.prop] || '-' }}</template>
          </span>
          <span v-else-if="item.type === 'category'">
            <template v-if="row[item.prop]">
              <el-breadcrumb :separator-icon="ArrowRight">
                <el-breadcrumb-item
                  v-for="(value, idx) in row[item.prop]"
                  :key="item.prop + idx"
                  >{{ value.title }}</el-breadcrumb-item
                >
              </el-breadcrumb>
            </template>
            <template v-else>{{ row[item.prop] || '-' }}</template>
          </span>
          <!-- 字符串。更多，则需要继续扩展 -->
          <span v-else-if="item.type === 'html'">
            <span v-html="row[item.prop]"></span>
          </span>
          <span v-else>{{ row[item.prop] || '-' }}</span>
        </template>
      </vxe-column>

      <!-- 操作列 -->
      <vxe-column
        v-if="showActions || showView || showDelete || showEdit"
        fixed="right"
        title="操作"
        :min-width="actionsMinWidth"
        class="com-table-list-actions"
      >
        <template #default="{ row }">
          <slot name="actions" :row="row"></slot>
          <el-button
            v-if="showView"
            link
            size="small"
            icon="View"
            @click="viewRow(row)"
            >查看</el-button
          >
          <el-button
            v-if="showEdit"
            link
            size="small"
            icon="Edit"
            @click="editRow(row)"
            >编辑</el-button
          >
          <el-button
            v-if="showDelete"
            link
            size="small"
            icon="Delete"
            :disabled="row.disable_delete"
            class="text-danger"
            @click="deleteRow(row)"
            >删除</el-button
          >
        </template>
      </vxe-column>
    </vxe-table>
  </div>
</template>

<script setup lang="ts">
import { VxeTable, VxeColumn } from 'vxe-table'
import UploadImage from './UploadImage.vue'
import { Link, ArrowRight } from '@element-plus/icons-vue'
import { formatDatetime, formatBytes } from '@/utils/utils'
import type { PropType } from 'vue'

defineProps({
  tableData: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  // 每个field结构，包括：label、prop、width、min-width、fixed，还有type，其中type枚举包括：text、image、link、button、slot
  fields: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  treeProps: {
    type: Object,
    default: () => ({}),
  },
  treeNode: {
    type: String,
    default: 'title',
  },
  actionsMinWidth: {
    type: Number,
    default: 180,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  showView: {
    type: Boolean,
    default: true,
  },
  showEdit: {
    type: Boolean,
    default: true,
  },
  showDelete: {
    type: Boolean,
    default: true,
  },
  showSelect: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits(['viewRow', 'editRow', 'deleteRow', 'selectRow'])

const checkboxConfig = {
  checkMethod: ({ row }: { row: any }) => {
    return !row.disable_delete
  },
  range: true,
  highlight: true,
  field: 'id',
}

const viewRow = (row: any) => {
  emit('viewRow', row)
}
const editRow = (row: any) => {
  emit('editRow', row)
}
const deleteRow = (row: any) => {
  emit('deleteRow', row)
}
const selectRow = ({ records }: { records: any[] }) => {
  emit('selectRow', records)
}
const selectable = (row: any) => {
  // 取反，禁止删除的行，不可选中
  return !row.disable_delete
}
</script>

<style>
/* 调整单元格内边距 */
.vxe-table .vxe-body--column {
  padding: 8px 10px;
}

/* 保持操作按钮样式一致 */
.com-table-list-v2 .el-button {
  margin-left: 0;
  margin-right: 5px;
}
</style>