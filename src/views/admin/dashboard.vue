<template>
  <div class="page-admin-dashboard">
    <el-alert
      v-if="mysqlGroupBy.error"
      type="error"
      show-icon
      style="margin-bottom: 20px"
      :closable="false"
    >
      <template #title>告警提示</template>
      <div>
        <div v-safe-html="mysqlGroupBy.error"></div>
      </div>
      <div style="margin-top: 10px">
        <div>当然，您也可以通过下述方式进行设置。</div>
        <br />
        <el-tooltip
          content="通过SQL临时设置全局sql_mode，但当MySQL服务重启后，该设置会失效"
        >
          <el-button type="warning" size="small" @click="setSQLMode">
            <el-icon><Setting /></el-icon>
            临时设置
          </el-button>
        </el-tooltip>
        <a
          href="https://www.bookstack.cn/read/moredoc/only_full_group_by.md"
          target="_blank"
        >
          <el-button type="primary" size="small">
            <el-icon><Link /></el-icon>
            永久设置
          </el-button>
        </a>
      </div>
    </el-alert>
    <el-card shadow="never">
      <template #header>服务器状态</template>
      <el-row :gutter="20" class="gauges">
        <el-col
          v-for="(gauge, index) in gauges"
          :key="'gauge' + index"
          :span="6"
          :xs="12"
          :sm="8"
          :md="6"
          :lg="6"
        >
          <v-chart class="chart" autoresize :option="gauge" />
          <div class="text-center">
            <ul>
              <li v-for="(item, index) in gauge.labels" :key="'label-' + index">
                <small v-if="item.label">{{ item.label }} : </small>{{ item.value }}
              </li>
            </ul>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <template #header>数据统计</template>
      <el-descriptions class="margin-top" :column="3" border>
        <el-descriptions-item>
          <template #label>
            <el-icon><Document /></el-icon>
            文档
          </template>
          {{ stats.document_count || 0 }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <el-icon><ChatDotSquare /></el-icon>
            评论
          </template>
          {{ stats.comment_count || 0 }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <el-icon><User /></el-icon>
            用户
          </template>
          {{ stats.user_count || 0 }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <el-icon><Grid /></el-icon>
            分类
          </template>
          {{ stats.category_count || 0 }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <el-icon><Warning /></el-icon>
            举报
          </template>
          {{ stats.report_count || 0 }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <el-icon><Tickets /></el-icon>
            文章
          </template>
          {{ stats.article_count || 0 }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <el-icon><Link /></el-icon>
            友链
          </template>
          {{ stats.friendlink_count || 0 }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <template #header>
        <span>系统信息</span>
        <el-button
          style="float: right; padding: 3px 0"
          :loading="loading"
          link
          @click="updateSitemap"
        >
          <el-icon><Refresh /></el-icon>
          更新站点地图
        </el-button>
      </template>
      <el-descriptions class="margin-top" :column="1" border>
        <el-descriptions-item>
          <template #label> 操作系统 </template>
          {{ stats.os }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <template #header>
        <span>环境依赖</span>
        <a
          href="https://www.bookstack.cn/read/moredoc/install.md"
          target="_blank"
        >
          <el-button style="float: right; padding: 3px 0" link>
            <el-icon><Tickets /></el-icon>
            依赖安装教程
          </el-button>
        </a>
      </template>
      <el-table
        v-loading="envLoading"
        :data="envs"
        style="width: 100%"
        empty-text="您暂无权限查看环境依赖情况"
      >
        <el-table-column prop="name" label="名称" width="120">
        </el-table-column>
        <el-table-column prop="is_required" label="是否必须" width="100">
          <template #default="scope">
            <el-tag
              v-if="scope.row.is_required"
              effect="dark"
              type="danger"
              size="small"
              >必须安装</el-tag
            >
            <el-tag v-else effect="dark" type="info" size="small"
              >非必须</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="is_installed" label="安装" width="100">
          <template #default="scope">
            <el-tag
              v-if="scope.row.is_installed"
              effect="dark"
              type="success"
              size="small"
              >已安装</el-tag
            >
            <el-tag v-else effect="dark" type="warning" size="small"
              >未安装</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="version"
          show-overflow-tooltip
          label="版本"
          min-width="100"
        >
          <template #default="scope">
            {{ scope.row.version || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" min-width="200" label="用途">
        </el-table-column>
        <el-table-column prop="error" label="错误" min-width="100">
          <template #default="scope">
            <span v-if="scope.row.error" size="small">{{
              scope.row.error
            }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="checked_at" width="180" label="检测">
          <template #default="scope">
            {{ formatDatetime(scope.row.checked_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, GaugeChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { formatDatetime, formatBytes, cssVar } from '@/utils/utils'
import * as configApi from '@/api/config'

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GaugeChart,
  UniversalTransition,
  GridComponent,
])

const stats = ref<any>({
  admin_count: 0,
  student_count: 0,
  company_count: 0,
  category_count: 0,
  article_count: 0,
  article_pending_count: 0,
  comment_count: 0,
  comment_pending_count: 0,
  banner_count: 0,
  friendlink_count: 0,
  user_pending_count: 0,
    os: '-',
  })
const envs = ref<any[]>([])
const loading = ref(false)
const envLoading = ref(false)
const gauges = ref<any[]>([])
let timeouter: any = null
const mysqlGroupBy = ref<any>({})

function getGaugeOption(name: string, percent: any) {
  return {
    series: [
      {
        type: 'gauge',
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.3, '#67e0e3'],
              [0.7, '#37a2da'],
              [1, '#fd666d'],
            ],
          },
        },
        pointer: {
          itemStyle: {
            color: 'inherit',
          },
        },
        axisTick: {
          distance: -30,
          length: 8,
          lineStyle: {
            color: cssVar('--el-color-white'),
            width: 2,
          },
        },
        splitLine: {
          distance: -15,
          length: 20,
          lineStyle: {
            color: cssVar('--el-color-white'),
            width: 4,
          },
        },
        axisLabel: {
          color: 'inherit',
          distance: 10,
          fontSize: 14,
        },
        detail: {
          valueAnimation: true,
          formatter: '{value} %',
          color: 'inherit',
          fontSize: 20,
          offsetCenter: [0, '85%'],
        },
        data: [
          {
            value: percent,
            name,
            fontSize: 14,
          },
        ],
      },
    ],
  }
}

function initDevice() {
  const mg: any[] = [
    {
      ...getGaugeOption('CPU', '0.00'),
      labels: [
        { label: 'Cores', value: '-' },
        { label: 'Mhz', value: '-' },
        { label: '', value: '-' },
      ],
    },
    {
      ...getGaugeOption('内存', '0.00'),
      labels: [
        { label: 'Used', value: '-' },
        { label: 'Free', value: '-' },
        { label: 'Total', value: '-' },
      ],
    },
  ]
  mg.push({
    ...getGaugeOption('磁盘', '0.00'),
    labels: [
      { label: 'Used', value: '-' },
      { label: 'Free', value: '-' },
      { label: 'Total', value: '-' },
    ],
  })
  gauges.value = mg
}

function loopGetDevice() {
  getDevice()
  clearTimeout(timeouter)
  timeouter = setTimeout(() => {
    loopGetDevice()
  }, 5000)
}

async function getStats() {
  const res: any = await configApi.getStats()
  if (res.status === 200) {
    stats.value = {
      ...stats.value,
      ...res.data,
    }
  }
}

async function getEnvs() {
  envLoading.value = true
  const res: any = await configApi.getEnvs()
  envLoading.value = false
  if (res.status === 200) {
    const list = res.data.envs || []
    envs.value = list.filter((env: any) => env.name !== 'GroupBy')
    mysqlGroupBy.value = list.find((env: any) => env.name === 'GroupBy') || {}
  }
}

async function updateSitemap() {
  loading.value = true
  const res: any = await configApi.updateSitemap()
  if (res.status === 200) {
    ElMessage.success('更新成功')
    loading.value = false
    return
  }
  loading.value = false
  ElMessage.error(res.data.message || '更新失败')
}

function setSQLMode() {
  ElMessageBox.confirm(
    '您确定要通过当前方式进行临时设置吗？临时设置成功之后，当前提示将不再显示。',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res: any = await configApi.setSQLMode(mysqlGroupBy.value.value)
      if (res.status === 200) {
        ElMessage.success('设置成功')
        mysqlGroupBy.value = {}
        return
      }
      ElMessage.error(res.data.message || '设置失败')
    })
    .catch(() => {})
}

async function getDevice() {
  const res: any = await configApi.getDevice()
  if (res.status === 200) {
    const mg: any[] = [
      {
        ...getGaugeOption(
          'CPU',
          (res.data.cpu.percent || 0).toFixed(2) || '0.00'
        ),
        labels: [
          { label: 'Cores', value: res.data.cpu.cores },
          { label: 'Mhz', value: (res.data.cpu.mhz || 0).toFixed(0) },
          { label: '', value: res.data.cpu.model_name },
        ],
      },
      {
        ...getGaugeOption(
          '内存',
          ((res.data.memory.used / res.data.memory.total) * 100).toFixed(2) ||
            '0.00'
        ),
        labels: [
          { label: 'Total', value: formatBytes(res.data.memory.total) },
          { label: 'Used', value: formatBytes(res.data.memory.used) },
          {
            label: 'Free',
            value: formatBytes(res.data.memory.total - res.data.memory.used),
          },
        ],
      },
    ]
    for (const disk of res.data.disk || []) {
      mg.push({
        ...getGaugeOption(
          '磁盘 ' + disk.disk_name,
          (disk.percent || 0).toFixed(2) || '0.00'
        ),
        labels: [
          { label: 'Total', value: formatBytes(disk.total) },
          { label: 'Used', value: formatBytes(disk.used) },
          { label: 'Free', value: formatBytes(disk.free) },
        ],
      })
    }
    gauges.value = mg
  }
}

onMounted(() => {
  initDevice()
  Promise.all([getStats(), getEnvs(), loopGetDevice()])
})

onBeforeUnmount(() => {
  clearTimeout(timeouter)
})
</script>

<style lang="scss">
.page-admin-dashboard {
  .el-descriptions-item__label.is-bordered-label {
    width: 150px;
  }
  .chart {
    height: 234px;
  }
  .gauges {
    min-height: 294px;
    font-size: 14px;
    ul,
    li {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    small {
      color: var(--app-text-muted-lighter);
    }
    li {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>