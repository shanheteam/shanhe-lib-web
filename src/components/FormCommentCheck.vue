<template>
  <div class="com-form-comment-check">
    <el-form
      ref="form"
      :model="icomment"
      class="form-comment-check"
      label-position="top"
    >
      <el-form-item prop="content" label="评论内容">
        <el-input
          v-model="icomment.content"
          type="textarea"
          :placeholder="placeholder"
          :autosize="{ minRows: 4, maxRows: 6 }"
          disabled
        />
      </el-form-item>
      <el-form-item label="审核状态">
        <el-radio-group v-model="icomment.status">
          <el-radio :label="0">待审核</el-radio>
          <el-radio :label="1">审核通过</el-radio>
          <el-radio :label="2">审核拒绝</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="Check"
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
import { updateComment } from '@/api/comment'

defineOptions({ name: 'FormCommentCheck' })
const props = defineProps({
  comment: {
    type: Object,
    default: () => ({}),
  },
  placeholder: {
    type: String,
    default: '请输入评论内容',
  },
})
const emit = defineEmits(['success'])

const icomment = ref<Record<string, any>>({
  id: 0,
  content: '',
  status: 0,
})

watch(
  () => props.comment,
  (val) => {
    icomment.value = { status: 0, ...val }
  },
  { immediate: true },
)

const onSubmit = async () => {
  const res: any = await updateComment(icomment.value)
  if (res.status === 200) {
    ElMessage.success('更新成功')
    emit('success')
  } else {
    ElMessage.error(res.data.message)
  }
}
</script>
<style lang="scss"></style>