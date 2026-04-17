<template>
  <view class="page">
    <view class="card" v-if="order">
      <view class="title">{{ pageTitle }}</view>
      <view class="row">
        <text class="label">沙龙标题</text>
        <text class="value">{{ order.title || '--' }}</text>
      </view>
      <view class="row">
        <text class="label">支付金额</text>
        <text class="value">¥{{ formatPrice(order.amount) }}</text>
      </view>
      <view class="row">
        <text class="label">支付时间</text>
        <text class="value">{{ order.payTime || '--' }}</text>
      </view>
      <view class="row">
        <text class="label">订单编号</text>
        <text class="value order-no">{{ order.orderNo || '--' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { querySalonPayOrder } from '@/api/wxmini/salonPay'

export default {
  data() {
    return {
      orderNo: '',
      order: null
    }
  },
  computed: {
    pageTitle() {
      const status = String(this.order?.status || '').toUpperCase()
      if (status === 'PAID') return '报名成功'
      if (status === 'REFUNDED') return '已退款'
      return '已取消'
    }
  },
  onLoad(options) {
    this.orderNo = options.orderNo || ''
    this.loadOrder()
  },
  methods: {
    async loadOrder() {
      if (!this.orderNo) return
      const res = await querySalonPayOrder(this.orderNo)
      this.order = res.data || res
    },
    formatPrice(val) {
      if (val === null || val === undefined) return '0.00'
      return Number(val).toFixed(2)
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 32rpx;
  box-sizing: border-box;
}
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
}
.title {
  font-size: 40rpx;
  font-weight: 700;
  color: #111827;
  margin-bottom: 28rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
  gap: 24rpx;
}
.label {
  color: #6b7280;
  font-size: 26rpx;
}
.value {
  color: #111827;
  font-size: 28rpx;
  text-align: right;
  flex: 1;
}
.order-no {
  word-break: break-all;
}
</style>
