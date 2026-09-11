<template>
  <div class="com-input-tag">
    <el-tag
      v-for="tag in dynamicTags"
      :key="tag"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)"
    >
      {{ tag }}
    </el-tag>
    <el-input
      ref="saveTagInput"
      v-model="inputValue"
      class="input-new-tag"
      :placeholder="placeholder"
      @keyup.enter="handleInputConfirm"
      @blur="handleInputConfirm"
    >
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps({
  placeholder: {
    type: String,
    default: '请输入，按回车键确认',
  },
})
const emit = defineEmits(['change'])

const dynamicTags = ref<any[]>([])
const inputVisible = ref(false)
const inputValue = ref('')
const saveTagInput = ref()

const handleClose = (tag: any) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1)
  emit('change', dynamicTags.value)
}
const handleInputConfirm = () => {
  const value = inputValue.value
  if (value) {
    dynamicTags.value.push(value)
  }
  inputValue.value = ''
  emit('change', dynamicTags.value)
}
</script>

<style lang="scss">
.com-input-tag {
  .el-tag {
    margin-right: 10px;
    position: relative;
    top: -4px;
  }
  .button-new-tag {
    margin-right: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 180px;
    vertical-align: bottom;
  }
}
</style>