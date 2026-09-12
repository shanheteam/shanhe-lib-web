import service from '@/utils/request'

// 文章列表页来源
export const createSpiderArticleList = (data: any) =>
  service({ url: '/api/v1/spiderarticle/source', method: 'post', data })
export const updateSpiderArticleList = (data: any) =>
  service({ url: '/api/v1/spiderarticle/source', method: 'put', data: { spider_article_list: data } })
export const deleteSpiderArticleList = (params: any) =>
  service({ url: '/api/v1/spiderarticle/source', method: 'delete', params })
export const getSpiderArticleList = (params: any) =>
  service({ url: '/api/v1/spiderarticle/source', method: 'get', params })
export const listSpiderArticleList = (params: any) =>
  service({ url: '/api/v1/spiderarticle/source/list', method: 'get', params })
export const batchSetSpiderArticleListStatus = (data: any) =>
  service({ url: '/api/v1/spiderarticle/source/status', method: 'put', data })

// 采集文章详情
export const updateSpiderArticleDetail = (data: any) =>
  service({ url: '/api/v1/spiderarticle/detail', method: 'put', data: { spider_article_detail: data } })
export const batchUpdateSpiderArticleDetail = (data: any) =>
  service({ url: '/api/v1/spiderarticle/detail/batch', method: 'put', data })
export const deleteSpiderArticleDetail = (params: any) =>
  service({ url: '/api/v1/spiderarticle/detail', method: 'delete', params })
export const getSpiderArticleDetail = (params: any) =>
  service({ url: '/api/v1/spiderarticle/detail', method: 'get', params })
export const listSpiderArticleDetail = (params: any) =>
  service({ url: '/api/v1/spiderarticle/detail/list', method: 'get', params })
