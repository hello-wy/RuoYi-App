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

        <view class="menu-item" @click="handleBuilding">
          <view class="menu-left">
            <view class="menu-icon-wrap menu-icon-blue">
              <view class="iconfont icon-location menu-icon-inner"></view>
            </view>
            <text class="menu-text">地址管理</text>
          </view>
          <view class="iconfont icon-right menu-arrow"></view>
        </view>

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
</template>

<script setup>
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

  function handleToInfo() {
    proxy.$tab.navigateTo('/pages/mine/info/index')
  }

  function handleToLogin() {
    proxy.$tab.reLaunch('/pages/login')
  }

  function handleToAvatar() {
    proxy.$tab.navigateTo('/pages/mine/avatar/index')
  }

  onLoad(() => {
    if (!getToken()) {
      proxy.$tab.reLaunch('/pages/index')
    }else{
			getTotalEnrollments().then(res => {
				enrollmentList.value = res.data
			})
	}
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
        color: rgba(255, 255, 255, 0.85);
        margin-right: 4rpx;
      }

      .verified-text {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;

    .homepage-text {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.9);
    }

    .homepage-arrow {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .stats-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
  }

  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    .stat-num {
      font-size: 44rpx;
      font-weight: 700;
      color: #fff;
      line-height: 1;
      margin-bottom: 12rpx;
    }

    .stat-btn {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(255, 255, 255, 0.2);
      border-radius: 30rpx;
      padding: 6rpx 24rpx;
      border: 1rpx solid rgba(255, 255, 255, 0.35);
    }
  }

  .stat-divider {
    width: 1rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.35);
  }

  /* ====== 内容区 ====== */
  .content-section {
    position: relative;
    top: -50rpx;
    padding: 0 24rpx 40rpx;
  }

  /* ====== 通用卡片 ====== */
  .card {
    background: #fff;
    border-radius: 20rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  }

  .card-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 28rpx;
  }

  /* ====== 学习中心 ====== */
  .study-grid {
    display: flex;
    gap: 20rpx;
  }

  .study-item {
    flex: 1;
    border-radius: 16rpx;
    padding: 28rpx 0 22rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .study-icon-wrap {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14rpx;

      .study-icon {
        font-size: 36rpx;
        color: #fff;
      }
    }

    .study-label {
      font-size: 24rpx;
      color: #fff;
      font-weight: 500;
    }
  }

  .study-blue {
    background: linear-gradient(135deg, #5B6CF6 0%, #3B82F6 100%);
  }

  .study-green {
    background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
  }

  .study-orange {
    background: linear-gradient(135deg, #FBBF24 0%, #F97316 100%);
  }

  /* ====== 菜单卡片 ====== */
  .menu-card {
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  }

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 32rpx;

    .menu-left {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .menu-text {
      font-size: 28rpx;
      color: #1a1a2e;
    }

    .menu-arrow {
      font-size: 26rpx;
      color: #c0c4cc;
    }

    .menu-right-info {
      display: flex;
      align-items: center;

      .menu-desc {
        font-size: 22rpx;
        color: #9ca3af;
        margin-right: 4rpx;
      }
    }
  }

  .menu-icon-wrap {
    width: 60rpx;
    height: 60rpx;
    border-radius: 14rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 22rpx;
    flex-shrink: 0;

    .menu-icon-inner {
      font-size: 30rpx;
      color: #fff;
    }
  }

  .menu-icon-pink   { background: linear-gradient(135deg, #F472B6, #EC4899); }
  .menu-icon-orange { background: linear-gradient(135deg, #FBBF24, #F97316); }
  .menu-icon-blue   { background: linear-gradient(135deg, #60A5FA, #3B82F6); }
  .menu-icon-teal   { background: linear-gradient(135deg, #34D399, #14B8A6); }
  .menu-icon-grey   { background: linear-gradient(135deg, #9CA3AF, #6B7280); }

  .menu-divider {
    height: 1rpx;
    background: #f3f4f6;
    margin: 0 32rpx;
  }

  /* ====== 钱包入口卡片 ====== */
  .wallet-card {
    margin: 0 0 20rpx 0;
    background: linear-gradient(135deg, #fff9f0, #fff);
    border-radius: 24rpx;
    padding: 28rpx 28rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1.5rpx solid #FDE68A;
    box-shadow: 0 2rpx 12rpx rgba(245, 158, 11, 0.1);

    &:active { background: #fffbeb; }
  }

  .wallet-left {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  .wallet-icon-bg {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #F59E0B, #FBBF24);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .wallet-icon-text {
    font-size: 36rpx;
    font-weight: 700;
    color: #fff;
  }

  .wallet-text-wrap {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .wallet-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1e293b;
  }

  .wallet-sub {
    font-size: 22rpx;
    color: #94a3b8;
  }

  .wallet-right {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .wallet-balance-hint {
    font-size: 24rpx;
    color: #F59E0B;
    font-weight: 500;
  }

  .wallet-arrow {
    font-size: 24rpx;
    color: #F59E0B;
  }

</style>
