<template>
  <el-container class="layout-admin">
    <el-aside :class="isCollapse ? 'layout-aside-collapsed' : ''" :width="'240px'">
      <div class="logo" title="文库管理后台" @click="gohome">
        <img v-if="isCollapse" src="/static/images/logo-icon.png" />
        <img v-else src="/static/images/logo.png" />
      </div>
      <transition :duration="{ enter: 800, leave: 800 }" mode="out-in" name="el-fade-in-linear">
        <el-menu
          :router="true"
          :default-active="activeMenu"
          :collapse="isCollapse"
          class="layout-admin-menu custom-scrollbar"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><Monitor /></el-icon>
            <template #title>面板</template>
          </el-menu-item>
          <template v-for="menu in menus" :key="menu.page || menu.title">
            <el-sub-menu
              v-if="menu.children"
              v-show="allowPages.includes(menu.page) || menu.is_public"
              :index="menu.page"
            >
              <template #title>
                <el-icon v-if="isEpIcon(menu.icon)"><component :is="menu.icon" /></el-icon>
                <i v-else :class="menu.icon"></i>
                <span>{{ menu.title }}</span>
              </template>
              <el-menu-item
                v-for="child in menu.children"
                v-show="allowPages.includes(child.page) || menu.is_public"
                :key="child.page"
                :index="child.page"
              >
                <el-icon v-if="isEpIcon(child.icon)"><component :is="child.icon" /></el-icon>
                <i v-else :class="child.icon"></i>
                <span>{{ child.title }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item
              v-else
              v-show="allowPages.includes(menu.page) || menu.is_public"
              :index="menu.page"
            >
              <el-icon v-if="isEpIcon(menu.icon)"><component :is="menu.icon" /></el-icon>
              <i v-else :class="menu.icon"></i>
              <template #title>{{ menu.title }}</template>
            </el-menu-item>
          </template>
        </el-menu>
      </transition>
    </el-aside>
    <el-container>
      <el-header class="admin-header">
        <el-button v-if="isCollapse" class="fold" link @click="isCollapse = false">
          <el-icon><Expand /></el-icon>
        </el-button>
        <el-button v-else class="fold" link @click="isCollapse = true">
          <el-icon><Fold /></el-icon>
        </el-button>
        <el-dropdown class="user-dropdown" trigger="click" @command="command">
          <el-button>
            <el-icon style="margin-right: 4px"><User /></el-icon>
            <span>{{ user.username }}</span>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile"> 个人资料 </el-dropdown-item>
              <el-dropdown-item command="password"> 修改密码 </el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
    <el-drawer v-model="formProfileVisible" direction="rtl" :size="isMobile ? '90%' : '50%'" :with-header="false">
      <div class="drawer-head">
        <el-page-header content="个人资料" @back="formProfileVisible = false" />
      </div>
      <div style="padding: 0 20px">
        <FormProfile @success="profileSuccess" />
      </div>
    </el-drawer>
    <el-drawer v-model="formPasswordVisible" direction="rtl" :size="isMobile ? '90%' : '50%'" :with-header="false">
      <div class="drawer-head">
        <el-page-header content="修改密码" @back="formPasswordVisible = false" />
      </div>
      <div style="padding: 0 20px">
        <FormPassword @success="passwordSuccess" />
      </div>
    </el-drawer>
  </el-container>
</template>

<script lang="ts">
import { mapState, mapActions } from 'pinia'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { adminMenus } from '@/utils/permission'

export default {
  name: 'AdminLayout',
  data() {
    return {
      formProfileVisible: false,
      formPasswordVisible: false,
      isCollapse: false,
      activeMenu: (this as any).$route.path,
      menus: adminMenus,
    }
  },
  watch: {
    $route() {
      this.$nextTick(() => {
        const main = document.querySelector('.el-main')
        if (main) main.scrollTo({ behavior: 'smooth', top: 0 })
      })
    },
  },
  computed: {
    ...mapState(useUserStore, ['user', 'token', 'permissions', 'allowPages']),
    ...mapState(useSettingStore, ['settings']),
  },
  created() {
    if (this.activeMenu.endsWith('/')) this.activeMenu = this.activeMenu.slice(0, -1)
    this.getUserPermissions()
  },
  mounted() {
    const screenWidth = document.body.clientWidth
    if (screenWidth < 1000) this.isCollapse = !this.isCollapse
  },
  methods: {
    ...mapActions(useUserStore, ['logout', 'getUserPermissions']),
    isEpIcon(name: string) {
      return name && !name.startsWith('fa ')
    },
    profileSuccess() {
      this.formProfileVisible = false
    },
    passwordSuccess() {
      this.formPasswordVisible = false
    },
    async command(cmd: string) {
      switch (cmd) {
        case 'profile':
          this.formProfileVisible = true
          break
        case 'password':
          this.formPasswordVisible = true
          break
        case 'logout':
          await this.logout()
          this.$router.replace({ path: '/' })
          ElMessage.success('退出成功')
          break
      }
    },
    gohome() {
      this.$router.push('/')
    },
  },
}
</script>

<style lang="scss">
.layout-admin {
  .drawer-head {
    padding: 10px 20px;
  }
  .logo {
    cursor: pointer;
    height: 60px;
    border-bottom: 1px solid #e5e5e5;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    img {
      padding: 5px;
      height: 50px;
      margin: 0 2px;
      max-width: 100%;
    }
  }
  height: 100vh;
  .el-main {
    background-color: #f0f2f5;
  }
  .el-aside {
    transition: width 0.2s;
    height: 100vh;
    border-right: 1px solid #e6e6e6;
    & > .el-menu {
      border-right: 0;
      height: calc(100vh - 60px);
      overflow-y: auto;
    }
  }
  .el-header.admin-header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    border-bottom: 1px solid #e6e6e6;
    padding: 0 16px;
    .fold {
      padding: 0 15px 0 0;
      font-size: 20px;
      color: #999;
      cursor: pointer;
      margin-right: auto;
      &:hover {
        color: #555;
      }
    }
    .user-dropdown {
      display: inline-flex;
      align-items: center;
      .el-button {
        display: inline-flex;
        align-items: center;
        margin: 0;
      }
    }
  }
  .el-table th {
    height: 45px;
    line-height: 45px;
    padding: 1px 0 5px;
    &.el-table__cell {
      background-color: #f7fbff;
      color: #000;
      font-weight: normal;
      &.el-table-column--selection > .cell {
        padding-left: 14px;
      }
    }
    &.el-table__cell.is-leaf {
      border-bottom: 0;
    }
  }
  .search-card {
    .el-card__body {
      padding-bottom: 0;
    }
  }
  .el-menu-item.is-active {
    background-color: #ecf5ff;
  }
}

.layout-aside-collapsed {
  width: 64px !important;
  overflow: hidden;
}

.layout-admin-menu .fa {
  font-size: 18px;
  width: 24px;
  margin-right: 5px;
  text-align: center;
}

.el-menu-item .el-icon,
.el-sub-menu__title .el-icon {
  margin-right: 5px;
}

.drawer-head .el-page-header__content {
  font-size: 16px;
}
</style>