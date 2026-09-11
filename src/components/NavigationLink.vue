<template>
  <el-menu-item
    :key="'nav-' + navigation.id"
    :class="hiddenXS ? 'hidden-xs-only' : ''"
    :index="navigation.href"
  >
    <template v-if="navigation.href">
      <!-- 判断是否存在 https:// 或者 http:// -->
      <template
        v-if="
          navigation.href.indexOf('https://') === 0 ||
          navigation.href.indexOf('http://') === 0
        "
      >
        <a
          :href="navigation.href"
          :style="`color:${navigation.color}`"
          :target="navigation.target"
          class="el-link el-link--default"
          >{{ navigation.title }}</a
        >
      </template>
      <router-link
        v-else
        :style="`color:${navigation.color}`"
        :to="navigation.href"
        :target="navigation.target"
        class="el-link el-link--default"
        >{{ navigation.title }}</router-link
      >
    </template>
    <template v-else>
      <span :style="`color:${navigation.color}`">{{ navigation.title }}</span>
    </template>
  </el-menu-item>
</template>
<script setup lang="ts">
defineProps({
  navigation: {
    type: Object,
    default: () => ({}),
  },
  hiddenXS: {
    type: Boolean,
    default: false,
  },
})
</script>