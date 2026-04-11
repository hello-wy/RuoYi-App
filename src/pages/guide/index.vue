<template>
  <view class="guide-container">
    <!-- 顶部标题区域 -->
    <view class="header-box">
      <text class="header-title">请选择您的身份</text>
      <text class="header-subtitle">选择合适的身份以获取最佳体验</text>
    </view>

    <!-- 身份选项列表 -->
    <view class="role-list">
      <!-- 家长/学员选项 -->
      <view
        class="role-item"
        :class="{ active: selectedRole === 'parent' }"
        @click="selectRole('parent')"
      >
        <view class="role-icon-wrap">
          <uni-icons type="staff" size="28" :color="selectedRole === 'parent' ? '#1677FF' : '#666'"></uni-icons>
        </view>
        <view class="role-info">
          <text class="role-name">我是家长/学员</text>
          <text class="role-desc">寻找优质教员</text>
        </view>
        <view v-if="selectedRole === 'parent'" class="check-icon">
          <uni-icons type="checkmarkempty" size="20" color="#1677FF"></uni-icons>
        </view>
      </view>

      <!-- 教员选项 -->
      <view
        class="role-item"
        :class="{ active: selectedRole === 'tutor' }"
        @click="selectRole('tutor')"
      >
        <view class="role-icon-wrap">
          <uni-icons type="contact" size="28" :color="selectedRole === 'tutor' ? '#1677FF' : '#666'"></uni-icons>
        </view>
        <view class="role-info">
          <text class="role-name">我是教员</text>
          <text class="role-desc">开启教学之旅</text>
        </view>
        <view v-if="selectedRole === 'tutor'" class="check-icon">
          <uni-icons type="checkmarkempty" size="20" color="#1677FF"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 下一步按钮 -->
    <view class="footer-btn">
      <button class="next-btn" @click="handleNext">下一步</button>
    </view>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
const selectedRole = ref('parent')

function selectRole(role) {
  selectedRole.value = role
}

function handleNext() {
  if (!selectedRole.value) {
    proxy.$modal.msgError('请选择您的身份')
    return
  }
  if (selectedRole.value === 'parent') {
    proxy.$tab.redirectTo('/pages/tutoring/parent/apply')
  } else {
    proxy.$tab.redirectTo('/pages/tutoring/tutor/apply')
  }
}
</script>

<style lang="scss" scoped>
page {
  background-color: #f5f6f8;
}

.guide-container {
  min-height: 100vh;
  background-color: #f5f6f8;
  padding: 40rpx 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 顶部标题 */
.header-box {
  background-color: #ffffff;
  border-radius: 16rpx;
  border: 2rpx solid ;
  padding: 40rpx 36rpx;
  margin-bottom: 32rpx;

  .header-title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 12rpx;
  }

  .header-subtitle {
    display: block;
    font-size: 26rpx;
    color: #888;
  }
}

/* 身份选项列表 */
.role-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.role-item {
  background-color: #ffffff;
  border-radius: 16rpx;
  border: 2rpx solid #e8e8e8;
  padding: 32rpx 36rpx;
  display: flex;
  align-items: center;
  transition: border-color 0.2s;

  &.active {
    border-color: #1677FF;
  }

  .role-icon-wrap {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background-color: #f0f5ff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    flex-shrink: 0;
  }

  .role-info {
    flex: 1;

    .role-name {
      display: block;
      font-size: 30rpx;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 8rpx;
    }

    .role-desc {
      display: block;
      font-size: 24rpx;
      color: #999;
    }
  }

  .check-icon {
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    background-color: #1677FF;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
}

/* 底部按钮 */
.footer-btn {
  margin-top: auto;
  padding-top: 80rpx;

  .next-btn {
    width: 100%;
    height: 96rpx;
    line-height: 96rpx;
    background-color: #1a1a1a;
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 48rpx;
    border: none;

    &::after {
      border: none;
    }
  }
}
</style>
