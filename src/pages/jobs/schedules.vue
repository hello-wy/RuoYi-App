<template>
  <scroll-view class="schedule-page" scroll-y>
    <view class="hero-card">
      <view>
        <text class="hero-title">兼职安排日历</text>
        <text class="hero-desc">按日期查看已支付报名岗位的工作安排</text>
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

      <view class="week-row">
        <text v-for="week in weekDays" :key="week" class="week-text">{{ week }}</text>
      </view>

      <view class="day-grid">
        <view
          v-for="day in calendarDays"
          :key="day.key"
          class="day-cell"
          :class="{
            'day-cell-empty': !day.date,
            'day-cell-active': day.date === selectedDate,
            'day-cell-has-dot': day.hasSchedule
          }"
          @click="handleSelectDate(day.date)"
        >
          <text class="day-num" :class="{ muted: !day.currentMonth }">{{ day.label }}</text>
          <view v-if="day.hasSchedule" class="day-dot"></view>
        </view>
      </view>
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
        <view v-for="item in selectedList" :key="item.orderNo || item.jobId" class="schedule-item">
          <view class="item-top">
            <text class="item-title">{{ item.title || '岗位安排' }}</text>
            <text class="item-status">{{ item.status || '已报名' }}</text>
          </view>
          <view class="item-row">
            <uni-icons type="time" size="14" color="#64748b" />
            <text class="item-text">{{ item.workTime || '时段待定' }}</text>
          </view>
          <view class="item-row">
            <uni-icons type="location-filled" size="14" color="#64748b" />
            <text class="item-text">{{ item.location || '地点待定' }}</text>
          </view>
          <view class="item-bottom">
            <text class="salary-text">¥{{ formatAmount(item.salaryDay) }}/天</text>
            <view v-if="item.jobId" class="detail-btn" @click.stop="goJobDetail(item.jobId)">
              <text class="detail-btn-text">查看岗位</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import { getMyJobSchedules } from '@/api/wxmini/jobs'

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

function pad(num) {
  return String(num).padStart(2, '0')
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export default {
  data() {
    return {
      loading: false,
      scheduleList: [],
      selectedDate: '',
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      weekDays
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
    calendarDays() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1)
      const startWeek = firstDay.getDay()
      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate()
      const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate()
      const cells = []

      for (let i = 0; i < startWeek; i++) {
        const day = prevMonthDays - startWeek + i + 1
        const date = new Date(this.currentYear, this.currentMonth - 1, day)
        const value = formatDate(date)
        cells.push(this.createDayCell(value, day, false))
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const value = formatDate(new Date(this.currentYear, this.currentMonth, day))
        cells.push(this.createDayCell(value, day, true))
      }

      const rest = cells.length % 7
      if (rest) {
        const count = 7 - rest
        for (let i = 1; i <= count; i++) {
          const date = new Date(this.currentYear, this.currentMonth + 1, i)
          const value = formatDate(date)
          cells.push(this.createDayCell(value, i, false))
        }
      }

      return cells
    }
  },
  onLoad() {
    const today = formatDate(new Date())
    this.selectedDate = today
    this.loadData()
  },
  methods: {
    createDayCell(date, label, currentMonth) {
      return {
        key: `${date}-${label}`,
        date,
        label,
        currentMonth,
        hasSchedule: Boolean(this.scheduleDateMap[date]?.length)
      }
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getMyJobSchedules()
        this.scheduleList = Array.isArray(res?.data) ? res.data : []
        if (!this.scheduleDateMap[this.selectedDate]) {
          const firstDate = this.scheduleList[0]?.workDate
          if (firstDate) {
            this.selectedDate = firstDate
            const date = new Date(firstDate)
            if (!Number.isNaN(date.getTime())) {
              this.currentYear = date.getFullYear()
              this.currentMonth = date.getMonth()
            }
          }
        }
      } catch (e) {
        this.scheduleList = []
        uni.showToast({ title: '加载安排失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    handleSelectDate(date) {
      if (!date) return
      this.selectedDate = date
    },
    changeMonth(step) {
      const next = new Date(this.currentYear, this.currentMonth + step, 1)
      this.currentYear = next.getFullYear()
      this.currentMonth = next.getMonth()
    },
    formatAmount(value) {
      const num = Number(value || 0)
      return Number.isNaN(num) ? '0.00' : num.toFixed(2)
    },
    goJobDetail(jobId) {
      uni.navigateTo({ url: `/pages/jobs/detail?id=${jobId}` })
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
.week-row,
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

.week-row {
  margin-top: 24rpx;
}

.week-text {
  width: calc(100% / 7);
  text-align: center;
  font-size: 24rpx;
  color: #94a3b8;
}

.day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12rpx;
  margin-top: 18rpx;
}

.day-cell {
  position: relative;
  min-height: 84rpx;
  border-radius: 18rpx;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-cell-active {
  background: #dbeafe;
}

.day-num {
  font-size: 26rpx;
  color: #1e293b;
}

.day-num.muted {
  color: #cbd5e1;
}

.day-dot {
  position: absolute;
  bottom: 10rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #10b981;
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
  gap: 14rpx;
}

.empty-text {
  font-size: 24rpx;
  color: #94a3b8;
}

.schedule-list {
  margin-top: 20rpx;
}

.schedule-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #eef2f7;
}

.schedule-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.item-status {
  font-size: 22rpx;
  color: #2563eb;
  background: #eff6ff;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 14rpx;
}

.item-text {
  font-size: 24rpx;
  color: #475569;
}

.item-bottom {
  margin-top: 18rpx;
}

.salary-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #ef4444;
}

.detail-btn {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: #0f172a;
}

.detail-btn-text {
  font-size: 22rpx;
  color: #fff;
}
</style>
