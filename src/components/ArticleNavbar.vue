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
<style lang="scss" scoped>
ul,
li {
  padding: 0;
  margin: 0;
  list-style: none;
}
ul {
  justify-content: space-between;
  li {
    margin-bottom: 5px;
    .icon {
      width: 20px;
      height: 20px;
      margin-right: 5px;
      border-radius: 4px;
      vertical-align: middle;
      margin-top: -2px;
    }
  }
}
.el-link--default {
  color: var(--app-text-heading);
  display: block;
  line-height: 40px;
  font-weight: normal;
  padding: 0 10px;
  border-radius: 6px;
  &:hover {
    background-color: var(--app-bg-navbar);
  }
  &.active {
    background-color: var(--el-color-white);
    color: var(--el-color-primary);
  }
}
</style>