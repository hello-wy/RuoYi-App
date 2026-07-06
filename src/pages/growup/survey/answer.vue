<template>
  <view class="answer-page">
    <image class="page-bg" src="/static/images/personality-starry-bg.jpg" mode="aspectFill"></image>
    <view class="answer-content">
      <view v-if="currentQuestion" class="question-count">
        <text class="count-label">题数：</text>
        <text class="count-value">{{ currentIndex + 1 }}/{{ questions.length }}</text>
      </view>

      <view v-if="loading" class="loading-wrap">
        <uni-load-more status="loading" color="#ffffff"></uni-load-more>
      </view>

      <view v-else-if="currentQuestion" class="question-wrap">
        <view class="question-card">
          <text class="question-text">{{ currentQuestion.content || currentQuestion.title }}</text>

          <view v-if="currentQuestion.type === 'text'" class="text-answer-wrap">
            <textarea
              class="text-answer"
              :value="answers[currentQuestion.id] || ''"
              placeholder="请输入你的答案"
              :disabled="submitting"
              @input="handleTextInput"
            ></textarea>
          </view>

          <view v-else-if="currentQuestion.type === 'multiple'" class="vertical-options">
            <view
              v-for="option in currentQuestion.options"
              :key="option.value"
              class="option-item vertical-option"
              :class="{ disabled: submitting, active: isMultipleSelected(option.value) }"
              @click="toggleMultiple(option.value)"
            >
              <view class="checkbox-box">
                <uni-icons v-if="isMultipleSelected(option.value)" type="checkmarkempty" size="18" color="#ffffff"></uni-icons>
              </view>
              <text class="option-label">{{ option.label }}</text>
            </view>
          </view>

          <view v-else-if="currentQuestion.type === 'matrix_single'" class="matrix-wrap">
            <view v-for="child in currentQuestion.children" :key="child.id" class="matrix-row">
              <text class="matrix-title">{{ child.content || child.title }}</text>
              <view class="matrix-options">
                <view
                  v-for="option in matrixOptions(currentQuestion, child)"
                  :key="option.value"
                  class="matrix-option"
                  :class="{ active: answers[child.id] === option.value, disabled: submitting }"
                  @click="setMatrixAnswer(child.id, option.value)"
                >
                  <text class="matrix-option-text">{{ option.label }}</text>
                </view>
              </view>
            </view>
          </view>

          <view v-else class="options-row">
            <view
              v-for="option in currentQuestion.options"
              :key="option.value"
              class="option-item"
              :class="{ disabled: submitting, active: answers[currentQuestion.id] === option.value }"
              @click="setSingleAnswer(option.value)"
            >
              <view class="radio-circle">
                <view v-if="answers[currentQuestion.id] === option.value" class="radio-dot"></view>
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
            @click="goPrevious"
          >
            上一题
          </button>
          <button
            class="nav-btn primary"
            :class="{ disabled: submitting }"
            :disabled="submitting"
            @click="goNext"
          >
            {{ isLastQuestion ? '提交' : '下一题' }}
          </button>
        </view>
      </view>

      <view v-else class="empty-wrap">
        <uni-icons type="info" size="42" color="#ffffff"></uni-icons>
        <text class="empty-text">暂无可答题目</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getSurveyAssignment, submitSurveyAssignment } from '@/api/wxmini/survey'

export default {
  data() {
    return {
      assignmentId: '',
      form: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      loading: true,
      submitting: false
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex] || null
    },
    canGoPrevious() {
      return !this.loading && !this.submitting && this.currentIndex > 0
    },
    isLastQuestion() {
      return this.currentIndex >= this.questions.length - 1
    }
  },
  onLoad(options) {
    this.assignmentId = options.assignmentId || ''
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      if (!this.assignmentId) {
        uni.showToast({ title: '问卷不存在', icon: 'none' })
        this.loading = false
        return
      }
      this.loading = true
      try {
        const form = await getSurveyAssignment(this.assignmentId)
        this.form = form || {}
        this.questions = this.normalizeQuestions(this.form.questions || [])
      } catch (e) {
        uni.showToast({ title: e?.msg || e?.message || '问卷加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    normalizeQuestions(questions = []) {
      const normalizeOptions = (options = []) => options.map(option => ({
        ...option,
        value: option.value ?? option.optionValue,
        label: option.label || option.optionLabel || option.content || option.text
      }))
      const isRequired = item => item.requiredFlag === undefined
        ? item.required !== false && item.required !== 0
        : Number(item.requiredFlag) === 1
      return questions.map(question => ({
        ...question,
        id: question.questionId || question.id,
        type: question.questionType || question.type,
        content: question.content || question.title || question.questionText,
        required: isRequired(question),
        options: normalizeOptions(question.options),
        children: (question.children || []).map(child => ({
          ...child,
          id: child.questionId || child.id,
          type: child.questionType || child.type,
          content: child.content || child.title || child.questionText,
          required: isRequired(child),
          options: normalizeOptions(child.options)
        }))
      }))
    },
    setSingleAnswer(value) {
      if (this.submitting || !this.currentQuestion) return
      this.answers[this.currentQuestion.id] = value
    },
    isMultipleSelected(value) {
      const selected = this.answers[this.currentQuestion?.id] || []
      return selected.includes(value)
    },
    toggleMultiple(value) {
      if (this.submitting || !this.currentQuestion) return
      const questionId = this.currentQuestion.id
      const selected = [...(this.answers[questionId] || [])]
      const index = selected.indexOf(value)
      if (index >= 0) {
        selected.splice(index, 1)
      } else {
        selected.push(value)
      }
      this.answers[questionId] = selected
    },
    handleTextInput(e) {
      if (!this.currentQuestion) return
      this.answers[this.currentQuestion.id] = e.detail.value
    },
    matrixOptions(question, child) {
      return child.options && child.options.length ? child.options : question.options
    },
    setMatrixAnswer(childId, value) {
      if (this.submitting) return
      this.answers[childId] = value
    },
    goPrevious() {
      if (this.canGoPrevious) {
        this.currentIndex -= 1
      }
    },
    async goNext() {
      if (!this.validateCurrentQuestion()) return
      if (!this.isLastQuestion) {
        this.currentIndex += 1
        return
      }
      await this.submitAnswers()
    },
    validateCurrentQuestion() {
      const question = this.currentQuestion
      if (!question || !question.required) return true
      if (question.type === 'matrix_single') {
        const missing = (question.children || []).some(child => child.required !== false && !this.hasAnswer(this.answers[child.id]))
        if (missing) {
          uni.showToast({ title: '请完成当前矩阵题', icon: 'none' })
          return false
        }
        return true
      }
      if (!this.hasAnswer(this.answers[question.id])) {
        uni.showToast({ title: '请完成当前题目', icon: 'none' })
        return false
      }
      return true
    },
    hasAnswer(value) {
      if (Array.isArray(value)) return value.length > 0
      return value !== undefined && value !== null && String(value).trim() !== ''
    },
    buildPayloadAnswers() {
      return this.questions.flatMap(question => {
        if (question.type === 'matrix_single') {
          return (question.children || []).map(child => this.buildAnswerItem(child, this.answers[child.id])).filter(Boolean)
        }
        return [this.buildAnswerItem(question, this.answers[question.id])].filter(Boolean)
      })
    },
    buildAnswerItem(question, value) {
      if (!this.hasAnswer(value)) return null
      return {
        questionId: question.id,
        answerValue: question.type === 'text' ? null : value,
        answerText: Array.isArray(value) ? value.join('，') : String(value)
      }
    },
    async submitAnswers() {
      this.submitting = true
      try {
        await submitSurveyAssignment(this.assignmentId, { answers: this.buildPayloadAnswers() })
        uni.showToast({ title: '提交成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 600)
      } catch (e) {
        uni.showToast({ title: e?.msg || e?.message || '提交失败，请重试', icon: 'none' })
      } finally {
        this.submitting = false
      }
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
  flex-direction: column;
  align-items: stretch;
  gap: 20rpx;
}

.vertical-options {
  margin-top: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option-item {
  min-height: 54rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}

.option-item.disabled {
  opacity: 0.72;
}

.radio-circle,
.checkbox-box {
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

.checkbox-box {
  border-radius: 12rpx;
}

.option-item.active .radio-circle,
.option-item.active .checkbox-box {
  border-color: #20d6ce;
  background: #20d6ce;
}

.radio-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 999rpx;
  background: #20d6ce;
}

.option-label {
  flex: 1;
  min-width: 0;
  margin-left: 12rpx;
  color: #777d8b;
  font-size: 30rpx;
  line-height: 44rpx;
  font-weight: 700;
}

.text-answer-wrap {
  margin-top: 28rpx;
}

.text-answer {
  width: 100%;
  min-height: 220rpx;
  padding: 22rpx;
  border-radius: 18rpx;
  background: #ffffff;
  color: #475569;
  font-size: 28rpx;
  line-height: 42rpx;
  box-sizing: border-box;
}

.matrix-wrap {
  margin-top: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.matrix-title {
  display: block;
  color: #64748b;
  font-size: 28rpx;
  line-height: 42rpx;
  font-weight: 700;
  margin-bottom: 14rpx;
}

.matrix-options {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 14rpx;
}

.matrix-option {
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  background: #ffffff;
  border: 2rpx solid #dbe2ea;
}

.matrix-option.active {
  background: #20d6ce;
  border-color: #20d6ce;
}

.matrix-option-text {
  color: #64748b;
  font-size: 25rpx;
  font-weight: 700;
}

.matrix-option.active .matrix-option-text {
  color: #ffffff;
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

.nav-btn::after {
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
  margin-top: 24rpx;
  color: rgba(255, 255, 255, 0.88);
  font-size: 28rpx;
}
</style>
