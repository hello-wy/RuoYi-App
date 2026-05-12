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
import UniCalendar from '@/uni_modules/uni-calendar/components/uni-calendar/uni-calendar.vue'
import { getMyJobSchedules } from '@/api/wxmini/jobs'

function pad(num) {
  return String(num).padStart(2, '0')
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseDate(date) {
  if (!date) return null
  const parsed = new Date(String(date).replace(/-/g, '/'))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export default {
  components: {
    UniCalendar
  },
  data() {
    const today = new Date()
    return {
      loading: false,
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
    }
  },
  onLoad() {
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
        const res = await getMyJobSchedules()
        this.scheduleList = Array.isArray(res?.data) ? res.data : []
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
