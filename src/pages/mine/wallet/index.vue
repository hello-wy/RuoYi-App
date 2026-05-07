<template>
  <view class="wallet-page">

    <view class="balance-card">
      <view v-if="infoLoading" class="skeleton-wrap">
        <view class="skeleton-amount"></view>
        <view class="skeleton-stats"></view>
      </view>

      <view v-else>
        <view class="balance-header">
          <text class="balance-title">钱包余额</text>
          <view class="refresh-btn" @click="refreshAll">
            <uni-icons type="refreshempty" size="16" color="rgba(255,255,255,0.8)"></uni-icons>
          </view>
        </view>

        <view class="balance-amount-row">
          <text class="currency-symbol">¥</text>
          <text class="balance-amount">{{ formatAmount(walletInfo.balance) }}</text>
          <text class="balance-unit">元</text>
        </view>

        <view class="wallet-stats">
          <view class="stat-block">
            <text class="stat-value">{{ formatAmount(walletInfo.totalEarned) }}</text>
            <text class="stat-label">累计收入</text>
          </view>
          <view class="stat-vline"></view>
          <view class="stat-block">
            <text class="stat-value">{{ formatAmount(walletInfo.totalWithdrawn) }}</text>
            <text class="stat-label">累计提现</text>
          </view>
          <view class="stat-vline"></view>
          <view class="stat-block">
            <text class="stat-value">{{ formatAmount(walletInfo.frozen) }}</text>
            <text class="stat-label">审核冻结</text>
          </view>
        </view>
      </view>
    </view>

    <view class="action-card" @click="onTapWithdraw">
      <view class="action-left">
        <view class="action-icon-bg">
          <text class="action-icon-text">微</text>
        </view>
        <view class="action-text-wrap">
          <text class="action-title">提现到微信钱包</text>
          <text class="action-desc">工作日1-3天到账 · 0手续费</text>
        </view>
      </view>
      <uni-icons type="right" size="16" color="#94a3b8"></uni-icons>
    </view>

    <view class="records-card">
      <view class="records-header">
        <text class="records-title">工资流水</text>
      </view>

      <view v-if="transactionsLoading" class="records-loading">
        <uni-load-more status="loading"></uni-load-more>
      </view>

      <view v-else-if="transactionList.length === 0" class="records-empty">
        <uni-icons type="wallet" size="44" color="#cbd5e1"></uni-icons>
        <text class="empty-text">暂无钱包流水</text>
      </view>

      <view v-else class="records-list">
        <view v-for="(item, index) in transactionList" :key="item.id || index" class="record-item">
          <view class="record-left">
            <view class="record-icon-wrap" :class="directionIconClass(item.direction)">
              <uni-icons :type="directionIcon(item.direction)" size="18" :color="directionIconColor(item.direction)"></uni-icons>
            </view>
            <view class="record-info">
              <text class="record-action">{{ transactionTitle(item) }}</text>
              <text class="record-time">{{ formatTime(item.createTime || item.transactionTime) }}</text>
              <text v-if="item.remark" class="record-reason">{{ item.remark }}</text>
            </view>
          </view>
          <view class="record-right">
            <text class="record-amount" :class="{ income: Number(item.direction) === 1 }">
              {{ Number(item.direction) === 1 ? '+' : '-' }}¥{{ formatAmount(item.amount) }}
            </text>
            <text class="record-balance">余额 {{ formatAmount(item.balanceAfter) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="records-card">
      <view class="records-header">
        <text class="records-title">提现记录</text>
      </view>

      <view v-if="recordsLoading" class="records-loading">
        <uni-load-more status="loading"></uni-load-more>
      </view>

      <view v-else-if="withdrawList.length === 0" class="records-empty">
        <uni-icons type="wallet" size="44" color="#cbd5e1"></uni-icons>
        <text class="empty-text">暂无提现记录</text>
      </view>

      <view v-else class="records-list">
        <view
          v-for="(item, index) in withdrawList"
          :key="item.id || index"
          class="record-item"
        >
          <view class="record-left">
            <view class="record-icon-wrap" :class="statusIconClass(item.status)">
              <uni-icons
                :type="statusIcon(item.status)"
                size="18"
                :color="statusIconColor(item.status)"
              ></uni-icons>
            </view>
            <view class="record-info">
              <text class="record-action">提现至微信钱包</text>
              <text class="record-time">{{ formatTime(item.applyTime) }}</text>
              <text v-if="item.remark && item.status === 2" class="record-reason">{{ item.remark }}</text>
            </view>
          </view>

          <view class="record-right">
            <text class="record-amount">-¥{{ formatAmount(item.amount) }}</text>
            <view class="status-badge" :class="statusBadgeClass(item.status)">
              <text class="status-text">{{ statusText(item.status) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="footer-tips">
      <text class="tips-text">· 钱包收入包括兼职工资等平台入账</text>
      <text class="tips-text">· 提现到账后将自动转入微信零钱</text>
      <text class="tips-text">· 如有疑问请联系客服</text>
    </view>

    <view class="safe-area-bottom"></view>

    <view v-if="showWithdrawSheet" class="sheet-mask" @click.self="closeSheet">
      <view class="withdraw-sheet" :class="{ 'sheet-in': sheetVisible }">
        <view class="sheet-drag-bar"></view>
        <view class="sheet-header">
          <text class="sheet-title">提现到微信钱包</text>
          <view class="sheet-close" @click="closeSheet">
            <uni-icons type="close" size="20" color="#64748b"></uni-icons>
          </view>
        </view>
        <view class="sheet-available">
          <text class="available-label">可提现余额</text>
          <text class="available-amount">¥{{ formatAmount(walletInfo.balance) }}</text>
        </view>
        <view class="input-section">
          <text class="input-label">提现金额</text>
          <view class="input-wrap">
            <text class="input-prefix">¥</text>
            <input
              class="amount-input"
              type="digit"
              v-model="withdrawAmount"
              placeholder="请输入金额"
              placeholder-class="input-placeholder"
              :focus="inputFocus"
              maxlength="10"
            />
            <text class="all-btn" @click="setAllAmount">全部</text>
          </view>
          <view class="input-divider"></view>
          <text v-if="withdrawError" class="input-error">{{ withdrawError }}</text>
        </view>
        <view class="sheet-tips">
          <text class="sheet-tip-item">· 最低提现金额 ¥1.00</text>
          <text class="sheet-tip-item">· 预计工作日1-3天到账</text>
        </view>
        <button
          class="confirm-btn"
          :class="{ 'confirm-btn-loading': withdrawLoading }"
          :disabled="withdrawLoading"
          @click="submitWithdraw"
        >
          <view v-if="withdrawLoading" class="btn-loading-wrap">
            <view class="btn-spinner"></view>
            <text>提交中...</text>
          </view>
          <text v-else>确认提现</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { getWalletInfo, applyWithdraw, getWithdrawRecords, getWalletTransactions } from '@/api/wxmini/wallet'

export default {
  name: 'WalletPage',
  data() {
    return {
      walletInfo: {
        balance: '0.00',
        frozen: '0.00',
        totalEarned: '0.00',
        totalWithdrawn: '0.00'
      },
      infoLoading: false,
      withdrawList: [],
      transactionList: [],
      recordsLoading: false,
      transactionsLoading: false,
      showWithdrawSheet: false,
      sheetVisible: false,
      withdrawAmount: '',
      withdrawError: '',
      withdrawLoading: false,
      inputFocus: false
    }
  },

  onLoad() {
    this.refreshAll()
  },

  methods: {
    async refreshAll() {
      await Promise.allSettled([
        this.loadWalletInfo(),
        this.loadWithdrawRecords(),
        this.loadWalletTransactions()
      ])
    },
    async loadWalletInfo() {
      this.infoLoading = true
      try {
        const res = await getWalletInfo()
        const data = res.data || res
        this.walletInfo = {
          balance: data.balance || '0.00',
          frozen: data.frozen || '0.00',
          totalEarned: data.totalEarned || '0.00',
          totalWithdrawn: data.totalWithdrawn || '0.00'
        }
      } catch (e) {
        uni.showToast({ title: '余额加载失败', icon: 'none' })
      } finally {
        this.infoLoading = false
      }
    },

    async loadWithdrawRecords() {
      this.recordsLoading = true
      try {
        const res = await getWithdrawRecords()
        this.withdrawList = res.data || res || []
      } catch (e) {
        this.withdrawList = []
      } finally {
        this.recordsLoading = false
      }
    },

    async loadWalletTransactions() {
      this.transactionsLoading = true
      try {
        const res = await getWalletTransactions()
        this.transactionList = res.data || res || []
      } catch (e) {
        this.transactionList = []
      } finally {
        this.transactionsLoading = false
      }
    },

    onTapWithdraw() {
      const balance = parseFloat(this.walletInfo.balance)
      if (balance <= 0) {
        uni.showToast({ title: '暂无可提现余额', icon: 'none' })
        return
      }
      this.withdrawAmount = ''
      this.withdrawError = ''
      this.showWithdrawSheet = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.sheetVisible = true
          this.inputFocus = true
        }, 50)
      })
    },

    closeSheet() {
      this.sheetVisible = false
      this.inputFocus = false
      setTimeout(() => {
        this.showWithdrawSheet = false
        this.withdrawAmount = ''
        this.withdrawError = ''
      }, 300)
    },

    setAllAmount() {
      this.withdrawAmount = String(parseFloat(this.walletInfo.balance) || 0)
      this.withdrawError = ''
    },

    async submitWithdraw() {
      const amount = parseFloat(this.withdrawAmount)
      const balance = parseFloat(this.walletInfo.balance)
      if (!this.withdrawAmount || isNaN(amount)) {
        this.withdrawError = '请输入提现金额'
        return
      }
      if (amount < 1) {
        this.withdrawError = '最低提现金额为 ¥1.00'
        return
      }
      if (amount > balance) {
        this.withdrawError = '提现金额不能超过可用余额'
        return
      }
      this.withdrawError = ''
      this.withdrawLoading = true

      try {
        const res = await applyWithdraw(amount.toFixed(2))

        const msg = res.msg || res.data || '微信提现已发起'
        this.closeSheet()
        uni.showToast({ title: msg, icon: 'success', duration: 2500 })
        setTimeout(() => {
          this.refreshAll()
        }, 500)
      } catch (e) {
        this.withdrawError = '提交失败，请重试'
      } finally {
        this.withdrawLoading = false
      }
    },

    formatAmount(val) {
      if (val === null || val === undefined || val === '') return '0.00'
      return Number(val).toFixed(2)
    },

    formatTime(val) {
      if (!val) return '—'
      const d = new Date(val)
      if (isNaN(d.getTime())) return val
      const p = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
    },

    transactionTitle(item) {
      if (item.remark) return item.remark
      if (String(item.bizType || '').toLowerCase().includes('payroll')) return '工资入账'
      return Number(item.direction) === 1 ? '钱包收入' : '钱包支出'
    },

    directionIcon(direction) {
      return Number(direction) === 1 ? 'arrow-up' : 'arrow-down'
    },

    directionIconColor(direction) {
      return Number(direction) === 1 ? '#10B981' : '#EF4444'
    },

    directionIconClass(direction) {
      return Number(direction) === 1 ? 'icon-success' : 'icon-failed'
    },

    statusText(status) {
      return ['打款中', '已打款', '打款失败'][status] || '未知'
    },

    statusIcon(status) {
      return ['spinner-cycle', 'checkmarkempty', 'closeempty'][status] || 'info'
    },

    statusIconColor(status) {
      return ['#F59E0B', '#10B981', '#EF4444'][status] || '#94a3b8'
    },

    statusIconClass(status) {
      return ['icon-pending', 'icon-success', 'icon-failed'][status] || ''
    },

    statusBadgeClass(status) {
      return ['badge-pending', 'badge-success', 'badge-failed'][status] || ''
    }
  }
}
</script>

<style lang="scss" scoped>
$primary: #3B82F6;
$primary-dark: #6366F1;
$bg: #f0f4f8;

page {
  background-color: $bg;
}

.wallet-page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: env(safe-area-inset-bottom);
}

/* ====== 余额卡片 ====== */
.balance-card {
  margin: 0;
  background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
  padding: 48rpx 36rpx 56rpx;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    right: -60rpx;
    top: -60rpx;
    width: 280rpx;
    height: 280rpx;
    background: rgba(255,255,255,0.07);
    border-radius: 50%;
  }
  &::before {
    content: '';
    position: absolute;
    right: 40rpx;
    bottom: -80rpx;
    width: 200rpx;
    height: 200rpx;
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
  }
}

.balance-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.balance-title {
  font-size: 28rpx;
  color: rgba(255,255,255,0.85);
}

.refresh-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.18);
  border-radius: 50%;
}

.balance-amount-row {
  display: flex;
  align-items: flex-end;
  margin-bottom: 40rpx;
}

.currency-symbol {
  font-size: 40rpx;
  color: rgba(255,255,255,0.9);
  margin-bottom: 10rpx;
  margin-right: 6rpx;
}

.balance-amount {
  font-size: 80rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  letter-spacing: -1px;
}

.balance-unit {
  font-size: 28rpx;
  color: rgba(255,255,255,0.7);
  margin-bottom: 12rpx;
  margin-left: 8rpx;
}

.wallet-stats {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.15);
  border-radius: 20rpx;
  padding: 20rpx 0;
}

.stat-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.7);
}

.stat-vline {
  width: 1rpx;
  height: 48rpx;
  background: rgba(255,255,255,0.3);
}

/* ====== 骨架屏 ====== */
.skeleton-wrap {
  padding: 12rpx 0;
}

.skeleton-amount {
  width: 240rpx;
  height: 80rpx;
  background: rgba(255,255,255,0.25);
  border-radius: 12rpx;
  margin-bottom: 32rpx;
}

.skeleton-stats {
  height: 88rpx;
  background: rgba(255,255,255,0.15);
  border-radius: 20rpx;
}

/* ====== 提现入口卡片 ====== */
.action-card {
  margin: 24rpx 24rpx 0;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
  border: 1rpx solid #e2e8f0;

  &:active {
    background: #f8fafc;
  }
}

.action-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.action-icon-bg {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #07C160, #0AAD6F);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
}

.action-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.action-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
}

.action-desc {
  font-size: 22rpx;
  color: #94a3b8;
}

/* ====== 提现记录卡片 ====== */
.records-card {
  margin: 24rpx 24rpx 0;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
  border: 1rpx solid #e2e8f0;
  overflow: hidden;
}

.records-header {
  padding: 28rpx 28rpx 20rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.records-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
}

.records-loading {
  padding: 40rpx 0;
}

.records-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64rpx 0;
  gap: 16rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #94a3b8;
}

.records-list {
  padding: 0 28rpx;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
}

.record-left {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  flex: 1;
}

.record-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.icon-pending { background: #FEF3C7; }
  &.icon-success { background: #D1FAE5; }
  &.icon-failed  { background: #FEE2E2; }
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  flex: 1;
}

.record-action {
  font-size: 28rpx;
  font-weight: 500;
  color: #1e293b;
}

.record-time {
  font-size: 22rpx;
  color: #94a3b8;
}

.record-reason {
  font-size: 22rpx;
  color: #EF4444;
  margin-top: 2rpx;
}

.record-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.record-amount {
  font-size: 32rpx;
  font-weight: 700;
  color: #EF4444;
}

.record-amount.income {
  color: #10B981;
}

.record-balance {
  font-size: 22rpx;
  color: #94a3b8;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;

  &.badge-pending { background: #FEF3C7; }
  &.badge-success { background: #D1FAE5; }
  &.badge-failed  { background: #FEE2E2; }
}

.status-text {
  &.badge-pending { color: #D97706; }
  &.badge-success { color: #059669; }
  &.badge-failed  { color: #DC2626; }
}

.badge-pending .status-text { color: #D97706; }
.badge-success .status-text { color: #059669; }
.badge-failed  .status-text { color: #DC2626; }

/* ====== 底部说明 ====== */
.footer-tips {
  margin: 24rpx 24rpx 0;
  padding: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  border: 1rpx solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.tips-text {
  font-size: 22rpx;
  color: #94a3b8;
  line-height: 1.6;
}

.safe-area-bottom {
  height: 48rpx;
}

/* ====== 提现弹窗 ====== */
.sheet-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.withdraw-sheet {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 0 36rpx 60rpx;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.sheet-in {
    transform: translateY(0);
  }
}

.sheet-drag-bar {
  width: 80rpx;
  height: 8rpx;
  background: #e2e8f0;
  border-radius: 4rpx;
  margin: 20rpx auto 0;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0 24rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.sheet-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.sheet-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
}

.sheet-available {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 0 20rpx;
}

.available-label {
  font-size: 26rpx;
  color: #64748b;
}

.available-amount {
  font-size: 32rpx;
  font-weight: 600;
  color: $primary;
}

.input-section {
  margin-top: 8rpx;
}

.input-label {
  font-size: 26rpx;
  color: #64748b;
  display: block;
  margin-bottom: 12rpx;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.input-prefix {
  font-size: 44rpx;
  color: #1e293b;
  font-weight: 300;
  line-height: 1;
}

.amount-input {
  flex: 1;
  font-size: 48rpx;
  font-weight: 600;
  color: #1e293b;
  height: 80rpx;
  border: none;
  outline: none;
  background: transparent;
}

.input-placeholder {
  font-size: 40rpx;
  font-weight: 400;
  color: #cbd5e1;
}

.all-btn {
  font-size: 26rpx;
  color: $primary;
  background: rgba(59,130,246,0.1);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.input-divider {
  height: 2rpx;
  background: linear-gradient(90deg, $primary, $primary-dark);
  border-radius: 1rpx;
  margin-top: 8rpx;
  margin-bottom: 12rpx;
}

.input-error {
  font-size: 24rpx;
  color: #EF4444;
  display: block;
  margin-top: 8rpx;
}

.sheet-tips {
  margin-top: 24rpx;
  padding: 20rpx;
  background: #f8fafc;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.sheet-tip-item {
  font-size: 22rpx;
  color: #94a3b8;
}

.confirm-btn {
  margin-top: 32rpx;
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #3B82F6, #6366F1);
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }

  &.confirm-btn-loading {
    opacity: 0.7;
  }
}

.btn-loading-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #fff;
  font-size: 32rpx;
}

.btn-spinner {
  width: 36rpx;
  height: 36rpx;
  border: 4rpx solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
