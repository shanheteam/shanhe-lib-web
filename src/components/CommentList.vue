<template>
  <div class="com-comment-list">
    <comment-item
      v-for="comment in comments"
      :key="'comment-' + comment.id"
      :comment="comment"
      @success="commentSuccess"
    >
      <comment-item
        v-for="child in comment.children"
        :key="'comment-' + child.id"
        class="comment-child"
        :comment="child"
        :size="'small'"
        @success="commentSuccess"
      ></comment-item>
    </comment-item>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { listComment } from '@/api/comment'

defineOptions({ name: 'CommentList' })
const props = defineProps({
  documentId: {
    type: Number,
    default: 0,
  },
  parentId: {
    type: Number,
    default: 0,
  },
  type: {
    type: Number,
    default: 0,
  },
})

const comments = ref<any[]>([])
const req = ref<{ document_id: number; parent_id: number }>({
  document_id: props.documentId,
  parent_id: props.parentId,
})

watch(
  () => props.documentId,
  (val) => {
    req.value.document_id = val
  },
  { immediate: true },
)
watch(
  () => props.parentId,
  (val) => {
    req.value.parent_id = val
  },
  { immediate: true },
)

const comments2tree = (list: any[]) => {
  const tree: any[] = []
  const map: Record<string, any> = {}
  list.forEach((comment) => {
    map[comment.id] = comment
  })
  list.forEach((comment) => {
    let parent = map[comment.parent_id]
    let replyUser = ''
    if (comment.parent_id && parent) {
      try {
        replyUser = `<a href="/user/${parent.user.id}" class="el-link el-link--primary" target="blank">@${parent.user.realname || parent.user.username}</a>`
      } catch (error) {}
    }
    while (parent && parent.parent_id) {
      parent = map[parent.parent_id]
    }
    comment.reply_user = replyUser
    if (parent) {
      ;(parent.children || (parent.children = [])).push(comment)
    } else {
      tree.push(comment)
    }
  })
  return tree
}

// 获取文章评论列表
const getComments = async () => {
  if (!req.value.document_id) return
  const res: any = await listComment({
    document_id: props.documentId,
    type: props.type,
    order: 'id asc',
  })
  if (res.status === 200) {
    comments.value = comments2tree(res.data.comment || [])
  }
}
const commentSuccess = () => {
  getComments()
}

getComments()
</script>
<style lang="scss" scoped>
.com-comment-list {
  & > .el-row {
    margin-top: 20px;
    border-bottom: 1px solid #efefef;
    padding-bottom: 10px;
  }
  & > .el-row:first-of-type {
    margin-top: 0;
  }
}
</style>