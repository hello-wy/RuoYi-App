<template>
  <scroll-view class="mine-container" scroll-y>
    <!-- 顶部个人信息栏 -->
    <view class="header-section">
      <!-- 第一行：用户信息 + 个人主页 -->
      <view class="header-top">
        <view class="user-left">
          <view v-if="!avatar" class="avatar-wrap">
            <view class="iconfont icon-people avatar-icon"></view>
          </view>
          <image v-if="avatar" @click="handleToAvatar" :src="avatar" class="avatar-img" mode="aspectFill" />
          <view class="user-detail">
            <view v-if="!name" @click="handleToLogin" class="login-tip">点击登录</view>
            <view v-if="name" class="user-name">{{ name }}</view>
            <!-- <view v-if="name" class="verified-badge">
              <view class="iconfont icon-safe verified-icon"></view>
              <text class="verified-text">实名认证用户</text>
            </view> -->
          </view>
        </view>
        <view class="header-right" @click="handleBuilding">
          <text class="homepage-text">个人主页</text>
          <view class="iconfont icon-right homepage-arrow"></view>
        </view>
      </view>

      <!-- 第二行：统计数据 -->
      <view class="stats-row">
        <view class="stat-item" @click="handleToEnrollment">
          <text class="stat-num">{{ enrollmentList }}</text>
          <view class="stat-btn">我的学箱</view>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @click="handleBuilding">
          <text class="stat-num">{{ jifen }}</text>
          <view class="stat-btn">我的积分</view>
        </view>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="content-section">

      <!-- 学习中心 -->
      <view class="card">
        <view class="card-title">学习中心</view>
        <view class="study-grid">
          <view class="study-item study-blue" @click="uni.navigateTo({ url: '/pages/mine/course/list' })">
            <view class="study-icon-wrap">
              <view class="iconfont icon-calendar study-icon"></view>
            </view>
            <text class="study-label">已报课程</text>
          </view>
          <view class="study-item study-green" @click="handleBuilding">
            <view class="study-icon-wrap">
              <view class="iconfont icon-order study-icon"></view>
            </view>
            <text class="study-label">我的订单</text>
          </view>
          <view class="study-item study-orange" @click="handleBuilding">
            <view class="study-icon-wrap">
              <view class="iconfont icon-notes study-icon"></view>
            </view>
            <text class="study-label">课程笔记</text>
          </view>
        </view>
      </view>

      <!-- 菜单列表 -->
      <view class="menu-card">
        <view class="menu-item" @click="handleBuilding">
          <view class="menu-left">
            <view class="menu-icon-wrap menu-icon-pink">
              <view class="iconfont icon-aixin menu-icon-inner"></view>
            </view>
            <text class="menu-text">课程建议及评价</text>
          </view>
          <view class="iconfont icon-right menu-arrow"></view>
        </view>

        <view class="menu-divider"></view>

        <view class="menu-item" @click="handleBuilding">
          <view class="menu-left">
            <view class="menu-icon-wrap menu-icon-orange">
              <view class="iconfont icon-friendfill menu-icon-inner"></view>
            </view>
            <text class="menu-text">我的沙龙活动</text>
          </view>
          <view class="iconfont icon-right menu-arrow"></view>
        </view>

        <view class="menu-divider"></view>

<!--        <view class="menu-item" @click="handleBuilding">
          <view class="menu-left">
            <view class="menu-icon-wrap menu-icon-blue">
              <view class="iconfont icon-location menu-icon-inner"></view>
            </view>
            <text class="menu-text">地址管理</text>
          </view>
          <view class="iconfont icon-right menu-arrow"></view>
        </view> -->

        <view class="menu-divider"></view>

        <view class="menu-item" @click="handleBuilding">
          <view class="menu-left">
            <view class="menu-icon-wrap menu-icon-teal">
              <view class="iconfont icon-service menu-icon-inner"></view>
            </view>
            <text class="menu-text">客服电话</text>
          </view>
          <view class="menu-right-info">
            <text class="menu-desc">周一至周日 09:00-24:00</text>
            <view class="iconfont icon-right menu-arrow"></view>
          </view>
        </view>

        <view class="menu-divider"></view>

        <view class="menu-item" @click="handleToSetting">
          <view class="menu-left">
            <view class="menu-icon-wrap menu-icon-grey">
              <view class="iconfont icon-setting menu-icon-inner"></view>
            </view>
            <text class="menu-text">设置</text>
          </view>
          <view class="iconfont icon-right menu-arrow"></view>
        </view>
      </view>

    </view>
  </scroll-view>

  <login-popup
    ref="loginPopupRef"
    :auto-open="shouldAutoOpenLogin"
    account-success-url=""
    wechat-success-url=""
    realtime-phone-success-url=""
    @success="handleLoginSuccess"
  />
</template>

<script setup>
  import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'
  import { useUserStore } from '@/store'
  import { storeToRefs } from 'pinia'
  import { ref, getCurrentInstance } from "vue"
  import { getToken } from '@/utils/auth'
  const { proxy } = getCurrentInstance()
  import { onLoad } from "@dcloudio/uni-app"
  import { getTotalEnrollments } from '@/api/wxmini/growup'
  const userStore = useUserStore()
  const { name, avatar } = storeToRefs(userStore)
  const jifen = ref(0)
  const enrollmentList = ref(0)
  const loginPopupRef = ref(null)
  const shouldAutoOpenLogin = ref(false)

  function handleToInfo() {
    proxy.$tab.navigateTo('/pages/mine/info/index')
  }

  function handleToLogin() {
    loginPopupRef.value?.open()
  }

  function handleToAvatar() {
    proxy.$tab.navigateTo('/pages/mine/avatar/index')
  }

  function loadEnrollment() {
    getTotalEnrollments().then(res => {
      enrollmentList.value = res.data
    })
  }

  function handleLoginSuccess() {
    shouldAutoOpenLogin.value = false
    loadEnrollment()
  }

  onLoad(() => {
    if (!getToken()) {
      shouldAutoOpenLogin.value = true
      return
    }
    loadEnrollment()
  })

  function handleToEnrollment() {
    proxy.$tab.navigateTo('/pages/mine/enrollment/index')
  }

  function handleBuilding() {
    proxy.$modal.showToast('功能正在建设中~')
  }

  function handleToSetting() {
    proxy.$tab.navigateTo('/pages/mine/setting/index')
  }
</script>

<style lang="scss" scoped>
  $primary: #3B82F6;

  page {
    background-color: #f0f2f5;
  }

  .mine-container {
    width: 100%;
    min-height: 100vh;
  }

  /* ====== 顶部 Header ====== */
  .header-section {
    background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
    padding: 40rpx 32rpx 80rpx 32rpx;
    color: #fff;
  }

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40rpx;
  }

  .user-left {
    display: flex;
    align-items: center;
  }

  .avatar-wrap {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .avatar-icon {
      font-size: 54rpx;
      color: #fff;
    }
  }

  .avatar-img {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    border: 3rpx solid rgba(255, 255, 255, 0.6);
    flex-shrink: 0;
  }

  .user-detail {
    margin-left: 20rpx;

    .login-tip {
      font-size: 36rpx;
      color: #fff;
    }

    .user-name {
      font-size: 36rpx;
      font-weight: 600;
      color: #fff;
      line-height: 1.4;
    }

    .verified-badge {
      display: flex;
      align-items: center;
      margin-top: 6rpx;

      .verified-icon {
        font-size: 24rpx;
        color: #4ADE80;
      }

      .verified-text {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.9);
        margin-left: 6rpx;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.18);
    padding: 14rpx 24rpx;
    border-radius: 999rpx;

    .homepage-text {
      font-size: 24rpx;
      color: #fff;
    }

    .homepage-arrow {
      font-size: 22rpx;
      color: #fff;
      margin-left: 8rpx;
    }
  }

  .stats-row {
    display: flex;
    align-items: stretch;
    background: rgba(255, 255, 255, 0.14);
    border-radius: 28rpx;
    overflow: hidden;
    backdrop-filter: blur(6px);
  }

  .stat-item {
    flex: 1;
    padding: 28rpx 20rpx;
    text-align: center;
  }

  .stat-num {
    display: block;
    font-size: 40rpx;
    font-weight: 700;
    color: #fff;
  }

  .stat-btn {
    margin-top: 10rpx;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.88);
  }

  .stat-divider {
    width: 1rpx;
    background: rgba(255, 255, 255, 0.18);
  }

  .content-section {
    margin-top: -38rpx;
    padding: 0 24rpx 40rpx;
  }

  .card,
  .menu-card {
    background: #fff;
    border-radius: 28rpx;
    box-shadow: 0 14rpx 40rpx rgba(15, 23, 42, 0.08);
  }

  .card {
    padding: 28rpx 24rpx 18rpx;
    margin-bottom: 24rpx;
  }

  .card-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1E293B;
    margin-bottom: 24rpx;
  }

  .study-grid {
    display: flex;
    gap: 18rpx;
  }

  .study-item {
    flex: 1;
    border-radius: 24rpx;
    padding: 24rpx 16rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .study-blue {
    background: linear-gradient(180deg, #DBEAFE 0%, #EFF6FF 100%);
  }

  .study-green {
    background: linear-gradient(180deg, #DCFCE7 0%, #F0FDF4 100%);
  }

  .study-orange {
    background: linear-gradient(180deg, #FED7AA 0%, #FFF7ED 100%);
  }

  .study-icon-wrap {
    width: 76rpx;
    height: 76rpx;
    border-radius: 50%;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14rpx;
  }

  .study-icon {
    font-size: 40rpx;
    color: #2563EB;
  }

  .study-label {
    font-size: 24rpx;
    color: #334155;
  }

  .menu-card {
    padding: 0 24rpx;
  }

  .menu-item {
    min-height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .menu-left {
    display: flex;
    align-items: center;
  }

  .menu-icon-wrap {
    width: 64rpx;
    height: 64rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu-icon-pink {
    background: #FCE7F3;
  }

  .menu-icon-orange {
    background: #FFEDD5;
  }

  .menu-icon-blue {
    background: #DBEAFE;
  }

  .menu-icon-teal {
    background: #CCFBF1;
  }

  .menu-icon-grey {
    background: #E2E8F0;
  }

  .menu-icon-inner {
    font-size: 34rpx;
    color: #334155;
  }

  .menu-text {
    margin-left: 18rpx;
    font-size: 28rpx;
    color: #0F172A;
  }

  .menu-arrow {
    font-size: 24rpx;
    color: #94A3B8;
  }

  .menu-divider {
    height: 1rpx;
    background: #F1F5F9;
  }

  .menu-right-info {
    display: flex;
    align-items: center;
  }

  .menu-desc {
    font-size: 22rpx;
    color: #94A3B8;
    margin-right: 10rpx;
  }
</style>
