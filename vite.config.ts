import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
import * as ElementPlusIcons from '@element-plus/icons-vue'

/**
 * Element Plus 图标按需解析器。
 *
 * 背景：模板里大量使用 <Link /> <Document /> 这类图标标签。此前这些图标全部在 main.ts 里
 * 逐个 import 并 app.component() 全局注册，导致 81 个图标无条件进入首屏 entry 包
 * （实测约 48KB 原始）。本解析器让 unplugin-vue-components 把静态标签按需解析为
 * `import { X } from '@element-plus/icons-vue'`，图标随之进入「实际用到它的页面」的 chunk。
 *
 * 注意：`<component :is="menu.icon" />` 这类**动态字符串**用法无法被解析器处理，
 * 它们仍依赖 main.ts 的全局注册（main.ts 中只保留这批动态图标）。
 * 新增菜单图标时，需同步补充 main.ts 的 APP_ICONS。
 */
const EP_ICON_NAMES = new Set(
  Object.keys(ElementPlusIcons).filter((name) => /^[A-Z]/.test(name)),
)

function ElementPlusIconsResolver() {
  return {
    type: 'component' as const,
    resolve: (name: string) => {
      if (!EP_ICON_NAMES.has(name)) return
      return { name, from: '@element-plus/icons-vue' }
    },
  }
}

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
          // 图标按需：静态 <Link /> 等标签随页面 chunk 引入（动态 :is 仍靠 main.ts 全局注册）
          ElementPlusIconsResolver(),
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // 样式已全部抽取至 public/css（见 scripts/build-css.mjs），.vue 内不再有 <style>/scss，
    // 故不再需要 additionalData 注入 var.scss。
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
        // 站点地图由后端生成并挂载在 /sitemap 下（见 server/src/main.ts 的 useStaticAssets）。
        // 页脚链接走 assetUrl()，生产指向后端域名；本地 base 为空时需要这条代理才能访问到。
        '/sitemap': {
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