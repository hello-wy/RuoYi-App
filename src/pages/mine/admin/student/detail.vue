<template>
  <scroll-view class="detail-page" scroll-y>
    <view class="hero-card">
      <text class="hero-name">{{ displayName }}</text>
      <text class="hero-type">{{ getUserTypeText(detail.userType) }}</text>
    </view>

    <view class="tab-card">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </view>
    </view>

    <view v-if="activeTab === 'basic'" class="profile-card">
      <view
        v-for="item in fieldList"
        :key="item.key"
        class="info-row"
        :class="{ 'is-multiline': item.multiline }"
      >
        <text class="info-label">{{ item.label }}</text>
        <text class="info-value" :class="{ multiline: item.multiline }">{{ formatValue(item.value) }}</text>
      </view>
    </view>

    <view v-else-if="activeTab === 'school'" class="school-panel">
      <view v-if="enrollmentLoading" class="state-card">
        <uni-load-more status="loading" />
      </view>
      <view v-else-if="enrollmentError" class="state-card">
        <text class="empty-text">学籍信息加载失败</text>
        <button class="retry-btn" size="mini" @click="loadEnrollmentSummary">重试</button>
      </view>
      <template v-else>
        <view class="school-total-card">
          <view>
            <text class="school-total-label">课程数</text>
            <text class="school-total-value">{{ enrollmentSummary.groups.length }}</text>
          </view>
          <view>
            <text class="school-total-label">剩余学籍数</text>
            <text class="school-total-value blue">{{ enrollmentSummary.remain }}</text>
          </view>
          <view>
            <text class="school-total-label">已分享</text>
            <text class="school-total-value">{{ enrollmentSummary.sharedCount }}</text>
          </view>
        </view>

        <view v-if="enrollmentSummary.groups.length === 0" class="empty-card compact-empty">
          <text class="empty-text">暂无课程</text>
        </view>

        <view v-for="group in enrollmentSummary.groups" :key="group.key" class="school-group-card">
          <view class="school-group-head">
            <view>
              <text class="school-group-title">{{ group.lectureName }}</text>
              <text class="school-group-sub">累计学籍数：{{ group.total }}</text>
            </view>
            <text class="school-group-date">剩余{{ group.remain }}个学籍</text>
          </view>

          <view v-for="item in group.items" :key="item.key" class="school-item-card">
            <view class="school-item-title-row">
              <text class="school-item-title">{{ item.lectureName }}</text>
              <text v-if="item.total === 0" class="zero-badge">暂无学籍</text>
              <button
                v-if="item.availableShareCount > 0 && item.id"
                class="share-mini-btn"
                size="mini"
                @click="handleShareEnrollment(item)"
              >帮学员赠送学籍</button>
            </view>
            <view class="school-item-meta">
              <text>共{{ item.total }}个学籍</text>
              <text>购买时间：{{ formatShortDate(item.createTime || item.lectureTime) }}</text>
            </view>
            <view class="school-item-remain">剩余{{ item.remain }}个学籍，{{ item.availableShareCount }}个可分享</view>
            <view class="school-stats-row">
              <view class="school-stat">
                <text class="school-stat-num">{{ item.usedCount }}</text>
                <text class="school-stat-label">已使用(学籍)</text>
              </view>
              <view class="school-stat divider">
                <text class="school-stat-num">{{ item.sharedCount }}</text>
                <text class="school-stat-label">已分享(学籍)</text>
              </view>
              <view class="school-stat">
                <text class="school-stat-num">{{ item.usedCount }}</text>
                <text class="school-stat-label">已使用(复训名额)</text>
              </view>
            </view>
          </view>
        </view>
      </template>
    </view>

    <view v-else-if="activeTab === 'study'" class="study-panel">
      <view v-if="learningLoading" class="state-card">
        <uni-load-more status="loading" />
      </view>
      <view v-else-if="learningError" class="state-card">
        <text class="empty-text">学习情况加载失败</text>
        <button class="retry-btn" size="mini" @click="loadLearningRecords">重试</button>
      </view>
      <template v-else>
        <view class="record-section">
          <view class="section-head">
            <text class="section-title">报名记录({{ enrollmentRecords.length }}条)</text>
          </view>
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
          <view class="section-head">
            <text class="section-title">签到记录({{ signInRecords.length }}条)</text>
          </view>
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

    <view v-else-if="activeTab === 'situation'" class="situation-card">
      <text class="situation-title">学员情况</text>
      <textarea
        v-model="situationDraft"
        class="situation-textarea"
        maxlength="1000"
        placeholder="请输入学员学习情况、沟通记录、注意事项等"
        placeholder-class="situation-placeholder"
        :disabled="savingSituation"
        auto-height
      />
      <view class="situation-footer">
        <text class="situation-count">{{ situationDraft.length }}/1000</text>
        <button
          class="save-btn"
          :loading="savingSituation"
          :disabled="savingSituation"
          @click="handleSaveSituation"
        >
          保存
        </button>
      </view>
    </view>

    <view v-else class="empty-card">
      <text class="empty-text">暂无内容</text>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  getStudentDetail,
  getStudentEnrollments,
  getStudentLearningRecords,
  listStudents,
  shareStudentEnrollment,
  updateStudentSituation
} from '@/pages/mine/admin/_api/system/student'
import { requireAdminAccess } from '../access'
import {
  buildProfileFields,
  formatShortDate,
  getDisplayName,
  getUserTypeText,
  normalizeEnrollmentSummary
} from './helpers'

const { proxy } = getCurrentInstance()
const detail = ref({})
const studentId = ref('')
const activeTab = ref('basic')
const situationDraft = ref('')
const savingSituation = ref(false)
const learningLoaded = ref(false)
const learningLoading = ref(false)
const learningError = ref(false)
const enrollmentLoaded = ref(false)
const enrollmentLoading = ref(false)
const enrollmentError = ref(false)
const enrollmentSummary = ref(normalizeEnrollmentSummary())
const enrollmentRecords = ref([])
const signInRecords = ref([])
const tabs = [
  { key: 'basic', label: '基本信息' },
  { key: 'school', label: '学籍信息' },
  { key: 'study', label: '学习情况' },
  { key: 'visit', label: '学员回访' },
  { key: 'profit', label: '盈利问卷' },
  { key: 'situation', label: '学员情况' }
]

const displayName = computed(() => getDisplayName(detail.value))
const fieldList = computed(() => buildProfileFields(detail.value))

async function loadDetail(id) {
  try {
    const res = await getStudentDetail(id)
    detail.value = res.data || {}
    situationDraft.value = detail.value.studentSituation || ''
  } catch (error) {
    uni.showToast({ title: error?.msg || error?.message || '学员详情不存在', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack({ delta: 1 })
    }, 600)
  }
}

async function loadLearningRecords() {
  if (!studentId.value || learningLoading.value) return
  learningLoading.value = true
  learningError.value = false
  try {
    const records = await getStudentLearningRecords(studentId.value)
    enrollmentRecords.value = records.enrollmentRecords || []
    signInRecords.value = records.signInRecords || []
    learningLoaded.value = true
  } catch (error) {
    learningError.value = true
  } finally {
    learningLoading.value = false
  }
}

async function loadEnrollmentSummary() {
  if (!studentId.value || enrollmentLoading.value) return
  enrollmentLoading.value = true
  enrollmentError.value = false
  try {
    const data = await getStudentEnrollments(studentId.value)
    enrollmentSummary.value = normalizeEnrollmentSummary(data)
    enrollmentLoaded.value = true
  } catch (error) {
    enrollmentError.value = true
  } finally {
    enrollmentLoading.value = false
  }
}

async function handleShareEnrollment(item = {}) {
  if (!item.availableShareCount) return
  try {
    const targetUid = await chooseShareTarget()
    if (!targetUid) return
    if (String(targetUid) === String(studentId.value)) {
      uni.showToast({ title: '不能分享给当前学员', icon: 'none' })
      return
    }
    await shareStudentEnrollment({
      sourceUid: Number(studentId.value),
      targetUid: Number(targetUid),
      lectureId: item.lectureId,
      count: 1
    })
    uni.showToast({ title: '分享成功', icon: 'success' })
    enrollmentLoaded.value = false
    loadEnrollmentSummary()
  } catch (error) {
    if (error?.cancel) return
    uni.showToast({ title: error?.msg || '分享失败', icon: 'none' })
  }
}

async function chooseShareTarget() {
  const res = await listStudents({ pageNum: 1, pageSize: 20 })
  const rows = res.rows || res.data?.rows || []
  const candidates = rows.filter((item) => String(item.id) !== String(studentId.value)).slice(0, 6)
  if (candidates.length === 0) {
    uni.showToast({ title: '暂无可分享学员', icon: 'none' })
    return ''
  }
  const itemList = candidates.map((item) => item.displayName || item.realName || item.userName || `学员${item.id}`)
  const selected = await new Promise((resolve, reject) => {
    uni.showActionSheet({
      itemList,
      success: ({ tapIndex }) => resolve(candidates[tapIndex]?.id),
      fail: () => reject({ cancel: true })
    })
  })
  return selected
}

async function handleSaveSituation() {
  if (!studentId.value || savingSituation.value) {
    return
  }
  const studentSituation = situationDraft.value.trim()
  if (studentSituation.length > 1000) {
    uni.showToast({ title: '学员情况不能超过1000字', icon: 'none' })
    return
  }
  savingSituation.value = true
  try {
    const res = await updateStudentSituation(studentId.value, { studentSituation })
    const savedSituation = res.data?.studentSituation ?? studentSituation
    detail.value = {
      ...detail.value,
      studentSituation: savedSituation
    }
    situationDraft.value = savedSituation
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.msg || '保存失败', icon: 'none' })
  } finally {
    savingSituation.value = false
  }
}

function switchTab(key) {
  activeTab.value = key
  if (key === 'school' && !enrollmentLoaded.value) {
    loadEnrollmentSummary()
  }
  if (key === 'study' && !learningLoaded.value) {
    loadLearningRecords()
  }
}

function getCourseOrderStatusText(status) {
  if (status === 0) return '待支付'
  if (status === 1) return '待签到'
  if (status === 2) return '已签到'
  if (status === 3) return '已退款'
  if (status === 4) return '已取消'
  return '未知'
}

function getSignInStatusText(item = {}) {
  if (item.recordType === 1) {
    if (item.signStatus === 0) return '待签到'
    if (item.signStatus === 1) return '已签到'
    if (item.signStatus === 2) return '迟到'
    if (item.signStatus === 3) return '已取消'
  }
  return getCourseOrderStatusText(item.status)
}

function formatValue(value) {
  return value === null || value === undefined || value === '' ? '--' : value
}

onLoad((options) => {
  if (!requireAdminAccess(proxy)) {
    return
  }
  if (!options?.id) {
    uni.showToast({ title: '学员参数缺失', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack({ delta: 1 })
    }, 600)
    return
  }
  studentId.value = options.id
  loadDetail(options.id)
})
</script>

<style lang="scss" scoped src="./detail.scss"></style>
