<template>
  <el-card v-loading="loading" shadow="never">
    <FormConfig v-if="configs.length > 0" :init-configs="configs" />
  </el-card>
</template>

<script setup lang="ts">
import { useConfigForm } from '@/composables/useConfigForm'

defineOptions({ name: 'AdminConfigSpider' })

const { configs, loading } = useConfigForm('spider')
</script>
