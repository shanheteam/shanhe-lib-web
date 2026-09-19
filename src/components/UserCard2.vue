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
<style lang="scss" scoped>
.com-user-card2 {
  text-align: center;

  .user-card__avatar-wrap {
    display: flex;
    justify-content: center;
  }

  .user-card__avatar-link {
    display: inline-flex;
  }

  .el-avatar {
    border: 4px solid var(--app-border-navy);
    background-color: var(--el-color-white);
    img {
      border-radius: 50%;
    }
  }

  .user-card__body {
    margin-top: 18px;
  }

  .user-card__username {
    margin: 0;
    color: var(--app-text-heading);
    font-size: 34px;
    font-weight: 700;
    line-height: 1.15;
  }

  .user-card__signature {
    margin-top: 14px;
    color: var(--app-text-muted-soft);
    font-size: 14px;
    line-height: 1.8;
    min-height: 50px;
  }

  .user-card__joined {
    margin-top: 14px;
    color: var(--app-text-muted-soft-3);
    font-size: 13px;

    i {
      margin-right: 6px;
    }
  }

  .user-card__divider {
    height: 1px;
    margin: 22px 0;
    background: linear-gradient(
      90deg,
      rgba(232, 237, 245, 0) 0%,
      var(--app-bg-soft-9) 18%,
      var(--app-bg-soft-9) 82%,
      rgba(232, 237, 245, 0) 100%
    );
  }

  .user-card__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .user-card__stat-item {
    min-width: 0;
  }

  .user-card__stat-value {
    color: var(--app-text-heading);
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
  }

  .user-card__stat-label {
    margin-top: 8px;
    color: var(--app-text-muted-2-light);
    font-size: 13px;
  }
}

@media screen and (max-width: $mobile-width) {
  .com-user-card2 {
    .user-card__username,
    .user-card__stat-value {
      font-size: 28px;
    }

    .user-card__signature {
      min-height: auto;
    }
  }
}
</style>