import { createApp, type Component } from 'vue'
// 样式源已全部集中到 public/assets/css（index.html 以 <link> 引入其构建产物）：
//   /assets/font-awesome-4.7.0/css/font-awesome.min.css → vendor.css（含 EP + markdown）
//   /css/app.css（骨架 + 设计令牌 + 全局样式） → /css/components.css（组件样式，源为 components.scss）
//   后台专用的 vxe / wangeditor 样式由各自组件按需 import，不进 vendor.css
// 此处不再 import 任何样式文件。
// 全局注册的 Element Plus 图标（**仅字符串引用所需**，共 49 个）。
// 模板里静态书写的 <Link /> <Document /> 等标签，由 vite.config.ts 的
// ElementPlusIconsResolver 按需解析，随各自页面 chunk 加载；
// 但后台菜单与个人中心使用 <component :is="menu.icon" /> 传字符串图标名，
// 解析器无法处理，故这批必须全局注册。
// 名单来源（**三类字符串引用都要算**，漏掉模板里的 icon="Xxx" 会导致图标解析不到）：
//   1) JS：icon: 'Xxx'        —— 后台菜单等
//   2) 模板：icon="Xxx"         —— 如 el-step / el-button 的 icon 属性
//   3) 模板：:icon="'Xxx'"
// 上述三类都由 Element Plus 在**运行时按全局注册名**解析（不经 SFC 编译器，
// 故构建产物里不会出现 resolveComponent，构建期检查发现不了）。
// 一键重扫：
//   { grep -rhoE "icon: '[A-Za-z]+'" src; grep -rhoE 'icon="[A-Za-z]+"' src; } | sort -u
// 新增图标时请同步补充此处。
import {
  ArrowRight, Back, Bell, Cellphone, ChatDotSquare, ChatLineSquare, Check, CircleCheck, Close,
  Coffee, Coin, Coordinate, Delete, Document, DocumentCopy, Download, Edit, EditPen, Flag,
  FolderOpened, GoldMedal, Goods, Grid, Guide, InfoFilled, Key, Link, MagicStick, Message,
  Monitor, Notebook, Paperclip, Picture, Plus, Position, Postcard, Promotion, Refresh,
  RefreshLeft, Search, Setting, Star, Suitcase, Tickets, Upload, User, View, Wallet, Warning,
} from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import mixins from './mixins/mixins'
import tableDrag from './directives/table-drag'
import safeHtml from './directives/safe-html'
import { useSettingStore } from './store/setting'

const app = createApp(App)

app.use(pinia)
app.use(router)

const APP_ICONS: Record<string, Component> = {
  ArrowRight,
  Back,
  Bell,
  Cellphone,
  ChatDotSquare,
  ChatLineSquare,
  Check,
  CircleCheck,
  Close,
  Coffee,
  Coin,
  Coordinate,
  Delete,
  Document,
  DocumentCopy,
  Download,
  Edit,
  EditPen,
  Flag,
  FolderOpened,
  GoldMedal,
  Goods,
  Grid,
  Guide,
  InfoFilled,
  Key,
  Link,
  MagicStick,
  Message,
  Monitor,
  Notebook,
  Paperclip,
  Picture,
  Plus,
  Position,
  Postcard,
  Promotion,
  Refresh,
  RefreshLeft,
  Search,
  Setting,
  Star,
  Suitcase,
  Tickets,
  Upload,
  User,
  View,
  Wallet,
  Warning,
}

for (const [name, component] of Object.entries(APP_ICONS)) {
  app.component(name, component)
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
if (settingStore.needFetchSettings()) {
  settingStore.getSettings()
}

app.mount('#app')