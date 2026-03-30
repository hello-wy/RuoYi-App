<template>
  <view class="login-page">
    <view class="page-orb orb-left"></view>
    <view class="page-orb orb-right"></view>

    <view class="hero-card">
      <view class="hero-top">
        <image class="logo" :src="globalConfig.appInfo.logo" mode="aspectFit"></image>
        <view class="hero-copy">
          <text class="eyebrow">WECHAT SIGN IN</text>
          <text class="title">微信手机号快捷验证登录</text>
          <text class="subtitle">主入口使用微信实时手机号验证，备选保留微信登录和账号密码登录。</text>
        </view>
      </view>

      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-title">手机号快捷验证</text>
          <text class="feature-desc">按钮直连微信手机号实时验证能力，不是运营商一键登录。</text>
        </view>
        <view class="feature-item">
          <text class="feature-title">两段式登录</text>
          <text class="feature-desc">先拿临时登录态，再绑定手机号，第二步成功后才正式落本地 token。</text>
        </view>
      </view>

      <button class="launch-btn" @click="openLoginPopup()">打开登录弹窗</button>
      <text class="launch-tip">默认核心交互在弹窗内完成，你也可以随时重新打开。</text>
    </view>

    <login-popup
      ref="loginPopupRef"
      :auto-open="shouldAutoOpen"
      :default-mode="defaultMode"
      :initial-login-form="initialLoginForm"
      :register="register"
      account-success-url="/pages/index"
      wechat-success-url="/pages/guide/index"
      realtime-phone-success-url="/pages/guide/index"
    />
  </view>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'
import { useConfigStore } from '@/store'
import { getToken } from '@/utils/auth'

const DEFAULT_MODE = 'realtimePhone'

const { proxy } = getCurrentInstance()
const globalConfig = useConfigStore().config
const loginPopupRef = ref(null)
const defaultMode = ref(DEFAULT_MODE)
const register = ref(false)
const shouldAutoOpen = ref(false)
const initialLoginForm = Object.freeze({
  username: 'admin',
  password: 'admin123',
  code: '',
  uuid: ''
})

function openLoginPopup(mode = DEFAULT_MODE) {
  defaultMode.value = mode
  loginPopupRef.value?.open(mode)
}

onLoad(() => {
  if (getToken()) {
    proxy.$tab.reLaunch('/pages/index')
    return
  }
  shouldAutoOpen.value = true
})
</script>

<style lang="scss" scoped>
@import './login-page.scss';
</style>
