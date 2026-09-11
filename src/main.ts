import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VxeUI from 'vxe-pc-ui'
import 'vxe-pc-ui/lib/style.css'
import VxeUITable from 'vxe-table'
import 'vxe-table/lib/style.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import mixins from './mixins/mixins'
import tableDrag from './directives/table-drag'

// 全局样式（与原版 nuxt.config.css 对应）
import './assets/font-awesome-4.7.0/css/font-awesome.min.css'
import './assets/css/app.scss'
import './assets/css/markdown.css'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })
app.use(VxeUI)
app.use(VxeUITable)

// 注册 Element Plus 图标（全局）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局 mixin（响应式 isMobile/isPad/isPC + 广告，对应原 mixins/mixins.js）
app.mixin(mixins)

// 全局指令 table-drag（对应原 plugins/table-drag.js）
app.directive('table-drag', tableDrag)

// 自动注册 src/components 下的所有组件（对应 Nuxt components: true 自动导入）
const componentModules = import.meta.glob('./components/**/*.vue', { eager: true })
const toPascal = (name: string) =>
  name
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
for (const path in componentModules) {
  const mod = componentModules[path] as any
  const comp = mod.default
  if (!comp) continue
  const rel = path.replace('./components/', '').replace(/\.vue$/, '')
  const parts = rel.split('/')
  const dirPascal = parts.map(toPascal).join('')
  const kebab = parts.join('-')
  const barePascal = toPascal(parts[parts.length - 1])
  app.component(dirPascal, comp)
  if (kebab !== dirPascal) app.component(kebab, comp)
  if (barePascal !== dirPascal) app.component(barePascal, comp)
  if (comp.name && comp.name !== dirPascal) app.component(comp.name, comp)
}

app.mount('#app')