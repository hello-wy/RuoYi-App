<template>
	<view class="page">
		<!-- 导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-back" @click="goBack">
				<uni-icons type="left" size="20" color="#1e293b"></uni-icons>
			</view>
			<text class="nav-title">订单支付</text>
			<view style="width: 44px;"></view>
		</view>

		<!-- 加载中 -->
		<view v-if="loading" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<block v-else-if="order">
			<scroll-view scroll-y class="scroll-content" :style="{ top: navHeight + 'px' }">
				<view class="content-wrap">

					<!-- 支付状态 -->
					<view class="pay-status-card" v-if="order.status === '1'">
						<uni-icons type="checkmarkempty" size="40" color="#10B981"></uni-icons>
						<text class="pay-status-title">支付成功</text>
						<text class="pay-status-desc">押金将在现场签到后退还至您的账户</text>
					</view>
					<view class="pay-status-card pending" v-else>
						<uni-icons type="clock" size="40" color="#F59E0B"></uni-icons>
						<text class="pay-status-title">等待支付</text>
						<text class="pay-status-desc">请在 {{ countdown }} 内完成支付</text>
					</view>

					<!-- 订单信息 -->
					<view class="order-card">
						<text class="order-card-title">订单信息</text>
						<view class="order-divider"></view>
						<view class="order-row">
							<text class="order-label">课程名称</text>
							<text class="order-value">{{ order.courseName || order.name }}</text>
						</view>
						<view class="order-row">
							<text class="order-label">报名姓名</text>
							<text class="order-value">{{ order.enrollName || order.name }}</text>
						</view>
						<view class="order-row">
							<text class="order-label">手机号码</text>
							<text class="order-value">{{ order.phone }}</text>
						</view>
						<view class="order-row">
							<text class="order-label">订单编号</text>
							<text class="order-value order-no">{{ order.orderNo || order.id }}</text>
						</view>
						<view class="order-row">
							<text class="order-label">下单时间</text>
							<text class="order-value">{{ order.createTime }}</text>
						</view>
					</view>

					<!-- 支付金额 -->
					<view class="amount-card">
						<text class="amount-label">席位预定金</text>
						<view class="amount-row">
							<text class="amount-unit">¥</text>
							<text class="amount-value">{{ order.amount || order.deposit || '0.00' }}</text>
						</view>
						<text class="amount-tip">签到后押金自动退还至您的支付账户</text>
					</view>

					<!-- 支付方式 -->
					<view class="pay-method-card" v-if="order.status !== '1'">
						<text class="order-card-title">支付方式</text>
						<view class="order-divider"></view>
						<view
							class="pay-method-item"
							v-for="method in payMethods"
							:key="method.value"
							@click="selectedMethod = method.value"
						>
							<view class="pay-method-icon-wrap">
								<image :src="method.icon" class="pay-method-icon" mode="aspectFit"></image>
							</view>
							<text class="pay-method-name">{{ method.label }}</text>
							<view class="pay-radio" :class="{ 'pay-radio-active': selectedMethod === method.value }">
								<view v-if="selectedMethod === method.value" class="pay-radio-inner"></view>
							</view>
						</view>
					</view>

					<view style="height: 110px;"></view>
				</view>
			</scroll-view>

			<!-- 底部支付栏 -->
			<view class="bottom-bar" v-if="order.status !== '1'">
				<view class="pay-total">
					<text class="pay-total-label">合计：</text>
					<text class="pay-total-amount">¥{{ order.amount || order.deposit || '0.00' }}</text>
				</view>
				<view
					class="pay-btn"
					:class="{ 'pay-btn-disabled': paying }"
					@click="handlePay"
				>
					<text class="pay-btn-text">{{ paying ? '支付中...' : '立即支付' }}</text>
				</view>
			</view>
			<view class="bottom-bar" v-else>
				<view class="done-btn" @click="goHome">
					<text class="done-btn-text">返回首页</text>
				</view>
			</view>
		</block>
	</view>
</template>

<script>
import { getOrder, addOrder } from '@/api/system/order'
import request from '@/utils/request'

export default {
	data() {
		return {
			statusBarHeight: 0,
			navHeight: 44,
			orderId: '',
			courseId: '',
			loading: true,
			paying: false,
			order: null,
			countdown: '30:00',
			selectedMethod: 'wxpay',
			payMethods: [
				{ label: '微信支付', value: 'wxpay', icon: '/static/images/wxpay.png' },
				{ label: '余额支付', value: 'balance', icon: '/static/images/balance.png' },
			],
			_timer: null,
		}
	},
	onLoad(options) {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 0
		this.navHeight = (sys.statusBarHeight || 0) + 44
		this.orderId = options.orderId || ''
		this.courseId = options.courseId || ''
		this.loadOrder()
	},
	onUnload() {
		if (this._timer) clearInterval(this._timer)
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		goHome() {
			uni.switchTab({ url: '/pages/index' })
		},
		async loadOrder() {
			this.loading = true
			try {
				if (this.orderId) {
					const res = await getOrder(this.orderId)
					this.order = res.data || res
				}
				if (this.order && this.order.status !== '1') {
					this.startCountdown()
				}
			} catch (e) {
				uni.showToast({ title: '订单加载失败', icon: 'none' })
			} finally {
				this.loading = false
			}
		},
		startCountdown() {
			let seconds = 30 * 60
			this._timer = setInterval(() => {
				if (seconds <= 0) {
					clearInterval(this._timer)
					this.countdown = '已超时'
					return
				}
				seconds--
				const m = Math.floor(seconds / 60)
				const s = seconds % 60
				this.countdown = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
			}, 1000)
		},
		async handlePay() {
			if (this.paying) return
			this.paying = true
			try {
				// 调用支付接口
				const res = await request({
					url: `/system/order/${this.orderId}/pay`,
					method: 'post',
					data: { payMethod: this.selectedMethod }
				})
				const payData = res.data || res

				// #ifdef MP-WEIXIN
				if (this.selectedMethod === 'wxpay' && payData.timeStamp) {
					await new Promise((resolve, reject) => {
						wx.requestPayment({
							...payData,
							success: resolve,
							fail: reject,
						})
					})
				}
				// #endif

				// 支付成功，刷新订单
				await this.loadOrder()
				if (this._timer) clearInterval(this._timer)
				uni.showToast({ title: '支付成功', icon: 'success' })
			} catch (e) {
				const msg = (e && e.msg) || (e && e.errMsg) || '支付失败，请重试'
				uni.showToast({ title: msg, icon: 'none' })
			} finally {
				this.paying = false
			}
		}
	}
}
</script>

<style lang="scss">
page {
	background: #f4f6fb;
}

.page {
	min-height: 100vh;
	background: #f4f6fb;
}

/* 导航 */
.nav-bar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	background: #fff;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 0 4px;
	z-index: 100;
	box-shadow: 0 1px 0 #f1f5f9;
}

.nav-back {
	width: 44px;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-title {
	font-size: 16px;
	font-weight: 700;
	color: #1e293b;
}

/* 加载 */
.loading-wrap {
	display: flex;
	align-items: center;
	justify-content: center;
	padding-top: 200px;
}

/* 滚动 */
.scroll-content {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
}

.content-wrap {
	padding: 12px 14px 0;
}

/* 支付状态卡 */
.pay-status-card {
	background: #fff;
	border-radius: 14px;
	padding: 28px 16px;
	margin-bottom: 12px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.pay-status-card.pending {
	background: #fffbeb;
}

.pay-status-title {
	font-size: 18px;
	font-weight: 700;
	color: #1e293b;
}

.pay-status-desc {
	font-size: 13px;
	color: #64748b;
}

/* 订单信息 */
.order-card {
	background: #fff;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 12px;
	box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.order-card-title {
	font-size: 15px;
	font-weight: 700;
	color: #1e293b;
	display: block;
	margin-bottom: 10px;
}

.order-divider {
	height: 1px;
	background: #f1f5f9;
	margin-bottom: 10px;
}

.order-row {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	padding: 6px 0;
}

.order-label {
	font-size: 13px;
	color: #94a3b8;
	width: 70px;
	flex-shrink: 0;
}

.order-value {
	font-size: 13px;
	color: #1e293b;
	flex: 1;
	text-align: right;
	line-height: 1.5;
}

.order-no {
	color: #64748b;
	font-size: 12px;
}

/* 金额卡 */
.amount-card {
	background: #fff;
	border-radius: 12px;
	padding: 18px 16px;
	margin-bottom: 12px;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.amount-label {
	font-size: 14px;
	color: #64748b;
	margin-bottom: 4px;
}

.amount-row {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
}

.amount-unit {
	font-size: 18px;
	color: #ef4444;
	font-weight: 700;
	margin-top: 6px;
}

.amount-value {
	font-size: 40px;
	font-weight: 700;
	color: #ef4444;
	line-height: 1.2;
}

.amount-tip {
	font-size: 11px;
	color: #94a3b8;
	margin-top: 6px;
}

/* 支付方式 */
.pay-method-card {
	background: #fff;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 12px;
	box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.pay-method-item {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 10px 0;
	gap: 12px;
}

.pay-method-icon-wrap {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.pay-method-icon {
	width: 28px;
	height: 28px;
}

.pay-method-name {
	font-size: 14px;
	color: #1e293b;
	flex: 1;
}

.pay-radio {
	width: 20px;
	height: 20px;
	border-radius: 50%;
	border: 1.5px solid #cbd5e1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.pay-radio.pay-radio-active {
	border-color: #3B82F6;
}

.pay-radio-inner {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: #3B82F6;
}

/* 底部支付栏 */
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	padding: 12px 16px;
	padding-bottom: calc(12px + env(safe-area-inset-bottom));
	box-shadow: 0 -1px 0 #f1f5f9;
	z-index: 50;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 12px;
}

.pay-total {
	display: flex;
	flex-direction: row;
	align-items: baseline;
}

.pay-total-label {
	font-size: 14px;
	color: #475569;
}

.pay-total-amount {
	font-size: 20px;
	font-weight: 700;
	color: #ef4444;
}

.pay-btn {
	flex: 1;
	height: 50px;
	border-radius: 25px;
	background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.pay-btn.pay-btn-disabled {
	background: #e2e8f0;
}

.pay-btn-text {
	font-size: 16px;
	font-weight: 700;
	color: #fff;
}

.pay-btn.pay-btn-disabled .pay-btn-text {
	color: #94a3b8;
}

.done-btn {
	flex: 1;
	height: 50px;
	border-radius: 25px;
	background: #1e293b;
	display: flex;
	align-items: center;
	justify-content: center;
}

.done-btn-text {
	font-size: 16px;
	font-weight: 700;
	color: #fff;
}
</style>
