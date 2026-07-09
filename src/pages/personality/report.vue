<template>
  <view class="report-page">
    <scroll-view class="report-scroll" scroll-y>
      <view class="report-content">
        <view v-if="report.hasReports" class="report-overview">
          <text class="overview-eyebrow">评估验证报告</text>
          <text class="overview-title">共生成 {{ report.reportCount }} 项性格解读</text>
          <text class="overview-desc">以下内容按测评结果分组展示，建议结合完成页截图一起保存。</text>
        </view>

        <block v-if="report.hasReports">
          <view v-for="(item, index) in report.reports" :key="`${item.type}-${index}`" class="report-card">
            <view class="card-heading">
              <view class="type-badge">{{ item.type }}号</view>
              <text v-if="item.level" class="level-badge">{{ item.level }}</text>
              <!-- <text v-if="item.score" class="score-badge">{{ item.score }}分</text> -->
            </view>
            <text class="core-title">{{ item.title }}</text>
            <text class="intro">{{ item.intro }}</text>

            <view class="info-rows">
              <view class="info-row">
                <text class="row-label">核心恐惧</text>
                <text class="row-value">{{ item.coreFear }}</text>
              </view>
              <view class="info-row">
                <text class="row-label">核心欲望</text>
                <text class="row-value">{{ item.coreDesire }}</text>
              </view>
            </view>

            <view class="two-columns">
              <view class="column-box">
                <text class="column-title">优势</text>
                <view class="tag-list">
                  <text v-for="tag in item.advantages" :key="tag" class="tag good">{{ tag }}</text>
                </view>
              </view>
              <view class="column-box">
                <text class="column-title">短板</text>
                <view class="tag-list">
                  <text v-for="tag in item.weaknesses" :key="tag" class="tag weak">{{ tag }}</text>
                </view>
              </view>
            </view>

            <view class="two-columns state-columns">
              <view v-if="item.stressState" class="state-box">
                <text class="column-title">压力状态</text>
                <text class="state-text">{{ item.stressState }}</text>
              </view>
              <view v-if="item.relaxState" class="state-box">
                <text class="column-title">放松状态</text>
                <text class="state-text">{{ item.relaxState }}</text>
              </view>
            </view>

            <view class="advice-box">
              <text class="section-label">成长建议</text>
              <text class="advice-text">{{ item.growthAdvice }}</text>
            </view>

            <view v-if="item.career || item.relationship || item.health" class="report-detail-list">
              <view v-if="item.career" class="detail-item">
                <text class="detail-label">事业财富</text>
                <text class="detail-text">{{ item.career }}</text>
              </view>
              <view v-if="item.relationship" class="detail-item">
                <text class="detail-label">亲密关系</text>
                <text class="detail-text">{{ item.relationship }}</text>
              </view>
              <view v-if="item.health" class="detail-item">
                <text class="detail-label">身心健康</text>
                <text class="detail-text">{{ item.health }}</text>
              </view>
            </view>

            <view class="blind-note">盲区提示：{{ item.blindSpotTip }}</view>
          </view>
        </block>

        <view v-else class="empty-card">
          <text class="empty-title">{{ report.emptyCard.title }}</text>
          <text class="empty-text">{{ report.emptyCard.text }}</text>
        </view>

        <button class="export-btn" :loading="exporting" :disabled="exporting" @click="exportReportImage">
          导出报告图片
        </button>
        <button class="consult-btn" open-type="contact">添加专业咨询微信，一对一解读完整深度分析</button>
      </view>
    </scroll-view>
    <report-image-exporter ref="reportImageExporter" :canvas-id="REPORT_CANVAS_ID"></report-image-exporter>
  </view>
</template>

<script>
import { getPersonalityResult } from '@/api/wxmini/personalityTest'
import ReportImageExporter from '@/components/ReportImageExporter/ReportImageExporter.vue'
import { normalizePersonalityReportResult } from './complete.helpers'
import {
  REPORT_CANVAS_ID,
  REPORT_CANVAS_WIDTH,
  REPORT_EXPORT_SCALE,
  buildExportablePersonalityReport,
  drawReportImage,
  estimateReportImageHeight
} from './reportExport.helpers'

export default {
  components: {
    ReportImageExporter
  },
  data() {
    return {
      REPORT_CANVAS_ID,
      attemptId: '',
      exporting: false,
      report: buildExportablePersonalityReport(normalizePersonalityReportResult({}))
    }
  },
  onLoad(options) {
    this.attemptId = options.attemptId || ''
    this.loadReport()
  },
  methods: {
    async loadReport() {
      if (!this.attemptId) {
        uni.showToast({ title: '缺少测试记录', icon: 'none' })
        return
      }
      try {
        const result = await getPersonalityResult(this.attemptId)
        this.report = buildExportablePersonalityReport(normalizePersonalityReportResult(result || {}))
      } catch (e) {
        uni.showToast({ title: e?.msg || e?.message || '报告加载失败', icon: 'none' })
        this.report = buildExportablePersonalityReport(normalizePersonalityReportResult({}))
      }
    },
    async exportReportImage() {
      if (this.exporting) return
      this.exporting = true
      uni.showLoading({ title: '生成图片中...' })
      try {
        const filePath = await this.createReportImage()
        await this.saveImageToAlbum(filePath)
        uni.showToast({ title: '已保存到相册', icon: 'success' })
      } catch (e) {
        console.error('personality report export failed', e)
        uni.showToast({ title: this.getExportErrorMessage(e), icon: 'none' })
      } finally {
        uni.hideLoading()
        this.exporting = false
      }
    },
    createReportImage() {
      const height = estimateReportImageHeight(this.report)
      return this.$refs.reportImageExporter.exportImage({
        width: REPORT_CANVAS_WIDTH,
        height,
        scale: REPORT_EXPORT_SCALE,
        draw: ctx => drawReportImage(ctx, this.report)
      })
    },
    async saveImageToAlbum(filePath) {
      await this.ensureAlbumPermission()
      return new Promise((resolve, reject) => {
        uni.saveImageToPhotosAlbum({ filePath, success: resolve, fail: reject })
      })
    },
    ensureAlbumPermission() {
      return new Promise((resolve, reject) => {
        uni.getSetting({
          success: setting => {
            const albumSetting = setting.authSetting?.['scope.writePhotosAlbum']
            if (albumSetting === true) {
              resolve()
              return
            }
            if (albumSetting === false) {
              this.openAlbumPermissionSetting(resolve, reject)
              return
            }
            uni.authorize({
              scope: 'scope.writePhotosAlbum',
              success: resolve,
              fail: () => this.openAlbumPermissionSetting(resolve, reject)
            })
          },
          fail: reject
        })
      })
    },
    openAlbumPermissionSetting(resolve, reject) {
      uni.showModal({
        title: '需要相册权限',
        content: '请授权保存图片到相册',
        success: modal => {
          if (!modal.confirm) {
            reject(new Error('用户取消相册授权'))
            return
          }
          uni.openSetting({
            success: setting => this.resolveAlbumSetting(setting, resolve, reject),
            fail: reject
          })
        },
        fail: reject
      })
    },
    resolveAlbumSetting(setting, resolve, reject) {
      if (setting.authSetting?.['scope.writePhotosAlbum']) {
        resolve()
        return
      }
      reject(new Error('未授权保存到相册'))
    },
    getExportErrorMessage(error) {
      const message = String(error?.errMsg || error?.message || '')
      if (message.includes('auth') || message.includes('授权')) return '请允许保存到相册'
      if (message.includes('canvas')) return '画布导出失败，请重试'
      return message || '导出失败'
    }
  }
}
</script>

<style lang="scss">
@import './report.scss';
</style>
