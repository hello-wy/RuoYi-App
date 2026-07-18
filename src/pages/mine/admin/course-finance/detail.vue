<template>
  <scroll-view class="detail-page" scroll-y>
    <view v-if="loading" class="state-box"><uni-load-more status="loading" /></view>
    <view v-else-if="!payment" class="state-box">未找到支付流水</view>
    <view v-else class="detail-card">
      <view class="amount">¥{{ money(payment.paidAmount) }}</view>
      <view class="subtitle">实付金额</view>
      <view class="status">{{ payment.status || '-' }}</view>
      <view class="section">
        <view v-for="item in detailItems" :key="item.label" class="row">
          <text class="label">{{ item.label }}</text><text class="value">{{ item.value }}</text>
        </view>
      </view>
      <view v-if="deductions.length" class="deduction-section">
        <view class="deduction-title">扣减记录</view>
        <view v-for="(item, index) in deductions" :key="item.id || index" class="deduction-item">
          <view class="deduction-row"><text>扣减 ¥{{ money(item.amount) }}</text><text>{{ item.createTime || '-' }}</text></view>
          <text class="deduction-reason">{{ item.reason || '未填写原因' }}</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { requireAdminAccess } from '../access'
import { getCourseFinancePayment } from '../_api/system/courseFinance'

const { proxy } = getCurrentInstance()
const loading = ref(true)
const payment = ref(null)
const deductions = ref([])
const money = value => Number(value || 0).toFixed(2)
const detailItems = computed(() => {
  const item = payment.value || {}
  return [
    { label: '订单号', value: item.orderNo || '-' },
    { label: '课程', value: item.courseName || item.courseTitle || '-' },
    { label: '学员', value: item.studentName || item.studentNickname || '-' },
    { label: '支付时间', value: item.payTime || '-' },
    { label: '课程总价', value: `¥${money(item.courseTotalAmount)}` },
    { label: '未付差额', value: `¥${money(item.outstandingAmount)}` },
    { label: '返现比例', value: item.cashbackRatio == null ? '-' : `${Number(item.cashbackRatio) * 100}%` },
    { label: '应返现', value: `¥${money(item.grossCashbackAmount ?? item.grossCashback)}` },
    { label: '可用返现', value: `¥${money(item.availableCashbackAmount ?? item.availableCashback)}` },
    { label: '归属员工', value: item.employeeUserName || item.employeeUserId || '未归属' },
    { label: '归属部门', value: item.ownerDeptName || item.ownerDeptId || '-' }
  ]
})

onLoad(async options => {
  if (!requireAdminAccess(proxy)) return
  if (!options.orderNo) { loading.value = false; return }
  try {
    const detail = await getCourseFinancePayment(options.orderNo)
    payment.value = detail.payment
    deductions.value = detail.deductions
  } catch (error) {
    proxy.$modal.showToast(error?.msg || '加载支付详情失败')
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.detail-page { min-height: 100vh; padding: 20rpx; box-sizing: border-box; background: #f1f5f9; }.detail-card { padding: 32rpx 24rpx; background: #fff; border-radius: 16rpx; }.amount { text-align: center; color: #0f766e; font-size: 54rpx; font-weight: 700; }.subtitle, .status { display: block; text-align: center; margin-top: 10rpx; color: #64748b; font-size: 25rpx; }.status { color: #0f766e; }.section, .deduction-section { margin-top: 28rpx; border-top: 1rpx solid #e2e8f0; }.row { display: flex; justify-content: space-between; gap: 24rpx; padding: 22rpx 0; border-bottom: 1rpx solid #f1f5f9; font-size: 27rpx; }.label { color: #64748b; }.value { color: #0f172a; text-align: right; word-break: break-all; }.deduction-title { padding: 22rpx 0 10rpx; font-size: 28rpx; font-weight: 600; color: #0f172a; }.deduction-item { padding: 18rpx 0; border-bottom: 1rpx solid #f1f5f9; }.deduction-row { display: flex; justify-content: space-between; gap: 20rpx; color: #334155; font-size: 26rpx; }.deduction-reason { display: block; margin-top: 10rpx; color: #64748b; font-size: 24rpx; }.state-box { padding-top: 160rpx; text-align: center; color: #94a3b8; }
</style>
