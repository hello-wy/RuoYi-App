<template>
  <view class="page">
    <view class="hero-card">
      <view class="hero-top">
        <view>
          <text class="hero-title">订单中心</text>
          <text class="hero-subtitle">统一查看沙龙与兼职订单</text>
        </view>
        <view class="hero-badge">
          <text class="hero-badge-text">{{ visibleList.length }} 笔</text>
        </view>
      </view>
      <view class="summary-row">
        <view class="summary-item">
          <text class="summary-value">{{ allList.length }}</text>
          <text class="summary-label">全部订单</text>
        </view>
        <view class="summary-divider"></view>
        <view class="summary-item">
          <text class="summary-value">{{ salonList.length }}</text>
          <text class="summary-label">沙龙订单</text>
        </view>
        <view class="summary-divider"></view>
        <view class="summary-item">
          <text class="summary-value">{{ jobList.length }}</text>
          <text class="summary-label">兼职订单</text>
        </view>
      </view>
    </view>

    <view class="tab-bar">
      <view
        v-for="(tab, idx) in tabs"
        :key="tab.key"
        class="tab-item"
        :class="activeTab === idx ? 'tab-active' : ''"
        @click="switchTab(idx)"
      >
        <text class="tab-text" :class="activeTab === idx ? 'tab-text-active' : ''">{{ tab.label }}</text>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="scroll-body"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="loading" class="loading-wrap">
        <uni-load-more status="loading"></uni-load-more>
      </view>

      <view v-else-if="visibleList.length === 0" class="empty-wrap">
        <view class="empty-icon">订单</view>
        <text class="empty-title">{{ emptyText }}</text>
        <text class="empty-desc">支付完成后的订单会展示在这里</text>
      </view>

      <view v-else class="list-wrap">
        <view
          v-for="item in visibleList"
          :key="item.id"
          class="order-card"
          @click="openOrder(item)"
        >
          <view class="card-head">
            <view class="type-tag" :class="`type-${item.type}`">
              <text class="type-tag-text">{{ item.typeLabel }}</text>
            </view>
            <view class="status-tag" :class="statusClass(item.statusKey)">
              <text class="status-tag-text">{{ item.statusLabel }}</text>
            </view>
          </view>

          <text class="order-title">{{ item.title || '未命名订单' }}</text>

          <view class="amount-row">
            <text class="amount-symbol">¥</text>
            <text class="amount-value">{{ formatPrice(item.amount) }}</text>
          </view>

          <view class="meta-panel">
            <view class="meta-row">
              <text class="meta-label">订单编号</text>
              <text class="meta-value meta-mono">{{ item.orderNo || '--' }}</text>
            </view>
            <view class="meta-row">
              <text class="meta-label">支付时间</text>
              <text class="meta-value">{{ formatDateTime(item.payTime) }}</text>
            </view>
            <view class="meta-row">
              <text class="meta-label">创建时间</text>
              <text class="meta-value">{{ formatDateTime(item.createTime) }}</text>
            </view>
          </view>

          <view class="card-foot">
            <text class="card-foot-text">点击查看{{ item.typeLabel }}详情</text>
            <uni-icons type="right" size="14" color="#94A3B8" />
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { listMySalonOrders } from '@/api/wxmini/salonPay'
import { useJobSignupOrderStore } from '@/store'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'salon', label: '沙龙' },
  { key: 'job', label: '兼职' }
]

const activeTab = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const jobList = ref([])
const salonList = ref([])
const allList = ref([])

const visibleList = computed(() => {
  const key = tabs[activeTab.value]?.key
  if (key === 'salon') return salonList.value
  if (key === 'job') return jobList.value
  return allList.value
})

const emptyText = computed(() => {
  const key = tabs[activeTab.value]?.key
  if (key === 'salon') return '暂无沙龙订单'
  if (key === 'job') return '暂无兼职订单'
  return '暂无订单'
})

onLoad(() => {
  loadOrders()
})

async function loadOrders() {
  if (loading.value) return
  loading.value = true
  try {
    const orderStore = useJobSignupOrderStore()
    orderStore.hydrate()
    let jobOrders = Array.isArray(orderStore.orders) ? orderStore.orders : []
    if (!jobOrders.length) {
      jobOrders = await orderStore.refresh()
    }

    const [salonRes] = await Promise.all([
      listMySalonOrders()
    ])

    jobList.value = normalizeJobOrders(jobOrders || [])
    salonList.value = normalizeSalonOrders(salonRes.data || [])
    allList.value = sortOrders([...jobList.value, ...salonList.value])
  } catch (e) {
    uni.showToast({ title: '加载订单失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function normalizeJobOrders(list) {
  return sortOrders((list || []).map(item => ({
    id: `job-${item.orderNo}`,
    type: 'job',
    typeLabel: '兼职',
    orderNo: item.orderNo,
    title: item.jobTitle,
    amount: item.amount,
    statusKey: mapJobStatus(item.status),
    statusLabel: getStatusLabel(mapJobStatus(item.status)),
    payTime: item.payTime,
    createTime: item.createTime,
    bizId: item.jobId
  })))
}

function normalizeSalonOrders(list) {
  return sortOrders((list || []).map(item => ({
    id: `salon-${item.orderNo}`,
    type: 'salon',
    typeLabel: '沙龙',
    orderNo: item.orderNo,
    title: item.title,
    amount: item.amount,
    statusKey: mapSalonStatus(item.status),
    statusLabel: getStatusLabel(mapSalonStatus(item.status)),
    payTime: item.payTime,
    createTime: item.createTime,
    bizId: item.salonId
  })))
}

function sortOrders(list) {
  return [...list].sort((a, b) => getSortTime(b) - getSortTime(a))
}

function getSortTime(item) {
  return parseTime(item.payTime) || parseTime(item.createTime) || 0
}

function parseTime(value) {
  if (!value) return 0
  const ts = new Date(value).getTime()
  return Number.isNaN(ts) ? 0 : ts
}

function mapSalonStatus(status) {
  const current = String(status || '').toUpperCase()
  if (current === 'PAID') return 'paid'
  if (current === 'CANCELED') return 'canceled'
  if (current === 'REFUNDED') return 'refunded'
  return 'pending'
}

function mapJobStatus(status) {
  const current = Number(status)
  if (current === 1) return 'paid'
  if (current === 2) return 'canceled'
  if (current === 3) return 'refunding'
  if (current === 4) return 'refunded'
  return 'pending'
}

function getStatusLabel(statusKey) {
  const map = {
    pending: '待支付',
    paid: '已支付',
    canceled: '已取消',
    refunding: '退款中',
    refunded: '已退款'
  }
  return map[statusKey] || '待支付'
}

function statusClass(statusKey) {
  return `status-${statusKey}`
}

function switchTab(idx) {
  activeTab.value = idx
}

async function onRefresh() {
  refreshing.value = true
  const orderStore = useJobSignupOrderStore()
  try {
    await orderStore.refresh()
    await loadOrders()
  } finally {
    refreshing.value = false
  }
}

function openOrder(item) {
  if (item.type === 'salon') {
    uni.navigateTo({ url: `/pages/salon/order-detail?orderNo=${item.orderNo}` })
    return
  }
  uni.navigateTo({ url: `/pages/jobs/detail?id=${item.bizId}` })
}

function formatPrice(val) {
  if (val === null || val === undefined || val === '') return '0.00'
  return Number(val).toFixed(2)
}

function formatDateTime(val) {
  if (!val) return '--'
  const date = new Date(val)
  if (Number.isNaN(date.getTime())) return val
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${mm}`
}
</script>

<style lang="scss" scoped>
page {
  background: #f4f7fb;
  height: 100%;
}

.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(15, 157, 143, 0.12), transparent 28%),
    linear-gradient(180deg, #f7fbff 0%, #f4f7fb 42%, #eef3f8 100%);
}

.hero-card {
  margin: 24rpx 24rpx 20rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #0f766e 0%, #10b981 100%);
  box-shadow: 0 18rpx 40rpx rgba(16, 185, 129, 0.18);
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.hero-title {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
  color: #fff;
}

.hero-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

.hero-badge {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.16);
  border: 1rpx solid rgba(255, 255, 255, 0.22);
}

.hero-badge-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
}

.summary-row {
  margin-top: 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
}

.summary-label {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.summary-divider {
  width: 1rpx;
  height: 52rpx;
  background: rgba(255, 255, 255, 0.22);
}

.tab-bar {
  display: flex;
  margin: 0 24rpx;
  padding: 8rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
}

.tab-item {
  flex: 1;
  padding: 18rpx 0;
  border-radius: 999rpx;
  display: flex;
  justify-content: center;
}

.tab-active {
  background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
  box-shadow: 0 10rpx 20rpx rgba(20, 184, 166, 0.18);
}

.tab-text {
  font-size: 28rpx;
  color: #64748b;
  font-weight: 600;
}

.tab-text-active {
  color: #fff;
}

.scroll-body {
  height: calc(100vh - 280rpx);
  padding: 20rpx 24rpx 32rpx;
  box-sizing: border-box;
}

.loading-wrap,
.empty-wrap {
  padding: 140rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #d1fae5 0%, #ecfeff 100%);
  color: #0f766e;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1rpx rgba(15, 118, 110, 0.08);
}

.empty-title {
  margin-top: 24rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.empty-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #94a3b8;
}

.list-wrap {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-card {
  position: relative;
  overflow: hidden;
  padding: 26rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 14rpx 34rpx rgba(15, 23, 42, 0.08);
}

.order-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 180rpx;
  height: 180rpx;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, rgba(20, 184, 166, 0) 70%);
  transform: translate(30%, -30%);
}

.card-head,
.card-foot,
.meta-panel,
.order-title,
.amount-row {
  position: relative;
  z-index: 1;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.type-tag,
.status-tag {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
}

.type-salon {
  background: rgba(20, 184, 166, 0.14);
}

.type-job {
  background: rgba(59, 130, 246, 0.12);
}

.type-tag-text,
.status-tag-text {
  font-size: 22rpx;
  font-weight: 600;
}

.type-salon .type-tag-text {
  color: #0f766e;
}

.type-job .type-tag-text {
  color: #1d4ed8;
}

.status-paid {
  background: rgba(34, 197, 94, 0.12);
}

.status-pending {
  background: rgba(245, 158, 11, 0.14);
}

.status-canceled,
.status-refunded,
.status-refunding {
  background: rgba(148, 163, 184, 0.14);
}

.status-paid .status-tag-text {
  color: #15803d;
}

.status-pending .status-tag-text {
  color: #b45309;
}

.status-canceled .status-tag-text,
.status-refunded .status-tag-text,
.status-refunding .status-tag-text {
  color: #64748b;
}

.order-title {
  margin-top: 22rpx;
  font-size: 32rpx;
  line-height: 1.5;
  font-weight: 700;
  color: #0f172a;
}

.amount-row {
  margin-top: 18rpx;
  display: flex;
  align-items: baseline;
}

.amount-symbol {
  font-size: 28rpx;
  color: #0f766e;
  font-weight: 700;
}

.amount-value {
  margin-left: 6rpx;
  font-size: 48rpx;
  line-height: 1;
  font-weight: 800;
  color: #0f766e;
}

.meta-panel {
  margin-top: 20rpx;
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: #f8fafc;
}

.meta-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.meta-row + .meta-row {
  margin-top: 12rpx;
}

.meta-label {
  font-size: 24rpx;
  color: #94a3b8;
}

.meta-value {
  flex: 1;
  text-align: right;
  font-size: 24rpx;
  color: #334155;
}

.meta-mono {
  word-break: break-all;
}

.card-foot {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-foot-text {
  font-size: 24rpx;
  color: #64748b;
}
</style>
