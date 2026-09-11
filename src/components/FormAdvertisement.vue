<template>
  <div class="com-form-advertisement">
    <el-form
      ref="formRef"
      label-position="top"
      label-width="80px"
      :model="advertisement"
    >
      <!-- 广告位下拉菜单 -->
      <el-form-item label="广告位" prop="position" :rules="[{ required: true, trigger: 'blur', message: '请选择广告位' }]">
        <el-select v-model="advertisement.position" filterable placeholder="请选择广告投放位置">
          <el-option-group
            v-for="item in advertisementPositions"
            :key="item.value"
            :label="item.label">
            <el-option
              v-for="child in item.children"
              :key="child.value"
              :label="child.label"
              :value="child.value">
            </el-option>
          </el-option-group>
        </el-select>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="18">
          <el-form-item
            label="名称"
            prop="title"
            :rules="[{ required: true, trigger: 'blur', message: '请输入广告名称' }]"
          >
            <el-input
              v-model="advertisement.title"
              placeholder="请输入广告名称"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="是否启用">
            <el-switch
              v-model="advertisement.enable"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
          </el-switch> </el-form-item>
        </el-col>
      </el-row>
      <!-- 起止时间 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="advertisement.start_time"
              type="datetime"
              placeholder="请选择开始时间"
              clearable
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="advertisement.end_time"
              type="datetime"
              placeholder="请选择结束时间"
              clearable
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 广告内容代码 -->
      <el-form-item label="广告代码" prop="content" :rules="[{ required: true, trigger: 'blur', message: '请输入广告内容代码' }]">
        <el-input
          v-model="advertisement.content"
          type="textarea"
          :rows="5"
          placeholder="请输入广告内容代码"
        ></el-input>
      </el-form-item>
      <el-form-item label="广告备注">
        <el-input
          v-model="advertisement.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入广告相关描述或备注"
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
import { createAdvertisement, updateAdvertisement } from '@/api/advertisement'
import { advertisementPositions } from '@/utils/enum'

defineOptions({ name: 'FormAdvertisement' })
const props = defineProps({
  initAdvertisement: {
    type: Object,
    default: () => ({}),
  },
})
const emit = defineEmits(['success'])

const formRef = ref<any>()
const loading = ref(false)
const advertisement = ref<Record<string, any>>({
  id: 0,
  title: '',
  enable: true,
  content: '',
  remark: '',
  position: '',
  start_time: '',
  end_time: '',
})

watch(
  () => props.initAdvertisement,
  (val) => {
    advertisement.value = { ...val }
  },
  { immediate: true },
)

const resetFields = () => {
  advertisement.value = {
    id: 0,
    title: '',
    enable: true,
    content: '',
    remark: '',
    position: '',
    start_time: '',
    end_time: '',
  }
}

const clearValidate = () => {
  formRef.value?.clearValidate()
}

const reset = () => {
  resetFields()
  clearValidate()
}

const onSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    loading.value = true
    const adv: Record<string, any> = { ...advertisement.value }
    if (!adv.start_time) delete adv.start_time
    if (!adv.end_time) delete adv.end_time

    if (advertisement.value.id > 0) {
      const res: any = await updateAdvertisement(adv)
      if (res.status === 200) {
        ElMessage.success('修改成功')
        resetFields()
        emit('success', res.data)
      } else {
        ElMessage.error(res.data.message)
      }
    } else {
      const res: any = await createAdvertisement(adv)
      if (res.status === 200) {
        ElMessage.success('新增成功')
        resetFields()
        emit('success', res.data)
      } else {
        ElMessage.error(res.data.message)
      }
    }
    loading.value = false
  })
}

defineExpose({ onSubmit, clearValidate, resetFields, reset })
</script>