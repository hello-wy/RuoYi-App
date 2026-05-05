<template>
  <view class="agent-container">
    <view class="agent-card">
      <view class="card-title">学优职傢</view>

      <image
        v-if="agentData.qrcodeUrl"
        class="card-qrcode"
        :src="agentData.qrcodeUrl"
        mode="aspectFit"
        @click="previewImage"
      />
      <view v-else class="card-qrcode-placeholder">
        <text class="placeholder-text">二维码加载中...</text>
      </view>

      <view class="card-scan-tip">
        <text class="scan-text">{{ agentData.scanTip || '扫码长按识别添加我' }}</text>
      </view>

      <view class="card-info">
        <view class="info-row">
          <text class="info-label">联系人：</text>
          <text class="info-value">{{ agentData.contact || '暂未配置' }}</text>
        </view>
        <view class="info-divider"></view>
        <view class="info-row">
          <text class="info-label">联系电话：</text>
          <text class="info-value" @click="callPhone">{{ agentData.phone || '暂未配置' }}</text>
        </view>
      </view>

      <view v-if="agentData.tips" class="card-tips">
        <text class="tips-text">{{ agentData.tips }}</text>
      </view>
    </view>

    <view v-if="agentData.phone" class="action-bar">
      <view class="action-btn action-btn-call" @click="callPhone">
        <text class="action-btn-text">拨打电话</text>
      </view>
      <view class="action-btn action-btn-copy" @click="copyPhone">
        <text class="action-btn-text">复制号码</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMerchantAgentConfig } from '@/api/wxmini/config'

const agentData = ref({
  qrcodeUrl: '',
  scanTip: '扫码长按识别添加我',
  contact: '',
  phone: '',
  tips: ''
})

async function loadAgentConfig() {
  try {
    const res = await getMerchantAgentConfig()
    const data = res?.data || {}
    agentData.value = {
      qrcodeUrl: data.qrcodeUrl || '',
      scanTip: data.scanTip || '扫码长按识别添加我',
      contact: data.contact || '',
      phone: data.phone || '',
      tips: data.tips || ''
    }
  } catch (e) {
    uni.showToast({ title: '配置加载失败', icon: 'none' })
  }
}

function previewImage() {
  if (!agentData.value.qrcodeUrl) return
  uni.previewImage({
    urls: [agentData.value.qrcodeUrl],
    current: agentData.value.qrcodeUrl
  })
}

function callPhone() {
  if (!agentData.value.phone) return
  uni.makePhoneCall({ phoneNumber: agentData.value.phone })
}

function copyPhone() {
  if (!agentData.value.phone) return
  uni.setClipboardData({
    data: agentData.value.phone,
    success: () => {
      uni.showToast({ title: '号码已复制', icon: 'none' })
    }
  })
}

onLoad(() => {
  loadAgentConfig()
})
</script>

<style lang="scss" scoped>
.agent-container {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.agent-card {
  width: 690rpx;
  margin: 40rpx auto 0;
  padding: 60rpx 48rpx;
  background: #fff;
  border-radius: 28rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
  letter-spacing: 4rpx;
  margin-bottom: 40rpx;
}

.card-qrcode {
  width: 340rpx;
  height: 340rpx;
  border-radius: 12rpx;
  background: #fafafa;
}

.card-qrcode-placeholder {
  width: 340rpx;
  height: 340rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 26rpx;
  color: #999;
}

.card-scan-tip {
  margin-top: 24rpx;
}

.scan-text {
  font-size: 28rpx;
  color: #666;
}

.card-info {
  width: 100%;
  margin-top: 40rpx;
  background: #f8f9fb;
  border-radius: 20rpx;
  padding: 28rpx 32rpx;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
}

.info-label {
  font-size: 28rpx;
  color: #999;
  flex-shrink: 0;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.info-divider {
  height: 1rpx;
  background: #eee;
  margin: 8rpx 0;
}

.card-tips {
  margin-top: 32rpx;
  text-align: center;
}

.tips-text {
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}

.action-bar {
  width: 690rpx;
  margin: 48rpx auto 0;
  display: flex;
  gap: 24rpx;
}

.action-btn {
  flex: 1;
  height: 92rpx;
  border-radius: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn-call {
  background: linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%);
}

.action-btn-copy {
  background: #fff;
  border: 2rpx solid #14b8a6;
}

.action-btn-call .action-btn-text {
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}

.action-btn-copy .action-btn-text {
  color: #14b8a6;
  font-size: 30rpx;
  font-weight: 600;
}
</style>
