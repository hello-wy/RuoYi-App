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
				mode="aspectFill"
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
				<!-- 富文本渲染 -->
				<rich-text class="rich-content" :nodes="detail.description || ''"></rich-text>
			</view>

			<!-- 底部占位，防止被操作栏遮挡 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- ===== 底部操作栏 ===== -->
		<view class="bottom-bar" v-if="detail">
			<view class="bottom-price-wrap">
				<text class="bottom-price">¥{{ formatPrice(detail.currentPrice) }}</text>
				<text class="bottom-price-original" v-if="detail.originalPrice">¥{{ formatPrice(detail.originalPrice) }}</text>
			</view>
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
</template>

<script>
import { getInfo } from '@/api/system/info'

export default {
	data() {
		return {
			salonId: '',
			detail: null,
			loading: false,
			error: false,
			joining: false
		}
	},
	onLoad(options) {
		this.salonId = options.id || ''
		this.loadDetail()
	},
	methods: {
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
			this.joining = true
			try {
				await joinSalon(this.salonId)
				uni.showToast({ title: '报名成功', icon: 'success' })
			} catch (e) {
				uni.showToast({ title: '报名失败，请稍后重试', icon: 'none' })
				console.error('报名沙龙失败', e)
			} finally {
				this.joining = false
			}
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
	padding: 0 28rpx 24rpx;
	background: #fff;
}

.main-title {
	display: block;
	font-size: 36rpx;
	font-weight: 700;
	color: #1a1a1a;
	line-height: 1.5;
	margin-bottom: 8rpx;
}

.sub-title {
	display: block;
	font-size: 26rpx;
	color: #888;
}

/* 分割线 */
.divider {
	height: 16rpx;
	background: #f5f6fa;
}

/* 信息行 */
.info-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 24rpx 28rpx;
	background: #fff;
}

.info-icon-wrap {
	width: 56rpx;
	height: 56rpx;
	background: #EEF3FF;
	border-radius: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.info-text-wrap {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.info-label {
	font-size: 22rpx;
	color: #999;
	margin-bottom: 4rpx;
}

.info-value {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

/* 详情区 */
.detail-section {
	background: #fff;
	padding: 28rpx;
	margin-top: 16rpx;
}

.section-title-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 24rpx;
}

.section-title-bar {
	width: 8rpx;
	height: 36rpx;
	background: #E53E3E;
	border-radius: 4rpx;
	margin-right: 16rpx;
}

.section-title-text {
	font-size: 32rpx;
	font-weight: 700;
	color: #1a1a1a;
}

.rich-content {
	font-size: 28rpx;
	color: #333;
	line-height: 1.8;
}

/* 底部操作栏 */
.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #fff;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 28rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
	box-sizing: border-box;
}

.bottom-price-wrap {
	display: flex;
	flex-direction: row;
	align-items: baseline;
}

.bottom-price {
	font-size: 44rpx;
	font-weight: 700;
	color: #E53E3E;
}

.bottom-price-original {
	font-size: 24rpx;
	color: #aaa;
	text-decoration: line-through;
	margin-left: 10rpx;
}

.join-btn {
	width: 280rpx;
	height: 80rpx;
	line-height: 80rpx;
	background: #E53E3E;
	color: #fff;
	font-size: 30rpx;
	font-weight: 600;
	border-radius: 40rpx;
	text-align: center;
	border: none;
}

.join-btn-disabled {
	background: #ccc;
	color: #fff;
}

.join-btn::after {
	border: none;
}

/* 底部安全区占位 */
.bottom-placeholder {
	height: calc(120rpx + env(safe-area-inset-bottom));
}
</style>
