<template>
  <div class="com-category-card">
    <div
      v-for="cate in categoryTrees"
      :key="'cate-' + cate.id"
      class="row"
      :class="level === 1 ? 'row-line' : ''"
    >
      <div class="lv1">
        <router-link
          class="el-link el-link--default"
          :to="
            cate.type === 1
              ? '/article?category_id=' + cate.id
              : `/category/${cate.id}`
          "
          @click="$emit('close')"
        >
          <el-avatar :size="20" :src="cate.icon"></el-avatar>
          <span>{{ cate.title }}</span>
        </router-link>
      </div>
      <div class="lv2">
        <router-link
          v-for="sub in (cate.children || []).filter((x) => x.enable)"
          :key="'sub-' + sub.id"
          class="el-link el-link--default"
          :to="
            sub.type === 1
              ? '/article?category_id=' + sub.id
              : `/category/${sub.id}`
          "
          @click="$emit('close')"
          >{{ sub.title }}</router-link
        >
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCategoryStore } from '@/store/category'
import { useSettingStore } from '@/store/setting'
import { categoryToTrees } from '@/utils/utils'

const props = defineProps({
  type: {
    type: Number,
    default: 0, // 0文档 1文章
  },
})
const emit = defineEmits(['close'])

const categoryStore = useCategoryStore()
const settingStore = useSettingStore()
const categories = computed(() => categoryStore.categories)
const settings = computed(() => settingStore.settings)

const categoryTrees = ref<any[]>([])
const level = ref(1)

watch(
  () => props.type,
  (val) => {
    const cates = categories.value.filter((x: any) => {
      if (
        !val &&
        !x.type &&
        settings.value.display &&
        settings.value.display.hide_category_without_document
      ) {
        return x.doc_count > 0 && x.enable
      }
      return (x.type === val || (!x.type && !val)) && x.enable
    })
    const trees = categoryToTrees(cates)
    let lv = 1
    trees.forEach((x: any) => {
      if (x.children && x.children.length > 0) {
        lv = 2
      }
    })
    level.value = lv
    categoryTrees.value = trees
  },
  { immediate: true },
)
</script>
<style lang="scss" scoped>
.com-category-card {
  max-height: calc(100vh - 200px);
  overflow: auto;
  .row {
    display: flex;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px dashed #f1f2f3;
    &.row-line {
      display: inline-block;
      border-bottom: 0;
      padding: 10px 5px;
      .lv1 {
        border-right: 0;
        margin-right: 5px;
      }
    }
    &:last-of-type {
      border-bottom: 0;
      padding-bottom: 5px;
    }
    &:first-of-type {
      padding-top: 5px;
    }
    :deep(.el-link--default) {
      padding: 3px 0;
    }
    .lv1 {
      border-right: 1px solid #eee;
      width: 100px;
      :deep(.el-link--default) {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        .el-avatar {
          vertical-align: middle;
          position: relative;
          top: -2px;
        }
      }
    }
    .lv2 {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      max-height: 72px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      :deep(.el-link--default) {
        font-weight: normal;
        margin-left: 15px;
        font-size: 14px;
      }
    }
  }
}
</style>