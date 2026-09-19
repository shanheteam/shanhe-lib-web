<template>
  <el-row :class="`com-comment-item com-comment-item-${size}`">
    <el-col :span="isMobile ? 3 : 2">
      <router-link :to="{ name: 'user-id', params: { id: user.id } }">
        <user-avatar
          v-if="isMobile"
          :size="size == 'small' ? 32 : 36"
          :user="comment.user"
        />
        <user-avatar
          v-else
          :size="size == 'small' ? 40 : 48"
          :user="comment.user"
        />
      </router-link>
    </el-col>
    <el-col :span="isMobile ? 21 : 22">
      <div class="username">
        <router-link
          class="el-link el-link--default"
          :to="{ name: 'user-id', params: { id: comment.user_id } }"
          >{{ comment.user.realname || '匿名' }}</router-link
        >
      </div>
      <div
        class="comment-content"
        :class="'comment-status-' + (comment.status || 0)"
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-safe-html="comment.reply_user" />
        {{ comment.content }}
      </div>
      <div class="comment-action">
        <el-row class="help-block">
          <el-col :span="12">
            <el-tooltip
              :content="formatDatetime(comment.created_at)"
              placement="right"
            >
              <small class="text-muted">
                <el-icon><Clock /></el-icon>
                {{ formatRelativeTime(comment.created_at) }}
              </small>
            </el-tooltip>
          </el-col>
          <el-col :span="12" class="text-right">
            <el-button text size="small" @click="reply"
              ><el-icon><ChatDotSquare /></el-icon>回复</el-button
            >
          </el-col>
        </el-row>
      </div>
      <form-comment
        v-if="replyComment"
        :document-id="comment.document_id"
        :parent-id="comment.id"
        :placeholder="`回复 ${comment.user.realname || '匿名'}`"
        :type="comment.type"
        @success="commentSuccess"
      />
      <slot></slot>
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { formatRelativeTime, formatDatetime } from '@/utils/utils'

defineOptions({ name: 'CommentItem' })
const props = defineProps({
  size: {
    type: String,
    default: 'default', // default、small
  },
  comment: {
    type: Object,
    default: () => ({
      id: 0,
      parent_id: 0,
      user_id: 0,
      username: '匿名',
      avatar: '',
      group_id: 0,
      verify_status: 0,
      content: '内容加载中...',
      created_at: '0000-00-00',
    }),
  },
})
const emit = defineEmits(['success'])

const userStore = useUserStore()
const user = computed(() => userStore.user)

const replyComment = ref(false)

const reply = () => {
  replyComment.value = !replyComment.value
}
const commentSuccess = () => {
  emit('success')
}
</script>
