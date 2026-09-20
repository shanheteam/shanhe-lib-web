<template>
  <div class="page page-user">
    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'user_top'"
        :key="item.position + item.id"
        v-safe-html="item.content"
      ></div>
    </template>
    <div class="user-layout">
      <aside class="user-layout__sidebar">
        <el-card class="user-panel user-panel--profile" shadow="never">
          <user-card :user="user" :hide-latest="true" />
        </el-card>
      </aside>
      <section class="user-layout__content">
        <el-card class="user-panel user-panel--content" shadow="never">
          <el-tabs v-model="activeTab" class="user-tabs" @tab-click="tabClick">
            <el-tab-pane name="user-id">
              <template #label>
                <span class="user-tab-label">
                  <router-link
                    class="user-tab-link"
                    :class="{ 'is-active': activeTab === 'user-id' }"
                    :to="{
                      name: 'user-id',
                      params: { id: user.id },
                    }"
                  >
                    <el-icon><Document /></el-icon>
                    <span>文档</span>
                  </router-link>
                </span>
              </template>
            </el-tab-pane>
            <el-tab-pane name="user-id-article">
              <template #label>
                <span class="user-tab-label">
                  <router-link
                    class="user-tab-link"
                    :class="{ 'is-active': activeTab === 'user-id-article' }"
                    :to="`/user/${user.id}/article`"
                  >
                    <el-icon><Tickets /></el-icon>
                    <span>文章</span>
                  </router-link>
                </span>
              </template>
            </el-tab-pane>
            <template v-for="item in advertisements">
              <div
                v-if="item.position == 'user_document_top'"
                :key="item.position + item.id"
                class="user-inline-ad"
                v-safe-html="item.content"
              ></div>
            </template>
            <router-view />
          </el-tabs>
        </el-card>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUser } from '@/api/user'
import { getAdvertisementByPosition } from '@/api/advertisement'
import { advertisementPositions } from '@/utils/enum'

const route = useRoute()
const router = useRouter()

const user = ref<any>({ id: 0 })
const activeTab = ref<any>(route.name)
const advertisements = ref<any[]>([])

watch(
  () => route.name,
  (value) => {
    activeTab.value = value
  }
)

const getAdvertisements = async () => {
  const positions: string[] = []
  advertisementPositions.forEach((item: any) => {
    if (item.value === 'user') {
      ;(item.children || []).forEach((child: any) => {
        positions.push(child.value)
      })
    }
  })
  const res: any = await getAdvertisementByPosition({ position: positions })
  if (res.status === 200) {
    advertisements.value = res.data.advertisement || []
  }
}

const getUserInfo = async () => {
  const res: any = await getUser({ id: user.value.id })
  if (res.status === 200) {
    user.value = res.data || { id: 0 }
  }
}

const tabClick = (e: any) => {
  const name = e?.paneName ?? e?.props?.name
  router.push({
    name,
    params: { id: user.value.id },
  })
}

onMounted(() => {
  try {
    const id = parseInt(route.params.id as string)
    user.value.id = id
    Promise.all([getUserInfo(), getAdvertisements()])
  } catch (error) {
    // ignore
  }
})
</script>
