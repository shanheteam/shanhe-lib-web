<template>
  <div>
    <el-card shadow="never" class="search-card">
      <FormSearch
        :fields="searchFormFields"
        :loading="loading"
        :show-create="false"
        :show-delete="false"
        :default-search="search"
        @onSearch="onSearch"
      />
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="orders"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="false"
        :show-delete="false"
        :show-select="false"
        :actions-min-width="160"
      >
        <template #actions="{ row }">
          <router-link target="_blank" :to="`/user/${row.user_id}`">
            <el-button link type="primary" size="small" icon="User">查看用户</el-button>
          </router-link>
          <router-link
            v-if="row.order_type === 1"
            target="_blank"
            :to="`/document/${row.product_id}`"
          >
            <el-button link type="primary" size="small" icon="Goods">查看商品</el-button>
          </router-link>
        </template>
      </TableListV2>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <div class="text-right">
        <el-pagination
          background
          :current-page="search.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="search.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        >
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { listOrder } from '@/api/order'
import { genLinkHTML, parseQueryIntArray } from '@/utils/utils'
import {
  orderStatusOptions,
  paymentTypeOptions,
  orderTypeOptions,
} from '@/utils/enum'

defineOptions({ name: 'AdminOrder' })

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const search = ref<any>({ wd: '', page: 1, size: 10 })
const orders = ref<any[]>([])
const total = ref(0)
const searchFormFields = ref<any[]>([])
const tableListFields = ref<any[]>([])

async function fetchList() {
  loading.value = true
  const res: any = await listOrder(search.value)
  if (res.status === 200) {
    orders.value = (res.data.order || []).map((item: any) => {
      if (item.order_type === 1) {
        item.product_name_html = genLinkHTML(
          item.product_name,
          `/document/${item.product_id}`,
        )
      } else {
        item.product_name_html = (item.product_name || '-')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      }
      return item
    })
    total.value = res.data.total
  } else {
    ElMessage.error(res.data.message)
  }
  loading.value = false
}

function handleSizeChange(val: number) {
  search.value.size = val
  router.push({ query: search.value })
}
function handlePageChange(val: number) {
  search.value.page = val
  router.push({ query: search.value })
}
function onSearch(params: any) {
  search.value = { ...search.value, ...params, page: 1 }
  router.push({ query: search.value })
}

function initSearchForm() {
  searchFormFields.value = [
    {
      type: 'text',
      label: '关键字',
      name: 'wd',
      placeholder: '请输入订单号或者产品名称关键字',
    },
    {
      type: 'select',
      label: '状态',
      name: 'order_status',
      placeholder: '请选择订单状态',
      multiple: true,
      options: orderStatusOptions,
    },
    {
      type: 'select',
      label: '订单类型',
      name: 'order_type',
      placeholder: '请选择订单类型',
      multiple: true,
      options: orderTypeOptions,
    },
    {
      type: 'select',
      label: '支付方式',
      name: 'payment_type',
      placeholder: '请选择订单支付方式',
      multiple: true,
      options: paymentTypeOptions,
    },
  ]
}

function initTableListFields() {
  const statusMap: Record<string, any> = {}
  const paymentTypeMap: Record<string, any> = {}
  const orderTypeMap: Record<string, any> = {}
  orderStatusOptions.forEach((item) => {
    statusMap[item.value] = item
  })
  paymentTypeOptions.forEach((item) => {
    paymentTypeMap[item.value] = { ...item, type: 'primary' }
  })
  orderTypeOptions.forEach((item) => {
    orderTypeMap[item.value] = { ...item, type: 'success' }
  })

  tableListFields.value = [
    { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
    { prop: 'product_name_html', label: '名称', minWidth: 200, fixed: 'left', type: 'html' },
    { prop: 'order_no', label: '订单号', minWidth: 220 },
    { prop: 'status', label: '状态', width: 90, type: 'enum', enum: statusMap },
    { prop: 'payment_type', label: '支付方式', width: 110, type: 'enum', enum: paymentTypeMap },
    { prop: 'order_type', label: '订单类型', width: 110, type: 'enum', enum: orderTypeMap },
    { prop: 'realname', label: '用户', width: 120 },
    { prop: 'quantity', label: '数量', width: 80, type: 'number' },
    { prop: 'price', label: '价格', width: 90, type: 'number' },
    { prop: 'coupon_amount', label: '优惠', width: 80, type: 'number' },
    { prop: 'amount', label: '实付', width: 90, type: 'number' },
    { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
    { prop: 'paid_at', label: '支付时间', width: 170, type: 'datetime' },
    { prop: 'closed_at', label: '关闭时间', width: 170, type: 'datetime' },
  ]
}

initSearchForm()
initTableListFields()

watch(
  () => route.query,
  () => {
    search.value = {
      ...search.value,
      ...route.query,
      page: parseInt(route.query.page as string) || 1,
      size: parseInt(route.query.size as string) || 10,
      ...parseQueryIntArray(route.query, ['order_status', 'order_type', 'payment_type']),
    }
    fetchList()
  },
  { immediate: true },
)
</script>
<style></style>
