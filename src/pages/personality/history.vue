<template>
  <view class="history-page">
    <view v-if="attempts.length" class="history-list">
      <button
        v-for="item in attempts"
        :key="item.attemptId"
        class="history-item"
        @click="openAttemptResult(item.attemptId)"
      >
        <view>
          <text class="history-label">完成时间</text>
          <text class="history-time">{{ item.completedAt }}</text>
        </view>
        <uni-icons type="right" size="18" color="#7c8394"></uni-icons>
      </button>
    </view>
    <view v-else-if="!loading" class="empty-state">暂无历史答题记录</view>
  </view>
</template>

<script>
import { getPersonalityAttempts } from '@/api/wxmini/personalityTest'

export default {
  data() {
    return {
      attempts: [],
      loading: false
    }
  },
  onShow() {
    this.loadAttempts()
  },
  methods: {
    async loadAttempts() {
      this.loading = true
      try {
        this.attempts = await getPersonalityAttempts()
      } catch (e) {
        this.attempts = []
        uni.showToast({ title: e?.msg || e?.message || '记录加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    openAttemptResult(attemptId) {
      uni.navigateTo({ url: `/pages/personality/complete?attemptId=${attemptId}` })
    }
  }
}
</script>

<style lang="scss">
page {
  background: #f5f7fb;
}

.history-page {
  min-height: 100vh;
  padding: 28rpx;
  box-sizing: border-box;
}

.history-list {
  overflow: hidden;
  border-radius: 24rpx;
  background: #ffffff;
}

.history-item {
  width: 100%;
  margin: 0;
  padding: 28rpx 30rpx;
  border-radius: 0;
  border-bottom: 1rpx solid #edf0f5;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  line-height: 1.5;
}

.history-item:last-child {
  border-bottom: 0;
}

.history-item::after {
  border: none;
}

.history-label,
.history-time {
  display: block;
}

.history-label {
  margin-bottom: 8rpx;
  color: #9aa1af;
  font-size: 24rpx;
}

.history-time {
  color: #4f5665;
  font-size: 30rpx;
}

.empty-state {
  padding-top: 220rpx;
  color: #9aa1af;
  font-size: 28rpx;
  text-align: center;
}
</style>
