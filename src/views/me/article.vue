<template>
  <div>
    <user-article :user-id="user.id" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const user = computed(() => userStore.user)
</script>