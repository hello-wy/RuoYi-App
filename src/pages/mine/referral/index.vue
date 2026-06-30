<template>
  <view class="referral-container">
    <!-- 头部邀请卡片 -->
    <view class="referral-header-card">
      <view class="header-title">推荐好友注册 共享优质服务</view>
      <view class="header-subtitle">新用户注册时将自动绑定为您的下级</view>
      
      <!-- 邀请码展示区 -->
      <view class="code-box">
        <text class="code-label">我的专属邀请码</text>
        <view class="code-value-row">
          <text class="code-value">{{ inviteCode || '加载中...' }}</text>
          <view v-if="inviteCode" class="copy-btn" @click="handleCopy">复制</view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="btn-row">
        <button class="share-btn" open-type="share">
          <uni-icons type="share" size="18" color="#ffffff" />
          <text class="share-btn-text">立即分享给好友</text>
        </button>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-num">{{ inviteCount }}</text>
        <text class="stat-label">成功邀请人数 (位)</text>
      </view>
    </view>

    <!-- 邀请列表 -->
    <view class="invitees-section">
      <view class="section-title">我邀请的好友</view>
      
      <view v-if="invitees.length > 0" class="invitees-list">
        <view v-for="(item, index) in invitees" :key="index" class="invitee-item">
          <image class="invitee-avatar" :src="item.avatarUrl || '/static/images/avatar.png'" mode="aspectFill" />
          <view class="invitee-info">
            <text class="invitee-name">{{ item.userName || '微信用户' }}</text>
            <text class="invitee-phone">{{ formatPhone(item.phone) }}</text>
          </view>
          <text class="invitee-time">{{ formatTime(item.createTime) }}</text>
        </view>
        
        <uni-load-more :status="loadMoreStatus" />
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-box">
        <uni-icons type="info" size="48" color="#CBD5E1" />
        <text class="empty-text">暂无邀请记录，快去邀请好友吧！</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { getMyReferralCode, getMyInvitees } from '@/api/wxmini/referral'

const inviteCode = ref('')
const inviteCount = ref(0)
const invitees = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const loadMoreStatus = ref('more') // more, loading, no-more

onLoad(() => {
  fetchCodeAndStats()
  fetchInvitees(true)
})

onShow(() => {
  // 页面显示时重新载入数据，防止有新注册用户能及时展示
  fetchCodeAndStats()
})

// 分享配置
onShareAppMessage(() => {
  return {
    title: '邀请你加入智育傢，点击立即注册！',
    path: `/pages/index?inviteCode=${inviteCode.value}`,
    imageUrl: '' // 可以不填使用默认截屏，或指定一张好看的分享封面
  }
})

// 获取我的邀请码及统计数据
function fetchCodeAndStats() {
  getMyReferralCode().then(res => {
    if (res.code === 200) {
      inviteCode.value = res.data.inviteCode
      inviteCount.value = res.data.inviteCount
    }
  })
}

// 获取邀请的人列表
function fetchInvitees(isRefresh = false) {
  if (isRefresh) {
    pageNum.value = 1
    invitees.value = []
    loadMoreStatus.value = 'more'
  }

  if (loadMoreStatus.value === 'no-more') return

  loadMoreStatus.value = 'loading'

  getMyInvitees({
    pageNum: pageNum.value,
    pageSize: pageSize.value
  }).then(res => {
    if (res.code === 200) {
      const rows = res.rows || []
      invitees.value = invitees.value.concat(rows)
      if (rows.length < pageSize.value) {
        loadMoreStatus.value = 'no-more'
      } else {
        loadMoreStatus.value = 'more'
        pageNum.value++
      }
    } else {
      loadMoreStatus.value = 'more'
    }
  }).catch(() => {
    loadMoreStatus.value = 'more'
  })
}

// 复制邀请码
function handleCopy() {
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => {
      uni.showToast({
        title: '邀请码已复制',
        icon: 'success'
      })
    }
  })
}

// 手机号格式化脱敏
function formatPhone(phone) {
  if (!phone) return '未绑定手机号'
  if (phone.length === 11) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
  return phone
}

// 格式化时间，只保留年月日
function formatTime(timeStr) {
  if (!timeStr) return ''
  return timeStr.split(' ')[0]
}
</script>

<style lang="scss" scoped>
.referral-container {
  min-height: 100vh;
  background-color: #F8FAFC;
  padding: 30rpx;
  box-sizing: border-box;
}

.referral-header-card {
  background: linear-gradient(135deg, #0F9D8F 0%, #14B8A6 100%);
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  color: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(15, 157, 143, 0.15);
  margin-bottom: 30rpx;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    right: -50rpx;
    bottom: -50rpx;
    width: 250rpx;
    height: 250rpx;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }
}

.header-title {
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.header-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 50rpx;
}

.code-box {
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 16rpx;
  padding: 30rpx;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 40rpx;
}

.code-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-bottom: 16rpx;
}

.code-value-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-value {
  font-size: 56rpx;
  font-weight: 800;
  letter-spacing: 4rpx;
  font-family: 'Outfit', 'Inter', monospace;
}

.copy-btn {
  font-size: 24rpx;
  background-color: #ffffff;
  color: #0F9D8F;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:active {
    opacity: 0.8;
  }
}

.btn-row {
  margin-top: 10rpx;
}

.share-btn {
  background-color: #ffffff;
  color: #0F9D8F;
  border: none;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 20rpx rgba(15, 157, 143, 0.2);

  &::after {
    border: none;
  }

  &:active {
    background-color: #F1F5F9;
  }
}

.share-btn-text {
  margin-left: 12rpx;
}

.stats-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
  margin-bottom: 30rpx;
  display: flex;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 48rpx;
  font-weight: 800;
  color: #1E293B;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #64748B;
}

.invitees-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 30rpx;
  border-left: 8rpx solid #0F9D8F;
  padding-left: 16rpx;
  line-height: 1;
}

.invitee-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #F1F5F9;

  &:last-child {
    border-bottom: none;
  }
}

.invitee-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background-color: #E2E8F0;
  margin-right: 20rpx;
}

.invitee-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.invitee-name {
  font-size: 28rpx;
  color: #1E293B;
  font-weight: 600;
  margin-bottom: 6rpx;
}

.invitee-phone {
  font-size: 24rpx;
  color: #94A3B8;
}

.invitee-time {
  font-size: 24rpx;
  color: #94A3B8;
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 26rpx;
  color: #94A3B8;
  margin-top: 20rpx;
}
</style>
