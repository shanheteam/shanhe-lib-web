import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

/**
 * 依赖分包规则：只被特定页面（后台表格、图表面板、富文本编辑器）用到的重型依赖
 * 单独成 chunk，不进首屏主包。
 * element-plus 刻意不在此配置：组件改为按需引入后，由 Rollup 按实际使用方自动拆分，
 * 若在此强制合并为一个 chunk，反而会把整个组件库拉回首屏。
 */
const VENDOR_RULES: Array<[string[], string]> = [
  [['vxe-table', 'vxe-pc-ui', '@vxe-ui'], 'vendor-vxe'],
  [['echarts', 'zrender', 'vue-echarts'], 'vendor-echarts'],
  [['@wangeditor-next'], 'vendor-wangeditor'],
  [
    ['vue', 'vue-router', 'vue-demi', 'pinia', 'pinia-plugin-persistedstate', '@vue'],
    'vendor-vue',
  ],
]

function manualChunks(id: string): string | undefined {
  // CJS 互操作辅助模块（@rollup/plugin-commonjs 注入的 commonjsHelpers.js）被首屏与
  // 懒加载 chunk 共同引用，其 id 不含 node_modules 路径。若不显式指定归属，Rollup 会把它
  // 并入 vendor-wangeditor，导致首屏静态引用整个富文本编辑器 chunk。
  if (id.includes('commonjsHelpers')) return 'vendor-cjs'
  if (!id.includes('node_modules')) return undefined
  for (const [pkgs, chunk] of VENDOR_RULES) {
    if (pkgs.some((pkg) => id.includes(`/node_modules/${pkg}/`))) return chunk
  }
  return undefined
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_BASE_URL || 'http://127.0.0.1:8880'
  const isProd = mode === 'production'

  return {
    plugins: [
      vue(),
      // 组件按需引入：替代原先 main.ts 中 import.meta.glob(eager) 的全量全局注册，
      // 未被页面使用的组件、以及只在后台使用的重型组件不再进入首屏包。
      Components({
        dirs: ['src/components'],
        deep: true,
        // 不生成 components.d.ts：该声明文件会覆盖 Element Plus 的宽松全局类型，
        // 使模板里既有的 10 处 props 类型不匹配被 vue-tsc 报错中断构建（与本次优化无关）。
        dts: false,
        resolvers: [
          // importStyle 设为 false：样式仍由 main.ts 统一全量引入 element-plus/dist/index.css，
          // 使 app.scss 对组件样式的覆盖顺序与改造前完全一致（只做 JS 层面的按需引入）。
          ElementPlusResolver({ importStyle: false, directives: true }),
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/css/var.scss";`,
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/view': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/download': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: { manualChunks },
      },
      reportCompressedSize: false,
    },
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
    },
  }
})