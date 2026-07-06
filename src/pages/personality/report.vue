<template>
  <view class="report-page">
    <scroll-view class="report-scroll" scroll-y>
      <view class="hero-card">
        <view class="eyebrow">性格测试报告</view>
        <text class="hero-title">九型分数雷达图</text>
        <view class="radar-wrap">
          <canvas canvas-id="scoreRadar" id="scoreRadar" class="radar-canvas"></canvas>
        </view>
        <view class="score-list">
          <view v-for="item in report.scores" :key="item.type" class="score-item">
            <text>{{ item.type }}号</text>
            <text>{{ item.score }}</text>
          </view>
        </view>
      </view>

      <block v-if="report.hasReports">
        <view v-for="item in report.reports" :key="item.type" class="report-card">
          <view class="type-badge">{{ item.type }}号</view>
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
            <view class="state-box">
              <text class="column-title">压力状态</text>
              <text class="state-text">{{ item.stressState }}</text>
            </view>
            <view class="state-box">
              <text class="column-title">放松状态</text>
              <text class="state-text">{{ item.relaxState }}</text>
            </view>
          </view>

          <view class="advice-box">
            <text class="section-label">简易成长建议</text>
            <text class="advice-text">{{ item.growthAdvice }}</text>
          </view>

          <view class="blind-note">盲区提示：{{ item.blindSpotTip }}</view>
        </view>
      </block>

      <view v-else class="empty-card">
        <text class="empty-title">报告生成中</text>
        <text class="empty-text">暂未获取到报告字段，已先展示分数图；稍后可重新进入查看。</text>
      </view>

      <button class="consult-btn" @click="contactConsultant">想获取完整深度分析，添加专业咨询师微信一对一解读</button>
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
  onReady() {
    this.drawRadar()
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
        this.$nextTick(() => this.drawRadar())
      } catch (e) {
        uni.showToast({ title: e?.msg || e?.message || '报告加载失败', icon: 'none' })
        this.report = normalizePersonalityReportResult({})
        this.$nextTick(() => this.drawRadar())
      }
    },
    drawRadar() {
      const scores = this.report.scores || []
      if (!scores.length) return

      const ctx = uni.createCanvasContext('scoreRadar', this)
      const size = 300
      const center = size / 2
      const radius = 104
      const maxScore = Math.max(...scores.map(item => Number(item.score) || 0), 1)
      const points = scores.map((item, index) => {
        const angle = -Math.PI / 2 + index * (Math.PI * 2 / scores.length)
        const valueRadius = radius * ((Number(item.score) || 0) / maxScore)
        return {
          label: `${item.type}`,
          score: item.score,
          axisX: center + Math.cos(angle) * radius,
          axisY: center + Math.sin(angle) * radius,
          x: center + Math.cos(angle) * valueRadius,
          y: center + Math.sin(angle) * valueRadius,
          labelX: center + Math.cos(angle) * (radius + 26),
          labelY: center + Math.sin(angle) * (radius + 26)
        }
      })

      ctx.clearRect(0, 0, size, size)
      ctx.setFillStyle('#fff7ed')
      ctx.fillRect(0, 0, size, size)

      for (let level = 1; level <= 4; level += 1) {
        const levelRadius = radius * level / 4
        ctx.beginPath()
        points.forEach((_, index) => {
          const angle = -Math.PI / 2 + index * (Math.PI * 2 / points.length)
          const x = center + Math.cos(angle) * levelRadius
          const y = center + Math.sin(angle) * levelRadius
          index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        })
        ctx.closePath()
        ctx.setStrokeStyle(level === 4 ? '#fdba74' : '#fed7aa')
        ctx.stroke()
      }

      points.forEach(point => {
        ctx.beginPath()
        ctx.moveTo(center, center)
        ctx.lineTo(point.axisX, point.axisY)
        ctx.setStrokeStyle('#ffedd5')
        ctx.stroke()
      })

      ctx.beginPath()
      points.forEach((point, index) => {
        index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)
      })
      ctx.closePath()
      ctx.setFillStyle('rgba(249, 115, 22, 0.24)')
      ctx.fill()
      ctx.setStrokeStyle('#f97316')
      ctx.setLineWidth(2)
      ctx.stroke()

      points.forEach(point => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
        ctx.setFillStyle('#ea580c')
        ctx.fill()
        ctx.setFillStyle('#7c2d12')
        ctx.setFontSize(12)
        ctx.setTextAlign('center')
        ctx.fillText(`${point.label}号`, point.labelX, point.labelY + 4)
      })

      ctx.draw()
    },
    contactConsultant() {
      uni.showToast({ title: '请添加专业咨询师微信', icon: 'none' })
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

.hero-card,
.report-card,
.empty-card {
  margin: 28rpx 28rpx 0;
  padding: 32rpx;
  border-radius: 32rpx;
  background: #ffffff;
  box-shadow: 0 16rpx 42rpx rgba(124, 45, 18, 0.08);
}

.hero-card {
  background: linear-gradient(180deg, #fffbeb, #ffffff);
}

.eyebrow {
  color: #ea580c;
  font-size: 24rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.hero-title {
  display: block;
  color: #1f2937;
  font-size: 40rpx;
  font-weight: 800;
}

.radar-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24rpx;
}

.radar-canvas {
  width: 600rpx;
  height: 600rpx;
  border-radius: 28rpx;
  overflow: hidden;
  background: #fff7ed;
}

.score-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.score-item {
  display: flex;
  justify-content: space-between;
  width: calc((100% - 24rpx) / 3);
  padding: 12rpx 16rpx;
  border-radius: 18rpx;
  color: #9a3412;
  background: #ffedd5;
  font-size: 24rpx;
}

.type-badge {
  display: inline-block;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  color: #ffffff;
  background: #f97316;
  font-size: 24rpx;
  font-weight: 700;
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
