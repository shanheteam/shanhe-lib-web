<template>
  <div class="com-user-card2">
    <div class="user-card__avatar-wrap">
      <router-link :to="'/user/' + user.id" class="user-card__avatar-link">
        <UserAvatar :size="108" :user="user" />
      </router-link>
    </div>
    <div class="user-card__body">
      <h2 class="user-card__username">{{ user.realname || '未命名用户' }}</h2>
      <div v-if="!hideSignature" class="user-card__signature">
        {{ user.signature || '这个人很懒，暂时还没有留下个性签名。' }}
      </div>
    </div>
    <div class="user-card__divider"></div>
    <div class="user-card__stats">
      <div
        v-for="item in statItems"
        :key="item.label"
        class="user-card__stat-item"
      >
        <div class="user-card__stat-value">{{ item.value }}</div>
        <div class="user-card__stat-label">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useSettingStore } from '@/store/setting'
import { formatDate } from '@/utils/utils'

defineOptions({ name: 'UserCard2' })
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
})

const settingStore = useSettingStore()
const settings = computed(() => settingStore.settings)

const statItems = computed(() => {
  return [
    {
      label: '文档',
      value: props.user.doc_count || 0,
    },
    {
      label: '文章',
      value: props.user.article_count || 0,
    },
    {
      label: settings.value.system.credit_name || '魔豆',
      value: props.user.credit_count || 0,
    },
  ]
})
</script>
