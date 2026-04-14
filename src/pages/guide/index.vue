<template>
  <view class="guide-container">
    <view class="header-box">
      <text class="header-title">请选择您的身份</text>
      <text class="header-subtitle">选择合适的身份以获取最佳体验</text>
    </view>

    <view class="role-list">
      <view
        class="role-item"
        :class="{ active: selectedRole === '0' }"
        @click="selectRole('0')"
      >
        <view class="role-icon-wrap">
          <uni-icons type="staff" size="28" :color="selectedRole === '0' ? '#1677FF' : '#666'"></uni-icons>
        </view>
        <view class="role-info">
          <text class="role-name">我是家长</text>
          <text class="role-desc">发布需求，寻找优质教员</text>
        </view>
        <view v-if="selectedRole === '0'" class="check-icon">
          <uni-icons type="checkmarkempty" size="20" color="#1677FF"></uni-icons>
        </view>
      </view>

      <view
        class="role-item"
        :class="{ active: selectedRole === '1' }"
        @click="selectRole('1')"
      >
        <view class="role-icon-wrap">
          <uni-icons type="contact" size="28" :color="selectedRole === '1' ? '#1677FF' : '#666'"></uni-icons>
        </view>
        <view class="role-info">
          <text class="role-name">我是学生</text>
          <text class="role-desc">做家教，开启教学之旅</text>
        </view>
        <view v-if="selectedRole === '1'" class="check-icon">
          <uni-icons type="checkmarkempty" size="20" color="#1677FF"></uni-icons>
        </view>
      </view>
    </view>

    <view class="footer-btn">
      <button class="next-btn" :disabled="submitting" @click="handleNext">
        {{ submitting ? '提交中...' : '下一步' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { useUserStore } from '@/store'
import { initWxUserType } from '@/api/wxmini/profile'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const selectedRole = ref('0')
const submitting = ref(false)

function selectRole(role) {
  selectedRole.value = role
}

function resolveTarget(userType) {
  return userType === '0' ? '/pages/tutoring/parent/apply' : '/pages/tutoring/tutor/apply'
}

async function handleNext() {
  if (!selectedRole.value) {
    proxy.$modal.msgError('请选择您的身份')
    return
  }
  if (submitting.value) {
    return
  }
  submitting.value = true
  try {
    await initWxUserType({ userType: selectedRole.value })
    userStore.updateWxProfileState({ userType: selectedRole.value })
    proxy.$tab.redirectTo(resolveTarget(selectedRole.value))
  } catch (error) {
    proxy.$modal.msgError(error?.msg || '身份设置失败')
  } finally {
    submitting.value = false
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

.header-box {
  background-color: #ffffff;
  border-radius: 16rpx;
  border: 2rpx solid;
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
