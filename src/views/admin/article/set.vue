<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <div class="clearfix">
          <el-row>
            <el-col :span="4">
              <el-button :icon="Back" @click="onCancel">返回</el-button>
            </el-col>
            <el-col :span="20" class="text-center">
              <div class="header-title">
                <span v-if="article.id > 0">编辑文章</span>
                <span v-else>新增文章</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </template>
      <FormArticle
        :init-article="article"
        :category-trees="trees"
        :is-admin="true"
        :can-i-publish="true"
      ></FormArticle>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { Back } from '@element-plus/icons-vue'
import { getArticle } from '@/api/article'
import { listCategory } from '@/api/category'
import { categoryToTrees } from '@/utils/utils'

const route = useRoute()
const router = useRouter()

const article = ref<any>({
  title: '',
  identifier: '',
  keywords: '',
  description: '',
  content: '',
  id: 0,
  category_id: [],
})
const trees = ref<any[]>([])

async function fetchArticle() {
  const id = route.query.id
  if (!id) {
    return
  }
  const res: any = await getArticle({ id: route.query.id })
  if (res.status !== 200) {
    ElMessage.error(res.data.message || '获取文章失败')
    return
  }
  article.value = res.data
}

async function fetchCategories() {
  const res: any = await listCategory({
    field: ['id', 'parent_id', 'title'],
    type: [1], // 筛选文章分类
  })
  if (res.status === 200) {
    let categories: any[] = res.data.category || []
    categories = categories.map((item: any) => {
      item.disable_delete = item.doc_count > 0
      return item
    })
    trees.value = categoryToTrees(categories, false)
  } else {
    ElMessage.error(res.data.message)
  }
}

function onCancel() {
  router.push('/admin/article/list')
}

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchArticle()])
})
</script>

<style>
.tox-promotion {
  display: none !important;
}
</style>
<style lang="scss" scoped>
.header-title {
  height: 40px;
  line-height: 40px;
  font-size: 20px;
}
</style>