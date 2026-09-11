<template>
  <el-container class="layout-default">
    <global-header />
    <el-main>
      <router-view />
    </el-main>
    <el-footer height="auto">
      <global-footer />
    </el-footer>
  </el-container>
</template>

<script lang="ts">
export default { name: 'DefaultLayout' }
</script>

<style lang="scss">
.autoheight .layout-default .el-main {
  min-height: auto;
  .page {
    min-height: calc(100vh - 70px - 135px);
  }
}
.layout-default {
  background-color: $background-grey-light;
  min-width: $min-width !important;
  min-height: 100vh;
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
  .el-main {
    padding-left: 0;
    padding-right: 0;
    min-height: calc(100vh - 70px);
  }
  .el-link {
    font-size: 15px;
  }
  .el-rate {
    display: inline-block;
    .el-rate__icon {
      margin-right: 0;
    }
    .el-rate__text {
      margin-left: 5px;
      color: #bdc3c7 !important;
    }
  }
  .el-breadcrumb__inner a,
  .el-breadcrumb__inner.is-link {
    font-weight: normal;
  }
  padding-top: 70px;
  .el-card {
    border-radius: 12px;
    border: 0;
  }
  .nav-ucenter {
    &.is-active {
      border-color: transparent !important;
    }
    .el-dropdown-link {
      display: inline-flex;
      align-items: center;
      height: 70px;
      font-weight: 400;
      font-size: 1.2em;
      .nav-user-avatar {
        margin-right: 6px;
      }
    }
  }
}
.dropdown-upload {
  font-size: 17px;
  margin-left: -2px;
}
.page {
  width: $default-width;
  min-width: $min-width !important;
  margin: 0 auto;
  overflow-x: hidden;
}
.btn-search {
  cursor: pointer;
}
.channel-category {
  &.is-active {
    background-color: #f2f6fc !important;
    a {
      color: #409eff;
    }
  }
  a {
    display: block;
  }
}
.el-menu--popup {
  min-width: 115px;
  .el-menu-item {
    a {
      display: block;
    }
  }
}
.el-dialog__header {
  padding: 20px 20px 10px;
}
.el-dialog__body {
  padding: 1px 20px;
}

.el-menu-mobile {
  margin-top: 15px;
  margin-left: -15px;
  border-right: 0;
  & > li {
    padding-left: 0;
  }
  .el-submenu__title {
    height: 32px;
    line-height: 32px;
    font-size: 15px;
  }
  .el-menu-item {
    height: 32px;
    line-height: 32px;
  }
}

@media screen and (max-width: $mobile-width) {
  .layout-default {
    min-width: 0 !important;
    .el-card {
      border-radius: 0;
    }
    .menu-drawer-box {
      .el-drawer__body {
        padding: 15px;
      }
      .navs {
        padding: 0;
        list-style: none;
        li {
          line-height: 30px;
        }
      }
    }
    .el-header {
      .el-menu.el-menu--horizontal {
        border-bottom: 0;
        width: 100%;
        max-width: unset;
        min-width: unset;
        .float-right {
          float: right;
          a {
            padding: 0 15px;
          }
        }
      }
      a {
        padding: 0 15px;
      }
      .menu-drawer {
        padding: 0 15px;
        display: inline-block;
      }
    }
  }
  .page {
    width: 100%;
    min-width: auto !important;
  }
  .el-card__header,
  .el-card__body {
    padding: 15px;
  }
  .el-dialog__header {
    padding: 15px 15px 5px;
  }
  .el-dialog__body {
    padding: 1px 15px;
  }
}

.breadcrumb-dropdown {
  max-height: 320px;
  overflow-y: auto;
  width: 360px;
  box-sizing: border-box;
  padding: 10px;
  max-width: 100%;
  .el-dropdown-menu__item {
    display: inline-block;
    padding: 0 10px;
    border-radius: 4px;
  }
  &::-webkit-scrollbar {
    background-color: transparent;
    width: 6px;
    height: 6px;
  }
  &:hover::-webkit-scrollbar {
    background-color: rgb(241, 241, 241);
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 3px;
  }
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgb(193, 193, 193);
  }
}
</style>