<template>
  <scroll-view class="page" scroll-y>
    <view v-if="blocked" class="state-card">
      <uni-icons type="locked-filled" size="42" color="#94a3b8" />
      <text class="state-title">仅商家可查看</text>
      <text class="state-desc">请先切换为商家身份</text>
      <view class="state-btn" @click="goGuide"><text>切换身份</text></view>
    </view>

    <template v-else>
      <view class="hero-card">
        <view>
          <text class="hero-title">兼职日结查询</text>
          <text class="hero-desc">查看已支付报名人员并发起工资支付</text>
        </view>
        <view class="hero-count">
          <text class="hero-count-num">{{ jobs.length }}</text>
          <text class="hero-count-label">个岗位</text>
        </view>
      </view>

      <view v-if="loading" class="state-card">
        <uni-load-more status="loading"></uni-load-more>
      </view>

      <view v-else-if="jobs.length === 0" class="state-card">
        <uni-icons type="briefcase" size="42" color="#cbd5e1" />
        <text class="state-title">暂无发布岗位</text>
      </view>

      <view v-else class="job-list">
        <view v-for="job in jobs" :key="job.id" class="job-card">
          <view class="job-head" @click="toggleJob(job)">
            <view class="job-main">
              <view class="job-title-row">
                <text class="job-title">{{ job.title }}</text>
                <text class="status-tag" :class="getJobStatusClass(job.status)">{{ getJobStatusLabel(job.status) }}</text>
                <text v-if="job.settlementStatus !== 'NONE'" class="remind-tag" :class="{ settled: job.settlementStatus === 'SETTLED' }">{{ job.settlementStatusLabel }}</text>
              </view>
              <text class="job-meta">{{ formatDate(job.workDate) }} · {{ job.workTime || '时段待定' }}</text>
              <text class="job-location">{{ job.location || '地点待定' }}</text>
            </view>
            <view class="job-side">
              <text class="job-salary">¥{{ formatAmount(job.salaryDay) }}</text>
              <text class="job-signup">{{ job.paidSignupCount || 0 }}/{{ job.signupLimit || '-' }}人</text>
            </view>
          </view>

          <view v-if="activeJobId === job.id" class="signup-panel">
            <view class="panel-head panel-head-actions">
              <text class="panel-title">已支付报名人员</text>
              <view class="panel-actions">
                <view v-if="job.canCancel" class="ghost-btn danger" @click.stop="changeJobStatus(job, 3)">
                  <text class="ghost-btn-text">取消招聘</text>
                </view>
                <view v-if="job.canResumeRecruiting" class="ghost-btn" @click.stop="changeJobStatus(job, 0)">
                  <text class="ghost-btn-text">恢复招聘</text>
                </view>
                <view class="payroll-btn" :class="{ disabled: !job.canSettle }" @click="goPayroll(job)">
                  <text class="payroll-btn-text">生成账单</text>
                </view>
              </view>
            </view>

            <view v-if="usersLoading" class="inner-state">
              <uni-load-more status="loading"></uni-load-more>
            </view>
            <view v-else-if="signupUsers.length === 0" class="inner-state">
              <text class="empty-text">暂无已支付报名人员</text>
            </view>
            <view v-else class="user-list">
              <view v-for="user in signupUsers" :key="user.userInfoId" class="user-item">
                <view class="avatar"><text>{{ avatarText(user.displayName) }}</text></view>
                <view class="user-info">
                  <text class="user-name">{{ user.displayName || '未命名用户' }}</text>
                  <text class="user-phone">{{ user.phoneMasked || '未提供手机号' }}</text>
                </view>
                <view class="user-right">
                  <text v-if="user.payrollPaid" class="paid-tag">已支付</text>
                  <text v-else class="amount-text">¥{{ formatAmount(job.salaryDay) }}</text>
                </view>
              </view>
            </view>

            <view v-if="signupUsers.length" class="bill-row">
              <text class="bill-label">{{ job.settlementStatus === 'SETTLED' ? '已结清账单' : '待结账单' }}</text>
              <text class="bill-amount">¥{{ formatAmount(calcUnpaidTotal(job)) }}</text>
            </view>
          </view>
        </view>
      </view>
    </template>
  </scroll-view>
</template>

<script>
import { getJobSignupUsers, getMyPublishedJobs, updateMerchantJobStatus } from '@/api/wxmini/jobs'
import { useUserStore } from '@/store'
import { USER_TYPES } from '@/utils/userType'

const JOB_STATUS_LABELS = {
  0: '招聘中',
  1: '已满员',
  2: '已结束',
  3: '已取消'
}

const JOB_STATUS_CLASSES = {
  0: 'status-open',
  1: 'status-full',
  2: 'status-end',
  3: 'status-cancelled'
}

export default {
  data() {
    return {
      blocked: false,
      loading: false,
      usersLoading: false,
      jobs: [],
      signupUsers: [],
      activeJobId: ''
    }
  },
  onLoad() {
    this.blocked = useUserStore().userType !== USER_TYPES.MERCHANT
    if (!this.blocked) this.loadJobs()
  },
  onPullDownRefresh() {
    if (this.blocked) {
      uni.stopPullDownRefresh()
      return
    }
    this.loadJobs().finally(() => uni.stopPullDownRefresh())
  },
  methods: {
    async loadJobs() {
      this.loading = true
      try {
        const res = await getMyPublishedJobs()
        this.jobs = Array.isArray(res?.data) ? res.data : []
      } catch (e) {
        this.jobs = []
        uni.showToast({ title: e?.msg || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    async toggleJob(job) {
      if (this.activeJobId === job.id) {
        this.activeJobId = ''
        this.signupUsers = []
        return
      }
      this.activeJobId = job.id
      this.signupUsers = []
      this.usersLoading = true
      try {
        const res = await getJobSignupUsers(job.id)
        this.signupUsers = Array.isArray(res?.data) ? res.data : []
      } catch (e) {
        uni.showToast({ title: e?.msg || '报名人员加载失败', icon: 'none' })
      } finally {
        this.usersLoading = false
      }
    },
    async changeJobStatus(job, status) {
      try {
        await updateMerchantJobStatus(job.id, { status })
        uni.showToast({ title: status === 3 ? '已取消招聘' : '已恢复招聘', icon: 'success' })
        if (this.activeJobId === job.id) {
          this.activeJobId = ''
          this.signupUsers = []
        }
        await this.loadJobs()
      } catch (e) {
        uni.showToast({ title: e?.msg || '状态修改失败', icon: 'none' })
      }
    },
    goPayroll(job) {
      if (!job.canSettle) return
      uni.navigateTo({ url: `/pages/jobs/payroll?jobId=${job.id}&salaryDay=${job.salaryDay || ''}` })
    },
    goGuide() {
      uni.navigateTo({ url: '/pages/guide/index' })
    },
    avatarText(name) {
      return name ? String(name).slice(0, 1) : '人'
    },
    calcUnpaidTotal(job) {
      const unpaidCount = this.signupUsers.filter(user => !user.payrollPaid).length
      return Number(job.salaryDay || 0) * unpaidCount
    },
    getJobStatusLabel(status) {
      return JOB_STATUS_LABELS[Number(status)] || '未知状态'
    },
    getJobStatusClass(status) {
      return JOB_STATUS_CLASSES[Number(status)] || 'status-default'
    },
    formatAmount(value) {
      const num = Number(value || 0)
      return Number.isNaN(num) ? '0.00' : num.toFixed(2)
    },
    formatDate(value) {
      return value || '日期待定'
    }
  }
}
</script>

<style scoped lang="scss">
page { background: #f5f7fb; }
.page { min-height: 100vh; padding: 24rpx; box-sizing: border-box; }
.hero-card, .state-card, .job-card {
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05);
}
.hero-card {
  padding: 28rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #eff6ff 0%, #ecfdf5 100%);
}
.hero-title { display: block; font-size: 34rpx; font-weight: 700; color: #0f172a; }
.hero-desc { display: block; margin-top: 8rpx; font-size: 24rpx; color: #64748b; }
.hero-count { text-align: center; min-width: 120rpx; }
.hero-count-num { display: block; font-size: 40rpx; font-weight: 800; color: #2563eb; }
.hero-count-label { display: block; font-size: 22rpx; color: #64748b; }
.state-card {
  min-height: 360rpx;
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
}
.state-title { font-size: 30rpx; font-weight: 700; color: #0f172a; }
.state-desc, .job-meta, .job-location, .job-signup, .user-phone, .empty-text, .bill-label {
  font-size: 24rpx;
  color: #64748b;
}
.state-btn {
  margin-top: 16rpx;
  padding: 18rpx 48rpx;
  border-radius: 999rpx;
  background: #2563eb;
  color: #fff;
  font-size: 26rpx;
}
.job-list { display: flex; flex-direction: column; gap: 22rpx; }
.job-card { padding: 26rpx; }
.job-head, .panel-head, .user-item, .bill-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.job-main, .user-info { flex: 1; min-width: 0; }
.job-title-row { display: flex; align-items: center; gap: 12rpx; flex-wrap: wrap; }
.job-title { font-size: 30rpx; font-weight: 700; color: #0f172a; }
.status-tag, .remind-tag, .paid-tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
}
.status-tag { background: #e2e8f0; color: #475569; }
.status-open { background: #dbeafe; color: #1d4ed8; }
.status-full { background: #fef3c7; color: #b45309; }
.status-end { background: #e5e7eb; color: #4b5563; }
.status-cancelled { background: #fee2e2; color: #dc2626; }
.remind-tag { background: #fef3c7; color: #b45309; }
.remind-tag.settled { background: #dcfce7; color: #15803d; }
.job-meta, .job-location { display: block; margin-top: 8rpx; }
.job-side { text-align: right; margin-left: 18rpx; }
.job-salary { display: block; font-size: 32rpx; font-weight: 800; color: #ef4444; }
.signup-panel { margin-top: 24rpx; padding-top: 24rpx; border-top: 1rpx solid #eef2f7; }
.panel-head-actions { align-items: flex-start; gap: 16rpx; }
.panel-title { font-size: 28rpx; font-weight: 700; color: #0f172a; }
.panel-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 12rpx; }
.payroll-btn, .ghost-btn {
  padding: 14rpx 26rpx;
  border-radius: 999rpx;
}
.payroll-btn { background: #2563eb; }
.payroll-btn.disabled { background: #cbd5e1; }
.payroll-btn-text, .ghost-btn-text { font-size: 24rpx; color: #fff; font-weight: 600; }
.ghost-btn { background: #eef2ff; }
.ghost-btn .ghost-btn-text { color: #4338ca; }
.ghost-btn.danger { background: #fee2e2; }
.ghost-btn.danger .ghost-btn-text { color: #dc2626; }
.inner-state { padding: 36rpx 0; text-align: center; }
.user-list { margin-top: 16rpx; }
.user-item { padding: 18rpx 0; border-bottom: 1rpx solid #f1f5f9; }
.user-item:last-child { border-bottom: none; }
.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 18rpx;
  background: #dbeafe;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.user-name { display: block; font-size: 28rpx; font-weight: 600; color: #0f172a; }
.user-phone { display: block; margin-top: 4rpx; }
.user-right { margin-left: 16rpx; }
.amount-text, .bill-amount { font-size: 28rpx; font-weight: 800; color: #ef4444; }
.paid-tag { background: #dcfce7; color: #15803d; }
.bill-row { margin-top: 18rpx; padding: 20rpx; border-radius: 18rpx; background: #f8fafc; }
</style>
