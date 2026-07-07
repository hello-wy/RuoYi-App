<template>
  <view class="answer-page">
    <image class="page-bg" src="/static/images/personality-starry-bg.jpg" mode="aspectFill"></image>
    <view class="answer-content">
      <view v-if="question" class="question-count">
        <text class="count-label">题数：</text>
        <text class="count-value">{{ question.questionNo }}/{{ question.totalQuestions }}</text>
      </view>

      <view v-if="loading" class="loading-wrap">
        <uni-load-more status="loading" color="#ffffff"></uni-load-more>
      </view>

      <view v-else-if="question" class="question-wrap">
        <view class="question-card">
          <text class="question-text">{{ question.content }}</text>
          <view class="options-row">
            <view
              v-for="option in question.options"
              :key="option.value"
              class="option-item"
              :class="{ disabled: submitting, active: selectedValue === option.value }"
              @click="handleSelect(option)"
            >
              <view class="radio-circle">
                <view v-if="selectedValue === option.value" class="radio-dot"></view>
              </view>
              <text class="option-label">{{ option.label }}</text>
            </view>
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
        <uni-icons type="info" size="42" color="#ffffff"></uni-icons>
        <text class="empty-text">暂无可答题目</text>
        <button class="home-btn" @click="goHome">返回主页</button>
      </view>
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
      answeredValues: {},
      autoNextTimer: null
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
  onUnload() {
    this.clearAutoNextTimer()
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
    handleSelect(option) {
      if (this.submitting || !this.question) return
      this.clearAutoNextTimer()
      this.selectedValue = option.value
      this.autoNextTimer = setTimeout(() => {
        this.goNextQuestion()
      }, 250)
    },
    async goPreviousQuestion() {
      this.clearAutoNextTimer()
      await this.loadQuestionByNo(Number(this.question.questionNo) - 1)
    },
    async goNextQuestion() {
      if (!this.canGoNext) return
      this.clearAutoNextTimer()
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
      this.clearAutoNextTimer()
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
      this.clearAutoNextTimer()
      this.question = question || null
      this.selectedValue = this.question ? this.answeredValues[this.question.questionNo] ?? null : null
      if (!this.question) {
        uni.redirectTo({ url: `/pages/personality/complete?attemptId=${this.attemptId}` })
      }
    },
    clearAutoNextTimer() {
      if (!this.autoNextTimer) return
      clearTimeout(this.autoNextTimer)
      this.autoNextTimer = null
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
  background: #061733;
}

.answer-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #061733;
}

.page-bg {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}

.answer-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 66rpx 30rpx 48rpx;
  box-sizing: border-box;
}

.question-count {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  color: #ffffff;
  font-weight: 700;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.22);
}

.count-label {
  font-size: 34rpx;
  line-height: 46rpx;
}

.count-value {
  margin-left: 20rpx;
  font-size: 44rpx;
  line-height: 56rpx;
  letter-spacing: 1rpx;
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
  padding-top: 54rpx;
}

.question-card {
  min-height: 214rpx;
  padding: 50rpx 32rpx 30rpx;
  border-radius: 26rpx;
  background: rgba(247, 248, 255, 0.9);
  box-shadow: 0 16rpx 46rpx rgba(12, 20, 72, 0.2);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.question-text {
  color: #777d8b;
  font-size: 31rpx;
  line-height: 56rpx;
  font-weight: 700;
  text-align: left;
}

.options-row {
  margin-top: 34rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}

.option-item {
  min-width: 148rpx;
  min-height: 54rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.option-item.disabled {
  opacity: 0.72;
}

.radio-circle {
  width: 48rpx;
  height: 48rpx;
  border-radius: 999rpx;
  border: 2rpx solid #bdc3cf;
  background: rgba(244, 246, 252, 0.7);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-item.active .radio-circle {
  border-color: #20d6ce;
  background: rgba(32, 214, 206, 0.12);
}

.radio-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 999rpx;
  background: #20d6ce;
}

.option-label {
  margin-left: 12rpx;
  color: #777d8b;
  font-size: 30rpx;
  line-height: 44rpx;
  font-weight: 700;
}

.nav-actions {
  margin-top: 58rpx;
  padding: 0 48rpx 22rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 28rpx;
}

.nav-btn {
  flex: 1;
  height: 102rpx;
  margin: 0;
  border-radius: 999rpx;
  line-height: 102rpx;
  font-size: 34rpx;
  font-weight: 800;
  border: none;
}

.nav-btn::after,
.home-btn::after {
  border: none;
}

.nav-btn.secondary {
  background: rgba(255, 255, 255, 0.94);
  color: #adb0b8;
  box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.08);
}

.nav-btn.primary {
  background: #20d6ce;
  color: #ffffff;
  box-shadow: 0 12rpx 30rpx rgba(32, 214, 206, 0.28);
}

.nav-btn.disabled {
  opacity: 1;
  box-shadow: none;
}

.nav-btn.primary.disabled {
  background: rgba(32, 214, 206, 0.68);
  color: rgba(255, 255, 255, 0.92);
}

.nav-btn.secondary.disabled {
  background: rgba(255, 255, 255, 0.9);
  color: #c0c2c8;
}

.empty-text {
  margin-top: 20rpx;
  color: #ffffff;
  font-size: 28rpx;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.28);
}

.home-btn {
  width: 320rpx;
  height: 86rpx;
  margin-top: 34rpx;
  border-radius: 999rpx;
  background: #20d6ce;
  color: #fff;
  line-height: 86rpx;
  font-size: 30rpx;
  font-weight: 800;
}
</style>
