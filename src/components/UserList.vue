<template>
  <div class="com-user-list">
    <el-row v-for="user in users" :key="'user-' + user.id" :gutter="20">
      <el-col :span="7">
        <div class="avatar">
          <router-link :to="'/user/' + user.id">
            <el-avatar :src="assetUrl(user.avatar)">
              <img src="/static/images/avatar.png" alt="" />
            </el-avatar>
          </router-link>
        </div>
      </el-col>
      <el-col :span="17">
        <div class="info">
          <router-link
            :to="'/user/' + user.id"
            class="el-link el-link--default"
            >{{ user.realname || '未命名用户' }}</router-link
          >
          <div class="doc-info">
            <span class="el-link el-link--primary">{{
              user.doc_count || 0
            }}</span>
            <span class="text-muted">篇文档</span>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { assetUrl } from '@/utils/asset'
import { listUser } from '@/api/user'

defineOptions({ name: 'UserList' })
const props = defineProps({
  limit: {
    type: Number,
    default: 5,
  },
  order: {
    type: String,
    default: 'doc_count desc',
  },
})

const users = ref<any[]>([])

const getUsers = async () => {
  const res: any = await listUser({
    limit: props.limit,
    sort: props.order,
  })
  if (res.status === 200) {
    users.value = res.data.user || []
  }
}

watch(() => props.limit, getUsers)
watch(() => props.order, getUsers)

getUsers()
</script>
