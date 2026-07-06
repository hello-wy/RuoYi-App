<template>
  <scroll-view class="detail-page" scroll-y>
    <view class="hero-card">
      <view>
        <text class="hero-title">{{ formTitle }}</text>
        <text class="hero-subtitle">问卷答题详情</text>
      </view>
      <text class="status-tag" :class="Number(detail.status) === 1 ? 'completed' : 'progress'">
        {{ detail.statusLabel || getStatusLabel(detail.status) }}
      </text>
    </view>

    <view v-if="loading" class="state-box">
      <uni-load-more status="loading" />
    </view>

    <view v-else-if="loadError" class="state-box">
      <text class="state-text">加载失败，请重试</text>
      <button class="retry-btn" size="mini" @click="loadDetail">重试</button>
    </view>

    <template v-else>
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">用户</text>
          <text class="info-value">{{ userName }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">手机号</text>
          <text class="info-value">{{ detail.user && detail.user.phone || '--' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">课程</text>
          <text class="info-value">{{ detail.course && detail.course.name || '--' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">问卷</text>
          <text class="info-value">{{ formTitle }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">状态</text>
          <text class="info-value">{{ detail.statusLabel || getStatusLabel(detail.status) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">提交时间</text>
          <text class="info-value">{{ detail.submittedAt || '--' }}</text>
        </view>
      </view>

      <view class="answer-card">
        <view class="answer-head">
          <text class="answer-title">答题结果</text>
          <text class="answer-subtitle">共 {{ answers.length }} 条答案</text>
        </view>

        <view v-if="answers.length === 0" class="state-box inline">
          <text class="state-text">暂无答题记录</text>
        </view>

        <view v-else class="answer-list">
          <view v-for="item in answers" :key="item.questionId || item.questionNo" class="answer-item">
            <view class="question-row">
              <text class="question-no">{{ item.questionNo }}</text>
              <view class="question-main">
                <text v-if="item.sectionTitle" class="section-title">{{ item.sectionTitle }}</text>
                <text class="question-content">{{ item.questionContent || '--' }}</text>
              </view>
            </view>
            <view class="answer-row">
              <text class="answer-label">答案</text>
              <text class="answer-value">{{ getAnswerText(item) }}</text>
            </view>
          </view>
        </view>
      </view>
    </template>
  </scroll-view>
</template>

<script>
import { getSurveyAssignmentDetail } from '@/pages/mine/admin/_api/system/survey'
import { requireAdminAccess } from '../access'

export default {
  data() {
    return {
      assignmentId: '',
      detail: {},
      loading: false,
      loadError: false
    }
  },
  computed: {
    answers() {
      return Array.isArray(this.detail.answers) ? this.detail.answers : []
    },
    formTitle() {
      return this.detail.form?.title || '问卷调查'
    },
    userName() {
      const user = this.detail.user || {}
      return user.realName || user.userName || user.userInfoId || '未命名用户'
    }
  },
  onLoad(options) {
    if (!requireAdminAccess(this)) return
    if (!options?.assignmentId) {
      uni.showToast({ title: '答题记录参数缺失', icon: 'none' })
      setTimeout(() => uni.navigateBack({ delta: 1 }), 600)
      return
    }
    this.assignmentId = options.assignmentId
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      this.loading = true
      this.loadError = false
      try {
        this.detail = await getSurveyAssignmentDetail(this.assignmentId) || {}
      } catch (error) {
        this.loadError = true
        console.error('加载问卷答题详情失败', error)
      } finally {
        this.loading = false
      }
    },
    getStatusLabel(status) {
      return Number(status) === 1 ? '已提交' : '未提交'
    },
    getAnswerText(item) {
      return item.answerLabel || item.answerText || item.answerValue || '--'
    }
  }
}
</script>

<style lang="scss" scoped>
page {
  background: #f3fbf8;
}

.detail-page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f3fbf8;
  box-sizing: border-box;
}

.hero-card,
.info-card,
.answer-card,
.state-box {
  border-radius: 28rpx;
  background: #fff;
  box-shadow: 0 14rpx 36rpx rgba(14, 148, 136, 0.08);
}

.hero-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  padding: 34rpx 28rpx;
  background: #dff7f0;
}

.hero-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #0f766e;
}

.hero-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #5f857f;
}

.status-tag {
  flex-shrink: 0;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.status-tag.completed {
  color: #16a34a;
  background: #dcfce7;
}

.status-tag.progress {
  color: #d97706;
  background: #fef3c7;
}

.info-card,
.answer-card {
  margin-top: 22rpx;
  padding: 26rpx 24rpx;
}

.info-row {
  display: flex;
  gap: 20rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: 0;
}

.info-label {
  width: 140rpx;
  flex-shrink: 0;
  font-size: 26rpx;
  color: #5f857f;
}

.info-value {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #0f3d3a;
  word-break: break-all;
}

.answer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 18rpx;
}

.answer-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
}

.answer-subtitle {
  font-size: 24rpx;
  color: #64748b;
}

.answer-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.answer-item {
  padding: 22rpx;
  border-radius: 22rpx;
  background: #f8fafc;
}

.question-row {
  display: flex;
  gap: 16rpx;
}

.question-no {
  width: 56rpx;
  height: 56rpx;
  line-height: 56rpx;
  flex-shrink: 0;
  border-radius: 50%;
  text-align: center;
  background: #0f766e;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.question-main {
  flex: 1;
  min-width: 0;
}

.section-title {
  display: block;
  margin-bottom: 6rpx;
  font-size: 22rpx;
  color: #0f766e;
}

.question-content {
  font-size: 28rpx;
  color: #0f172a;
  line-height: 1.5;
}

.answer-row {
  display: flex;
  gap: 16rpx;
  margin-top: 18rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #fff;
}

.answer-label {
  width: 64rpx;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #94a3b8;
}

.answer-value {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #334155;
  word-break: break-all;
}

.state-box {
  margin-top: 22rpx;
  padding: 110rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.state-box.inline {
  margin-top: 0;
  box-shadow: none;
  background: #f8fafc;
}

.state-text {
  font-size: 28rpx;
  color: #5f857f;
}

.retry-btn {
  margin-top: 20rpx;
}
</style>
