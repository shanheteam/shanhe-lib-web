<template>
  <div class="com-form-document-recommend">
    <el-form
      ref="formDocument"
      label-position="top"
      label-width="80px"
      :model="document"
    >
      <el-form-item label="文档" prop="title">
        <el-input v-model="document.title" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="推荐状态" prop="recommend_at">
        <div v-if="document.recommend_at">
          <el-radio-group v-model="document.type">
            <el-radio-button :value="0">取消推荐</el-radio-button>
            <el-radio-button :value="1">推荐</el-radio-button>
            <el-radio-button :value="2">重新推荐</el-radio-button>
          </el-radio-group>
          <el-alert
            class="mgt-20px"
            title="重新推荐，可让文档的推荐排序重新变靠前"
            type="warning"
            :closable="false"
          >
          </el-alert>
        </div>

        <el-switch
          v-else
          v-model="document.type"
          style="display: block"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="设为推荐"
          inactive-text="未推荐"
          :active-value="1"
          :inactive-value="0"
        >
        </el-switch>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="Check"
          :loading="loading"
          @click="onSubmit"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { setDocumentRecommend } from '@/api/document'

defineOptions({ name: 'FormDocumentRecommend' })
const props = defineProps({
  initDocument: {
    type: Object,
    default: () => ({}),
  },
})
const emit = defineEmits(['success'])

const loading = ref(false)
const document = ref<Record<string, any>>({
  type: 0,
})

const initDocumentWithType = (val: any) => {
  const target = { ...val }
  if (target.recommend_at) {
    target.type = 1
  } else {
    target.type = 0
  }
  document.value = target
}

watch(
  () => props.initDocument,
  (val) => {
    initDocumentWithType(val)
  },
  { immediate: true },
)

const onSubmit = async () => {
  loading.value = true
  const req = {
    id: [document.value.id],
    type: document.value.type,
  }
  const res: any = await setDocumentRecommend(req)
  if (res.status === 200) {
    ElMessage.success('操作成功')
    emit('success')
  } else {
    ElMessage.error(res.msg || res.data?.message)
  }
  loading.value = false
}
</script>
<style lang="scss"></style>