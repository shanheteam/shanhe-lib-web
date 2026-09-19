// 前端维护权限映射关系，后端只需要返回权限列表即可
// Key 为组，对象为权限相关名称（与原版 utils/permission.js 一致）
const customPermissionMap: Record<string, any> = {
  'api.v1.DocumentAPI': {
    label: '文档管理',
    path: 'ListDocument',
    children: [],
    pages: ['/admin/document', '/admin/document/list'],
  },
  'api.v1.RecycleAPI': {
    label: '回收站管理',
    path: 'ListRecycleDocument',
    children: [],
    pages: ['/admin/document', '/admin/document/recycle'],
  },
  'api.v1.SearchRecordAPI': {
    label: '搜索记录管理',
    path: 'ListSearchRecord',
    children: [],
    pages: ['/admin/document', '/admin/document/searchrecord'],
  },
  'api.v1.LanguageAPI': {
    label: '语言管理',
    path: 'ListLanguage',
    children: [],
    pages: ['/admin/document', '/admin/document/language'],
  },
  'api.v1.CategoryAPI': {
    label: '分类管理',
    path: 'ListCategory',
    children: [],
    pages: ['/admin/document', '/admin/document/category', '/admin/article/category'],
  },
  'api.v1.UserAPI': {
    label: '用户管理',
    path: 'ListUser',
    children: [],
    pages: ['/admin/user', '/admin/user/list'],
  },
  'api.v1.FriendlinkAPI': {
    label: '友链管理',
    path: 'ListFriendlink',
    children: [],
    pages: ['/admin/friendlink'],
  },
  'api.v1.AttachmentAPI': {
    label: '附件管理',
    path: 'ListAttachment',
    children: [],
    pages: ['/admin/attachment'],
  },
  'api.v1.ReportAPI': {
    label: '举报管理',
    path: 'ListReport',
    children: [],
    pages: ['/admin/biz', '/admin/report'],
  },
  'api.v1.BannerAPI': {
    label: '轮播图管理',
    path: 'ListBanner',
    children: [],
    pages: ['/admin/banner'],
  },
  'api.v1.GroupAPI': {
    label: '角色管理',
    path: 'ListGroup',
    children: [],
    pages: ['/admin/user', '/admin/user/group'],
  },
  'api.v1.PermissionAPI': {
    label: '权限管理',
    path: 'ListPermission',
    children: [],
    pages: ['/admin/user', '/admin/user/permission'],
  },
  'api.v1.AdvertisementAPI': {
    label: '广告管理',
    path: 'ListAdvertisement',
    children: [],
    pages: ['/admin/biz', '/admin/advertisement'],
  },
  'api.v1.ConfigAPI': {
    label: '系统设置',
    path: 'ListConfig',
    children: [],
    pages: [
      '/admin/config',
      '/admin/config/system',
      '/admin/config/display',
      '/admin/config/footer',
      '/admin/config/security',
      '/admin/config/converter',
      '/admin/config/download',
      '/admin/config/score',
      '/admin/config/email',
      '/admin/config/captcha',
      '/admin/config/search',
      '/admin/config/spider',
      '/admin/config/vip',
      '/admin/config/miniprogram',
      '/admin/config/oauth',
      '/admin/config/pay',
      '/admin/config/sms',
      '/admin/config/storage',
    ],
  },
  'api.v1.ArticleAPI': {
    label: '文章管理',
    path: 'ListArticle',
    children: [],
    pages: ['/admin/article', '/admin/article/set', '/admin/article/list', '/admin/article/recycle'],
  },
  'api.v1.CommentAPI': {
    label: '评论管理',
    path: 'ListComment',
    children: [],
    pages: ['/admin/biz', '/admin/comment'],
  },
  'api.v1.PunishmentAPI': {
    label: '惩罚管理',
    path: 'ListPunishment',
    children: [],
    pages: ['/admin/user', '/admin/user/punishment'],
  },
  'api.v1.NavigationAPI': {
    label: '导航管理',
    path: 'ListNavigation',
    children: [],
    pages: ['/admin/navigation'],
  },
  'api.v1.SpiderAPI': {
    label: '采集管理',
    path: 'ListSpiderUrl',
    children: [],
    pages: [
      '/admin/spider',
      '/admin/spider/url',
      '/admin/spider/articlelist',
      '/admin/spider/articledetail',
      '/admin/spider/document',
    ],
  },
  'api.v1.OrderAPI': {
    label: '订单管理',
    path: 'ListOrder',
    children: [],
    pages: ['/admin/order'],
  },
  'api.v1.SmsAPI': {
    label: '短信记录',
    path: 'ListSms',
    children: [],
    pages: ['/admin/user', '/admin/user/sms'],
  },
  'api.v1.UserVipAPI': {
    label: '会员管理',
    path: 'ListUserVip',
    children: [],
    pages: ['/admin/user', '/admin/user/vip'],
  },
}

// 权限树
export const permissionsToTree = (permissions: any[]): any[] => {
  const tree: any[] = []
  const permissionMap = JSON.parse(JSON.stringify(customPermissionMap))
  ;(permissions || []).forEach((permission: any) => {
    const slice = (permission.path || '').split('/')
    if (permission.method === 'GRPC') {
      if (!permissionMap[slice[1]]) permissionMap[slice[1]] = { children: [] }
      if (slice[2] === permissionMap[slice[1]].path) permissionMap[slice[1]].id = permission.id
      permissionMap[slice[1]].children.push({
        ...permission,
        label: permission.title || permission.path,
      })
    } else {
      if (!permissionMap[slice[3]]) permissionMap[slice[3]] = { children: [], label: slice[3] }
      permissionMap[slice[3]].children.push({
        ...permission,
        label: permission.title || permission.path,
      })
    }
  })
  Object.keys(permissionMap).forEach((key) => tree.push(permissionMap[key]))
  return tree
}

// 管理员菜单（icon 使用 Element Plus 图标组件名，或 'fa xxx' 形式的 font-awesome 类名）
export const adminMenus: any[] = [
  {
    page: '/admin/document',
    title: '文档管理',
    icon: 'DocumentCopy',
    children: [
      { page: '/admin/document/category', title: '文档分类', icon: 'Grid' },
      { page: '/admin/document/list', title: '文档列表', icon: 'Tickets' },
      { page: '/admin/document/language', title: '语言管理', icon: 'fa fa-language' },
      { page: '/admin/document/searchrecord', title: '搜索记录', icon: 'Search' },
      { page: '/admin/document/recycle', title: '回收站', icon: 'Delete' },
    ],
  },
  {
    page: '/admin/article',
    title: '文章管理',
    icon: 'Notebook',
    children: [
      { page: '/admin/article/category', title: '文章分类', icon: 'Grid' },
      { page: '/admin/article/list', title: '文章列表', icon: 'Tickets' },
      { page: '/admin/article/recycle', title: '回收站', icon: 'Delete' },
    ],
  },
  {
    page: '/admin/user',
    title: '用户管理',
    icon: 'User',
    children: [
      { page: '/admin/user/list', title: '用户管理', icon: 'User' },
      { page: '/admin/user/group', title: '角色管理', icon: 'MagicStick' },
      { page: '/admin/user/permission', title: '权限管理', icon: 'CircleCheck' },
      { page: '/admin/user/punishment', title: '处罚管理', icon: 'Warning' },
      { page: '/admin/user/vip', title: '会员管理', icon: 'GoldMedal' },
      { page: '/admin/user/sms', title: '短信记录', icon: 'Message' },
    ],
  },
  {
    page: '/admin/spider',
    title: '采集管理',
    icon: 'Connection',
    children: [
      { page: '/admin/spider/url', title: '文档嗅探', icon: 'Link' },
      { page: '/admin/spider/document', title: '采集文档', icon: 'Document' },
      { page: '/admin/spider/articlelist', title: '文章嗅探', icon: 'Reading' },
      { page: '/admin/spider/articledetail', title: '文章采集', icon: 'Notebook' },
    ],
  },
  { page: '/admin/order', title: '订单管理', icon: 'Tickets' },
  {
    title: '运营管理',
    page: '/admin/biz',
    icon: 'Suitcase',
    children: [
      { page: '/admin/comment', title: '评论管理', icon: 'ChatDotSquare' },
      { page: '/admin/report', title: '举报管理', icon: 'Warning' },
      { title: '广告管理', page: '/admin/advertisement', icon: 'Flag' },
    ],
  },
  { page: '/admin/banner', title: '轮播图管理', icon: 'Picture' },
  { page: '/admin/navigation', title: '导航管理', icon: 'Guide' },
  { page: '/admin/friendlink', title: '友链管理', icon: 'Link' },
  { page: '/admin/attachment', title: '附件管理', icon: 'Paperclip' },
  {
    page: '/admin/config',
    title: '系统设置',
    icon: 'Setting',
    children: [
      { title: '系统配置', page: '/admin/config/system', icon: 'Setting' },
      { title: '展示配置', page: '/admin/config/display', icon: 'Monitor' },
      { title: '底链配置', page: '/admin/config/footer', icon: 'Link' },
      { title: '验证码配置', page: '/admin/config/captcha', icon: 'Postcard' },
      { title: '安全配置', page: '/admin/config/security', icon: 'Coffee' },
      { title: '转换配置', page: '/admin/config/converter', icon: 'Refresh' },
      { title: '下载配置', page: '/admin/config/download', icon: 'Download' },
      { title: '积分配置', page: '/admin/config/score', icon: 'Coin' },
      { title: '邮箱配置', page: '/admin/config/email', icon: 'Message' },
      { title: '全文搜索', page: '/admin/config/search', icon: 'Search' },
      { title: '采集配置', page: '/admin/config/spider', icon: 'Connection' },
      { title: 'VIP配置', page: '/admin/config/vip', icon: 'GoldMedal' },
      { title: '小程序配置', page: '/admin/config/miniprogram', icon: 'Cellphone' },
      { title: 'Oauth配置', page: '/admin/config/oauth', icon: 'Key' },
      { title: '支付配置', page: '/admin/config/pay', icon: 'Wallet' },
      { title: '短信配置', page: '/admin/config/sms', icon: 'ChatLineSquare' },
      { title: '存储配置', page: '/admin/config/storage', icon: 'FolderOpened' },
    ],
  },
]