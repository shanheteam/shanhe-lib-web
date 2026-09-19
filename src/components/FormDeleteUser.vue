<template>
  <div class="com-form-delete-user">
    <el-form :model="deleteUserRequest" label-width="80px" label-position="top">
      <el-form-item label="用户列表">
        <el-table :data="users" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column
            prop="realname"
            label="真实姓名"
            width="150"
          ></el-table-column>
          <el-table-column prop="doc_count" label="文档" :width="80">
            <template #default="scope">
              <span>{{ scope.row.doc_count || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="article_count" label="文章" :width="80">
            <template #default="scope">
              <span>{{ scope.row.article_count || 0 }}</span>
            </template></el-table-column
          >
          <el-table-column label="删除检测">
            <template #default="scope">
              <!-- 如果文档数或文章数大于0，则不符合删除 -->
              <span
                v-if="scope.row.doc_count > 0 || scope.row.article_count > 0"
                class="text-danger"
                >不可删除。用户文档或文章数量大于0</span
              >
              <span v-else style="color: var(--el-color-success)"
                >可删除。用户未发布文档和文章</span
              >
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="您的密码">
        <el-input
          v-model="deleteUserRequest.password"
          placeholder="请输入您的密码，以验证身份"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="danger"
          :disabled="disableDelete"
          icon="Delete"
          @click="onSubmit"
          >提交删除</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { deleteUser } from '@/api/user'

defineOptions({ name: 'FormDeleteUser' })
const props = defineProps({
  users: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['success'])

const deleteUserRequest = ref<Record<string, any>>({
  id: [],
  password: '',
})

const disableDelete = computed(() => {
  // 如果用户列表中，存在文档数或文章数大于0的用户，则不允许删除
  return (props.users as any[]).some(
    (item) => item.doc_count > 0 || item.article_count > 0,
  )
})

watch(
  () => props.users,
  (val) => {
    deleteUserRequest.value.id = (val as any[]).map((item) => item.id)
  },
  { immediate: true },
)

const onSubmit = async () => {
  const res: any = await deleteUser(deleteUserRequest.value)
  if (res.status === 200) {
    ElMessage.success('删除成功')
    emit('success')
  } else {
    ElMessage.error(res.data.message || '删除失败')
  }
}
</script>
<style lang="scss" scoped></style>