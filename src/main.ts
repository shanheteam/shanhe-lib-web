import { createApp, type Component } from 'vue'
// 样式源已全部集中到 public/assets/css（index.html 以 <link> 引入其构建产物）：
//   /assets/font-awesome-4.7.0/css/font-awesome.min.css → vendor.css（含 EP + markdown）
//   /css/app.css（骨架 + 设计令牌 + 全局样式） → /css/components.css（组件样式，源为 components.scss）
//   后台专用的 vxe / wangeditor 样式由各自组件按需 import，不进 vendor.css
// 此处不再 import 任何样式文件。
import {
  Aim,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Back,
  Bell,
  BellFilled,
  Box,
  Calendar,
  Cellphone,
  ChatDotRound,
  ChatDotSquare,
  ChatLineSquare,
  CircleCheck,
  CircleClose,
  Clock,
  Close,
  Coffee,
  CoffeeCup,
  Coin,
  CollectionTag,
  Connection,
  Coordinate,
  DArrowRight,
  Delete,
  Document,
  DocumentChecked,
  DocumentCopy,
  Download,
  Edit,
  EditPen,
  Expand,
  Files,
  Flag,
  Fold,
  FolderOpened,
  FullScreen,
  GoldMedal,
  Grid,
  Guide,
  HomeFilled,
  House,
  InfoFilled,
  Key,
  Link,
  Loading,
  Location,
  Lock,
  MagicStick,
  Message,
  Monitor,
  Notebook,
  Operation,
  Paperclip,
  Picture,
  Plus,
  Postcard,
  QuestionFilled,
  Reading,
  Refresh,
  RefreshLeft,
  RefreshRight,
  Search,
  Setting,
  Sort,
  Star,
  StarFilled,
  SuccessFilled,
  Suitcase,
  Tickets,
  Top,
  TrendCharts,
  Upload,
  UploadFilled,
  User,
  UserFilled,
  View,
  Wallet,
  Warning,
  ZoomIn,
  ZoomOut,
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

// 注册 Element Plus 图标（全局）。模板与后台菜单存在 <component :is="menu.icon" /> 这类动态用法，
// 但图标名全部来自静态数组（utils/permission.ts 的 adminMenus、views/me.vue 的菜单定义），
// 已与 @element-plus/icons-vue 的导出集求交集穷举。不做全量注册：整库 293 个图标会给首屏包
// 多带约 142KB 原始 / 37KB gzip。新增图标时请同时补充上方 import 与本映射。
const APP_ICONS: Record<string, Component> = {
  Aim,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Back,
  Bell,
  BellFilled,
  Box,
  Calendar,
  Cellphone,
  ChatDotRound,
  ChatDotSquare,
  ChatLineSquare,
  CircleCheck,
  CircleClose,
  Clock,
  Close,
  Coffee,
  CoffeeCup,
  Coin,
  CollectionTag,
  Connection,
  Coordinate,
  DArrowRight,
  Delete,
  Document,
  DocumentChecked,
  DocumentCopy,
  Download,
  Edit,
  EditPen,
  Expand,
  Files,
  Flag,
  Fold,
  FolderOpened,
  FullScreen,
  GoldMedal,
  Grid,
  Guide,
  HomeFilled,
  House,
  InfoFilled,
  Key,
  Link,
  Loading,
  Location,
  Lock,
  MagicStick,
  Message,
  Monitor,
  Notebook,
  Operation,
  Paperclip,
  Picture,
  Plus,
  Postcard,
  QuestionFilled,
  Reading,
  Refresh,
  RefreshLeft,
  RefreshRight,
  Search,
  Setting,
  Sort,
  Star,
  StarFilled,
  SuccessFilled,
  Suitcase,
  Tickets,
  Top,
  TrendCharts,
  Upload,
  UploadFilled,
  User,
  UserFilled,
  View,
  Wallet,
  Warning,
  ZoomIn,
  ZoomOut,
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