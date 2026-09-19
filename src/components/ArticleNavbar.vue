<template>
  <div class="com-article-navbar">
    <ul>
      <li>
        <router-link
          to="/article"
          class="el-link el-link--default"
          :class="!activeId ? 'active' : ''"
        >
          <el-image :src="'/static/images/all.png'" class="icon">
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          全部文章
        </router-link>
      </li>
      <li
        v-for="cate in categories.filter(
          (item) => item.type === 1 && !item.parent_id && item.enable
        )"
        :key="'cate-' + cate.id"
      >
        <router-link
          :to="`/article?category_id=${cate.id}`"
          class="el-link el-link--default"
          :class="activeId === cate.id ? 'active' : ''"
        >
          <el-image :src="assetUrl(cate.icon) || '/favicon.ico'" class="icon">
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          {{ cate.title }}</router-link
        >
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { assetUrl } from '@/utils/asset'
import { useCategoryStore } from '@/store/category'

const route = useRoute()
const categoryStore = useCategoryStore()
const categories = computed(() => categoryStore.categories)

const activeId = ref(parseInt(route.query.category_id as string) || 0)

const findParentId = (id: number): number => {
  const cate = categories.value.find((item: any) => item.id === id)
  if (cate && cate.parent_id) {
    return findParentId(cate.parent_id)
  }
  return id
}

watch(
  () => route.query.category_id,
  () => {
    const cateId = parseInt(route.query.category_id as string) || 0
    if (cateId > 0) {
      activeId.value = findParentId(cateId)
    } else {
      activeId.value = 0
    }
  },
  { immediate: true },
)
</script>
