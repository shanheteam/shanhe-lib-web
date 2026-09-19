<template>
  <div class="__nuxt-error-page">
    <div class="error">
      <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" fill="var(--app-error-svg)" viewBox="0 0 48 48">
        <path
          d="M22 30h4v4h-4zm0-16h4v12h-4zm1.99-10C12.94 4 4 12.95 4 24s8.94 20 19.99 20S44 35.05 44 24 35.04 4 23.99 4zM24 40c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z"
        />
      </svg>
      <div class="title">
        <h1>{{ message }}</h1>
        <router-link to="/">
          <el-button type="primary"><el-icon><HomeFilled /></el-icon> 返回首页</el-button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ErrorLayout',
  props: ['error'],
  computed: {
    message(): string {
      return (this as any).error?.message || '出错了'
    },
  },
}
</script>

<style>
.__nuxt-error-page {
  padding: 1rem;
  background: var(--app-bg-soft-3);
  color: var(--app-text-error-strong);
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: sans-serif;
  font-weight: 100 !important;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.__nuxt-error-page .error {
  max-width: 450px;
}
.__nuxt-error-page .title {
  font-size: 1.5rem;
  margin-top: 15px;
  color: var(--app-text-error-strong);
  margin-bottom: 8px;
}
.__nuxt-error-page a {
  color: var(--app-text-muted-soft) !important;
  text-decoration: none;
}
</style>