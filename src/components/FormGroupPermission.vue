<template>
  <div class="com-form-group-permission">
    <el-alert
      title="风险提示：当前权限仅针对管理组，普通用户请不要设置此授权！"
      show-icon
      type="warning"
      :closable="false"
    >
    </el-alert>
    <el-form label-position="top" label-width="80px" :model="groupPermission">
      <el-form-item>
        <el-checkbox
          v-model="isCheckedAll"
          :indeterminate="isIndeterminate"
          @change="checkedAll"
          >全选</el-checkbox
        >
        <el-tree
          ref="tree"
          :data="permissionTrees"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="groupPermission.permission_id"
          @check-change="handleCheckChange"
        >
        </el-tree>
      </el-form-item>
      <el-form-item class="btn-fixed">
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
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { listPermission } from '@/api/permission'
import { permissionsToTree } from '@/utils/permission'
import { getGroupPermission, updateGroupPermission } from '@/api/group'
import { useUserStore } from '@/store/user'

defineOptions({ name: 'FormGroupPermission' })
const props = defineProps({
  groupId: {
    type: Number,
    default: 0,
  },
})
const emit = defineEmits(['success'])

const userStore = useUserStore()

const loading = ref(false)
const groupPermission = ref<Record<string, any>>({
  group_id: 0,
  permission_id: [],
})
const permissions = ref<any[]>([])
const permissionTrees = ref<any[]>([])
const isCheckedAll = ref(false)
const isIndeterminate = ref(true)
const tree = ref<any>()

watch(
  () => props.groupId,
  (val) => {
    groupPermission.value.group_id = val
    loadAllPermissions()
  },
  { immediate: true },
)

const onSubmit = async () => {
  loading.value = true
  const res: any = await updateGroupPermission({
    group_id: groupPermission.value.group_id,
    permission_id: tree.value.getCheckedKeys(),
  })
  if (res.status === 200) {
    groupPermission.value.permission_id = tree.value.getCheckedKeys()
    ElMessage.success('设置成功')
    userStore.getUserPermissions()
    emit('success')
  } else {
    resetChecked()
    ElMessage.error(res.data.message)
  }
  loading.value = false
}
async function loadAllPermissions() {
  if (groupPermission.value.group_id > 0) {
    groupPermission.value.permission_id = [] // 重置授权信息
    const [resPermissions, resGroupPermissions] = await Promise.all([
      listPermission({
        method: [
          'grpc',
          'get',
          'post',
          'put',
          'delete',
          'patch',
          'options',
          'head',
          'trace',
          'connect',
        ],
      }),
      getGroupPermission({ id: groupPermission.value.group_id }),
    ])
    if (resPermissions.status !== 200) {
      resetChecked()
      ElMessage.error(resPermissions.data.message)
    }
    if (resGroupPermissions.status !== 200) {
      resetChecked()
      ElMessage.error(resGroupPermissions.data.message)
    }

    if (resPermissions.status === 200 && resGroupPermissions.status === 200) {
      const trees = permissionsToTree(resPermissions.data.permission)
      permissionTrees.value = trees
      permissions.value = resPermissions.data.permission || []
      groupPermission.value.permission_id =
        resGroupPermissions.data.permission_id || []
      nextTick(() => {
        tree.value?.setCheckedKeys(groupPermission.value.permission_id)
      })
    }
  }
}
// 全选
const checkedAll = (yes: boolean) => {
  tree.value.setCheckedKeys(
    yes ? permissions.value.map((item) => item.id) : [],
  )
}
const handleCheckChange = () => {
  const checkedKeys = tree.value.getCheckedKeys()
  let keysLength = 0
  permissionTrees.value.forEach((item) => {
    keysLength++
    if (item.children) {
      keysLength += item.children.length
    }
  })
  isCheckedAll.value = checkedKeys.length === keysLength
  // 中间状态
  isIndeterminate.value = checkedKeys.length > 0 && checkedKeys.length < keysLength
}
const resetChecked = () => {
  tree.value?.setCheckedKeys(groupPermission.value.permission_id)
}
</script>
<style lang="scss">
.com-form-group-permission {
  .el-form {
    padding-bottom: 80px;
  }
  .btn-fixed {
    position: absolute;
    bottom: -22px;
    z-index: 99;
    background: var(--el-color-white);
    width: 100%;
    margin-left: -20px;
    padding: 20px;
    box-sizing: border-box;
  }
}
</style>