<template>
  <view class="answer-page">
    <view class="top-card" v-if="question">
      <view class="progress-head">
        <text class="progress-text">第 {{ question.questionNo }} / {{ question.totalQuestions }} 题</text>
        <text class="progress-percent">{{ progressPercent }}%</text>
      </view>
      <view class="progress-bar">
        <view class="progress-inner" :style="{ width: progressPercent + '%' }"></view>
      </view>
    </view>

    <view v-if="loading" class="loading-wrap">
      <uni-load-more status="loading"></uni-load-more>
    </view>

    <view v-else-if="question" class="question-wrap">
      <view class="question-card">
        <text class="question-no">Q{{ question.questionNo }}</text>
        <text class="question-text">{{ question.content }}</text>
      </view>

      <view class="options-wrap">
        <view
          v-for="option in question.options"
          :key="option.value"
          class="option-item"
          :class="{ disabled: submitting, active: selectedValue === option.value }"
          @click="handleSelect(option)"
        >
          <text class="option-label">{{ option.label }}</text>
          <uni-icons type="right" size="18" color="#94a3b8"></uni-icons>
        </view>
      </view>

      <view class="nav-actions">
        <button
          class="nav-btn secondary"
          :class="{ disabled: !canGoPrevious }"
          :disabled="!canGoPrevious"
          @click="goPreviousQuestion"
        >
          上一题
        </button>
        <button
          class="nav-btn primary"
          :class="{ disabled: !canGoNext }"
          :disabled="!canGoNext"
          @click="goNextQuestion"
        >
          下一题
        </button>
      </view>
    </view>

    <view v-else class="empty-wrap">
      <uni-icons type="info" size="42" color="#94a3b8"></uni-icons>
      <text class="empty-text">暂无可答题目</text>
      <button class="home-btn" @click="goHome">返回主页</button>
    </view>
  </view>
</template>

<script>
import { getCurrentQuestion, getPersonalityQuestion, savePersonalityAnswer } from '@/api/wxmini/personalityTest'

export default {
  data() {
    return {
      attemptId: '',
      question: null,
      loading: true,
      submitting: false,
      selectedValue: null,
      answeredValues: {}
    }
  },
  computed: {
    progressPercent() {
      if (!this.question || !this.question.totalQuestions) return 0
      return Math.min(100, Math.round((Number(this.question.questionNo) / Number(this.question.totalQuestions)) * 100))
    },
    canGoPrevious() {
      return this.canMoveToQuestion(Number(this.question?.questionNo) - 1)
    },
    canGoNext() {
      return !this.loading && !this.submitting && !!this.question && this.selectedValue !== null
    }
  },
  onLoad(options) {
    this.attemptId = options.attemptId || ''
    this.loadQuestion()
  },
  methods: {
    async loadQuestion() {
      if (!this.attemptId) {
        uni.showToast({ title: '测试记录不存在', icon: 'none' })
        this.loading = false
        return
      }
      this.loading = true
      try {
        const res = await getCurrentQuestion(this.attemptId)
        this.applyQuestion(res)
      } catch (e) {
        uni.showToast({ title: e?.msg || e?.message || '题目加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    async handleSelect(option) {
      if (this.submitting || !this.question) return
      this.selectedValue = option.value
      await this.submitSelectedAnswer()
    },
    async goPreviousQuestion() {
      await this.loadQuestionByNo(Number(this.question.questionNo) - 1)
    },
    async goNextQuestion() {
      if (!this.canGoNext) return
      await this.submitSelectedAnswer()
    },
    async submitSelectedAnswer() {
      if (this.submitting || !this.question || this.selectedValue === null) return
      const answerValue = this.selectedValue
      this.submitting = true
      try {
        const res = await savePersonalityAnswer(this.attemptId, {
          questionId: this.question.questionId,
          answerValue
        })
        this.answeredValues[this.question.questionNo] = answerValue
        const data = res || {}
        if (data.completed) {
          uni.redirectTo({ url: `/pages/personality/complete?attemptId=${this.attemptId}` })
          return
        }
        this.applyQuestion(data.nextQuestion)
      } catch (e) {
        uni.showToast({ title: e?.msg || e?.message || '保存失败，请重试', icon: 'none' })
        this.selectedValue = this.answeredValues[this.question.questionNo] ?? null
      } finally {
        this.submitting = false
      }
    },
    async loadQuestionByNo(questionNo) {
      if (!this.canMoveToQuestion(questionNo)) return
      this.loading = true
      try {
        const res = await getPersonalityQuestion(this.attemptId, questionNo)
        this.applyQuestion(res)
      } catch (e) {
        uni.showToast({ title: e?.msg || e?.message || '题目加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    applyQuestion(question) {
      this.question = question || null
      this.selectedValue = this.question ? this.answeredValues[this.question.questionNo] ?? null : null
      if (!this.question) {
        uni.redirectTo({ url: `/pages/personality/complete?attemptId=${this.attemptId}` })
      }
    },
    canMoveToQuestion(questionNo) {
      const totalQuestions = Number(this.question?.totalQuestions)
      return !this.loading && !this.submitting && questionNo >= 1 && questionNo <= totalQuestions
    },
    goHome() {
      uni.switchTab({ url: '/pages/index' })
    }
  }
}
</script>

<style lang="scss">
page {
  background: #f5f7fb;
}

.answer-page {
  min-height: 100vh;
  padding: 28rpx 28rpx 44rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #eef7ff 0%, #f5f7fb 38%, #ffffff 100%);
}

.top-card {
  padding: 28rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 10rpx 32rpx rgba(30, 64, 175, 0.08);
}

.progress-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.progress-text {
  color: #1e293b;
  font-size: 30rpx;
  font-weight: 800;
}

.progress-percent {
  color: #0ea5e9;
  font-size: 26rpx;
  font-weight: 700;
}

.progress-bar {
  height: 14rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background: #e2e8f0;
}

.progress-inner {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #60a5fa 0%, #67e8f9 100%);
  transition: width 0.2s ease;
}

.loading-wrap,
.empty-wrap {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.question-wrap {
  padding-top: 38rpx;
}

.question-card {
  min-height: 360rpx;
  padding: 42rpx 34rpx;
  border-radius: 30rpx;
  background: #fff;
  box-shadow: 0 16rpx 44rpx rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
}

.question-no {
  margin-bottom: 24rpx;
  color: #0ea5e9;
  font-size: 34rpx;
  font-weight: 900;
}

.question-text {
  color: #1e293b;
  font-size: 36rpx;
  line-height: 60rpx;
  font-weight: 700;
}

.options-wrap {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.option-item {
  min-height: 104rpx;
  padding: 0 34rpx;
  border-radius: 22rpx;
  background: #fff;
  border: 2rpx solid #e2e8f0;
  box-shadow: 0 8rpx 26rpx rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.option-item.active {
  border-color: #22d3ee;
  background: #ecfeff;
}

.option-item.disabled {
  opacity: 0.72;
}

.option-label {
  color: #334155;
  font-size: 32rpx;
  font-weight: 800;
}

.nav-actions {
  margin-top: 48rpx;
  padding-bottom: 22rpx;
  display: flex;
  flex-direction: row;
  gap: 24rpx;
}

.nav-btn {
  flex: 1;
  height: 88rpx;
  margin: 0;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 88rpx;
}

.nav-btn::after {
  border: none;
}

.nav-btn.primary {
  color: #fff;
  background: #3b82f6;
  box-shadow: 0 12rpx 28rpx rgba(59, 130, 246, 0.22);
}

.nav-btn.secondary {
  color: #2563eb;
  background: #eff6ff;
  border: 2rpx solid #bfdbfe;
}

.nav-btn.disabled {
  color: #94a3b8;
  background: #e2e8f0;
  border-color: #e2e8f0;
  box-shadow: none;
}

.empty-text {
  margin-top: 20rpx;
  color: #64748b;
  font-size: 28rpx;
}

.home-btn {
  width: 320rpx;
  height: 86rpx;
  margin-top: 34rpx;
  border-radius: 999rpx;
  background: #3b82f6;
  color: #fff;
  line-height: 86rpx;
  font-size: 30rpx;
  font-weight: 800;
}

.home-btn::after {
  border: none;
}
</style>
