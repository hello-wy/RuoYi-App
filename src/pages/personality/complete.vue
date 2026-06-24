<template>
  <view class="complete-page">
    <view class="confetti-wrap">
      <view v-for="item in confetti" :key="item" class="confetti" :class="`c${item}`"></view>
    </view>

    <view class="complete-card">
      <view class="check-wrap">
        <text class="check-icon">✅</text>
      </view>
      <text class="complete-title">答题完成</text>
      <text class="complete-desc">你已完成 {{ result.answeredCount || 180 }} 道性格测试题</text>
      <button class="home-btn" @click="goHome">返回主页</button>
      <button class="share-btn" open-type="share">分享测试</button>
    </view>
  </view>
</template>

<script>
import { getPersonalityResult } from '@/api/wxmini/personalityTest'

export default {
  data() {
    return {
      attemptId: '',
      result: {},
      confetti: Array.from({ length: 24 }, (_, index) => index + 1)
    }
  },
  onLoad(options) {
    this.attemptId = options.attemptId || ''
    this.loadResult()
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
    async loadResult() {
      if (!this.attemptId) return
      try {
        const res = await getPersonalityResult(this.attemptId)
        this.result = res || {}
      } catch (e) {
        this.result = {}
      }
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

.complete-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at 20% 8%, rgba(103, 232, 249, 0.36), transparent 34%),
    linear-gradient(180deg, #eef7ff 0%, #f8fafc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  box-sizing: border-box;
}

.complete-card {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 64rpx 42rpx 48rpx;
  border-radius: 34rpx;
  background: #fff;
  box-shadow: 0 22rpx 60rpx rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.check-wrap {
  width: 150rpx;
  height: 150rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #22c55e 0%, #14b8a6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14rpx 34rpx rgba(34, 197, 94, 0.28);
}

.check-icon {
  color: #fff;
  font-size: 96rpx;
  line-height: 120rpx;
  font-weight: 900;
}

.complete-title {
  margin-top: 34rpx;
  color: #1e293b;
  font-size: 42rpx;
  font-weight: 900;
}

.complete-desc {
  margin-top: 18rpx;
  margin-bottom: 54rpx;
  color: #64748b;
  font-size: 28rpx;
}

.home-btn,
.share-btn {
  width: 100%;
  height: 92rpx;
  border-radius: 999rpx;
  line-height: 92rpx;
  font-size: 30rpx;
  font-weight: 800;
}

.home-btn {
  background: #3b82f6;
  color: #fff;
}

.share-btn {
  margin-top: 22rpx;
  background: #eef6ff;
  color: #2563eb;
}

.home-btn::after,
.share-btn::after {
  border: none;
}

.confetti-wrap {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.confetti {
  position: absolute;
  top: -40rpx;
  width: 14rpx;
  height: 26rpx;
  border-radius: 4rpx;
  background: #f97316;
  animation: confetti-fall 2.8s linear infinite;
}

.c1 { left: 5vw; background: #ef4444; animation-delay: 0s; }
.c2 { left: 9vw; background: #f97316; animation-delay: .2s; animation-duration: 3s; }
.c3 { left: 13vw; background: #facc15; animation-delay: .6s; animation-duration: 2.6s; }
.c4 { left: 18vw; background: #22c55e; animation-delay: .1s; animation-duration: 3.4s; }
.c5 { left: 23vw; background: #06b6d4; animation-delay: .8s; animation-duration: 2.9s; }
.c6 { left: 28vw; background: #3b82f6; animation-delay: .3s; animation-duration: 3.7s; }
.c7 { left: 33vw; background: #8b5cf6; animation-delay: 1s; animation-duration: 2.8s; }
.c8 { left: 38vw; background: #ec4899; animation-delay: .4s; animation-duration: 3.1s; }
.c9 { left: 43vw; background: #14b8a6; animation-delay: .7s; animation-duration: 3.5s; }
.c10 { left: 48vw; background: #f59e0b; animation-delay: .15s; animation-duration: 2.7s; }
.c11 { left: 53vw; background: #84cc16; animation-delay: .9s; animation-duration: 3.2s; }
.c12 { left: 58vw; background: #0ea5e9; animation-delay: .35s; animation-duration: 3.6s; }
.c13 { left: 63vw; background: #a855f7; animation-delay: .55s; animation-duration: 2.9s; }
.c14 { left: 68vw; background: #f43f5e; animation-delay: .25s; animation-duration: 3.3s; }
.c15 { left: 73vw; background: #10b981; animation-delay: .75s; animation-duration: 2.8s; }
.c16 { left: 78vw; background: #6366f1; animation-delay: .45s; animation-duration: 3.8s; }
.c17 { left: 83vw; background: #eab308; animation-delay: 1.1s; animation-duration: 3s; }
.c18 { left: 88vw; background: #06b6d4; animation-delay: .65s; animation-duration: 3.4s; }
.c19 { left: 93vw; background: #f97316; animation-delay: .05s; animation-duration: 2.9s; }
.c20 { left: 97vw; background: #22c55e; animation-delay: .85s; animation-duration: 3.5s; }
.c21 { left: 16vw; background: #3b82f6; animation-delay: 1.25s; animation-duration: 3.2s; }
.c22 { left: 36vw; background: #ec4899; animation-delay: 1.05s; animation-duration: 2.8s; }
.c23 { left: 66vw; background: #facc15; animation-delay: 1.35s; animation-duration: 3.7s; }
.c24 { left: 86vw; background: #8b5cf6; animation-delay: 1.15s; animation-duration: 3.1s; }

@keyframes confetti-fall {
  0% {
    transform: translateY(-60rpx) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) rotate(540deg);
    opacity: 0;
  }
}
</style>
