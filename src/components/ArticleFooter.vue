<template>
  <div class="com-article-footer">
    <div>
      <el-link
        v-if="settings.footer.about"
        underline="never"
        target="_blank"
        :href="settings.footer.about"
        >关于我们</el-link
      >
      <el-link
        v-if="settings.footer.agreement"
        :href="settings.footer.agreement"
        underline="never"
        target="_blank"
        >文库协议</el-link
      >
      <el-link
        v-if="settings.footer.contact"
        underline="never"
        target="_blank"
        :href="settings.footer.contact"
        >联系我们</el-link
      >
      <el-link
        v-if="settings.footer.feedback"
        underline="never"
        :href="settings.footer.feedback"
        target="_blank"
        >意见反馈</el-link
      >
      <el-link
        v-if="settings.footer.copyright"
        underline="never"
        :href="settings.footer.copyright"
        target="_blank"
        >免责声明</el-link
      >
      <el-link
        underline="never"
        target="_blank"
        title="站点地图"
        href="/sitemap.xml"
        >站点地图</el-link
      >
    </div>
    <div>
      <el-link
        v-if="settings.system.domain"
        underline="never"
        :title="settings.system.sitename || ''"
        :href="settings.system.domain"
      >
        {{ settings.system.sitename }}
      </el-link>
      <span class="copyright-year"
        ><span v-if="settings.system.copyright_start_year == currentYear"
          >©{{ currentYear }}</span
        >
        <span v-else>
          ©{{ settings.system.copyright_start_year }} - {{ currentYear }}
        </span></span
      >
    </div>
    <div v-if="settings.system.icp">
      <el-link
        underline="never"
        target="_blank"
        :title="settings.system.icp"
        href="https://beian.miit.gov.cn/"
        >{{ settings.system.icp }}</el-link
      >
    </div>
    <div v-if="settings.system.sec_icp">
      <el-link
        underline="never"
        target="_blank"
        :title="settings.system.sec_icp"
        :href="`http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${settings.system.sec_icp.replace(
          /[^\d]/g,
          ''
        )}`"
        >{{ settings.system.sec_icp }}</el-link
      >
    </div>
    <FixedRightBar />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useSettingStore } from '@/store/setting'

const settingStore = useSettingStore()
const settings = computed(() => settingStore.settings)
const currentYear = new Date().getFullYear()
</script>
