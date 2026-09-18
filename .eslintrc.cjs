module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist/**', 'node_modules/**'],
  rules: {
    // 项目大量使用 any 与动态类型，放宽严格规则以保证 lint 可作门禁而不阻塞开发
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    // 代码中存在大量有意吞错的空 catch 块（如列表过滤容错），允许空 catch 但保留其他空块告警
    'no-empty': ['error', { allowEmptyCatch: true }],
    // env.d.ts 中 *.vue 模块声明使用 DefineComponent<{}, {}, any> 是 Vue 官方 shim 惯例写法
    '@typescript-eslint/ban-types': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
  },
};
