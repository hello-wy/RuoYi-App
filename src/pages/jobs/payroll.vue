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
        <view v-for="item in userPool" :key="resolveEmployeeId(item)" class="user-item">
          <view class="user-main">
            <text class="user-name">{{ item.displayName || item.nickName || '未命名用户' }}</text>
            <text class="user-phone">{{ item.phoneMasked || item.phone || '未提供手机号' }}</text>
          </view>
          <view class="user-action" :class="{ added: isSelected(item), paid: isPayrollPaid(item) }" @click="toggleSelect(item)">
            <text class="user-action-text">{{ getUserActionLabel(item) }}</text>
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
        <view v-for="(item, index) in selectedEmployees" :key="resolveEmployeeId(item)" class="batch-item">
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
              <text class="field-label">工作天数</text>
              <input class="field-input" type="digit" v-model="item.hours" @input="recalculateItem(item)" placeholder="如 1" />
            </view>
            <view class="field-item">
              <text class="field-label">日薪</text>
              <input class="field-input" type="digit" v-model="item.hourlyRate" @input="recalculateItem(item)" placeholder="如 200" />
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
import { getJobSignupUsers } from '@/pages/jobs/_api/wxmini/jobs'
import { createPayrollOrder, getPayrollOrder } from '@/pages/jobs/_api/wxmini/payroll'
import { useUserStore } from '@/store'
import { USER_TYPES } from '@/utils/userType'

export default {
  data() {
    return {
      jobId: '',
      keyword: '',
      loading: false,
      paying: false,
      userPool: [],
      selectedEmployees: [],
      checkedIds: [],
      defaultDailySalary: ''
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
    if (useUserStore().userType !== USER_TYPES.MERCHANT) {
      uni.showToast({ title: '仅商家可查看', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 800)
      return
    }
    this.jobId = options?.jobId || ''
    this.defaultDailySalary = options?.salaryDay || ''
    if (!this.jobId) {
      uni.showToast({ title: '缺少岗位信息', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 800)
      return
    }
    this.loadUsers()
  },
  methods: {
    resolveEmployeeId(item) {
      return String(item.userInfoId || item.userId || item.uid || item.id || '')
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
        const availableIds = this.userPool
          .filter(item => !this.isPayrollPaid(item))
          .map(item => this.resolveEmployeeId(item))
        this.selectedEmployees = this.selectedEmployees.filter(item => availableIds.includes(this.resolveEmployeeId(item)))
        this.checkedIds = this.checkedIds.filter(id => availableIds.includes(id))
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
    isPayrollPaid(item) {
      return Boolean(item?.payrollPaid)
    },
    getUserActionLabel(item) {
      if (this.isPayrollPaid(item)) return '已支付'
      return this.isSelected(item) ? '移出批次' : '加入批次'
    },
    toggleSelect(item) {
      if (this.isPayrollPaid(item)) {
        return
      }
      if (this.isSelected(item)) {
        this.selectedEmployees = this.selectedEmployees.filter(employee => this.resolveEmployeeId(employee) !== this.resolveEmployeeId(item))
        this.checkedIds = this.checkedIds.filter(id => id !== this.resolveEmployeeId(item))
        return
      }
      const next = {
        ...item,
        hours: item.hours || '1',
        hourlyRate: item.hourlyRate || this.defaultDailySalary || '0',
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
        employeeUserId: Number(this.resolveEmployeeId(item)),
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
          employees: this.buildPayItems()
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

<style scoped lang="scss" src="./payroll.scss"></style>
