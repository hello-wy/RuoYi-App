<template>
  <view class="page">
    <view class="hero-card">
      <view class="hero-top">
        <view>
          <text class="hero-title">订单中心</text>
          <text class="hero-subtitle">统一查看沙龙、兼职、课程与家教课时包订单</text>
        </view>
      </view>
      <view class="summary-row">
        <view
          v-for="item in summaryOptions"
          :key="item.key"
          class="summary-item"
          :class="activeType === item.key ? 'summary-item-active' : ''"
          @click="switchType(item.key)"
        >
          <text class="summary-value">{{ summaryCountMap[item.key] }}</text>
          <text class="summary-label">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <view class="tab-bar">
      <view
        v-for="tab in statusTabs"
        :key="tab.key"
        class="tab-item"
        :class="activeStatus === tab.key ? 'tab-active' : ''"
        @click="switchStatus(tab.key)"
      >
        <text class="tab-text" :class="activeStatus === tab.key ? 'tab-text-active' : ''">{{ tab.label }}</text>
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
import { listMySalonOrders } from '@/pages/mine/order-center/_api/wxmini/salonPay'
import { listMyCourseOrders } from '@/api/wxmini/coursePay'
import { getMyTutoringOrders } from '@/api/wxmini/tutoring'
import { useJobSignupOrderStore } from '@/store'
import {
  ORDER_TYPE_OPTIONS,
  STATUS_FILTER_OPTIONS,
  filterOrdersByStatus,
  filterOrdersByType,
  formatOrderDateTime,
  getEmptyText,
  getStatusLabel,
  isDisplayableOrderStatus,
  mapJobStatus,
  mapCourseStatus,
  mapSalonStatus,
  mapTutoringStatus,
  resolveOrderCenterInitialFilters,
  sortOrders
} from './orderCenter'

const summaryOptions = ORDER_TYPE_OPTIONS
const statusTabs = STATUS_FILTER_OPTIONS
const activeType = ref('all')
const activeStatus = ref('all')
const loading = ref(false)
const refreshing = ref(false)
const jobList = ref([])
const salonList = ref([])
const courseList = ref([])
const tutoringPackageList = ref([])
const allList = ref([])

const typedList = computed(() => filterOrdersByType(allList.value, activeType.value))

const visibleList = computed(() => filterOrdersByStatus(typedList.value, activeStatus.value))

const summaryCountMap = computed(() => ({
  all: allList.value.length,
  salon: salonList.value.length,
  job: jobList.value.length,
  course: courseList.value.length,
  tutoringPackage: tutoringPackageList.value.length
}))

const emptyText = computed(() => getEmptyText(activeType.value, activeStatus.value))

onLoad((options = {}) => {
  const filters = resolveOrderCenterInitialFilters(options)
  activeType.value = filters.type
  activeStatus.value = filters.status
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

    const [salonRes, courseOrders, tutoringRes] = await Promise.all([
      listMySalonOrders(),
      listMyCourseOrders(),
      getMyTutoringOrders()
    ])

    jobList.value = normalizeJobOrders(jobOrders || []).filter(hasDisplayableStatus)
    salonList.value = normalizeSalonOrders(salonRes.data || []).filter(hasDisplayableStatus)
    courseList.value = normalizeCourseOrders(courseOrders || []).filter(hasDisplayableStatus)
    tutoringPackageList.value = normalizeTutoringPackageOrders(tutoringRes.data || []).filter(hasDisplayableStatus)
    allList.value = sortOrders([...jobList.value, ...salonList.value, ...courseList.value, ...tutoringPackageList.value])
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

function normalizeCourseOrders(list) {
  return sortOrders((list || []).map(item => {
    const statusKey = mapCourseStatus(item.status)
    return {
      id: `course-${item.orderNo}`,
      type: 'course',
      typeLabel: '课程',
      orderNo: item.orderNo,
      title: item.courseName || item.title || item.name,
      amount: item.amount,
      statusKey,
      statusLabel: getStatusLabel(statusKey),
      payTime: item.payTime,
      createTime: item.createTime,
      bizId: item.courseId
    }
  }))
}

function normalizeTutoringPackageOrders(list) {
  return sortOrders((list || []).map(item => ({
    id: `tutoring-package-${item.orderNo}`,
    type: 'tutoringPackage',
    typeLabel: '家教课时包',
    orderNo: item.orderNo,
    title: buildTutoringPackageTitle(item),
    amount: item.amount,
    statusKey: mapTutoringStatus(item.status),
    statusLabel: getStatusLabel(mapTutoringStatus(item.status)),
    payTime: item.payTime,
    createTime: item.createTime,
    bizId: item.orderNo
  })))
}

function buildTutoringPackageTitle(item) {
  const parentName = item.parentName || '家教课时包'
  const tutorName = item.tutorName ? ` · ${item.tutorName}` : ''
  return `${parentName}${tutorName}`
}

function hasDisplayableStatus(item) {
  return isDisplayableOrderStatus(item.statusKey)
}

function statusClass(statusKey) {
  return `status-${statusKey}`
}

function switchType(typeKey) {
  activeType.value = typeKey
}

function switchStatus(statusKey) {
  activeStatus.value = statusKey
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
  if (item.type === 'course') {
    uni.navigateTo({ url: `/pages/growup/course/pay?orderNo=${item.orderNo}` })
    return
  }
  if (item.type === 'tutoringPackage') {
    uni.navigateTo({ url: `/pages/mine/course-package/index?orderNo=${item.orderNo}` })
    return
  }
  uni.navigateTo({ url: `/pages/jobs/detail?id=${item.bizId}` })
}

function formatPrice(val) {
  if (val === null || val === undefined || val === '') return '0.00'
  return Number(val).toFixed(2)
}

const formatDateTime = formatOrderDateTime
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

.summary-row {
  margin-top: 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18rpx 0;
  border-radius: 22rpx;
  transition: all 0.2s ease;
}

.summary-item-active {
  background: rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.18);
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

.type-course {
  background: rgba(168, 85, 247, 0.12);
}

.type-tutoringPackage {
  background: rgba(124, 58, 237, 0.12);
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

.type-course .type-tag-text {
  color: #7e22ce;
}

.type-tutoringPackage .type-tag-text {
  color: #6d28d9;
}

.status-paid {
  background: rgba(34, 197, 94, 0.12);
}

.status-signIn {
  background: rgba(14, 165, 233, 0.12);
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

.status-signIn .status-tag-text {
  color: #0369a1;
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
