<template>
  <div class="com-notice-board">
    <div class="text">
      <router-link
        class="notice-link"
        :to="{ path: '/article', query: { is_notice: 1 } }"
      >
        <el-icon><BellFilled /></el-icon>
        <span class="hidden-xs-only">网站公告</span>
      </router-link>
    </div>
    <el-carousel
      class="notice-carousel"
      :interval="interval"
      :height="height"
      direction="vertical"
      indicator-position="none"
      arrow="never"
    >
      <el-carousel-item v-for="item in notices" :key="'mb-' + item.id">
        <router-link
          class="notice-item-link"
          :to="`/article/${item.identifier}`"
          target="_blank"
        >
          {{ item.title }}
        </router-link>
        <span class="notice-datetime">{{ formatDate(item.updated_at) }}</span>
      </el-carousel-item>
    </el-carousel>
    <router-link
      class="notice-more"
      :to="{ path: '/article', query: { is_notice: 1 } }"
    >
      <small
        >更多 <el-icon><DArrowRight /></el-icon
      ></small>
    </router-link>
  </div>
</template>
<script setup lang="ts">
import { BellFilled, DArrowRight } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/utils'

defineOptions({ name: 'NoticeBoard' })

withDefaults(
  defineProps<{
    notices?: any[]
    height?: string
    interval?: number
  }>(),
  {
    notices: () => [],
    height: '50px',
    interval: 3000,
  }
)
</script>
<style lang="scss" scoped>
.com-notice-board {
  display: flex;
  align-items: center;

  .text {
    width: 100px;
    flex-shrink: 0;
    line-height: 50px;

    .notice-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--el-color-danger);
      font-size: 14px;
      text-decoration: none;
      .el-icon {
        font-size: 16px;
      }
    }
  }

  .notice-carousel {
    flex: 1;
    min-width: 0;

    .el-carousel__item {
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--el-color-white);

      .notice-item-link {
        flex: 1;
        min-width: 0;
        height: 50px;
        line-height: 50px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--el-text-color-primary);
        text-decoration: none;

        &:hover {
          color: var(--el-color-primary);
        }
      }

      .notice-datetime {
        flex-shrink: 0;
        padding-left: 30px;
        font-size: 13px;
        color: var(--el-text-color-secondary);
        cursor: auto;
      }
    }

    .el-carousel__arrow,
    .el-carousel__indicators {
      display: none;
    }
  }

  .notice-more {
    flex-shrink: 0;
    margin-left: 12px;
    color: var(--el-color-primary);
    text-decoration: none;
    font-size: 13px;
    white-space: nowrap;

    small {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
  }
}

@media screen and (max-width: 768px) {
  .com-notice-board {
    .text {
      width: 30px;

      .hidden-xs-only {
        display: none;
      }
    }

    .notice-carousel {
      .el-carousel__item {
        .notice-datetime {
          width: 100px;
          padding-left: 0;
        }
      }
    }

    .notice-more {
      display: none;
    }
  }
}
</style>