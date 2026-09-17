<template>
  <div class="com-table-list-v2 custom-vxe-table">
    <vxe-table
      v-table-drag
      stripe
      :loading="loading"
      :data="tableData"
      :tree-config="treeProps"
      :column-config="{ resizable: true }"
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
        <template #header="{ column }">
          {{ column.title }}
          <slot name="header" :column="column"></slot>
        </template>
        <template #default="{ row }">
          <!-- 头像 -->
          <el-avatar
            v-if="item.type === 'avatar'"
            :size="45"
            :src="assetUrl(row[item.prop])"
          >
            <img src="/static/images/blank.png" />
          </el-avatar>
          <!-- 数字 -->
          <div v-else-if="item.type === 'number'">
            <el-input-number
              v-if="item.editable && row['editing']"
              :key="'number-' + item.prop + '-' + row.id"
              v-model="row[item.prop]"
              size="small"
            ></el-input-number>
            <span v-else>{{ row[item.prop] || '0' }}</span>
          </div>
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
            <el-select
              v-if="item.editable && row['editing']"
              :key="'select-' + item.prop + '-' + row.id"
              v-model="row[item.prop]"
              size="small"
            >
              <el-option
                v-for="(option, index) in enumOptions(item.enum)"
                :key="'enum-' + item.prop + index"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
            <template v-else>
              <el-tag
                v-if="item.enum[row[item.prop] || 0]"
                :type="item.enum[row[item.prop] || 0].type || 'info'"
                :effect="item.enum[row[item.prop] || 0].effect || 'dark'"
              >
                {{ item.enum[row[item.prop] || 0].label }}
              </el-tag>
              <span v-else>{{ row[item.prop] || '-' }}</span>
            </template>
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
              :image="assetUrl(row[item.prop])"
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
            <span v-safe-html="row[item.prop]"></span>
          </span>
          <template v-else>
            <el-input
              v-if="item.editable && row['editing']"
              v-model="row[item.prop]"
              size="small"
              :placeholder="item.placeholder || '请输入' + item.label"
              type="textarea"
              :rows="3"
            ></el-input>
            <span v-else>{{ row[item.prop] || '-' }}</span>
          </template>
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
// vxe 相关样式只在后台表格使用，随本组件一起按需加载，不再进入前台首屏 CSS
import 'vxe-table/lib/style.css'
import 'vxe-pc-ui/lib/style.css'
import UploadImage from './UploadImage.vue'
import { Link, ArrowRight } from '@element-plus/icons-vue'
import { formatDatetime, formatBytes } from '@/utils/utils'
import { assetUrl } from '@/utils/asset'
import { computed, type PropType } from 'vue'

const props = defineProps({
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
    default: null,
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

// 与 vxe-table 内部的 `props.treeConfig &&` 判断保持一致，
// 只要传入了 tree-config 对象就视为树形表格，禁用 checkbox-config.range
const isTreeTable = computed(() => !!props.treeProps)

const checkboxConfig = computed(() => ({
  checkMethod: ({ row }: { row: any }) => {
    return !row.disable_delete
  },
  // 树结构不支持 range，仅在非树表格中启用范围选择
  range: !isTreeTable.value,
  highlight: true,
  field: 'id',
}))

const viewRow = (row: any) => {
  emit('viewRow', row)
}
const editRow = (row: any) => {
  emit('editRow', row)
}

// 可编辑枚举列时，把 { value: {label,value} } 映射转成选项数组
const enumOptions = (enumMap: any): any[] => (enumMap ? Object.values(enumMap) : [])
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