<template>
  <div class="com-user-download">
    <el-table v-loading="loading" :data="downloads" style="width: 100%">
      <el-table-column prop="title" label="文档" min-width="200">
        <template #default="scope">
          <router-link
            target="_blank"
            :to="{
              name: 'document-id',
              params: { id: scope.row.document_uuid || scope.row.document_id },
            }"
            class="el-link el-link--default doc-title"
          >
            <img :src="`/static/images/${scope.row.icon}_24.png`" alt="" />
            {{ scope.row.title || '已被删除' }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="评分" width="110">
        <template #default="scope">
          <el-rate
            :value="scope.row.score || 0.0"
            disabled
            score-template="{value}"
          ></el-rate>
        </template>
      </el-table-column>
      <el-table-column prop="page" label="页数" width="70">
        <template #default="scope">{{ scope.row.pages || '-' }}</template>
      </el-table-column>
      <el-table-column prop="size" label="大小" width="100">
        <template #default="scope">{{
          formatBytes(scope.row.size)
        }}</template>
      </el-table-column>
      <el-table-column prop="created_at" label="下载时间" width="160">
        <template #default="scope">
          <el-tooltip
            :content="formatDatetime(scope.row.created_at)"
            placement="top"
          >
            <span>{{ formatRelativeTime(scope.row.created_at) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="total > 0"
      :current-page="query.page"
      :page-size="query.size"
      :layout="
        isMobile
          ? 'total, prev, pager, next'
          : 'total, prev, pager, next, jumper'
      "
      :pager-count="isMobile ? 5 : 7"
      :small="isMobile"
      :total="total"
      class="mgt-20px"
      @current-change="pageChange"
    >
    </el-pagination>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserDownloads } from '@/api/user'
import {
  formatDatetime,
  formatRelativeTime,
  formatBytes,
  getIcon,
} from '@/utils/utils'

defineOptions({ name: 'UserDownload' })
defineProps({
  userId: {
    type: Number,
    default: 0,
  },
})

const route = useRoute()
const router = useRouter()

const downloads = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const query = ref<Record<string, any>>({
  page: parseInt(route.query.page as string) || 1,
  size: 20,
})

watch(
  () => route.query.page,
  (val) => {
    query.value.page = parseInt(val as string) || 1
    getDownloads()
  },
  { immediate: true },
)

async function getDownloads() {
  loading.value = true
  const res: any = await getUserDownloads({
    page: query.value.page,
    size: query.value.size,
  })
  if (res.status === 200) {
    let list = res.data.download || []
    list = list.map((item: any) => {
      item.score = item.score / 100 || 3.0
      try {
        item.icon = getIcon(item.ext)
      } catch (error) {}
      return item
    })
    downloads.value = list
    total.value = res.data.total || 0
  }
  loading.value = false
}

const pageChange = (page: number) => {
  router.push({
    query: {
      page,
    },
  })
}
</script>

<style lang="scss">
.com-user-download {
  .doc-title {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 180%;
    img {
      height: 18px;
      position: relative;
      top: 3px;
    }
  }
}
</style>