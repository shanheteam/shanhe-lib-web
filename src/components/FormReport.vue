<template>
  <div class="com-form-report">
    <el-form
      ref="reportForm"
      label-position="top"
      label-width="80px"
      :model="report"
    >
      <el-form-item label="文档">
        <el-input v-model="report.document_title" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="举报原因">
        <el-radio-group v-model="report.reason" class="report-reason">
          <el-row>
            <el-col
              :span="8"
              v-for="item in reportOptions"
              :key="'rs' + item.value"
            >
              <el-radio :value="item.value">{{ item.label }}</el-radio>
            </el-col>
          </el-row>
        </el-radio-group>
      </el-form-item>
      <template v-if="isAdmin">
        <el-form-item label="处理状态">
          <el-switch
            v-model="report.status"
            active-text="已处理"
            inactive-text="未处理"
          >
          </el-switch>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input
            v-model="report.remark"
            placeholder="请输入文档处理相关备注"
            type="textarea"
            :rows="3"
          ></el-input>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button
          type="primary"
          icon="Check"
          class="btn-block"
          @click="setReport"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { createReport, updateReport } from '@/api/report'
import { reportOptions } from '@/utils/enum'

defineOptions({ name: 'FormReport' })
const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false,
  },
  initReport: {
    type: Object,
    default: () => ({
      id: 0,
      report_id: 0,
      document_id: 0,
    }),
  },
})
const emit = defineEmits(['success'])

const reportForm = ref<any>()
const report = ref<Record<string, any>>({ id: 0, status: 0 })

watch(
  () => props.initReport,
  (val) => {
    report.value = { status: 0, ...val }
  },
  { immediate: true },
)

const setReport = async () => {
  if (report.value.id > 0) {
    const target = { ...report.value }
    delete target.document_title_html
    delete target.username_html
    const res: any = await updateReport(target)
    if (res.status === 200) {
      ElMessage.success('更新成功')
      emit('success')
    } else {
      ElMessage.error(res.data.message)
    }
  } else {
    const res: any = await createReport(report.value)
    if (res.status === 200) {
      ElMessage.success('提交成功')
      emit('success')
    } else {
      ElMessage.error(res.data.message)
    }
  }
}

const reset = () => {
  report.value = { id: 0 }
  reportForm.value.resetFields()
  reportForm.value.clearValidate()
}

defineExpose({ reset })
</script>
<style lang="scss">
.com-form-report {
  .el-select {
    width: 100%;
  }
  .report-reason {
    width: 100%;
    .el-radio {
      margin-bottom: 10px;
    }
  }
}
</style>