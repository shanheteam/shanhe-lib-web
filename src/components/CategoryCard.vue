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
          <el-avatar :size="20" :src="assetUrl(cate.icon)"></el-avatar>
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
import { assetUrl } from '@/utils/asset'

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
