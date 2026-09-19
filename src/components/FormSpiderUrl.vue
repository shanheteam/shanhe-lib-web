<template>
  <div class="com-form-spiderurl">
    <el-form
      ref="formRef"
      label-position="top"
      label-width="80px"
      :model="spiderurl"
    >
      <el-form-item label="批量链接">
        <el-input
          v-model="spiderurl.url"
          :type="spiderurl.id > 0 ? 'text' : 'textarea'"
          :rows="5"
          :disabled="spiderurl.id > 0"
          :placeholder="
            spiderurl.id > 0
              ? ''
              : '请输入链接地址，支持文档链接和网页链接。多个链接请换行，每行一个'
          "
        ></el-input>
      </el-form-item>
      <el-row v-if="spiderurl.id > 0" :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select v-model="spiderurl.status" placeholder="请选择状态">
              <el-option
                v-for="item in spiderUrlStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="启用浏览器渲染(针对JS渲染页面)">
            <el-switch
              v-model="spiderurl.enable_browser"
              active-color="var(--app-color-switch-on)"
              inactive-color="var(--app-color-switch-off)"
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="嗅探层级">
            <el-input
              v-model="spiderurl.level"
              :min="0"
              :max="999"
              :step="1"
              type="number"
              controls-position="right"
              placeholder="链接嗅探层级，0表示种子链接"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="嗅探频率(天)">
            <el-input
              v-model="spiderurl.frequency"
              :min="0"
              :max="999"
              :step="1"
              type="number"
              controls-position="right"
              placeholder="请输入嗅探频率"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-collapse>
        <el-collapse-item title="链接快筛" name="generator">
          <template #title>
            <h3>链接快筛</h3>
          </template>
          <div class="generator-container">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="【推荐】链接前缀">
                  <el-input
                    v-model="spiderurl.url_prefix"
                    placeholder="请输入链接前缀，用于快速筛选链接，只嗅探带有该前缀的链接。多个链接前缀请用换行分隔，取并集。"
                    type="textarea"
                    :rows="5"
                  ></el-input>
                  <div class="generator-tip">
                    <p>
                      用于快速筛选链接，只嗅探带有该前缀的链接。多个链接前缀，请用换行分隔。
                      比如数据源链接为 https://example.com/download/pdf/xxx.html
                      ，则可以填写前缀：
                    </p>
                    <p>https://example.com/download/pdf</p>
                    <p>https://example.com/pdf/</p>
                    <p>请视资源链接前缀填写。</p>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="排除特定关键字链接">
                  <el-input
                    v-model="spiderurl.exclude_url_keywords"
                    placeholder="请输入需要排除带有特定关键字的链接，如带有#号等关键字的链接。多个关键字请用换行分隔"
                    type="textarea"
                    :rows="3"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="只包含特定关键字链接">
                  <el-input
                    v-model="spiderurl.include_url_keywords"
                    placeholder="请输入只包含带有特定关键字的链接，多个关键字请用换行分隔"
                    type="textarea"
                    :rows="3"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-collapse-item>
      </el-collapse>
      <el-form-item class="mgt-20px">
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
import { spiderUrlStatusOptions } from '@/utils/enum'
import { createSpiderUrl, updateSpiderUrl } from '@/api/spiderurl'

defineOptions({ name: 'FormSpiderUrl' })

const props = defineProps({
  initSpiderUrl: {
    type: Object,
    default: () => ({}),
  },
})
const emit = defineEmits(['success'])

const formRef = ref<any>(null)
const loading = ref(false)
const defaultSpiderUrl = () => ({
  id: 0,
  url: '',
  status: 0,
  level: 0,
  frequency: 0,
  enable_browser: false,
  url_prefix: '',
  exclude_url_keywords: '',
  include_url_keywords: '',
})
const spiderurl = ref<any>(defaultSpiderUrl())

watch(
  () => props.initSpiderUrl,
  (val) => {
    spiderurl.value = { ...defaultSpiderUrl(), ...val }
  },
  { immediate: true, deep: true },
)

async function onSubmit() {
  loading.value = true
  const payload: any = { url: '', ...spiderurl.value }
  if (payload.id > 0) {
    payload.level = Number(payload.level) || 0
    payload.frequency = Number(payload.frequency) || 0
    const res: any = await updateSpiderUrl(payload)
    if (res.status === 200) {
      ElMessage.success('修改成功')
      resetFields()
      emit('success', res.data)
    } else {
      ElMessage.error(res.data.message)
    }
  } else {
    const req: any = {
      ...payload,
      status: 0,
      url: (payload.url || '').split('\n').map((u: string) => u.trim()).filter(Boolean),
    }
    delete req.id
    delete req.status
    const res: any = await createSpiderUrl(req)
    if (res.status === 200) {
      ElMessage.success('新增成功')
      resetFields()
      emit('success', res.data)
    } else {
      ElMessage.error(res.data.message)
    }
  }
  loading.value = false
}

function resetFields() {
  spiderurl.value = defaultSpiderUrl()
}

function clearValidate() {
  formRef.value && formRef.value.clearValidate()
}

function reset() {
  resetFields()
  clearValidate()
}

defineExpose({ reset, clearValidate })
</script>

<style lang="scss">
.com-form-spiderurl .el-textarea__inner {
  white-space: nowrap;
}
.generator-container {
  padding: 20px;
  border: 1px dashed var(--app-color-warning-strong);
  border-radius: 5px;
}
.generator-tip {
  line-height: 1;
  padding: 5px 10px;
  margin-top: 10px;
  background: var(--app-bg-warning);
  border: 1px solid var(--app-border-color-warning);
  border-radius: 5px;
}
</style>
