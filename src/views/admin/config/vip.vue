<template>
  <el-card shadow="never" v-loading="loading">
    <FormConfig v-if="configs.length > 0" :init-configs="configs" />
  </el-card>
</template>

<script setup lang="ts">
import { useConfigForm } from '@/composables/useConfigForm'

defineOptions({ name: 'AdminConfigVip' })

const { configs, loading } = useConfigForm('vip')
</script>
