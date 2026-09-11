<template>
  <div class="page page-user">
    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'user_top'"
        :key="item.position + item.id"
        v-html="item.content"
      ></div>
    </template>
    <div class="user-layout">
      <aside class="user-layout__sidebar">
        <el-card class="user-panel user-panel--profile" shadow="never">
          <user-card2 :user="user" />
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
                v-html="item.content"
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

<style lang="scss">
.page-user {
  .user-layout {
    display: flex;
    align-items: flex-start;
    gap: 24px;
  }

  .user-layout__sidebar {
    width: 272px;
    flex: 0 0 272px;
  }

  .user-layout__content {
    min-width: 0;
    flex: 1;
  }

  .user-panel {
    // border: 1px solid #e8edf5;
    border-radius: 18px;
    box-shadow: 0 10px 30px rgba(31, 45, 61, 0.05);

    .el-card__body {
      padding: 28px;
    }
  }

  .user-tabs {
    margin-top: -6px;

    .el-tabs__nav-wrap::after {
      background-color: #edf1f7;
    }

    // .el-tabs__item {
    //   padding: 0 0 14px;
    //   height: auto;
    //   line-height: 1;
    //   // margin-right: 28px;
    // }

    .el-tabs__active-bar {
      height: 3px;
      border-radius: 999px;
      background: #409eff;
    }

    & > .el-tabs__content {
      min-height: calc(100vh - 240px);
      padding-top: 18px;
    }

    .el-tabs__header {
      margin-bottom: 0;
    }
  }

  .user-tab-label {
    display: inline-flex;
    align-items: center;
  }

  .user-tab-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #6b7280;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s ease;

    &.is-active,
    &:hover {
      color: #409eff;
    }
  }

  .user-inline-ad {
    margin-bottom: 18px;
  }
}

@media screen and (max-width: $mobile-width) {
  .page-user {
    padding-top: 12px;

    .user-layout {
      flex-direction: column;
      gap: 16px;
    }

    .user-layout__sidebar,
    .user-layout__content {
      width: 100%;
      flex-basis: auto;
    }

    .user-panel {
      border-radius: 14px;

      .el-card__body {
        padding: 18px;
      }
    }

    .user-tabs {
      .el-tabs__item {
        margin-right: 18px;
      }

      & > .el-tabs__content {
        min-height: unset;
      }
    }
  }
}
</style>