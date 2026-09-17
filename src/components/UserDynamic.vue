<template>
  <div class="com-user-dynamic">
    <el-table v-loading="loading" :data="dynamics" style="width: 100%">
      <el-table-column
        prop="created_at"
        label="时间"
        :width="isMobile ? 90 : 160"
      >
        <template #default="scope">
          <el-tooltip
            :content="formatDatetime(scope.row.created_at)"
            placement="top"
          >
            <span>{{ formatRelativeTime(scope.row.created_at) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="内容">
        <template #default="scope">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-safe-html="scope.row.content"></span>
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
      @current-change="pageChange"
      class="mgt-20px"
    >
    </el-pagination>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDynamics } from '@/api/user'
import { formatRelativeTime, formatDatetime } from '@/utils/utils'

defineOptions({ name: 'UserDynamic' })
defineProps({
  userId: {
    type: Number,
    default: 0,
  },
})

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const query = ref<Record<string, any>>({
  page: parseInt(route.query.page as string) || 1,
  size: 20,
})
const dynamics = ref<any[]>([])
const total = ref(0)

const pageChange = (page: number) => {
  router.push({
    query: {
      page,
    },
  })
}

const getDynamicsList = async () => {
  if (loading.value) return
  loading.value = true
  const res: any = await getDynamics({ ...query.value })
  if (res.status === 200) {
    dynamics.value = res.data.dynamic || []
    total.value = res.data.total || 0
  }
  loading.value = false
}

watch(
  () => route.query,
  (val) => {
    query.value.page = parseInt((val.page as string) || '1') || 1
    getDynamicsList()
  },
  { immediate: true },
)
</script>

<style lang="scss">
.com-user-dynamic {
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