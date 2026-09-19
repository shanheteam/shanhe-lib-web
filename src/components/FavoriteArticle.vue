<template>
  <div class="com-favorite-article">
    <el-table v-loading="loading" :data="favorites" style="width: 100%">
      <el-table-column prop="title" label="文章" min-width="200">
        <template #default="scope">
          <router-link
            target="_blank"
            :to="{
              name: 'article-id',
              params: { id: scope.row.document_uuid || scope.row.document_id },
            }"
            class="el-link el-link--default doc-title"
          >
            {{ scope.row.title }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="收藏时间" width="160">
        <template #default="scope">
          <el-tooltip
            :content="formatDatetime(scope.row.created_at)"
            placement="top"
          >
            <span>{{ formatRelativeTime(scope.row.created_at) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        v-if="userId === user.id"
        label="操作"
        width="70"
        fixed="right"
      >
        <template #default="scope">
          <el-tooltip content="移除收藏" placement="top">
            <el-button text @click="removeFavorite(scope.row)"
              ><el-icon><Delete /></el-icon>移除</el-button
            >
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
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import { deleteFavorite, listFavorite } from '@/api/favorite'
import { formatDatetime, formatRelativeTime } from '@/utils/utils'
import { createLatestGuard } from '@/utils/latest'

defineOptions({ name: 'FavoriteArticle' })
defineProps({
  userId: {
    type: Number,
    default: 0,
  },
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)

const favorites = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const query = ref({
  page: parseInt(route.query.page as string) || 1,
  size: 20,
})

const favoriteGuard = createLatestGuard()

const getFavorites = async () => {
  const token = favoriteGuard.start()
  loading.value = true
  const res: any = await listFavorite({
    page: query.value.page,
    size: query.value.size,
    type: 1,
  })
  if (!favoriteGuard.isLatest(token)) return
  if (res.status === 200) {
    favorites.value = res.data.favorite || []
    total.value = res.data.total || 0
  }
  loading.value = false
}

const removeFavorite = (row: any) => {
  ElMessageBox.confirm(`您确定要移除收藏的文章《${row.title}》吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const res: any = await deleteFavorite({ id: row.id })
      if (res.status === 200) {
        ElMessage.success('移除收藏成功')
        getFavorites()
      }
    })
    .catch(() => {})
}

const pageChange = (page: number) => {
  router.push({
    query: {
      ...route.query,
      page,
    },
  })
}

watch(
  () => route.query.page,
  (val) => {
    query.value.page = parseInt(val as string) || 1
    getFavorites()
  },
  { immediate: true },
)
</script>
