<template>
  <view v-if="visible" class="guard-overlay" @touchmove.stop.prevent>
    <view class="guard-mask" @click="handleCancel"></view>
    <view class="guard-dialog">
      <view class="guard-header">
        <text class="guard-title">{{ title }}</text>
      </view>
      <text class="guard-content">{{ content }}</text>
      <view class="guard-actions">
        <view class="guard-btn guard-btn--secondary" @click="handleCancel">
          <text class="guard-btn__text guard-btn__text--secondary">{{ cancelText }}</text>
        </view>
        <view class="guard-btn guard-btn--primary" @click="handleConfirm">
          <text class="guard-btn__text">{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '身份提示'
  },
  content: {
    type: String,
    default: ''
  },
  cancelText: {
    type: String,
    default: '过会'
  },
  confirmText: {
    type: String,
    default: '现在就去'
  }
})

const emit = defineEmits(['cancel', 'confirm', 'close'])

function handleCancel() {
  emit('cancel')
  emit('close')
}

function handleConfirm() {
  emit('confirm')
}
</script>

<style lang="scss" scoped>
.guard-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  box-sizing: border-box;
}

.guard-mask {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
}

.guard-dialog {
  position: relative;
  width: 100%;
  max-width: 620rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx 32rpx;
  box-sizing: border-box;
}

.guard-header {
  margin-bottom: 16rpx;
}

.guard-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1e293b;
}

.guard-content {
  display: block;
  font-size: 28rpx;
  line-height: 1.7;
  color: #64748b;
}

.guard-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 36rpx;
}

.guard-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guard-btn--secondary {
  background: #f1f5f9;
}

.guard-btn--primary {
  background: #3b82f6;
}

.guard-btn__text {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
}

.guard-btn__text--secondary {
  color: #475569;
}
</style>
