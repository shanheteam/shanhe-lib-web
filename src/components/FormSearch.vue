<template>
  <div class="com-form-search">
    <!-- 注意：需要加 @submit.prevent，否则表单只有一项输入项的时候，按enter键会直接触发提交表单，导致页面刷新 -->
    <el-form :inline="true" :model="search" @submit.prevent>
      <el-form-item
        v-for="field in fields"
        :key="field.name"
        :label="field.label"
      >
        <el-input
          v-if="field.type == 'text'"
          v-model="search[field.name]"
          :placeholder="field.placeholder"
          clearable
          @keydown.enter="onSearch"
        ></el-input>
        <el-select
          v-else-if="field.type == 'select'"
          v-model="search[field.name]"
          :placeholder="field.placeholder"
          :multiple="field.multiple"
          clearable
          filterable
        >
          <el-option
            v-for="item in field.options"
            :key="field.name + '_option_' + item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
        <el-cascader
          v-else-if="field.type == 'cascader'"
          v-model="search[field.name]"
          :options="field.trees || []"
          :filterable="true"
          :props="
            field.props || {
              checkStrictly: true,
              expandTrigger: 'hover',
              label: 'title',
              value: 'id',
            }
          "
          clearable
          :placeholder="field.placeholder"
        ></el-cascader>
      </el-form-item>
      <slot name="inputs"></slot>
      <el-form-item>
        <el-button
          type="primary"
          icon="Search"
          :loading="loading"
          @click="onSearch"
          >查询</el-button
        >
      </el-form-item>
      <el-form-item v-if="showCreate">
        <el-button type="primary" icon="Plus" @click="onCreate"
          >新增</el-button
        >
      </el-form-item>
      <el-form-item v-if="showDelete">
        <el-button
          type="danger"
          icon="Delete"
          :disabled="disabledDelete"
          @click="onDelete"
          >批量删除</el-button
        >
      </el-form-item>
      <slot name="buttons"></slot>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'

defineOptions({ name: 'FormSearch' })
const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  showCreate: {
    type: Boolean,
    default: true,
  },
  showDelete: {
    type: Boolean,
    default: true,
  },
  disabledDelete: {
    type: Boolean,
    default: true,
  },
  fields: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  defaultSearch: {
    type: Object,
    default: () => ({}),
  },
})
const emit = defineEmits(['onSearch', 'onCreate', 'onDelete'])

const search = ref<Record<string, any>>({})

watch(
  () => props.defaultSearch,
  (val) => {
    search.value = { ...val }
  },
  { immediate: true },
)

const onSearch = () => {
  emit('onSearch', { ...search.value, _t: Date.now().toString() })
}
const onCreate = () => {
  emit('onCreate')
}
const onDelete = () => {
  emit('onDelete')
}
</script>