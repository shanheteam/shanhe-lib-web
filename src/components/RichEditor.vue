<template>
  <div class="rich-editor">
    <Toolbar
      class="rich-editor__toolbar"
      :editor="editorRef"
      :default-config="toolbarConfig"
      mode="default"
    />
    <div class="rich-editor__body" :style="{ height: `${height}px` }">
      <Editor
        v-model="content"
        :default-config="editorConfig"
        mode="default"
        @on-created="handleCreated"
        @custom-paste="handleCustomPaste"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import '@wangeditor-next/editor/dist/css/style.css'
import {
  type IDomEditor,
  type IEditorConfig,
  type IToolbarConfig,
} from '@wangeditor-next/editor'
import { Editor, Toolbar } from '@wangeditor-next/editor-for-vue'
import MarkdownIt from 'markdown-it'
import { useUserStore } from '@/store/user'

defineOptions({ name: 'RichEditor' })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    height?: number
    placeholder?: string
    uploadUrl?: string
    enableMarkdownPaste?: boolean
  }>(),
  {
    modelValue: '',
    height: 600,
    placeholder: '请输入内容',
    uploadUrl: '/api/v1/upload/article?type=image',
    enableMarkdownPaste: true,
  },
)
const emit = defineEmits(['update:modelValue'])

const userStore = useUserStore()
const editorRef = shallowRef<IDomEditor>()

const content = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
})

const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    'undo',
    'redo',
    '|',
    'headerSelect',
    'fontSize',
    'lineHeight',
    '|',
    'bold',
    'italic',
    'underline',
    'through',
    'code',
    '|',
    'color',
    'bgColor',
    'clearStyle',
    '|',
    'bulletedList',
    'numberedList',
    'todo',
    '|',
    'justifyLeft',
    'justifyCenter',
    'justifyRight',
    '|',
    'indent',
    'delIndent',
    '|',
    'insertLink',
    'insertImage',
    'uploadImage',
    'insertVideo',
    '|',
    'insertTable',
    'deleteTable',
    'codeBlock',
    'blockquote',
    'divider',
    'emotion',
    '|',
    'fullScreen',
  ],
}

const markdownParser = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

const containsHtml = (content: string) => /<\/?[a-z][\s\S]*?>/i.test(content)

const shouldTreatAsMarkdown = (content: string) => {
  const text = content.trim()
  if (!text) return false
  if (containsHtml(text)) return false
  const markdownIndicators =
    /(^|\n)(#{1,6}\s.+|[-*+]\s.+|\d+\.\s.+|>\s.+|`{3}|\[[^\]]+\]\([^)]+\)|\*{1,2}[^*]+\*{1,2})/
  return markdownIndicators.test(text)
}

// 纯文本且带 Markdown 特征时转换为 HTML 粘贴，普通内容交给编辑器默认处理
const handleCustomPaste = (
  editor: IDomEditor,
  event: ClipboardEvent,
  callback: (v: boolean) => void,
) => {
  if (!props.enableMarkdownPaste) {
    callback(true)
    return
  }
  const plaintext = event.clipboardData?.getData('text/plain') || ''
  if (!shouldTreatAsMarkdown(plaintext)) {
    callback(true)
    return
  }
  editor.dangerouslyInsertHtml(markdownParser.render(plaintext))
  callback(false)
}

const uploadImage = (
  file: File,
  insertFn: (url: string, alt?: string, href?: string) => void,
) => {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL || ''}${props.uploadUrl}`)
  if (userStore.token) {
    xhr.setRequestHeader('Authorization', 'Bearer ' + userStore.token)
  }
  xhr.onload = () => {
    if (xhr.status < 200 || xhr.status >= 300) {
      ElMessage.error(`图片上传失败（HTTP ${xhr.status}）`)
      return
    }
    try {
      const res = JSON.parse(xhr.responseText)
      if (res.errno === 0 && res.data?.url) {
        insertFn(res.data.url, res.data.alt || file.name, res.data.url)
      } else {
        ElMessage.error(res.msg || '图片上传失败')
      }
    } catch (e) {
      ElMessage.error('图片上传响应解析失败')
    }
  }
  xhr.onerror = () => ElMessage.error('图片上传失败，网络错误')
  const formData = new FormData()
  formData.append('file', file, file.name)
  xhr.send(formData)
}

const editorConfig = computed<Partial<IEditorConfig>>(() => ({
  placeholder: props.placeholder,
  MENU_CONF: {
    uploadImage: {
      maxFileSize: 10 * 1024 * 1024,
      customUpload: uploadImage,
    },
  },
}))

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor
}

onBeforeUnmount(() => {
  editorRef.value?.destroy()
  editorRef.value = undefined
})
</script>

<style lang="scss" scoped>
.rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;

  :deep(.w-e-toolbar) {
    border-bottom: 1px solid #e4e7ed;
    background-color: #fafafa;
  }

  :deep(.w-e-text-container) {
    background-color: #fff;
  }
}
</style>
