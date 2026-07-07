<template>
  <view class="report-page">
    <scroll-view class="report-scroll" scroll-y>
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
            <text v-if="item.score" class="score-badge">{{ item.score }}分</text>
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
        <text class="empty-title">报告生成中</text>
        <text class="empty-text">暂未获取到报告字段，稍后可重新进入查看。</text>
      </view>

      <button class="consult-btn" open-type="contact">添加专业咨询微信，一对一解读完整深度分析</button>
    </scroll-view>
  </view>
</template>

<script>
import { getPersonalityResult } from '@/api/wxmini/personalityTest'
import { normalizePersonalityReportResult } from './complete.helpers'

export default {
  data() {
    return {
      attemptId: '',
      report: normalizePersonalityReportResult({})
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
        this.report = normalizePersonalityReportResult(result || {})
      } catch (e) {
        uni.showToast({ title: e?.msg || e?.message || '报告加载失败', icon: 'none' })
        this.report = normalizePersonalityReportResult({})
      }
    }
  }
}
</script>

<style lang="scss">
page {
  background: #fff7ed;
}

.report-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff7ed 0%, #ffffff 55%, #fff7ed 100%);
}

.report-scroll {
  height: 100vh;
  box-sizing: border-box;
}

.report-overview,
.report-card,
.empty-card {
  margin: 28rpx 28rpx 0;
  padding: 32rpx;
  border-radius: 32rpx;
  background: #ffffff;
  box-shadow: 0 16rpx 42rpx rgba(124, 45, 18, 0.08);
}

.report-overview {
  background: linear-gradient(180deg, #fffbeb, #ffffff);
}

.overview-eyebrow,
.overview-title,
.overview-desc {
  display: block;
}

.overview-eyebrow {
  color: #ea580c;
  font-size: 24rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.overview-title {
  color: #1f2937;
  font-size: 40rpx;
  font-weight: 800;
  line-height: 1.35;
}

.overview-desc {
  margin-top: 12rpx;
  color: #6b7280;
  font-size: 26rpx;
  line-height: 1.6;
}

.card-heading {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  align-items: center;
}

.type-badge,
.level-badge,
.score-badge {
  display: inline-block;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.type-badge {
  color: #ffffff;
  background: #f97316;
}

.level-badge {
  color: #9a3412;
  background: #ffedd5;
}

.score-badge {
  color: #166534;
  background: #dcfce7;
}

.core-title {
  display: block;
  margin-top: 18rpx;
  color: #111827;
  font-size: 42rpx;
  font-weight: 800;
  line-height: 1.35;
}

.intro {
  display: block;
  margin-top: 14rpx;
  color: #6b7280;
  font-size: 28rpx;
  line-height: 1.6;
}

.info-rows {
  margin-top: 26rpx;
  border-top: 2rpx solid #f3f4f6;
}

.info-row {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f3f4f6;
}

.row-label {
  flex: 0 0 150rpx;
  color: #92400e;
  font-size: 26rpx;
  font-weight: 700;
}

.row-value {
  flex: 1;
  color: #374151;
  font-size: 26rpx;
  line-height: 1.5;
}

.two-columns {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}

.column-box,
.state-box {
  flex: 1;
  padding: 22rpx;
  border-radius: 24rpx;
  background: #f9fafb;
}

.column-title,
.section-label {
  display: block;
  color: #111827;
  font-size: 28rpx;
  font-weight: 800;
  margin-bottom: 16rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
}

.good {
  color: #166534;
  background: #dcfce7;
}

.weak {
  color: #991b1b;
  background: #fee2e2;
}

.state-columns {
  align-items: stretch;
}

.state-text,
.advice-text {
  display: block;
  color: #4b5563;
  font-size: 26rpx;
  line-height: 1.55;
}

.advice-box {
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #fff7ed;
}

.report-detail-list {
  margin-top: 24rpx;
  border-radius: 24rpx;
  overflow: hidden;
  background: #f9fafb;
}

.detail-item {
  padding: 22rpx;
  border-bottom: 2rpx solid #ffffff;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label,
.detail-text {
  display: block;
}

.detail-label {
  color: #111827;
  font-size: 28rpx;
  font-weight: 800;
  margin-bottom: 12rpx;
}

.detail-text {
  color: #4b5563;
  font-size: 26rpx;
  line-height: 1.55;
}

.blind-note {
  margin-top: 20rpx;
  padding: 18rpx 22rpx;
  border-radius: 20rpx;
  color: #6b7280;
  background: #f3f4f6;
  font-size: 24rpx;
  line-height: 1.5;
}

.empty-title,
.empty-text {
  display: block;
  text-align: center;
}

.empty-title {
  color: #111827;
  font-size: 34rpx;
  font-weight: 800;
}

.empty-text {
  margin-top: 14rpx;
  color: #6b7280;
  font-size: 26rpx;
  line-height: 1.6;
}

.consult-btn {
  margin: 32rpx 28rpx 48rpx;
  min-height: 104rpx;
  line-height: 1.35;
  padding: 22rpx 30rpx;
  border-radius: 999rpx;
  color: #ffffff;
  background: linear-gradient(135deg, #f97316, #dc2626);
  font-size: 30rpx;
  font-weight: 800;
  box-shadow: 0 18rpx 36rpx rgba(220, 38, 38, 0.24);
}

.consult-btn::after {
  border: none;
}
</style>
