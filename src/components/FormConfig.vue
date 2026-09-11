<template>
  <div class="com-form-config">
    <el-form
      ref="formConfig"
      label-position="top"
      label-width="80px"
      :model="configs"
    >
      <el-row :gutter="20">
        <el-col
          v-for="(item, index) in configs"
          :key="'cfg-' + item.id"
          :span="item.col_num || 24"
        >
          <el-form-item>
            <template #label>
              {{ item.label
              }}<template v-if="item.placeholder"
                >（<small>{{ item.placeholder }}</small
                >）</template
              >
            </template>
            <el-input-number
              v-if="item.input_type === 'number'"
              v-model="configs[index]['value']"
              clearable
              :min="0"
              :placeholder="item.placeholder"
              :step="1"
            ></el-input-number>
            <el-input
              v-else-if="item.input_type === 'textarea'"
              v-model="configs[index]['value']"
              type="textarea"
              :placeholder="item.placeholder"
              rows="5"
            ></el-input>
            <el-select
              v-else-if="item.input_type === 'select'"
              v-model="configs[index]['value']"
            >
              <el-option
                v-for="option in item.options.split('\n')"
                :key="'option-' + option"
                :label="option.split(':')[1]"
                :value="option.split(':')[0]"
              ></el-option>
            </el-select>
            <el-select
              v-else-if="item.input_type === 'select-multi'"
              v-model="configs[index]['value']"
              multiple
              clearable
            >
              <el-option
                v-for="option in item.options.split('\n')"
                :key="'option-' + option"
                :label="option.split(':')[1]"
                :value="option.split(':')[0]"
              ></el-option>
            </el-select>
            <el-switch
              v-else-if="item.input_type === 'switch'"
              v-model="configs[index]['value']"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
              :active-value="'true'"
              :inactive-value="'false'"
            >
            </el-switch>
            <UploadImage
              v-else-if="item.input_type === 'image'"
              :action="'/api/v1/upload/config'"
              :image="configs[index]['value']"
              :width="'200px'"
              :show-remove="true"
              @remove="configs[index]['value'] = ''"
              @success="success($event, index)"
            />
            <el-input
              v-else
              v-model="configs[index]['value']"
              :placeholder="item.placeholder"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <el-button
          type="primary"
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
import { updateConfig } from '@/api/config'

defineOptions({ name: 'FormConfig' })
const props = defineProps({
  initConfigs: {
    type: Array,
    default: () => [],
  },
})

const loading = ref(false)
// 转成对象的方式来处理，解决采用数组方式，数据不响应的问题
const configs = ref<Record<string, any>>({})

const normalize = (data: any) => {
  const configsObj: Record<string, any> = { ...data }
  Object.values(configsObj).forEach((item: any) => {
    if (item.input_type === 'select-multi') {
      try {
        item.value = item.value.split(',')
      } catch (error) {
        // ignore
      }
    }
  })
  return configsObj
}

watch(
  () => props.initConfigs,
  (val) => {
    configs.value = normalize(val)
  },
  { immediate: true },
)

const onSubmit = async () => {
  loading.value = true
  const list: any[] = []
  Object.values(configs.value).forEach((item: any) => {
    // 注意：value值类型全都是字符串，所以提交上去的value值也要转换成字符串
    let value = ''
    try {
      value = item.value.toString()
    } catch (error) {
      // ignore
    }
    list.push({ ...item, value })
  })
  const res: any = await updateConfig({ config: list })
  if (res.status === 200) {
    ElMessage.success('配置更新成功')
  } else {
    ElMessage.error(res.data.message || '配置更新失败')
  }
  loading.value = false
}
const success = (res: any, index: any) => {
  configs.value[index] = { ...configs.value[index], value: res.data.path }
}
</script>
<style lang="scss">
.com-form-config {
  .el-form-item__label {
    padding-bottom: 0;
    line-height: 28px;
  }
}
</style>