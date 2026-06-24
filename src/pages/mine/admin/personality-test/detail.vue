<template>
  <scroll-view class="detail-page" scroll-y>
    <view class="hero-card">
      <view>
        <text class="hero-title">{{ displayName }}</text>
        <text class="hero-subtitle">性格测试答题详情</text>
      </view>
      <text class="status-tag" :class="statusClass">{{ detail.statusLabel || getStatusLabel(detail.status) }}</text>
    </view>

    <view class="overview-card">
      <view class="overview-item">
        <text class="overview-value">{{ detail.answeredCount || 0 }}</text>
        <text class="overview-label">已答题</text>
      </view>
      <view class="overview-item">
        <text class="overview-value">{{ detail.totalQuestions || 180 }}</text>
        <text class="overview-label">总题数</text>
      </view>
      <view class="overview-item">
        <text class="overview-value small">{{ detail.completedAt || '--' }}</text>
        <text class="overview-label">完成时间</text>
      </view>
    </view>

    <view class="answer-card">
      <view class="answer-head">
        <text class="answer-title">答题结果</text>
        <text class="answer-subtitle">按 1-180 题展示</text>
      </view>

      <view v-if="loading" class="state-box">
        <uni-load-more status="loading" />
      </view>

      <view v-else-if="loadError" class="state-box">
        <text class="state-text">加载失败，请重试</text>
        <button class="retry-btn" size="mini" @click="loadDetail">重试</button>
      </view>

      <view v-else class="answer-table">
        <view class="table-row table-header">
          <text class="col-no">题号</text>
          <text class="col-content">题目</text>
          <text class="col-answer">答案</text>
        </view>
        <view
          v-for="item in answers"
          :key="item.questionNo"
          class="table-row"
        >
          <text class="col-no">{{ item.questionNo }}</text>
          <text class="col-content">{{ item.questionContent || (item.questionNo + '题') }}</text>
          <text class="col-answer" :class="getAnswerClass(item.answerLabel)">{{ item.answerLabel || '未答' }}</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import { getPersonalityAttemptDetail } from '@/api/wxmini/personalityTest'
import { requireAdminAccess } from '../access'

export default {
  data() {
    return {
      attemptId: null,
      detail: {},
      answers: [],
      loading: false,
      loadError: false
    }
  },
  computed: {
    displayName() {
      return this.detail.realName || this.detail.userName || this.detail.userId || '未命名用户'
    },
    statusClass() {
      if (Number(this.detail.status) === 1) return 'completed'
      if (Number(this.detail.status) === 0) return 'progress'
      return 'muted'
    }
  },
  onLoad(options) {
    if (!requireAdminAccess(this)) {
      return
    }
    if (!options?.attemptId) {
      uni.showToast({ title: '答题记录参数缺失', icon: 'none' })
      setTimeout(() => uni.navigateBack({ delta: 1 }), 600)
      return
    }
    this.attemptId = options.attemptId
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      this.loading = true
      this.loadError = false
      try {
        const res = await getPersonalityAttemptDetail(this.attemptId)
        const data = res.data || {}
        this.detail = data
        this.answers = Array.isArray(data.answers) ? data.answers : []
      } catch (error) {
        this.loadError = true
        console.error('加载性格测试详情失败', error)
      } finally {
        this.loading = false
      }
    },
    getStatusLabel(status) {
      if (Number(status) === 0) return '进行中'
      if (Number(status) === 1) return '已完成'
      if (Number(status) === 2) return '已取消'
      return '未知'
    },
    getAnswerClass(label) {
      if (label === '是') return 'yes'
      if (label === '否') return 'no'
      if (label === '不确定') return 'unsure'
      return 'empty'
    }
  }
}
</script>

<style lang="scss" scoped src="./detail.scss"></style>
