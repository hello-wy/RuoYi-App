<template>
  <view class="panel">
    <view v-if="loading" class="state-card"><uni-load-more status="loading" /></view>
    <view v-else-if="loadError" class="state-card">
      <text class="empty-text">学籍信息加载失败</text>
      <button class="retry-btn" size="mini" @click="loadEnrollments">重试</button>
    </view>
    <template v-else>
      <view class="total-card">
        <view><text class="total-label">课程数</text><text class="total-value">{{ summary.groups.length }}</text></view>
        <view><text class="total-label">剩余学籍数</text><text class="total-value blue">{{ summary.remain }}</text></view>
        <view><text class="total-label">已分享</text><text class="total-value">{{ summary.sharedCount }}</text></view>
      </view>
      <view v-if="summary.groups.length === 0" class="empty-card"><text class="empty-text">暂无课程</text></view>
      <view v-for="group in summary.groups" :key="group.key" class="group-card">
        <view class="group-head"><view><text class="group-title">{{ group.lectureName }}</text><text class="group-sub">累计学籍数：{{ group.total }}</text></view><text class="group-sub">剩余{{ group.remain }}个学籍</text></view>
        <view v-for="item in group.items" :key="item.key" class="item-card">
          <view class="item-title-row"><text class="item-title">{{ item.lectureName }}</text><button v-if="item.availableShareCount > 0 && item.id" class="share-btn" size="mini" @click="shareEnrollment(item)">帮学员赠送学籍</button></view>
          <view class="item-meta"><text>共{{ item.total }}个学籍</text><text>购买时间：{{ formatShortDate(item.createTime || item.lectureTime) }}</text></view>
          <view class="item-remain">剩余{{ item.remain }}个学籍，{{ item.availableShareCount }}个可分享</view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getStudentEnrollments, listStudents, shareStudentEnrollment } from '@/pages/mine/admin/_api/system/student'
import { formatShortDate, normalizeEnrollmentSummary } from './helpers'

defineOptions({ name: 'StudentEnrollmentPanel' })

const props = defineProps({ studentId: { type: [Number, String], required: true } })
const loading = ref(false)
const loadError = ref(false)
const summary = ref(normalizeEnrollmentSummary())

async function loadEnrollments() {
  if (loading.value) return
  loading.value = true
  loadError.value = false
  try {
    summary.value = normalizeEnrollmentSummary(await getStudentEnrollments(props.studentId))
  } catch (error) {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

async function shareEnrollment(item = {}) {
  try {
    const targetUid = await chooseShareTarget()
    if (!targetUid) return
    if (String(targetUid) === String(props.studentId)) {
      uni.showToast({ title: '不能分享给当前学员', icon: 'none' })
      return
    }
    await shareStudentEnrollment({ sourceUid: Number(props.studentId), targetUid: Number(targetUid), lectureId: item.lectureId, count: 1 })
    uni.showToast({ title: '分享成功', icon: 'success' })
    loadEnrollments()
  } catch (error) {
    if (!error?.cancel) uni.showToast({ title: error?.msg || '分享失败', icon: 'none' })
  }
}

async function chooseShareTarget() {
  const res = await listStudents({ pageNum: 1, pageSize: 20 })
  const candidates = (res.rows || []).filter((item) => String(item.id) !== String(props.studentId)).slice(0, 6)
  if (candidates.length === 0) {
    uni.showToast({ title: '暂无可分享学员', icon: 'none' })
    return ''
  }
  return new Promise((resolve, reject) => {
    uni.showActionSheet({
      itemList: candidates.map((item) => item.displayName || item.realName || item.userName || `学员${item.id}`),
      success: ({ tapIndex }) => resolve(candidates[tapIndex]?.id),
      fail: () => reject({ cancel: true })
    })
  })
}

onMounted(loadEnrollments)
</script>

<style lang="scss" scoped>
.panel { margin-top: 20rpx; }
.state-card, .total-card, .empty-card, .group-card { border-radius: 22rpx; box-shadow: 0 12rpx 36rpx rgba(15, 23, 42, .06); }
.state-card, .empty-card { padding: 48rpx 28rpx; display: flex; flex-direction: column; align-items: center; gap: 20rpx; background: #fff; }
.total-card { display: flex; justify-content: space-between; padding: 24rpx 28rpx; background: linear-gradient(135deg, #edeaff 0%, #f7f9ff 100%); }
.total-label, .total-value, .group-title, .group-sub { display: block; }
.total-label, .group-sub, .item-meta { font-size: 24rpx; color: #7c74ae; }
.total-value { margin-top: 10rpx; font-size: 36rpx; font-weight: 700; color: #4019b8; }
.total-value.blue, .item-remain { color: #2395df; }
.empty-card, .group-card { margin-top: 20rpx; }
.group-card { overflow: hidden; background: #fff; }
.group-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16rpx; padding: 22rpx 28rpx; background: #e7e6ff; }
.group-title { font-size: 30rpx; font-weight: 700; color: #4019b8; }
.group-sub { margin-top: 10rpx; }
.item-card { padding: 28rpx; border-top: 1rpx solid #f0edf9; }
.item-title-row { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.item-title { flex: 1; font-size: 32rpx; font-weight: 700; color: #201c34; }
.share-btn { flex: none; height: 52rpx; margin: 0; padding: 0 18rpx; border: 1rpx solid #c7bfff; border-radius: 999rpx; background: #fff; font-size: 22rpx; line-height: 52rpx; color: #6b4fe8; }
.item-meta { display: flex; justify-content: space-between; gap: 18rpx; margin-top: 22rpx; }
.item-remain { margin-top: 14rpx; text-align: right; font-size: 26rpx; font-weight: 600; }
.empty-text { font-size: 28rpx; color: #94a3b8; }
.retry-btn { border-radius: 999rpx; background: #7c6cff; color: #fff; }
</style>
