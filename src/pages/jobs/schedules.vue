<template>
  <scroll-view class="schedule-page" scroll-y>
    <view class="hero-card">
      <view>
        <text class="hero-title">我的安排日历</text>
        <text class="hero-desc">同时查看兼职安排与家教安排，按日期处理签到与确认</text>
      </view>
      <view class="hero-count">
        <text class="hero-count-num">{{ scheduleList.length }}</text>
        <text class="hero-count-label">条安排</text>
      </view>
    </view>

    <view class="calendar-card">
      <view class="calendar-head">
        <view class="month-switch" @click="changeMonth(-1)">
          <uni-icons type="left" size="16" color="#475569" />
        </view>
        <text class="calendar-title">{{ currentYear }}年{{ currentMonth + 1 }}月</text>
        <view class="month-switch" @click="changeMonth(1)">
          <uni-icons type="right" size="16" color="#475569" />
        </view>
      </view>

      <uni-calendar
        ref="scheduleCalendar"
        :insert="true"
        :lunar="false"
        :show-month="false"
        :date="selectedDate"
        :selected="calendarSelected"
        @change="handleCalendarChange"
        @monthSwitch="handleMonthSwitch"
      />
    </view>

    <view class="list-card">
      <view class="list-head">
        <text class="list-title">{{ selectedDate || '请选择日期' }}</text>
        <text class="list-subtitle">当天安排</text>
      </view>

      <view v-if="loading" class="state-wrap">
        <uni-load-more status="loading"></uni-load-more>
      </view>

      <view v-else-if="selectedList.length === 0" class="state-wrap empty-wrap">
        <uni-icons type="calendar" size="40" color="#cbd5e1" />
        <text class="empty-text">当天暂无安排</text>
      </view>

      <view v-else class="schedule-list">
        <view v-for="item in selectedList" :key="item.uniqueKey" class="schedule-item" :class="`schedule-item-${item.type}`">
          <view class="item-top">
            <view class="item-title-group">
              <text class="item-title">{{ item.title || (item.type === 'tutoring' ? '家教安排' : '岗位安排') }}</text>
              <text class="type-tag" :class="item.type">{{ item.typeLabel }}</text>
            </view>
            <text class="audit-tag" :class="getStatusTag(item).type">{{ getStatusTag(item).label }}</text>
          </view>
          <view class="item-row">
            <uni-icons type="time" size="14" color="#64748b" />
            <text class="item-text">{{ item.workTime || '时段待定' }}</text>
          </view>
          <view class="item-row">
            <uni-icons type="location-filled" size="14" color="#64748b" />
            <text class="item-text">{{ item.location || '地点待定' }}</text>
          </view>
          <view class="item-row" v-if="item.type === 'job'">
            <uni-icons type="checkbox-filled" size="14" color="#64748b" />
            <text class="item-text">签到状态：{{ item.attendanceStatusLabel || '未签到' }}</text>
          </view>
          <view class="item-row" v-else>
            <uni-icons type="person-filled" size="14" color="#64748b" />
            <text class="item-text">陪伴官：{{ item.tutorName || '待分配' }}</text>
          </view>
          <view v-if="getRejectReason(item)" class="reject-reason">
            驳回原因：{{ getRejectReason(item) }}
          </view>
          <view class="item-bottom item-actions">
            <text class="salary-text">{{ getAmountText(item) }}</text>
            <view class="action-buttons">
              <view v-if="item.type === 'job' && item.jobId" class="ghost-btn" @click.stop="goJobDetail(item.jobId)">
                <text class="ghost-btn-text">查看岗位</text>
              </view>
              <view v-if="item.type === 'job' && canUpload(item)" class="detail-btn" @click.stop="goSignUpload(item)">
                <text class="detail-btn-text">{{ item.auditStatus === 3 ? '重新上传' : '上传签到图' }}</text>
              </view>
              <view v-if="item.type === 'tutoring' && canStudentCheckIn(item)" class="detail-btn" @click.stop="handleStudentCheckIn(item)">
                <text class="detail-btn-text">上课签到</text>
              </view>
              <view v-if="item.type === 'tutoring' && canParentConfirm(item)" class="detail-btn warning-btn" @click.stop="handleParentConfirm(item)">
                <text class="detail-btn-text">上课完成</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import UniCalendar from '@/uni_modules/uni-calendar/components/uni-calendar/uni-calendar.vue'
import { getMyJobSchedules } from '@/pages/jobs/_api/wxmini/jobs'
import {
  getMyTutoringSchedules,
  submitParentScheduleComplete,
  submitStudentScheduleCheckIn,
} from '@/api/wxmini/tutoring'
import { useUserStore } from '@/store/modules/user'
import {
  buildAttendanceAuditStatus,
  buildTutoringScheduleStatus,
  canParentConfirmTutoringSchedule,
  canStudentCheckInTutoringSchedule,
  canUploadAttendanceImage,
  getAttendanceRejectReason
} from './schedules.helpers'

function pad(num) {
  return String(num).padStart(2, '0')
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseDate(date) {
  if (!date) return null
  const normalized = String(date).slice(0, 10)
  const parsed = new Date(normalized.replace(/-/g, '/'))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function normalizeScheduleDate(date) {
  return String(date || '').slice(0, 10)
}

function formatAmount(value) {
  const num = Number(value || 0)
  return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}

function normalizeJobSchedule(item = {}) {
  return {
    ...item,
    uniqueKey: `job-${item.orderNo || item.jobId || item.workDate || Math.random()}`,
    type: 'job',
    typeLabel: '兼职',
    workDate: normalizeScheduleDate(item.workDate),
  }
}

function normalizeTutoringSchedule(item = {}) {
  return {
    ...item,
    uniqueKey: `tutoring-${item.orderNo || item.id || item.workDate || Math.random()}`,
    type: 'tutoring',
    typeLabel: '家教',
    workDate: normalizeScheduleDate(item.workDate),
  }
}

export default {
  components: {
    UniCalendar
  },
  data() {
    const today = new Date()
    return {
      loading: false,
      actionLoading: false,
      scheduleList: [],
      selectedDate: formatDate(today),
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth()
    }
  },
  computed: {
    scheduleDateMap() {
      return this.scheduleList.reduce((map, item) => {
        const date = item.workDate || ''
        if (!date) return map
        if (!map[date]) {
          map[date] = []
        }
        map[date].push(item)
        return map
      }, {})
    },
    selectedList() {
      return this.scheduleDateMap[this.selectedDate] || []
    },
    calendarSelected() {
      const added = new Set()
      return this.scheduleList.reduce((list, item) => {
        const date = item.workDate || ''
        if (!date || added.has(date)) return list
        added.add(date)
        list.push({
          date,
          info: '',
          data: item
        })
        return list
      }, [])
    },
    userType() {
      return useUserStore().userType
    }
  },
  onLoad() {
    this.loadData()
  },
  onShow() {
    this.loadData()
  },
  methods: {
    syncCurrentMonth(date) {
      const parsed = parseDate(date)
      if (!parsed) return
      this.currentYear = parsed.getFullYear()
      this.currentMonth = parsed.getMonth()
    },
    resolveMonthSelectedDate(year, monthIndex) {
      const today = new Date()
      if (today.getFullYear() === year && today.getMonth() === monthIndex) {
        return formatDate(today)
      }
      return formatDate(new Date(year, monthIndex, 1))
    },
    async loadData() {
      this.loading = true
      try {
        const [jobRes, tutoringRes] = await Promise.all([
          getMyJobSchedules(),
          getMyTutoringSchedules().catch(() => ({ data: [] }))
        ])
        const jobList = Array.isArray(jobRes?.data) ? jobRes.data.map(normalizeJobSchedule) : []
        const tutoringList = Array.isArray(tutoringRes?.data) ? tutoringRes.data.map(normalizeTutoringSchedule) : []
        this.scheduleList = [...jobList, ...tutoringList].sort((a, b) => {
          const dateCompare = String(a.workDate || '').localeCompare(String(b.workDate || ''))
          if (dateCompare !== 0) return dateCompare
          return String(a.workTime || '').localeCompare(String(b.workTime || ''))
        })
        if (!this.scheduleDateMap[this.selectedDate]) {
          const firstDate = this.scheduleList[0]?.workDate
          if (firstDate) {
            this.selectedDate = firstDate
            this.syncCurrentMonth(firstDate)
          }
        }
      } catch (e) {
        this.scheduleList = []
        uni.showToast({ title: '加载安排失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    handleCalendarChange(event) {
      const date = event?.fulldate || ''
      if (!date) return
      this.selectedDate = date
      this.syncCurrentMonth(date)
    },
    handleMonthSwitch({ year, month }) {
      const nextYear = Number(year)
      const nextMonth = Number(month) - 1
      if (Number.isNaN(nextYear) || Number.isNaN(nextMonth)) return
      this.currentYear = nextYear
      this.currentMonth = nextMonth
      this.selectedDate = this.resolveMonthSelectedDate(nextYear, nextMonth)
    },
    changeMonth(step) {
      const calendar = this.$refs.scheduleCalendar
      if (calendar && typeof calendar.pre === 'function' && typeof calendar.next === 'function') {
        if (step < 0) {
          calendar.pre()
        } else {
          calendar.next()
        }
        return
      }
      const next = new Date(this.currentYear, this.currentMonth + step, 1)
      this.currentYear = next.getFullYear()
      this.currentMonth = next.getMonth()
      this.selectedDate = this.resolveMonthSelectedDate(this.currentYear, this.currentMonth)
    },
    getStatusTag(item) {
      return item.type === 'tutoring' ? buildTutoringScheduleStatus(item) : buildAttendanceAuditStatus(item)
    },
    canUpload(item) {
      return item.type === 'job' && canUploadAttendanceImage(item)
    },
    getRejectReason(item) {
      return item.type === 'job' ? getAttendanceRejectReason(item) : ''
    },
    getAmountText(item) {
      if (item.type === 'job') {
        return `¥${formatAmount(item.salaryDay)}/天`
      }
      return `¥${formatAmount(item.amount)}`
    },
    canStudentCheckIn(item) {
      if (item.type !== 'tutoring') return false
      return canStudentCheckInTutoringSchedule(item, this.userType)
    },
    canParentConfirm(item) {
      if (item.type !== 'tutoring') return false
      return canParentConfirmTutoringSchedule(item, this.userType)
    },
    goJobDetail(jobId) {
      uni.navigateTo({ url: `/pages/jobs/detail?id=${jobId}` })
    },
    goSignUpload(item) {
      const title = encodeURIComponent(item.title || '')
      const workDate = encodeURIComponent(item.workDate || '')
      const orderNo = encodeURIComponent(item.orderNo || '')
      uni.navigateTo({
        url: `/pages/jobs/sign-upload?jobId=${item.jobId}&orderNo=${orderNo}&title=${title}&workDate=${workDate}`
      })
    },
    async handleStudentCheckIn(item) {
      if (this.actionLoading || !item.id) return
      this.actionLoading = true
      try {
        await submitStudentScheduleCheckIn(item.id)
        uni.showToast({ title: '上课签到成功', icon: 'success' })
        await this.loadData()
      } catch (e) {
        uni.showToast({ title: e?.msg || '操作失败，请重试', icon: 'none' })
      } finally {
        this.actionLoading = false
      }
    },
    handleParentConfirm(item) {
      if (this.actionLoading || !item.id) return
      uni.showModal({
        title: '上课完成',
        content: '确认上课完成后，管理员需要进行审核。确定现在提交吗？',
        success: async ({ confirm }) => {
          if (!confirm) return
          this.actionLoading = true
          try {
            await submitParentScheduleComplete(item.id)
            uni.showToast({ title: '已提交上课完成', icon: 'success' })
            await this.loadData()
          } catch (e) {
            uni.showToast({ title: e?.msg || '操作失败，请重试', icon: 'none' })
          } finally {
            this.actionLoading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
page {
  background: #f5f7fb;
}

.schedule-page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.hero-card,
.calendar-card,
.list-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05);
}

.hero-card {
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #eff6ff 0%, #eefcf6 100%);
}

.hero-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #0f172a;
}

.hero-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #64748b;
}

.hero-count {
  min-width: 148rpx;
  text-align: center;
}

.hero-count-num {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #2563eb;
}

.hero-count-label {
  font-size: 22rpx;
  color: #64748b;
}

.calendar-card {
  margin-bottom: 24rpx;
}

.calendar-head,
.item-top,
.item-bottom,
.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.month-switch {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.uni-calendar) {
  margin-top: 24rpx;
}

:deep(.uni-calendar__header) {
  display: none !important;
}

:deep(.uni-calendar__box) {
  border: none;
}

:deep(.uni-calendar__weeks-day) {
  height: auto;
  padding: 0 0 12rpx;
  border-bottom: none;
}

:deep(.uni-calendar__weeks-day-text) {
  font-size: 24rpx;
  color: #94a3b8;
}

:deep(.uni-calendar__weeks) {
  margin-top: 6rpx;
  overflow: hidden;
}

:deep(.uni-calendar__weeks:first-child) {
  margin-top: 0;
}

:deep(.uni-calendar__weeks-item) {
  min-width: 0;
  padding: 2rpx 2rpx;
  box-sizing: border-box;
}

:deep(.uni-calendar-item__weeks-box) {
  min-height: 60rpx;
}

:deep(.uni-calendar-item__weeks-box-item) {
  width: auto;
  max-width: 100%;
  min-height: 60rpx;
  height: 60rpx;
  border-radius: 14rpx;
  background: #f8fafc;
}

:deep(.uni-calendar-item__weeks-box-text) {
  font-size: 24rpx;
  color: #1e293b;
}

:deep(.uni-calendar-item__weeks-lunar-text) {
  display: none;
}

:deep(.uni-calendar-item__weeks-box-circle) {
  top: auto;
  right: auto;
  bottom: 8rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #10b981;
}

:deep(.uni-calendar-item--disable) {
  background: transparent;
}

:deep(.uni-calendar-item--disable .uni-calendar-item__weeks-box-item) {
  background: #f8fafc;
}

:deep(.uni-calendar-item--disable .uni-calendar-item__weeks-box-text) {
  color: #cbd5e1;
}

:deep(.uni-calendar-item--checked),
:deep(.uni-calendar-item--isDay) {
  background: transparent !important;
  opacity: 1;
  color: inherit;
}

:deep(.uni-calendar-item--checked .uni-calendar-item__weeks-box-item),
:deep(.uni-calendar-item--isDay .uni-calendar-item__weeks-box-item) {
  background: #dbeafe;
}

:deep(.uni-calendar-item--checked .uni-calendar-item__weeks-box-text),
:deep(.uni-calendar-item--isDay .uni-calendar-item__weeks-box-text),
:deep(.uni-calendar-item--isDay-text) {
  color: #2563eb !important;
}

.list-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.list-subtitle {
  font-size: 24rpx;
  color: #64748b;
}

.state-wrap {
  padding: 48rpx 0;
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #94a3b8;
}

.schedule-list {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.schedule-item {
  border-radius: 22rpx;
  background: #f8fafc;
  padding: 24rpx;
}

.schedule-item-tutoring {
  border: 1px solid #dbeafe;
}

.item-title-group {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.item-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.type-tag,
.audit-tag {
  font-size: 22rpx;
  padding: 8rpx 18rpx;
  border-radius: 15rpx;
}

.type-tag.job {
  color: #2563eb;
  background: #dbeafe;
}

.type-tag.tutoring {
  color: #7c3aed;
  background: #ede9fe;
}

.audit-tag.empty {
  color: #94a3b8;
  background: #e2e8f0;
}

.audit-tag.pending {
  color: #d97706;
  background: #fef3c7;
}

.audit-tag.approved {
  color: #16a34a;
  background: #dcfce7;
}

.audit-tag.rejected {
  color: #dc2626;
  background: #fee2e2;
}

.audit-tag.warning {
  color: #b45309;
  background: #fde68a;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 14rpx;
}

.item-text {
  font-size: 24rpx;
  color: #475569;
}

.reject-reason {
  margin-top: 16rpx;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 24rpx;
}

.item-actions {
  margin-top: 20rpx;
}

.salary-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #dc2626;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ghost-btn,
.detail-btn {
  min-width: 136rpx;
  height: 60rpx;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ghost-btn {
  background: #e2e8f0;
}

.ghost-btn-text {
  font-size: 24rpx;
  color: #475569;
}

.detail-btn {
  background: #0f172a;
}

.warning-btn {
  background: #b45309;
}

.detail-btn-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
}
</style>
