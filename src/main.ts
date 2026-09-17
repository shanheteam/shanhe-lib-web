import { createApp } from 'vue'
// Element Plus 样式仍全量引入：组件本身已改为按需引入（见 vite.config.ts 的 Components 插件），
// 全量样式可以保证 app.scss 对组件样式的覆盖顺序与改造前一致。
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import mixins from './mixins/mixins'
import tableDrag from './directives/table-drag'
import safeHtml from './directives/safe-html'
import { useSettingStore } from './store/setting'

// 全局样式（与原版 nuxt.config.css 对应）
import './assets/font-awesome-4.7.0/css/font-awesome.min.css'
import './assets/css/app.scss'
import './assets/css/markdown.css'

const app = createApp(App)

app.use(pinia)
app.use(router)

// 注册 Element Plus 图标（全局）。模板与后台菜单中存在 <component :is="menu.icon" /> 这类
// 动态名称用法，无法静态分析，因此保留全局注册。
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局 mixin（响应式 isMobile/isPad/isPC + 广告，对应原 mixins/mixins.js）
app.mixin(mixins)

// 全局指令 table-drag（对应原 plugins/table-drag.js）
app.directive('table-drag', tableDrag)

// 全局指令 v-safe-html：替代 v-html，渲染前经 DOMPurify 过滤，防存储型 XSS
app.directive('safe-html', safeHtml)

// 首屏需要站点配置：提前发起请求，与路由懒加载并行，避免在路由守卫里才开始请求。
// 配置已持久化到 localStorage 时不再请求；此处与路由守卫的并发调用会复用同一个请求。
const settingStore = useSettingStore()
if (!Object.keys(settingStore.settings.system || {}).length) {
  settingStore.getSettings()
}

app.mount('#app')