<template>
  <div class="com-user-card">
    <div class="user-card-avatar">
      <router-link :to="'/user/' + user.id">
        <UserAvatar :user="user" />
      </router-link>
    </div>
    <div class="user-card-username">
      <strong>{{ user.realname || '未命名用户' }}</strong>
    </div>
    <div class="user-card-stat">
      <el-row class="help-block">
        <el-col :span="8">
          <div>文档</div>
          <router-link
            class="el-link el-link--primary"
            :to="'/user/' + user.id"
            >{{ user.doc_count || 0 }}</router-link
          >
        </el-col>
        <el-col :span="8">
          <div>文章</div>
          <router-link
            class="el-link el-link--primary"
            :to="'/user/' + user.id + '/article'"
            >{{ user.article_count || 0 }}</router-link
          >
        </el-col>
        <el-col :span="8"
          ><div>{{ creditName(settings) }}</div>
          <router-link
            class="el-link el-link--primary"
            :to="'/user/' + user.id"
            >{{ user.credit_count || 0 }}</router-link
          ></el-col
        >
      </el-row>
    </div>
    <div v-if="!hideSignature" class="user-card-signature">
      <div><small>个性签名</small></div>
      <div class="help-block">
        {{ user.signature || '暂无个性签名' }}
      </div>
    </div>
    <template v-if="!hideLatest">
      <template v-if="type === 'default'">
        <div v-if="latestDocuments.length > 0" class="mgt-20px latest">
          <div class="heading">
            <small
              ><strong>最近上传</strong> <el-icon><Clock /></el-icon
            ></small>
          </div>
          <div class="help-block">
            <document-simple-list :docs="latestDocuments" />
          </div>
        </div>
      </template>
      <template v-else-if="type === 'article'">
        <div v-if="latestArticles.length > 0" class="mgt-20px latest">
          <div class="heading">
            <small
              ><strong>最近发布</strong> <el-icon><Clock /></el-icon
            ></small>
          </div>
          <div class="help-block">
            <article-simple-list :articles="latestArticles" />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSettingStore } from '@/store/setting'
import { creditName } from '@/utils/credit'
import { listArticle } from '@/api/article'
import { listDocument } from '@/api/document'

defineOptions({ name: 'UserCard' })
const props = defineProps({
  user: {
    type: Object,
    default: () => {
      return {
        id: 0,
        name: '',
        avatar: '',
        signature: '',
        doc_count: 0,
        favorite_count: 0,
        credit_count: 0,
      }
    },
  },
  hideActions: {
    type: Boolean,
    default: false,
  },
  hideSignature: {
    type: Boolean,
    default: false,
  },
  hideLatest: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'default',
  },
})

const settingStore = useSettingStore()
const settings = computed(() => settingStore.settings)

const loading = ref(false)
const latestDocuments = ref<any[]>([])
const latestArticles = ref<any[]>([])

const isMobileWidth = () => document.body.clientWidth < 768

// 获取最近上传的文档
const getLatestDocuments = async () => {
  if (
    props.user.id === 0 ||
    loading.value ||
    isMobileWidth() ||
    props.hideLatest
  )
    return
  loading.value = true
  const res: any = await listDocument({
    page: 1,
    size: 5,
    user_id: props.user.id,
  })
  loading.value = false
  if (res.status === 200) {
    latestDocuments.value = res.data.document || []
  }
}

const getLatestArticles = async () => {
  if (
    props.user.id === 0 ||
    loading.value ||
    isMobileWidth() ||
    props.hideLatest
  )
    return
  loading.value = true
  const res: any = await listArticle({
    page: 1,
    size: 5,
    user_id: props.user.id,
    type: 1,
    status: 1,
  })
  loading.value = false
  if (res.status === 200) {
    latestArticles.value = res.data.article || []
  }
}

watch(
  () => props.user,
  () => {
    if (props.type === 'article') {
      getLatestArticles()
    } else {
      getLatestDocuments()
    }
  },
  { immediate: true },
)
</script>
