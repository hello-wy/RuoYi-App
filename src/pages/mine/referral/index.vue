<template>
  <view class="referral-container">
    <!-- 头部邀请卡片 -->
    <view class="referral-header-card">
      <view class="header-title">推荐好友注册 共享优质服务</view>
      <view class="header-subtitle">好友登录后可通过邀请码绑定为您的下级</view>
      <!-- 邀请码展示区 -->
      <view class="code-box">
        <text class="code-label">我的专属邀请码</text>
        <view class="code-value-row" @tap="handleCopy">
          <text class="code-value">{{ inviteCode || '加载中...' }}</text>
          <view v-if="inviteCode" class="copy-btn">复制</view>
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
    <view class="invitees-section">
      <view class="section-title">我邀请的好友</view>
      <ReferralTreeGroups
        :groups="referralGroups"
        :total="referralTotal"
        :loading="treeLoading"
        @load-more="loadMoreReferralGroups"
      />
    </view>
  </view>
</template>
<script setup>
import { computed, ref } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { getMyReferralCode, getMyReferralTree } from '@/api/wxmini/referral'
import { appendInviteCodeToPath, appendInviteCodeToQuery, cacheShareInviteCode } from '@/utils/invite-share'
import ReferralTreeGroups from './components/ReferralTreeGroups.vue'

const TREE_PAGE_SIZE = 1
const inviteCode = ref('')
const inviteCount = ref(0)
const referralGroups = ref([])
const referralTotal = ref(0)
const treePageNum = ref(1)
const treeLoading = ref(false)
const hasMoreReferralGroups = computed(() => referralGroups.value.length < referralTotal.value)

onShow(() => {
  fetchCodeAndStats()
  loadReferralTree({ reset: true })
})

onShareAppMessage(() => {
  if (!inviteCode.value) {
    uni.showToast({
      title: '邀请码加载中，请稍后再分享',
      icon: 'none'
    })
    return {
      title: '邀请你加入智育傢，点击立即注册！',
      path: '/pages/index',
      imageUrl: ''
    }
  }
  return {
    title: '邀请你加入智育傢，点击立即注册！',
    path: appendInviteCodeToPath('/pages/index', inviteCode.value),
    imageUrl: ''
  }
})

onShareTimeline(() => ({
  title: '邀请你加入智育傢，点击立即注册！',
  query: appendInviteCodeToQuery('', inviteCode.value)
}))

function fetchCodeAndStats() {
  getMyReferralCode().then(res => {
    if (res.code === 200 && res.data?.inviteCode) {
      inviteCode.value = res.data.inviteCode
      cacheShareInviteCode(inviteCode.value)
      inviteCount.value = res.data.inviteCount
    }
  }).catch(() => {
    uni.showToast({
      title: '邀请码加载失败，请稍后重试',
      icon: 'none'
    })
  })
}

async function loadReferralTree({ reset = false } = {}) {
  if (treeLoading.value) return
  if (reset) resetReferralTree()
  treeLoading.value = true
  try {
    const res = await getMyReferralTree({
      pageNum: treePageNum.value,
      pageSize: TREE_PAGE_SIZE
    })
    if (res.code !== 200 || !Array.isArray(res.rows) || !Number.isFinite(Number(res.total))) {
      throw new Error(res.msg || '邀请关系数据格式错误')
    }
    referralGroups.value = reset ? res.rows : [...referralGroups.value, ...res.rows]
    referralTotal.value = Number(res.total)
    treePageNum.value += 1
  } catch (error) {
    console.error('邀请关系加载失败:', error)
    uni.showToast({
      title: error?.msg || error?.message || '邀请关系加载失败',
      icon: 'none'
    })
  } finally {
    treeLoading.value = false
  }
}

function resetReferralTree() {
  treePageNum.value = 1
  referralGroups.value = []
  referralTotal.value = 0
}

function loadMoreReferralGroups() {
  if (hasMoreReferralGroups.value) loadReferralTree()
}

function handleCopy() {
  if (!inviteCode.value) {
    uni.showToast({
      title: '邀请码加载中，请稍后重试',
      icon: 'none'
    })
    return
  }
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => {
      uni.showToast({
        title: '邀请码已复制',
        icon: 'success'
      })
    },
    fail: (error) => {
      const message = error?.errMsg || '未知错误'
      console.error('邀请码复制失败:', message)
      uni.showToast({
        title: '复制失败：' + message.replace(/^setClipboardData:fail\s*/, '').slice(0, 16),
        icon: 'none'
      })
    },
    complete: (result) => {
      console.log('邀请码复制结果:', result)
    }
  })
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
    pointer-events: none;
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
</style>
