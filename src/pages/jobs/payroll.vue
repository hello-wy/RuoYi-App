<template>
  <scroll-view class="payroll-page" scroll-y>
    <view class="hero-card">
      <view>
        <text class="hero-title">岗位工资台</text>
        <text class="hero-desc">仅可为该岗位已支付报名的兼职人员发放工资</text>
      </view>
      <view class="hero-job" v-if="jobId">
        <text class="hero-job-label">岗位ID</text>
        <text class="hero-job-id">#{{ jobId }}</text>
      </view>
    </view>

    <view class="search-card">
      <view class="search-row">
        <input v-model="keyword" class="search-input" placeholder="搜索姓名/昵称/手机号" confirm-type="search" @confirm="loadUsers" />
        <view class="search-btn" @click="loadUsers">
          <text class="search-btn-text">搜索</text>
        </view>
      </view>
      <text class="search-tip">搜索范围仅限该岗位已支付报名用户</text>
    </view>

    <view class="section-card">
      <view class="section-head">
        <text class="section-title">员工池</text>
        <text class="section-subtitle">{{ userPool.length }}人</text>
      </view>

      <view v-if="loading" class="state-wrap">
        <uni-load-more status="loading"></uni-load-more>
      </view>

      <view v-else-if="userPool.length === 0" class="state-wrap empty-wrap">
        <uni-icons type="person" size="38" color="#cbd5e1" />
        <text class="empty-text">暂无可发薪员工</text>
      </view>

      <view v-else class="user-list">
        <view v-for="item in userPool" :key="item.userId || item.uid" class="user-item">
          <view class="user-main">
            <text class="user-name">{{ item.displayName || item.nickName || '未命名用户' }}</text>
            <text class="user-phone">{{ item.phoneMasked || item.phone || '未提供手机号' }}</text>
          </view>
          <view class="user-action" :class="{ added: isSelected(item) }" @click="toggleSelect(item)">
            <text class="user-action-text">{{ isSelected(item) ? '移出批次' : '加入批次' }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-head">
        <text class="section-title">当前工资批次</text>
        <text class="section-subtitle">{{ selectedEmployees.length }}人</text>
      </view>

      <view v-if="selectedEmployees.length === 0" class="state-wrap empty-wrap">
        <uni-icons type="wallet" size="38" color="#cbd5e1" />
        <text class="empty-text">请先从员工池添加人员</text>
      </view>

      <view v-else class="batch-list">
        <view v-for="(item, index) in selectedEmployees" :key="item.userId || item.uid" class="batch-item">
          <view class="batch-item-top">
            <label class="select-box">
              <checkbox :checked="isPayChecked(item)" color="#2563eb" @click.stop="togglePayChecked(item)" />
            </label>
            <view class="batch-user-main">
              <text class="user-name">{{ item.displayName || item.nickName || '未命名用户' }}</text>
              <text class="user-phone">{{ item.phoneMasked || item.phone || '未提供手机号' }}</text>
            </view>
            <view class="remove-btn" @click="removeEmployee(index)">
              <text class="remove-btn-text">删除</text>
            </view>
          </view>

          <view class="field-grid">
            <view class="field-item">
              <text class="field-label">工时</text>
              <input class="field-input" type="digit" v-model="item.hours" @input="recalculateItem(item)" placeholder="如 8" />
            </view>
            <view class="field-item">
              <text class="field-label">小时价</text>
              <input class="field-input" type="digit" v-model="item.hourlyRate" @input="recalculateItem(item)" placeholder="如 25" />
            </view>
          </view>

          <view class="amount-row">
            <text class="amount-label">应发工资</text>
            <text class="amount-value">¥{{ formatAmount(item.amount) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <view>
        <text class="summary-text">已选 {{ checkedCount }} 人</text>
        <text class="summary-amount">合计 ¥{{ formatAmount(totalAmount) }}</text>
      </view>
      <view class="pay-btn" :class="{ disabled: paying || checkedCount === 0 || totalAmount <= 0 }" @click="handlePay">
        <text class="pay-btn-text">{{ paying ? '支付中...' : '统一支付' }}</text>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import { getJobSignupUsers } from '@/api/wxmini/jobs'
import { createPayrollOrder, getPayrollOrder } from '@/api/wxmini/payroll'

export default {
  data() {
    return {
      jobId: '',
      keyword: '',
      loading: false,
      paying: false,
      userPool: [],
      selectedEmployees: [],
      checkedIds: []
    }
  },
  computed: {
    checkedEmployees() {
      return this.selectedEmployees.filter(item => this.checkedIds.includes(this.resolveEmployeeId(item)))
    },
    checkedCount() {
      return this.checkedEmployees.length
    },
    totalAmount() {
      return this.checkedEmployees.reduce((sum, item) => sum + this.parseAmount(item.amount), 0)
    }
  },
  onLoad(options) {
    this.jobId = options?.jobId || ''
    if (!this.jobId) {
      uni.showToast({ title: '缺少岗位信息', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 800)
      return
    }
    this.loadUsers()
  },
  methods: {
    resolveEmployeeId(item) {
      return String(item.userId || item.uid || item.id || '')
    },
    parseAmount(value) {
      const num = Number(value || 0)
      return Number.isNaN(num) ? 0 : num
    },
    formatAmount(value) {
      return this.parseAmount(value).toFixed(2)
    },
    async loadUsers() {
      if (!this.jobId) return
      this.loading = true
      try {
        const res = await getJobSignupUsers(this.jobId, this.keyword ? { keyword: this.keyword.trim() } : {})
        this.userPool = Array.isArray(res?.data) ? res.data : []
      } catch (e) {
        this.userPool = []
        uni.showToast({ title: '员工池加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    isSelected(item) {
      const id = this.resolveEmployeeId(item)
      return this.selectedEmployees.some(employee => this.resolveEmployeeId(employee) === id)
    },
    toggleSelect(item) {
      if (this.isSelected(item)) {
        this.selectedEmployees = this.selectedEmployees.filter(employee => this.resolveEmployeeId(employee) !== this.resolveEmployeeId(item))
        this.checkedIds = this.checkedIds.filter(id => id !== this.resolveEmployeeId(item))
        return
      }
      const next = {
        ...item,
        hours: item.hours || '8',
        hourlyRate: item.hourlyRate || '25',
        amount: 0
      }
      this.recalculateItem(next)
      this.selectedEmployees = [...this.selectedEmployees, next]
      this.checkedIds = [...new Set([...this.checkedIds, this.resolveEmployeeId(next)])]
    },
    removeEmployee(index) {
      const item = this.selectedEmployees[index]
      this.selectedEmployees.splice(index, 1)
      this.selectedEmployees = [...this.selectedEmployees]
      this.checkedIds = this.checkedIds.filter(id => id !== this.resolveEmployeeId(item))
    },
    recalculateItem(item) {
      const hours = Number(item.hours || 0)
      const hourlyRate = Number(item.hourlyRate || 0)
      item.amount = Number.isNaN(hours * hourlyRate) ? 0 : Number((hours * hourlyRate).toFixed(2))
    },
    isPayChecked(item) {
      return this.checkedIds.includes(this.resolveEmployeeId(item))
    },
    togglePayChecked(item) {
      const id = this.resolveEmployeeId(item)
      if (this.checkedIds.includes(id)) {
        this.checkedIds = this.checkedIds.filter(current => current !== id)
        return
      }
      this.checkedIds = [...this.checkedIds, id]
    },
    buildPayItems() {
      return this.checkedEmployees.map(item => ({
        employeeUid: item.uid,
        employeeUserId: item.userId,
        hours: Number(item.hours || 0),
        hourlyRate: Number(item.hourlyRate || 0)
      }))
    },
    async handlePay() {
      if (this.paying) return
      if (!this.checkedCount || this.totalAmount <= 0) {
        uni.showToast({ title: '请选择有效员工与金额', icon: 'none' })
        return
      }
      this.paying = true
      try {
        const res = await createPayrollOrder({
          jobId: Number(this.jobId),
          items: this.buildPayItems()
        })
        const payload = res?.data || {}
        const payParam = payload.payParam || {}
        await uni.requestPayment({
          provider: 'wxpay',
          timeStamp: payParam.timeStamp,
          nonceStr: payParam.nonceStr,
          package: payParam.packageValue || payParam.package,
          signType: payParam.signType || 'RSA',
          paySign: payParam.paySign
        })
        await this.pollOrder(payload.orderNo)
      } catch (e) {
        uni.showToast({ title: e?.msg || e?.errMsg || '支付失败，请重试', icon: 'none' })
      } finally {
        this.paying = false
      }
    },
    async pollOrder(orderNo) {
      if (!orderNo) {
        uni.showToast({ title: '支付结果确认中，请稍后查看', icon: 'none' })
        return
      }
      for (let i = 0; i < 8; i++) {
        const res = await getPayrollOrder(orderNo)
        const order = res?.data || {}
        if (Number(order.status) === 1 || String(order.status) === '1') {
          uni.showToast({ title: '工资支付成功', icon: 'success' })
          this.selectedEmployees = []
          this.checkedIds = []
          this.loadUsers()
          return
        }
        await new Promise(resolve => setTimeout(resolve, 800))
      }
      uni.showToast({ title: '支付结果刷新中，请稍后查看', icon: 'none' })
    }
  }
}
</script>

<style scoped lang="scss">
page {
  background: #f5f7fb;
}

.payroll-page {
  min-height: 100vh;
  padding: 24rpx 24rpx 180rpx;
  box-sizing: border-box;
}

.hero-card,
.search-card,
.section-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05);
  margin-bottom: 24rpx;
}

.hero-card,
.section-head,
.search-row,
.user-item,
.batch-item-top,
.amount-row,
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-card {
  background: linear-gradient(135deg, #eff6ff 0%, #eefcf6 100%);
}

.hero-title,
.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
}

.hero-desc,
.section-subtitle,
.search-tip,
.user-phone,
.field-label,
.summary-text {
  font-size: 24rpx;
  color: #64748b;
}

.hero-desc,
.search-tip {
  display: block;
  margin-top: 8rpx;
}

.hero-job {
  text-align: right;
}

.hero-job-label {
  display: block;
  font-size: 22rpx;
  color: #94a3b8;
}

.hero-job-id {
  font-size: 30rpx;
  font-weight: 700;
  color: #2563eb;
}

.search-row {
  gap: 16rpx;
}

.search-input,
.field-input {
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 18rpx;
  min-height: 80rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  font-size: 26rpx;
  color: #0f172a;
}

.search-input {
  flex: 1;
}

.search-btn,
.user-action,
.remove-btn {
  padding: 18rpx 24rpx;
  border-radius: 18rpx;
  background: #2563eb;
}

.search-btn-text,
.user-action-text,
.remove-btn-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
}

.user-list,
.batch-list {
  margin-top: 20rpx;
}

.user-item,
.batch-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #eef2f7;
}

.user-item:last-child,
.batch-item:last-child {
  border-bottom: none;
}

.user-main,
.batch-user-main {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.user-phone {
  display: block;
  margin-top: 6rpx;
}

.user-action.added {
  background: #e2e8f0;
}

.user-action.added .user-action-text {
  color: #475569;
}

.batch-item-top {
  gap: 16rpx;
  align-items: flex-start;
}

.select-box {
  padding-top: 6rpx;
}

.remove-btn {
  background: #fee2e2;
}

.remove-btn-text {
  color: #dc2626;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-top: 20rpx;
}

.field-item {
  min-width: 0;
}

.field-label {
  display: block;
  margin-bottom: 10rpx;
}

.amount-row {
  margin-top: 18rpx;
  padding: 18rpx 20rpx;
  border-radius: 16rpx;
  background: #f8fafc;
}

.amount-label {
  font-size: 24rpx;
  color: #475569;
}

.amount-value,
.summary-amount {
  font-size: 30rpx;
  font-weight: 700;
  color: #ef4444;
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

.bottom-bar {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 14rpx 32rpx rgba(15, 23, 42, 0.12);
}

.pay-btn {
  min-width: 220rpx;
  height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pay-btn.disabled {
  background: #cbd5e1;
}

.pay-btn-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
}
</style>
