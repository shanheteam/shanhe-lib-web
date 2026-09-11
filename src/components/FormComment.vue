<template>
  <div class="com-form-comment">
    <el-form
      ref="form"
      :inline="true"
      :model="comment"
      :rules="rules"
      class="form-comment"
    >
      <el-form-item prop="content" class="comment-content">
        <el-input
          v-model="comment.content"
          type="textarea"
          :placeholder="placeholder"
          :autosize="
            isMobile ? { minRows: 3, maxRows: 6 } : { minRows: 4, maxRows: 6 }
          "
        />
      </el-form-item>
      <el-form-item class="comment-btns">
        <el-row>
          <el-col :span="isMobile ? 24 : 7"> 请文明评论，理性发言. </el-col>
          <el-col
            :span="isMobile ? 24 : 17"
            :class="isMobile ? '' : 'text-right'"
          >
            <template v-if="captcha.enable">
              <el-form-item class="el-form-item-captcha">
                <div class="captcha">
                  <div v-if="captcha.type == 'audio'">
                    <el-row :gutter="15">
                      <el-col :span="20">
                        <audio
                          :controls="true"
                          :src="captcha.captcha"
                        ></audio>
                      </el-col>
                      <el-col :span="4">
                        <el-tooltip placement="top" content="刷新语音验证码">
                          <el-button
                            icon="Refresh"
                            class="btn-audio-refresh"
                            @click="loadCaptcha"
                          ></el-button>
                        </el-tooltip>
                      </el-col>
                    </el-row>
                  </div>
                  <div v-else>
                    <el-tooltip placement="top" content="点击可刷新验证码">
                      <img
                        :src="captcha.captcha"
                        class="pointer"
                        @click="loadCaptcha"
                      />
                    </el-tooltip>
                  </div>
                </div>
              </el-form-item>
              <el-form-item
                prop="captcha"
                :rules="[
                  { required: true, trigger: 'blur', message: '请输入验证码' },
                ]"
              >
                <el-input
                  v-model="comment.captcha"
                  placeholder="请输入验证码"
                  :size="isMobile ? 'default' : ''"
                ></el-input>
              </el-form-item>
            </template>
            <el-form-item>
              <el-button
                type="primary"
                icon="Position"
                :size="isMobile ? 'default' : ''"
                @click="submitForm('form')"
                >发表点评</el-button
              >
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserCaptcha } from '@/api/user'
import { createComment } from '@/api/comment'
import { useSettingStore } from '@/store/setting'

defineOptions({ name: 'FormComment' })
const props = defineProps({
  documentId: {
    type: Number,
    default: 0,
  },
  parentId: {
    type: Number,
    default: 0,
  },
  placeholder: {
    type: String,
    default: '请输入评论内容',
  },
  type: {
    type: Number,
    default: 0, // 0 文档，1 文章
  },
})
const emit = defineEmits(['success'])

const settingStore = useSettingStore()
const settings = computed(() => settingStore.settings)

const form = ref<any>()
const comment = ref<Record<string, any>>({
  document_id: props.documentId,
  parent_id: props.parentId,
  content: '',
  captcha: '',
  captcha_id: '',
  type: props.type,
})
const captcha = ref<Record<string, any>>({
  enable: false,
  captcha: '/static/images/touch-captcha.png',
  type: 'image',
})
const rules = {
  content: [{ required: true, message: '请输入评论内容', trigger: 'blur' }],
}

watch(
  () => props.documentId,
  (val) => {
    comment.value.document_id = val
  },
  { immediate: true },
)
watch(
  () => props.parentId,
  (val) => {
    comment.value.parent_id = val
  },
  { immediate: true },
)

if (settings.value.security.enable_captcha_comment) {
  captcha.value.enable = true
}

const submitForm = (formName: string) => {
  form.value.validate(async (valid: boolean) => {
    if (valid) {
      const res: any = await createComment(comment.value)
      if (res.status === 200) {
        ElMessage.success('评论成功')
        comment.value.content = ''
        comment.value.captcha = ''
        loadCaptcha()
        emit('success')
      } else {
        ElMessage.error(res.data.message)
      }
    } else {
      return false
    }
  })
}
const loadCaptcha = async () => {
  const res: any = await getUserCaptcha({ type: 'comment', t: Date.now() })
  if (res.data.enable) {
    comment.value = {
      ...comment.value,
      captcha_id: res.data.id,
    }
    captcha.value = res.data
  }
}
</script>
<style lang="scss">
.com-form-comment {
  .comment-content {
    width: 100%;
    .el-form-item__content {
      display: block;
    }
  }
  .comment-btns {
    width: 100%;
    img {
      height: 40px;
    }
    .el-form-item__content {
      display: block;
    }
    .captcha {
      float: left;
    }
  }
}
@media screen and (max-width: $mobile-width) {
  .com-form-comment {
    .comment-content {
      margin-bottom: 10px;
    }
    .captcha {
      width: 100%;
    }
    .el-form-item-captcha {
      display: block;
    }
  }
}
</style>