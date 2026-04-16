<template>
  <view class="page">
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-back" @click="goBack">
        <uni-icons type="left" size="20" color="#1e293b"></uni-icons>
      </view>
      <text class="nav-title">{{ title }}</text>
      <view style="width: 44px;"></view>
    </view>

    <scroll-view scroll-y class="scroll-content" :style="{ top: navHeight + 'px' }">
      <view class="content-wrap">
        <view v-for="(section, index) in sections" :key="index" class="notice-section">
          <text class="notice-section-title">{{ section.title }}</text>
          <view class="notice-text-wrap">
            <text class="notice-plain">{{ section.content }}</text>
          </view>
        </view>
        <view style="height: 160px;"></view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="agree-row" @click="toggleAgree">
        <view class="checkbox-wrap" :class="{ checked: agreed }">
          <uni-icons v-if="agreed" type="checkmarkempty" size="12" color="#fff"></uni-icons>
        </view>
        <text class="agree-text">{{ agreementText }}</text>
      </view>
      <view class="agree-btn" :class="{ 'agree-btn-disabled': !agreed }" @click="handleConfirm">
        <text class="agree-btn-text">{{ confirmText }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    title: { type: String, default: '报名须知' },
    sections: { type: Array, default: () => [] },
    agreementText: { type: String, default: '我已阅读并同意相关须知' },
    confirmText: { type: String, default: '我同意' }
  },
  emits: ['confirm'],
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 44,
      agreed: false
    }
  },
  mounted() {
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight || 0
    this.navHeight = (sys.statusBarHeight || 0) + 44
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    toggleAgree() {
      this.agreed = !this.agreed
    },
    handleConfirm() {
      if (!this.agreed) {
        return uni.showToast({ title: '请先勾选同意协议', icon: 'none' })
      }
      this.$emit('confirm')
    }
  }
}
</script>

<style lang="scss" scoped>
page { background: #f4f6fb; }
.page { min-height: 100vh; background: #f4f6fb; }
.nav-bar { position: fixed; top: 0; left: 0; right: 0; background: #fff; display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 0 4px; z-index: 100; box-shadow: 0 1px 0 #f1f5f9; }
.nav-back { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
.nav-title { font-size: 16px; font-weight: 700; color: #1e293b; }
.scroll-content { position: fixed; left: 0; right: 0; bottom: 0; margin-bottom: 50rpx; }
.content-wrap { padding: 16px 14px 0; }
.notice-section { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.notice-section-title { font-size: 16px; font-weight: 700; color: #1e293b; display: block; margin-bottom: 12px; }
.notice-text-wrap { background: #f8fafc; border-radius: 8px; padding: 12px; }
.notice-plain { font-size: 13px; color: #475569; line-height: 1.9; white-space: pre-wrap; word-break: break-all; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 12px 16px; padding-bottom: calc(12px + env(safe-area-inset-bottom)); box-shadow: 0 -1px 0 #f1f5f9; z-index: 50; }
.agree-row { display: flex; flex-direction: row; align-items: center; margin-bottom: 12px; gap: 8px; }
.checkbox-wrap { width: 18px; height: 18px; border-radius: 4px; border: 1.5px solid #cbd5e1; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.checkbox-wrap.checked { background: #3B82F6; border-color: #3B82F6; }
.agree-text { font-size: 12px; color: #64748b; flex: 1; line-height: 1.5; }
.agree-btn { height: 50px; border-radius: 25px; background: #3B82F6; display: flex; align-items: center; justify-content: center; }
.agree-btn-disabled { background: #e2e8f0; }
.agree-btn-text { font-size: 16px; font-weight: 700; color: #fff; }
.agree-btn-disabled .agree-btn-text { color: #94a3b8; }
</style>
