// 这些枚举值与原版 utils/enum.js 保持一致，供列表/表单的标签、颜色分组使用
export interface OptionItem {
  label: string
  value: any
  type?: string
}

export const attachmentTypeOptions: OptionItem[] = [
  { label: '未知', value: 0 },
  { label: '头像', value: 1 },
  { label: '文档', value: 2 },
  { label: '文章', value: 3 },
  { label: '评论', value: 4 },
  { label: '轮播图', value: 5 },
  { label: '分类封面', value: 6 },
  { label: '配置', value: 7 },
]

export const documentStatusOptions: OptionItem[] = [
  { label: '待转换', value: 0, type: 'info' },
  { label: '转换中', value: 1, type: 'primary' },
  { label: '已转换', value: 2, type: 'success' },
  { label: '转换失败', value: 3, type: 'warning' },
  { label: '已禁用', value: 4, type: 'danger' },
  { label: '重新转换', value: 5, type: 'info' },
  { label: '待审核', value: 6, type: 'warning' },
  { label: '审核拒绝', value: 7, type: 'danger' },
]

export const bannerTypeOptions: OptionItem[] = [
  { label: '网站轮播图', value: 0, type: 'primary' },
  { label: '小程序轮播图', value: 1, type: 'success' },
  { label: 'APP轮播图', value: 2, type: 'warning' },
]

export const boolOptions: OptionItem[] = [
  { label: '是', value: true, type: 'success' },
  { label: '否', value: false, type: 'danger' },
]

export const reportOptions: OptionItem[] = [
  { label: '垃圾广告', value: 1 },
  { label: '淫秽色情', value: 2 },
  { label: '虚假中奖', value: 3 },
  { label: '敏感信息', value: 4 },
  { label: '人身攻击', value: 5 },
  { label: '骚扰他人', value: 6 },
]

export const methodOptions: OptionItem[] = [
  { label: 'GET', value: 'GET', type: 'success' },
  { label: 'POST', value: 'POST', type: 'primary' },
  { label: 'PUT', value: 'PUT', type: 'warning' },
  { label: 'DELETE', value: 'DELETE', type: 'danger' },
  { label: 'GRPC', value: 'GRPC', type: 'primary' },
]

export const punishmentTypeOptions: OptionItem[] = [
  { label: '禁用账户', value: 1, type: 'danger' },
  { label: '禁止评论', value: 2, type: 'warning' },
  { label: '禁止上传', value: 3, type: 'warning' },
  { label: '禁止下载', value: 4, type: 'warning' },
  { label: '禁止收藏', value: 5, type: 'warning' },
  { label: '禁止发布文章', value: 6, type: 'warning' },
]

export const categoryTypeOptions: OptionItem[] = [
  { label: '综合', value: -1, type: 'info' },
  { label: '文档', value: 0, type: 'primary' },
  { label: '文章', value: 1, type: 'success' },
]

export const articleStatusOptions: OptionItem[] = [
  { label: '待审核', value: 0, type: 'info' },
  { label: '审核通过', value: 1, type: 'success' },
  { label: '审核拒绝', value: 2, type: 'danger' },
]

export const wordExtEnum = ['.doc', '.docx', '.rtf', '.wps', '.odt', '.dot']
export const excelExtEnum = ['.xls', '.xlsx', '.csv', '.tsv', '.et', '.ods']
export const pptExtEnum = [
  '.ppt',
  '.pptx',
  '.pps',
  '.ppsx',
  '.dps',
  '.odp',
  '.pot',
]
export const otherExtEnum = [
  '.epub',
  '.umd',
  '.chm',
  '.mobi',
  '.azw',
  '.azw3',
  '.azw4',
]
export const textExtEnum = ['.txt']

// 广告位置
export const advertisementPositions: any[] = [
  {
    label: '全局广告',
    value: 'global',
    description: '网站全局广告，所有页面都会显示',
    children: [
      { label: '全局底部', value: 'global_bottom', description: '网站全局底部，所有页面都会显示' },
      { label: '全局顶部', value: 'global_top', description: '网站全局顶部，所有页面都会显示' },
    ],
  },
  {
    label: '首页',
    value: 'index',
    description: '网站首页，只有首页会显示',
    children: [
      { label: '首页轮播图下方', value: 'index_banner_bottom', description: '网站首页轮播图下方，只有首页会显示' },
      { label: '首页分类上方', value: 'index_category_top', description: '网站首页分类上方，只有首页会显示' },
      { label: '首页分类下方', value: 'index_category_bottom', description: '网站首页分类下方，只有首页会显示' },
      { label: '首页友链上方', value: 'index_link_top', description: '网站首页友链上方，只有首页会显示' },
    ],
  },
  {
    label: '列表页',
    value: 'list',
    description: '网站列表页，只有列表页会显示',
    children: [
      { label: '列表页导航下方', value: 'list_nav_bottom', description: '网站列表页导航下方，只有列表页会显示' },
      { label: '列表页文档列表上方', value: 'list_document_top', description: '网站列表页文档列表内容上方，只有列表页会显示' },
      { label: '列表页文档列表下方', value: 'list_document_bottom', description: '网站列表页文档列表内容下方，只有列表页会显示' },
    ],
  },
  {
    label: '文档浏览页',
    value: 'document',
    description: '网站文档浏览页，只有文档浏览页会显示',
    children: [
      { label: '文档浏览页顶部', value: 'document_top', description: '网站文档浏览页顶部，只有文档浏览页会显示' },
      { label: '文档浏览页评论顶部', value: 'document_bottom', description: '网站文档浏览页评论顶部，只有文档浏览页会显示' },
      { label: '文档浏览页页间', value: 'document_between', description: '网站文档浏览页页间，只有文档浏览页会显示' },
    ],
  },
  {
    label: '个人主页',
    value: 'user',
    description: '网站个人主页，只有个人主页会显示',
    children: [
      { label: '个人主页顶部', value: 'user_top', description: '网站个人主页顶部，只有个人主页会显示' },
      { label: '个人主页文档列表顶部', value: 'user_document_top', description: '网站个人主页文档列表顶部，只有个人主页会显示' },
    ],
  },
  {
    label: '搜索结果页',
    value: 'search',
    description: '网站搜索结果页，只有搜索结果页会显示',
    children: [
      { label: '搜索结果页顶部', value: 'search_top', description: '网站搜索结果页顶部，只有搜索结果页会显示' },
      { label: '搜索结果页底部', value: 'search_bottom', description: '网站搜索结果页底部，只有搜索结果页会显示' },
      { label: '搜索结果页右侧', value: 'search_right', description: '网站搜索结果页右侧，只有搜索结果页会显示' },
    ],
  },
]

// 带快捷选项的日期时间选择器配置（与原版 utils/enum.js 保持一致）
const dtShortcut = (days: number) => ({
  text: days === 7 ? '最近一周' : days === 30 ? '最近一个月' : days === 90 ? '最近三个月' : days === 183 ? '最近半年' : '最近一年',
  onClick(picker: any) {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * days)
    picker.$emit('pick', [start, end])
  },
})

export const datetimePickerOptions: any = {
  shortcuts: [7, 30, 90, 183, 365].map((d) => dtShortcut(d)),
}

export const datetimePickerPunishmentOptions: any = {
  shortcuts: [
    {
      text: '1小时',
      onClick(picker: any) {
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000)
        picker.$emit('pick', end)
      },
    },
    {
      text: '12小时',
      onClick(picker: any) {
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 12)
        picker.$emit('pick', end)
      },
    },
    {
      text: '1天',
      onClick(picker: any) {
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 24)
        picker.$emit('pick', end)
      },
    },
    {
      text: '2天',
      onClick(picker: any) {
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 2)
        picker.$emit('pick', end)
      },
    },
    {
      text: '1周',
      onClick(picker: any) {
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 7)
        picker.$emit('pick', end)
      },
    },
    {
      text: '1月',
      onClick(picker: any) {
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 30)
        picker.$emit('pick', end)
      },
    },
    {
      text: '半年',
      onClick(picker: any) {
        const start = new Date()
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 183)
        picker.$emit('pick', [start, end])
      },
    },
    {
      text: '1年',
      onClick(picker: any) {
        const start = new Date()
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 365)
        picker.$emit('pick', [start, end])
      },
    },
  ],
}

// 订单状态
export const orderStatusOptions: OptionItem[] = [
  { label: '待支付', value: 1, type: 'danger' },
  { label: '已支付', value: 2, type: 'success' },
  { label: '已关闭', value: 3, type: 'info' },
]

// 订单类型
const orderTypeBuyDocument = 1
const orderTypeBuyVIP = 2
const orderTypeRecharge = 3

export const orderTypeOptions: OptionItem[] = [
  { label: '购买文档', value: orderTypeBuyDocument },
  { label: '购买VIP', value: orderTypeBuyVIP },
  { label: '账户充值', value: orderTypeRecharge },
]

// 支付方式
export const paymentTypeOptions: OptionItem[] = [
  { label: '微信支付', value: 1 },
  { label: '支付宝支付', value: 2 },
  { label: '银行卡', value: 3 },
  { label: '现金支付', value: 4 },
  { label: '积分支付', value: 5 },
  { label: '系统充值', value: 6 },
  { label: '其他', value: 7 },
  { label: '虎皮椒支付', value: 8 },
  { label: '下载码支付', value: 9 },
  { label: '广告支付', value: 10 },
]

// 文档嗅探链接状态
export const spiderUrlStatusOptions: OptionItem[] = [
  { label: '待嗅探', value: 0, type: 'info' },
  { label: '嗅探中', value: 1, type: 'primary' },
  { label: '嗅探完成', value: 2, type: 'success' },
  { label: '嗅探失败', value: 3, type: 'warning' },
]

// 文章列表页嗅探状态
export const spiderArticleListStatusOptions: OptionItem[] = [
  { label: '待嗅探', value: 0, type: 'info' },
  { label: '嗅探中', value: 1, type: 'primary' },
  { label: '嗅探完成', value: 2, type: 'success' },
  { label: '嗅探失败', value: 3, type: 'warning' },
]

// 采集文章状态
export const spiderArticleDetailStatusOptions: OptionItem[] = [
  { label: '待采集', value: 0, type: 'info' },
  { label: '采集队列', value: 1, type: 'primary' },
  { label: '采集中', value: 2, type: 'primary' },
  { label: '采集成功', value: 3, type: 'success' },
  { label: '采集失败', value: 4, type: 'warning' },
  { label: '发布队列', value: 5, type: 'primary' },
  { label: '发布中', value: 6, type: 'primary' },
  { label: '发布成功', value: 7, type: 'success' },
  { label: '发布失败', value: 8, type: 'danger' },
]

// 采集文档状态
export const spiderDocumentStatusOptions: OptionItem[] = [
  { label: '待下载', value: 0, type: 'info' },
  { label: '下载队列', value: 1, type: 'primary' },
  { label: '下载中..', value: 2, type: 'primary' },
  { label: '下载成功', value: 3, type: 'success' },
  { label: '下载失败', value: 4, type: 'warning' },
  { label: '发布队列', value: 5, type: 'primary' },
  { label: '发布中', value: 6, type: 'primary' },
  { label: '发布成功', value: 7, type: 'success' },
  { label: '发布失败', value: 8, type: 'danger' },
]

// VIP 类型
export const vipTypeOptions: OptionItem[] = [
  { label: '年卡VIP', value: 0, type: 'success' },
  { label: '季卡VIP', value: 1, type: 'primary' },
  { label: '月卡VIP', value: 2, type: 'warning' },
]

// 短信类型
export const smsTypeOptions: OptionItem[] = [
  { label: '注册', value: 0, type: 'primary' },
  { label: '登录', value: 1, type: 'success' },
  { label: '找回密码', value: 2, type: 'warning' },
]

// 短信状态
export const smsStatusOptions: OptionItem[] = [
  { label: '发送中', value: 0, type: 'primary' },
  { label: '发送成功', value: 1, type: 'success' },
  { label: '发送失败', value: 2, type: 'danger' },
]

// 短信服务商
export const smsProviderOptions: OptionItem[] = [
  { label: '阿里云', value: 'smsAliyun', type: 'primary' },
  { label: '腾讯云', value: 'smsTencent', type: 'primary' },
  { label: '百度云', value: 'smsBaidu', type: 'primary' },
  { label: '华为云', value: 'smsHuawei', type: 'primary' },
  { label: '浩信', value: 'smsHaomas', type: 'primary' },
]