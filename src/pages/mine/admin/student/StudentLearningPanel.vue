<template>
  <view class="panel">
    <view v-if="loading" class="state-card"><uni-load-more status="loading" /></view>
    <view v-else-if="loadError" class="state-card">
      <text class="empty-text">学习情况加载失败</text>
      <button class="retry-btn" size="mini" @click="loadRecords">重试</button>
    </view>
    <template v-else>
      <view class="record-section">
        <text class="section-title">报名记录({{ enrollmentRecords.length }}条)</text>
        <view v-if="enrollmentRecords.length === 0" class="record-empty">暂无报名记录</view>
        <view v-for="item in enrollmentRecords" :key="item.id" class="record-card">
          <view class="record-main">
            <text class="record-title">{{ item.courseName }}</text>
            <text class="record-status">{{ getCourseOrderStatusText(item.status) }}</text>
          </view>
          <view class="record-line">订单号：{{ formatValue(item.orderNo) }}</view>
          <view class="record-line">报名时间：{{ formatValue(item.createTime || item.payTime) }}</view>
          <view class="record-line">课程时间：{{ formatValue(item.courseTime) }}</view>
          <view class="record-line">课程地点：{{ formatValue(item.courseLocation) }}</view>
        </view>
      </view>
      <view class="record-section">
        <text class="section-title">签到记录({{ signInRecords.length }}条)</text>
        <view v-if="signInRecords.length === 0" class="record-empty">暂无签到记录</view>
        <view v-for="item in signInRecords" :key="item.id" class="record-card">
          <view class="record-main">
            <text class="record-title">{{ item.courseName }}</text>
            <text class="record-status signed">{{ getSignInStatusText(item) }}</text>
          </view>
          <view class="record-line">订单号：{{ formatValue(item.orderNo) }}</view>
          <view class="record-line">签到时间：{{ formatValue(item.signTime) }}</view>
          <view class="record-line">课程时间：{{ formatValue(item.courseTime) }}</view>
          <view class="record-line">课程地点：{{ formatValue(item.courseLocation) }}</view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getStudentLearningRecords } from '@/pages/mine/admin/_api/system/student'

defineOptions({ name: 'StudentLearningPanel' })

const props = defineProps({ studentId: { type: [Number, String], required: true } })
const loading = ref(false)
const loadError = ref(false)
const enrollmentRecords = ref([])
const signInRecords = ref([])

async function loadRecords() {
  if (loading.value) return
  loading.value = true
  loadError.value = false
  try {
    const records = await getStudentLearningRecords(props.studentId)
    enrollmentRecords.value = records.enrollmentRecords || []
    signInRecords.value = records.signInRecords || []
  } catch (error) {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function getCourseOrderStatusText(status) {
  const statusMap = { 0: '待支付', 1: '已报名', 2: '已签到', 3: '已退款', 4: '已取消' }
  return statusMap[status] || '未知'
}

function getSignInStatusText(item = {}) {
  const signInMap = { 0: '待签到', 1: '已签到', 2: '迟到', 3: '已取消' }
  return item.recordType === 1 ? signInMap[item.signStatus] || '未知' : getCourseOrderStatusText(item.status)
}

function formatValue(value) {
  return value === null || value === undefined || value === '' ? '--' : value
}

onMounted(loadRecords)
</script>

<style lang="scss" scoped>
.panel { margin-top: 20rpx; }
.record-section,
.state-card { padding: 28rpx; border-radius: 28rpx; background: #fff; box-shadow: 0 12rpx 36rpx rgba(15, 23, 42, .06); }
.record-section + .record-section { margin-top: 20rpx; }
.section-title { display: block; margin-bottom: 20rpx; font-size: 32rpx; font-weight: 700; color: #201c34; }
.record-empty { padding: 36rpx 0; text-align: center; font-size: 26rpx; color: #94a3b8; }
.record-card { padding: 24rpx 0; border-top: 1rpx solid #f0edf9; }
.record-card:first-of-type { border-top: 0; }
.record-main { display: flex; align-items: flex-start; justify-content: space-between; gap: 20rpx; margin-bottom: 12rpx; }
.record-title { flex: 1; font-size: 30rpx; font-weight: 600; line-height: 1.5; color: #201c34; }
.record-status { flex: none; padding: 6rpx 14rpx; border-radius: 999rpx; background: #eef2ff; font-size: 22rpx; color: #5b4fd8; }
.record-status.signed { background: #ecfdf5; color: #059669; }
.record-line { margin-top: 8rpx; font-size: 26rpx; line-height: 1.5; word-break: break-all; color: #64748b; }
.state-card { display: flex; flex-direction: column; align-items: center; gap: 20rpx; }
.empty-text { font-size: 28rpx; color: #94a3b8; }
.retry-btn { border-radius: 999rpx; background: #7c6cff; color: #fff; }
</style>
