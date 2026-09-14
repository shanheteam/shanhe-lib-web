<template>
  <div class="tinymce-editor">
    <Editor v-model="contentValue" :init="editorInit" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import tinymce from 'tinymce/tinymce'
import Editor from '@tinymce/tinymce-vue'
import MarkdownIt from 'markdown-it'
import { useUserStore } from '@/store/user'

defineOptions({ name: 'TinymceEditor' })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    height?: number
    placeholder?: string
    menubar?: boolean
    uploadUrl?: string
    enableMarkdownPaste?: boolean
    init?: Record<string, any>
  }>(),
  {
    modelValue: '',
    height: 600,
    placeholder: '请输入内容',
    menubar: true,
    uploadUrl: '/api/v1/upload/article?type=image',
    enableMarkdownPaste: true,
    init: () => ({}),
  },
)
const emit = defineEmits(['update:modelValue'])

const defaultToolbar =
  'undo redo | styleselect blocks | kityformula-editor codesample code table link bold italic | bullist numlist alignleft aligncenter alignright alignjustify indent outdent | image media | searchreplace preview fullscreen help'

const defaultPlugins =
  'kityformula-editor image media wordcount codesample code link charmap emoticons table searchreplace visualblocks fullscreen table help wordcount lists preview paste'

const markdownParser = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

const contentValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function containsHtml(content: string) {
  return /<\/?[a-z][\s\S]*?>/i.test(content)
}

function shouldTreatAsMarkdown(content: string) {
  const text = content.trim()
  if (!text) return false
  if (containsHtml(text)) return false
  const markdownIndicators =
    /(^|\n)(#{1,6}\s.+|[-*+]\s.+|\d+\.\s.+|>\s.+|`{3}|\[[^\]]+\]\([^)]+\)|\*{1,2}[^*]+\*{1,2})/
  return markdownIndicators.test(text)
}

function handleEditorPaste(event: any, editor: any) {
  const clipboardData = event.clipboardData || event.originalEvent?.clipboardData
  if (!clipboardData) return
  const plaintext = clipboardData.getData('text/plain')
  if (!plaintext || !shouldTreatAsMarkdown(plaintext)) return
  event.preventDefault()
  editor.insertContent(markdownParser.render(plaintext))
}

function imagesUploadHandler(blobInfo: any, progress: (v: number) => void) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.withCredentials = false
    xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL || ''}${props.uploadUrl}`)
    const userStore = useUserStore()
    const token = userStore.token
    if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token)
    xhr.upload.onprogress = (event) => {
      progress((event.loaded / event.total) * 100)
    }
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error('HTTP Error: ' + xhr.status))
        return
      }
      try {
        const res = JSON.parse(xhr.responseText)
        resolve(res.data.url)
      } catch (e) {
        reject(new Error('图片上传响应解析失败'))
      }
    }
    xhr.onerror = () => reject(new Error('图片上传失败，网络错误'))
    const formData = new FormData()
    formData.append('file', blobInfo.blob(), blobInfo.filename())
    xhr.send(formData)
  })
}

const editorInit = computed<Record<string, any>>(() => {
  const customInit = props.init || {}
  const customSetup = customInit.setup
  return {
    base_url: '/static/tinymce',
    language_url: '/static/tinymce/langs/zh-Hans.js',
    language: 'zh-Hans',
    skin_url: '/static/tinymce/skins/ui/oxide',
    height: props.height,
    branding: true,
    placeholder: props.placeholder,
    menubar: props.menubar,
    toolbar: defaultToolbar,
    plugins: defaultPlugins,
    relative_urls: false,
    images_upload_handler: imagesUploadHandler,
    ...customInit,
    setup: (editor: any) => {
      if (props.enableMarkdownPaste) {
        editor.on('Paste', (event: any) => handleEditorPaste(event, editor))
      }
      if (typeof customSetup === 'function') customSetup(editor)
    },
  }
})

tinymce.init({})
</script>

<style>
.tox-promotion {
  display: none !important;
}
</style>
