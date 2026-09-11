<template>
  <div>
    <user-document :user-id="userId" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = computed(() => parseInt(route.params.id as string) || 0)
</script>