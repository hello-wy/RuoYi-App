<template>
	<view class="page">
		<!-- 加载中 -->
		<view v-if="loading" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<!-- 加载失败 -->
		<view v-else-if="error" class="error-wrap">
			<text class="error-text">加载失败，请重试</text>
			<view class="retry-btn" @click="loadDetail">
				<text class="retry-text">重试</text>
			</view>
		</view>

		<!-- 内容 -->
		<scroll-view v-else-if="detail" scroll-y class="content-scroll">
			<!-- ===== 封面图 ===== -->
			<image
				class="cover-image"
				:src="detail.coverImg || '/static/images/banner/default.jpg'"
				mode="widthFix"
			></image>

			<!-- ===== 价格与销量 ===== -->
			<view class="price-section">
				<view class="price-left">
					<text class="price-current">¥{{ formatPrice(detail.currentPrice) }}</text>
					<text class="price-original" v-if="detail.originalPrice">¥{{ formatPrice(detail.originalPrice) }}</text>
				</view>
				<text class="sales-text" v-if="detail.salesVolume">已售{{ detail.salesVolume }}</text>
			</view>

			<!-- ===== 标题与副标题 ===== -->
			<view class="title-section">
				<text class="main-title">{{ detail.title }}</text>
				<text class="sub-title">{{ detail.subtitle }}</text>
			</view>

			<!-- 分割线 -->
			<view class="divider"></view>

			<!-- ===== 时间信息 ===== -->
			<view class="info-row" v-if="detail.startTime">
				<view class="info-icon-wrap">
					<uni-icons type="calendar" size="16" color="#3B82F6"></uni-icons>
				</view>
				<view class="info-text-wrap">
					<text class="info-label">活动时间</text>
					<text class="info-value">{{ formatDate(detail.startTime) }}</text>
				</view>
			</view>

			<!-- 分割线 -->
			<view class="divider"></view>

			<!-- ===== 详情/富文本 ===== -->
			<view class="detail-section">
				<view class="section-title-row">
					<view class="section-title-bar"></view>
					<text class="section-title-text">详情</text>
				</view>
				<!-- 原样文本渲染，保留数据库换行 -->
				<text class="rich-content">{{ formatDescription(detail.description) }}</text>
			</view>

			<!-- 底部占位，防止被操作栏遮挡 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- ===== 底部操作栏 ===== -->
		<view class="bottom-bar" v-if="detail">
			<view class="bottom-left-actions">
				<view class="bottom-price-wrap">
					<text class="bottom-price">¥{{ formatPrice(detail.currentPrice) }}</text>
					<text class="bottom-price-original" v-if="detail.originalPrice">¥{{ formatPrice(detail.originalPrice) }}</text>
				</view>
			</view>
			<view class="bottom-right-actions">
				<button class="share-btn" open-type="share">
					<view class="share-btn-inner">
						<uni-icons type="redo" size="24" color="#6B7280"></uni-icons>
						<text class="share-btn-text">分享</text>
					</view>
				</button>
				<button
					class="join-btn"
					:class="{ 'join-btn-disabled': detail.status != 1 }"
					:disabled="detail.status != 1"
					@click="handleJoin"
				>
					{{ detail.status == 1 ? '立即报名' : '已结束' }}
				</button>
			</view>
		</view>
		<!-- 登录弹窗 -->
		<LoginPopup :auto-open="shouldAutoOpenLogin" @close="handleLoginPopupClose"/>
	</view>
</template>

<script>
import { getInfo } from '@/pages/salon/_api/system/info'
import { createSalonPayOrder, querySalonPayOrder } from '@/pages/salon/_api/wxmini/salonPay'
import { getMyReferralCode } from '@/api/wxmini/referral'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store';
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'

export default {
	data() {
		return {
			salonId: '',
			detail: null,
			loading: false,
			error: false,
			joining: false,
			shouldAutoOpenLogin: false,
			inviteCode: ''
		}
	},
	onLoad(options) {
		this.salonId = options.id || ''
		this.loadDetail()
		this.loadInviteCode()
	},
	onShareAppMessage() {
		const title = this.detail?.title || '沙龙活动详情'
		const imageUrl = this.detail?.coverImg || ''
		const path = this.buildSharePath()
		return { title, imageUrl, path }
	},
	onShareTimeline() {
		const title = this.detail?.title || '沙龙活动详情'
		const imageUrl = this.detail?.coverImg || ''
		return { title, imageUrl, query: this.buildShareQuery() }
	},
	methods: {
		async loadInviteCode() {
			if (!getToken()) {
				this.inviteCode = ''
				return
			}
			try {
				const res = await getMyReferralCode()
				this.inviteCode = res?.data?.inviteCode || ''
			} catch (e) {
				this.inviteCode = ''
			}
		},
		buildShareQuery() {
			const query = `id=${encodeURIComponent(this.salonId)}`
			if (!this.inviteCode) return query
			return `${query}&inviteCode=${encodeURIComponent(this.inviteCode)}`
		},
		buildSharePath() {
			return `/pages/salon/detail?${this.buildShareQuery()}`
		},
		async loadDetail() {
			if (!this.salonId) return
			this.loading = true
			this.error = false
			try {
				const res = await getInfo(this.salonId)
				this.detail = res.data || res
			} catch (e) {
				this.error = true
				console.error('加载沙龙详情失败', e)
			} finally {
				this.loading = false
			}
		},
		async handleJoin() {
			if (this.joining || !this.detail || this.detail.status != 1) return
			// # 判断用户是否登录
			const userStore = useUserStore()
			if (!userStore.token) {
				uni.showToast({ title: '请先登录', icon: 'none' })
				this.shouldAutoOpenLogin = true
				return
			}
			this.joining = true
			try {
				const res = await createSalonPayOrder({ salonId: Number(this.salonId) })
				const payload = res.data || res
				const payParam = payload.payParam || {}
				await uni.requestPayment({
					provider: 'wxpay',
					appId: payParam.appId || payParam.appid,
					timeStamp: payParam.timeStamp,
					nonceStr: payParam.nonceStr,
					package: payParam.packageValue || payParam.package,
					signType: payParam.signType || 'RSA',
					paySign: payParam.paySign
				})
				await this.confirmPaidAndNavigate(payload.orderNo)
			} catch (e) {
				uni.showToast({ title: '支付未完成', icon: 'none' })
				console.error('支付沙龙失败', e)
			} finally {
				this.joining = false
			}
		},
		handleLoginPopupClose() {
			this.shouldAutoOpenLogin = false
		},
		async confirmPaidAndNavigate(orderNo) {
			for (let i = 0; i < 5; i++) {
				const res = await querySalonPayOrder(orderNo)
				const order = res.data || res
				if (order.status === 'PAID') {
					uni.navigateTo({ url: `/pages/salon/order-detail?orderNo=${orderNo}` })
					return
				}
				await new Promise(resolve => setTimeout(resolve, 800))
			}
			uni.showToast({ title: '支付结果确认中，请稍后查看', icon: 'none' })
		},
		formatPrice(val) {
			if (val === null || val === undefined) return '0.00'
			return Number(val).toFixed(2)
		},
		formatDate(val) {
			if (!val) return '--'
			const d = new Date(val)
			if (isNaN(d.getTime())) return val
			const y = d.getFullYear()
			const m = String(d.getMonth() + 1).padStart(2, '0')
			const day = String(d.getDate()).padStart(2, '0')
			return `${y}-${m}-${day}`
		},
		formatDescription(val) {
			if (!val) return ''
			return String(val).replace(/↵/g, '\n')
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background-color: #f5f6fa;
}

.loading-wrap,
.error-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
}

.error-text {
	font-size: 28rpx;
	color: #999;
	margin-bottom: 24rpx;
}

.retry-btn {
	padding: 16rpx 48rpx;
	background: #3B82F6;
	border-radius: 40rpx;
}

.retry-text {
	font-size: 28rpx;
	color: #fff;
}

.content-scroll {
	height: 100vh;
}

/* 封面图 */
.cover-image {
	width: 100%;
	height: 580rpx;
	display: block;
}

/* 价格区域 */
.price-section {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 28rpx 16rpx;
	background: #fff;
}

.price-left {
	display: flex;
	flex-direction: row;
	align-items: baseline;
}

.price-current {
	font-size: 52rpx;
	font-weight: 700;
	color: #E53E3E;
}

.price-original {
	font-size: 26rpx;
	color: #aaa;
	text-decoration: line-through;
	margin-left: 12rpx;
}

.sales-text {
	font-size: 24rpx;
	color: #999;
}

/* 标题区域 */
.title-section {
	background: #fff;
	padding: 0 28rpx 24rpx;
}

.main-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #1f2937;
	line-height: 1.45;
	display: block;
}

.sub-title {
	font-size: 26rpx;
	color: #6b7280;
	margin-top: 12rpx;
	display: block;
	line-height: 1.5;
}

.divider {
	height: 20rpx;
	background: #f5f6fa;
}

.info-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 24rpx 28rpx;
	background: #fff;
}

.info-icon-wrap {
	width: 64rpx;
	height: 64rpx;
	border-radius: 18rpx;
	background: #EFF6FF;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.info-text-wrap {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.info-label {
	font-size: 24rpx;
	color: #94A3B8;
}

.info-value {
	font-size: 30rpx;
	font-weight: 600;
	color: #1f2937;
	margin-top: 8rpx;
}

.detail-section {
	background: #fff;
	padding: 32rpx 28rpx;
}

.section-title-row {
	display: flex;
	align-items: center;
	margin-bottom: 24rpx;
}

.section-title-bar {
	width: 8rpx;
	height: 32rpx;
	border-radius: 999rpx;
	background: linear-gradient(180deg, #3B82F6 0%, #60A5FA 100%);
	margin-right: 16rpx;
}

.section-title-text {
	font-size: 32rpx;
	font-weight: 700;
	color: #111827;
}

.rich-content {
	font-size: 28rpx;
	line-height: 1.8;
	color: #374151;
	white-space: pre-wrap;
	word-break: break-all;
}

.bottom-placeholder {
	height: 160rpx;
}

.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #fff;
	box-shadow: 0 -8rpx 24rpx rgba(15, 23, 42, 0.08);
	padding: 20rpx 28rpx calc(20rpx + env(safe-area-inset-bottom));
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.bottom-left-actions {
	display: flex;
	align-items: center;
}

.bottom-right-actions {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.bottom-price-wrap {
	display: flex;
	align-items: baseline;
	gap: 12rpx;
}

.bottom-price {
	font-size: 44rpx;
	font-weight: 800;
	color: #E53E3E;
}

.bottom-price-original {
	font-size: 24rpx;
	color: #9CA3AF;
	text-decoration: line-through;
}

.share-btn {
	margin: 0;
	padding: 0;
	width: 80rpx;
	height: 88rpx;
	background: transparent !important;
	border: none !important;
	box-shadow: none !important;
	line-height: 1 !important;
	font-size: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.share-btn::after {
	display: none !important;
	border: none !important;
}

.share-btn-inner {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 6rpx;
}

.share-btn-text {
	font-size: 20rpx;
	color: #6B7280;
	font-weight: 400;
	line-height: 1;
}

.join-btn {
	margin: 0;
	min-width: 240rpx;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #2563EB, #3B82F6);
	color: #fff;
	font-size: 30rpx;
	font-weight: 700;
}

.join-btn-disabled {
	background: #CBD5E1 !important;
	color: #fff !important;
}
</style>
