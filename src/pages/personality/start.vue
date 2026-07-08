<template>
  <view class="personality-start">
    <image class="page-bg" src="/static/images/personality-starry-bg.jpg" mode="aspectFill"></image>
    <view class="content-wrap">
      <view class="intro-card">
        <text class="title">{{ entry.title || '天人合一·性格测试' }}</text>
        <text class="desc">恭喜你踏上性格探秘的神奇之旅！</text>
        <text class="desc">请您倾听内心最真实的声音，回答“是”“否”“不确定”，</text>
        <text class="desc">穿越180扇性格迷雾之门，获取传承千年的识人智慧！</text>
        <text class="desc">接下来，速速开启这段美妙的读心之旅吧！</text>
      </view>

      <view class="action-area">
        <button class="start-btn" :loading="starting" @click="handleStart">
          {{ buttonText }}
        </button>
        <button v-if="entry.hasInProgress" class="restart-btn" :disabled="starting" @click="handleRestart">
          重新开始
        </button>
        <button class="share-btn" open-type="share">
          <uni-icons type="redo" size="18" color="#ffffff"></uni-icons>
          <text class="share-text">分享测试</text>
        </button>
      </view>
    </view>
    <LoginPopup v-if="shouldAutoOpenLogin" :auto-open="shouldAutoOpenLogin" @close="handleLoginPopupClose" />
  </view>
</template>

<script>
import { getPersonalityEntry, startPersonalityAttempt } from '@/api/wxmini/personalityTest'
import { getToken } from '@/utils/auth'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'
import { removePersonalityProgress } from './progressStorage'

export default {
  components: { LoginPopup },
  data() {
    return {
      entry: {},
      loading: false,
      starting: false,
      shouldAutoOpenLogin: false
    }
  },
  computed: {
    buttonText() {
      if (this.starting) return '准备中...'
      return this.entry.hasInProgress ? '继续测试' : '开始测试'
    }
  },
  onLoad() {
    if (getToken()) {
      this.loadEntry()
    }
  },
  onShow() {
    if (getToken() && !this.entry.testId) {
      this.loadEntry()
    }
  },
  onShareAppMessage() {
    return {
      title: '天人合一·性格测试',
      path: '/pages/personality/start'
    }
  },
  onShareTimeline() {
    return {
      title: '天人合一·性格测试'
    }
  },
  methods: {
    async loadEntry() {
      this.loading = true
      try {
        const res = await getPersonalityEntry()
        this.entry = res || {}
      } catch (e) {
        this.entry = {}
      } finally {
        this.loading = false
      }
    },
    async handleStart() {
      await this.openAttempt(false)
    },
    async handleRestart() {
      await this.openAttempt(true)
    },
    async openAttempt(restart) {
      if (!getToken()) {
        this.shouldAutoOpenLogin = true
        return
      }
      this.starting = true
      try {
        const res = await startPersonalityAttempt({ mode: restart ? 'restart' : 'continue_or_create' })
        const data = res || {}
        if (!data.attemptId) {
          uni.showToast({ title: '测试暂不可用', icon: 'none' })
          return
        }
        if (restart) {
          removePersonalityProgress(data.attemptId)
        }
        const restartQuery = restart ? '&restart=1' : ''
        uni.navigateTo({ url: `/pages/personality/answer?attemptId=${data.attemptId}${restartQuery}` })
      } catch (e) {
        uni.showToast({ title: e?.msg || e?.message || '开始失败', icon: 'none' })
      } finally {
        this.starting = false
      }
    },
    handleLoginPopupClose() {
      this.shouldAutoOpenLogin = false
      if (getToken()) {
        this.loadEntry()
      }
    }
  }
}
</script>

<style lang="scss">
page {
  background: #061733;
}

.personality-start {
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

.content-wrap {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 98rpx 30rpx 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.intro-card {
  min-height: 500rpx;
  padding: 54rpx 22rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18rpx 60rpx rgba(8, 20, 68, 0.22);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  margin-bottom: 38rpx;
  color: #7c8394;
  font-size: 40rpx;
  line-height: 58rpx;
  font-weight: 800;
  text-align: center;
}

.desc {
  width: 100%;
  color: #8b91a0;
  font-size: 30rpx;
  line-height: 54rpx;
  font-weight: 700;
  text-align: left;
}

.action-area {
  padding-bottom: 18rpx;
}

.start-btn,
.restart-btn,
.share-btn {
  width: 100%;
  height: 110rpx;
  border-radius: 999rpx;
  background: #66d7cd;
  color: #fff;
  font-size: 32rpx;
  font-weight: 800;
  line-height: 110rpx;
  box-shadow: 0 12rpx 34rpx rgba(81, 222, 212, 0.38);
}

.restart-btn {
  margin-top: 24rpx;
  height: 82rpx;
  line-height: 82rpx;
  background: rgba(255, 255, 255, 0.94);
  color: #66d7cd;
  font-size: 30rpx;
  box-shadow: 0 10rpx 26rpx rgba(255, 255, 255, 0.2);
}

.share-btn {
  margin-top: 24rpx;
  height: 82rpx;
  line-height: 82rpx;
  background: rgba(255, 255, 255, 0.18);
  border: 2rpx solid rgba(255, 255, 255, 0.38);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.share-btn::after,
.restart-btn::after,
.start-btn::after {
  border: none;
}

.share-text {
  margin-left: 8rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}
</style>
