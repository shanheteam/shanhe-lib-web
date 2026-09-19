<template>
  <div class="com-form-download">
    <h3>您当前正在下载文档《{{ document.title }}》</h3>
    <el-form
      ref="formDownload"
      label-position="left"
      label-width="80px"
      :model="download"
    >
      <el-form-item class="download">
        <div>
          <el-radio-group v-model="download.payment_type">
            <el-radio :value="creditDownload" border>积分下载</el-radio>
            <el-radio
              v-if="settings.download.enable_code_download"
              :value="codeDownload"
              border
              >下载码下载</el-radio
            >
          </el-radio-group>
        </div>
        <div class="tips mgt-20px code-tip">
          <template v-if="download.payment_type === codeDownload">
            <div
              v-if="
                settings.download.enable_code_download &&
                (document.price || 0) > (settings.download.max_price || 0)
              "
            >
              下载码只能免费下载价格不超过
              <span class="el-link el-link--danger">{{
                settings.download.max_price || 0
              }}</span>
              {{ settings.system.credit_name || '魔豆' }}的文档
            </div>
            <div v-else v-safe-html="settings.download.code_tip"></div>
          </template>
          <div v-if="download.payment_type === creditDownload">
            <div>用户可免费下载自己上传的文档</div>
            <div>
              所有用户每个IP每天可以下载
              <span class="el-link el-link--danger">{{
                settings.download.times_every_ip || 0
              }}</span>
              篇文档
            </div>
            <div>
              每个登录用户每天可下载
              <span class="el-link el-link--danger">{{
                settings.download.times_every_day || 0
              }}</span>
              篇文档
            </div>
            <div>
              下载当前文档需要
              <span class="el-link el-link--danger">{{
                document.price || 0
              }}</span>
              {{ settings.system.credit_name || '魔豆' }}
            </div>
          </div>
        </div>
      </el-form-item>
      <template v-if="download.payment_type === codeDownload">
        <el-form-item
          label="下载码"
          prop="downcode"
          :rules="[
            { required: true, message: '请输入您的下载码', trigger: 'blur' },
          ]"
        >
          <el-input
            v-model="download.downcode"
            placeholder="请输入您的下载码"
          ></el-input>
        </el-form-item>
      </template>
      <el-form-item class="download">
        <el-button
          type="primary"
          class="btn-block btn-download"
          :disabled="
            download.payment_type === codeDownload &&
            settings.download.enable_code_download &&
            (document.price || 0) > (settings.download.max_price || 0)
          "
          :loading="downloading"
          @click="execDownload"
          ><el-icon><Download /></el-icon>马上下载</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import * as documentApi from '@/api/document'
import { useSettingStore } from '@/store/setting'

const props = defineProps<{
  document: { id: number; title?: string; price?: number }
}>()

const emit = defineEmits<{ (e: 'success'): void }>()

const settingStore = useSettingStore()
const settings = computed(() => settingStore.settings)

const formDownload = ref<FormInstance>()
const downloading = ref(false)
const creditDownload = 5
const codeDownload = 9

const download = reactive({
  payment_type: creditDownload,
  downcode: '',
})

async function execDownload() {
  if (download.payment_type === codeDownload) {
    if (!formDownload.value) return
    await formDownload.value.validate().catch(() => {})
    if (!download.downcode.trim()) return
  }

  downloading.value = true
  const params: any = { id: props.document.id }
  if (download.payment_type === codeDownload) {
    params.downcode = download.downcode.trim()
  }
  const res: any = await documentApi.downloadDocument(params)
  downloading.value = false

  if (res.status === 200) {
    // 后端返回相对路径 /download/<jwt>，需拼上后端域名，否则会被当前前端域名解析导致 404
    const base = import.meta.env.VITE_API_BASE_URL || ''
    const url = res.data.url.startsWith('/') ? base + res.data.url : res.data.url
    window.location.href = url
    emit('success')
  } else {
    ElMessage.error(res.data.message || '下载失败')
  }
}
</script>

<style lang="scss">
.com-form-download {
  h3 {
    font-size: 15px;
    margin: 10px 0 20px;
  }
  .tips {
    margin-bottom: 20px;
    border: 1px dashed var(--app-color-warning-strong);
    padding: 15px 20px;
    border-radius: 4px;
    line-height: 24px;
    .el-link {
      cursor: auto;
      position: relative;
      top: -2px;
    }
  }
  .code-tip {
    margin-bottom: 0;
  }
  .download {
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
  .el-radio {
    margin-right: 10px;
  }
  .btn-download {
    width: 100%;
  }
}
</style>