<template>
  <div class="com-form-punishment">
    <el-form
      ref="formPunishment"
      label-position="top"
      label-width="80px"
      :model="punishment"
    >
      <el-form-item
        label="用户"
        prop="user_id"
        :rules="
          punishment.id === 0
            ? [{ required: true, trigger: 'blur', message: '请选择用户' }]
            : []
        "
      >
        <el-select
          v-if="punishment.id === 0"
          v-model="punishment.user_id"
          filterable
          multiple
          remote
          reserve-keyword
          placeholder="请输入和选择用户"
          :remote-method="remoteSearchUser"
          :loading="loading"
        >
          <el-option
            v-for="user in users"
            :key="'userid' + user.id"
            :label="user.username"
            :value="user.id"
          >
          </el-option>
        </el-select>
        <el-input v-else v-model="punishment.username" :disabled="true" />
      </el-form-item>
      <el-form-item
        prop="type"
        :rules="[
          { required: true, trigger: 'blur', message: '请选择处罚类型' },
        ]"
      >
        <template #label>
          处罚类型
          <ToolTip
            content="禁止评论：不允许发表评论；禁止上传：不允许上传文档；禁止收藏：不允许收藏文档和文章；禁止下载：不允许下载文档；禁止发布文章；禁用账户：包括上述全部禁用项"
          />
        </template>
        <el-checkbox-group v-if="punishment.id === 0" v-model="punishment.type">
          <el-checkbox
            v-for="item in punishmentTypeOptions"
            :key="'checkbox-pt' + item.value"
            :label="item.value"
            >{{ item.label }}</el-checkbox
          >
        </el-checkbox-group>
        <el-select v-else v-model="punishment.type" :disabled="true">
          <el-option
            v-for="item in punishmentTypeOptions"
            :key="'select-pt-' + item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="是否启用处罚">
            <el-switch
              v-model="punishment.enable"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch> </el-form-item
        ></el-col>
        <el-col :span="16">
          <el-form-item>
            <template #label>
              截止时间
              <ToolTip content="用户被处罚的截止时间，留空则为永久" />
            </template>
            <el-date-picker
              v-model="punishment.end_time"
              type="datetime"
              placeholder="请选择处罚截止时间"
              :picker-options="datetimePickerPunishmentOptions"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="处罚原因">
        <el-input
          v-model="punishment.reason"
          type="textarea"
          :rows="3"
          placeholder="请输入处罚原因，被处罚用户可见"
        ></el-input>
      </el-form-item>
      <el-form-item label="处罚备注">
        <el-input
          v-model="punishment.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入处罚备注，管理员可见"
        ></el-input>
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
import { createPunishment, updatePunishment } from '@/api/punishment'
import {
  punishmentTypeOptions,
  datetimePickerPunishmentOptions,
} from '@/utils/enum'
import { listUser } from '@/api/user'

defineOptions({ name: 'FormPunishment' })
const props = defineProps({
  initPunishment: {
    type: Object,
    default: () => ({}),
  },
})
const emit = defineEmits(['success'])

const loading = ref(false)
const punishment = ref<Record<string, any>>({
  id: 0,
  user_id: '',
  remark: '',
  reason: '',
  type: [],
  enable: true,
})
const users = ref<any[]>([])
const formPunishment = ref<any>()

watch(
  () => props.initPunishment,
  (val) => {
    const enable = val.enable || false
    punishment.value = {
      id: 0,
      user_id: '',
      remark: '',
      reason: '',
      type: [],
      ...val,
      enable,
    }
  },
  { immediate: true },
)

const onSubmit = () => {
  formPunishment.value.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    loading.value = true
    const target = { ...punishment.value }
    if (punishment.value.id > 0) {
      delete target.operators
      const res: any = await updatePunishment(target)
      if (res.status === 200) {
        ElMessage.success('修改成功')
        emit('success', res.data)
      } else {
        ElMessage.error(res.data.message)
      }
    } else {
      const res: any = await createPunishment(target)
      if (res.status === 200) {
        ElMessage.success('新增成功')
        emit('success', res.data)
      } else {
        ElMessage.error(res.data.message)
      }
    }
    loading.value = false
  })
}

const remoteSearchUser = async (wd: string) => {
  searchUser(wd)
}

const searchUser = async (wd: string, userId: any[] = []) => {
  const res: any = await listUser({
    page: 1,
    size: 10,
    wd,
    id: userId || [],
    field: ['id', 'username'],
  })
  if (res.status === 200) {
    users.value = res.data.user || []
  }
}

const clearValidate = () => {
  formPunishment.value.clearValidate()
}

const resetFields = () => {
  punishment.value = {
    id: 0,
    title: '',
    link: '',
    sort: 0,
    enable: true,
    description: '',
  }
}

const reset = () => {
  resetFields()
  clearValidate()
}

defineExpose({ reset, resetFields, clearValidate })
</script>