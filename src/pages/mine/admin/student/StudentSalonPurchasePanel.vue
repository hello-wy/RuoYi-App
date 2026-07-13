<template>
  <view class="panel">
    <view v-if="loading" class="state-card"><uni-load-more status="loading" /></view>
    <view v-else-if="loadError" class="state-card"><text class="empty-text">沙龙购买记录加载失败</text><button class="retry-btn" size="mini" @click="loadRecords">重试</button></view>
    <view v-else-if="records.length === 0" class="state-card"><text class="empty-text">暂无沙龙购买记录</text></view>
    <view v-else class="record-list"><view v-for="record in records" :key="record.id" class="record-card"><view class="record-head"><text class="record-title">{{ record.salonTitle }}</text><text class="record-status" :class="{ refunded: record.status === 'REFUNDED' }">{{ getStatusText(record.status) }}</text></view><view class="record-line">订单号：{{ formatValue(record.orderNo) }}</view><view class="record-line">支付金额：¥{{ formatAmount(record.amount) }}</view><view class="record-line">支付时间：{{ formatValue(record.payTime) }}</view><view v-if="record.refundTime" class="record-line">退款时间：{{ record.refundTime }}</view></view></view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getStudentSalonPurchaseRecords } from '@/pages/mine/admin/_api/system/student'

defineOptions({ name: 'StudentSalonPurchasePanel' })

const props = defineProps({ studentId: { type: [Number, String], required: true } })
const records = ref([])
const loading = ref(false)
const loadError = ref(false)

async function loadRecords() {
  if (loading.value) return
  loading.value = true
  loadError.value = false
  try {
    records.value = await getStudentSalonPurchaseRecords(props.studentId)
  } catch (error) {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function getStatusText(status) {
  return status === 'REFUNDED' ? '已退款' : '已支付'
}

function formatAmount(value) {
  return Number(value || 0).toFixed(2)
}

function formatValue(value) {
  return value || '--'
}

onMounted(loadRecords)
</script>

<style lang="scss" scoped>
.panel { margin-top: 20rpx; }
.state-card, .record-list { padding: 28rpx; border-radius: 28rpx; background: #fff; box-shadow: 0 12rpx 36rpx rgba(15, 23, 42, .06); }
.state-card { display: flex; flex-direction: column; align-items: center; gap: 20rpx; }
.record-card + .record-card { margin-top: 24rpx; padding-top: 24rpx; border-top: 1rpx solid #f0edf9; }
.record-head { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.record-title { flex: 1; font-size: 31rpx; font-weight: 700; color: #201c34; }
.record-status { flex: none; padding: 6rpx 14rpx; border-radius: 999rpx; background: #ecfdf5; font-size: 22rpx; color: #059669; }
.record-status.refunded { background: #fff1f2; color: #e11d48; }
.record-line { margin-top: 12rpx; font-size: 26rpx; line-height: 1.5; color: #64748b; }
.empty-text { font-size: 28rpx; color: #94a3b8; }
.retry-btn { margin: 0; border-radius: 999rpx; background: #7c6cff; color: #fff; }
</style>
