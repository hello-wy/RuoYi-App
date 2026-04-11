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
		<view v-else-if="detail" class="content">

			<!-- ===== Hero 横幅 ===== -->
			<view class="hero" :class="heroClass">
				<!-- 状态角标 -->
				<view class="hero-status-badge" :class="statusBadgeClass">
					<text class="hero-status-text">{{ statusLabel }}</text>
				</view>

				<!-- 分类小标签 -->
				<view class="hero-status-badge" style="margin-left: 10rpx;">
					<text class="hero-status-text">{{ catLabel }}</text>
				</view>

				<!-- 标题 -->
				<text class="hero-title">{{ detail.title }}</text>

				<!-- 薪资主展示 -->
				<view class="hero-salary-row">
					<text class="hero-salary-num">¥{{ detail.salaryDay }}</text>
					<view class="hero-salary-desc">
						<text class="hero-salary-unit">元</text>
						<text class="hero-salary-slash"> / </text>
						<text class="hero-salary-daily">日结</text>
					</view>
				</view>

				<!-- 日期时间快览 -->
				<view class="hero-meta">
					<view class="hero-meta-item">
						<uni-icons type="calendar" size="14" color="rgba(255,255,255,0.85)"></uni-icons>
						<text class="hero-meta-text">{{ detail.workDate }}</text>
					</view>
					<view class="hero-meta-divider"></view>
					<view class="hero-meta-item">
						<uni-icons type="time" size="14" color="rgba(255,255,255,0.85)"></uni-icons>
						<text class="hero-meta-text">{{ detail.workTime || '时段待定' }}</text>
					</view>
				</view>
			</view>

			<!-- ===== 地点卡片 ===== -->
			<view class="section-card" @click="openMap">
				<view class="section-card-row">
					<view class="section-icon-wrap" style="background:#EEF3FF;">
						<uni-icons type="location-filled" size="18" color="#3B82F6"></uni-icons>
					</view>
					<view class="section-text-wrap">
						<text class="section-label">工作地点</text>
						<text class="section-value">{{ detail.location || '详细地址接单后可见' }}</text>
						<text v-if="detail.districtId" class="section-sub">{{ detail.districtId }}</text>
					</view>
					<uni-icons type="right" size="16" color="#CCC"></uni-icons>
				</view>
				<!-- 地图预览 -->
				<view v-if="mapLat && mapLng" class="map-preview">
					<map
						class="map-view"
						:longitude="mapLng"
						:latitude="mapLat"
						:markers="markers"
						:show-location="false"
						:enable-scroll="false"
					></map>
				</view>
			</view>

			<!-- ===== 工作详情 ===== -->
			<view class="info-group">
				<text class="group-title">工作详情</text>
				<view class="info-grid">
					<view class="info-cell">
						<text class="info-cell-label">工作日期</text>
						<text class="info-cell-value">{{ detail.workDate || '--' }}</text>
					</view>
					<view class="info-cell">
						<text class="info-cell-label">工作时段</text>
						<text class="info-cell-value">{{ detail.workTime || '--' }}</text>
					</view>
					<view class="info-cell">
						<text class="info-cell-label">岗位分类</text>
						<text class="info-cell-value">{{ catLabel }}</text>
					</view>
					<view class="info-cell">
						<text class="info-cell-label">结算方式</text>
						<text class="info-cell-value salary-inline">日结 ¥{{ detail.salaryDay }}/天</text>
					</view>
				</view>
			</view>

			<!-- ===== 工作要求 ===== -->
			<view class="info-group" v-if="detail.description">
				<text class="group-title">工作要求</text>
				<view class="req-list">
					<view
						v-for="(req, i) in parseDesc(detail.description)"
						:key="i"
						class="req-item"
					>
						<view class="req-dot"></view>
						<text class="req-text">{{ req }}</text>
					</view>
				</view>
			</view>

			<!-- ===== 发布者信息 ===== -->
			<view class="info-group">
				<text class="group-title">联系方式</text>
				<view class="contact-card">
					<view class="contact-row">
						<view class="contact-avatar">
							<text class="contact-avatar-text">{{ avatarChar }}</text>
						</view>
						<view class="contact-info">
							<text class="contact-name">{{ detail.contacts }}</text>
							<text class="contact-phone">{{ detail.phone }}</text>
						</view>
						<view class="contact-call-btn" @click="callPhone">
							<uni-icons type="phone-filled" size="18" color="#3B82F6"></uni-icons>
						</view>
					</view>
				</view>
			</view>

			<!-- ===== 发布时间 ===== -->
			<view class="publish-row">
				<uni-icons type="info" size="12" color="#CCC"></uni-icons>
				<text class="publish-text">发布于 {{ timeAgo(detail.createDate) }} · ID #{{ formatId(detail.id) }}</text>
			</view>

			<view style="height: 160rpx;"></view>
		</view>

		<!-- ===== 底部操作栏 ===== -->
		<view class="bottom-bar" v-if="detail">
			<view class="bottom-salary">
				<text class="bottom-salary-num">¥{{ detail.salaryDay }}</text>
				<text class="bottom-salary-unit">/日</text>
			</view>
			<button
				class="apply-btn"
				:disabled="detail.status != 0"
				:class="{ 'apply-btn-disabled': detail.status != 0 }"
				open-type="contact"
			>
				{{ detail.status == 0 ? '立即申请' : (detail.status == 1 ? '已满员' : '已结束') }}
			</button>
		</view>
	</view>
</template>

<script>
import { getJobs } from '@/api/system/jobs'

const CAT_MAP = { '0': '家教', '1': '助教', '2': '派发', '3': '其他' }
const HERO_CLASSES = { '0': 'hero-blue', '1': 'hero-green', '2': 'hero-amber', '3': 'hero-slate' }
const STATUS_LABEL = { '0': '招募中', '1': '已满员', '2': '已结束' }
const STATUS_BADGE_CLASS = { '0': 'badge-open', '1': 'badge-full', '2': 'badge-end' }

export default {
	data() {
		return {
			jobId: '',
			detail: null,
			loading: false,
			error: false,
			mapLat: 0,
			mapLng: 0
		}
	},
	computed: {
		catLabel() {
			return CAT_MAP[String(this.detail && this.detail.category)] || '其他'
		},
		heroClass() {
			return HERO_CLASSES[String(this.detail && this.detail.category)] || 'hero-slate'
		},
		statusLabel() {
			return STATUS_LABEL[String(this.detail && this.detail.status)] || '--'
		},
		statusBadgeClass() {
			return STATUS_BADGE_CLASS[String(this.detail && this.detail.status)] || ''
		},
		markers() {
			if (!this.mapLat || !this.mapLng) return []
			return [{ id: 1, latitude: this.mapLat, longitude: this.mapLng }]
		},
		avatarChar() {
			const name = (this.detail && this.detail.contacts) || ''
			return name ? name.slice(-1) : '人'
		}
	},
	onLoad(options) {
		this.jobId = options.id || ''
		this.loadDetail()
	},
	methods: {
		async loadDetail() {
			if (!this.jobId) return
			this.loading = true
			this.error = false
			try {
				const res = await getJobs(this.jobId)
				this.detail = res.data || res
				if (this.detail.geo) {
					const parts = this.detail.geo.split(',')
					this.mapLng = parseFloat(parts[0]) || 0
					this.mapLat = parseFloat(parts[1]) || 0
				}
			} catch (e) {
				this.error = true
				console.error('加载兼职详情失败', e)
			} finally {
				this.loading = false
			}
		},
		parseDesc(text) {
			if (!text) return []
			return text.split(/[，,。\n；;]/).map(s => s.trim()).filter(Boolean)
		},
		timeAgo(dateVal) {
			if (!dateVal) return ''
			const diff = Math.floor((Date.now() - new Date(dateVal).getTime()) / 1000)
			if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前'
			if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前'
			return Math.floor(diff / 86400) + ' 天前'
		},
		formatId(id) {
			if (!id) return '----'
			return String(id).slice(-4).toUpperCase()
		},
		openMap() {
			if (!this.mapLat || !this.mapLng) return
			uni.openLocation({
				latitude: this.mapLat,
				longitude: this.mapLng,
				name: (this.detail && this.detail.location) || '工作地点'
			})
		},
		callPhone() {
			const phone = (this.detail && this.detail.phone) || ''
			if (!phone) return uni.showToast({ title: '暂无联系电话', icon: 'none' })
			uni.makePhoneCall({ phoneNumber: phone })
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background: #F5F5F5;
}

/* Hero 横幅 */
.hero {
	position: relative;
	padding: 48rpx 36rpx 40rpx;
	overflow: hidden;
}
.hero::after {
	content: '';
	position: absolute;
	right: -40rpx;
	bottom: -40rpx;
	width: 240rpx;
	height: 240rpx;
	border-radius: 50%;
	background: rgba(255,255,255,0.08);
}
.hero::before {
	content: '';
	position: absolute;
	right: 60rpx;
	top: -30rpx;
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	background: rgba(255,255,255,0.06);
}
.hero-blue { background: linear-gradient(135deg, #2563EB 0%, #3B82F6 60%, #60A5FA 100%); }
.hero-green { background: linear-gradient(135deg, #059669 0%, #10B981 60%, #34D399 100%); }
.hero-amber { background: linear-gradient(135deg, #D97706 0%, #F59E0B 60%, #FCD34D 100%); }
.hero-slate { background: linear-gradient(135deg, #374151 0%, #6B7280 60%, #9CA3AF 100%); }

.hero-status-badge {
	display: inline-flex;
	align-items: center;
	padding: 6rpx 20rpx;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
}
.badge-open { background: rgba(255,255,255,0.25); }
.badge-full { background: rgba(0,0,0,0.2); }
.badge-end { background: rgba(0,0,0,0.25); }
.hero-status-text {
	font-size: 22rpx;
	color: #fff;
	font-weight: 600;
}

.hero-cat-chip {
	background: rgba(255,255,255,0.18);
	border: 1rpx solid rgba(255,255,255,0.3);
	border-radius: 8rpx;
	padding: 4rpx 16rpx;
	display: inline-block;
	margin-bottom: 16rpx;
}
.hero-cat-text {
	font-size: 22rpx;
	color: rgba(255,255,255,0.9);
}

.hero-title {
	display: block;
	font-size: 40rpx;
	font-weight: bold;
	color: #fff;
	margin-bottom: 24rpx;
	line-height: 1.4;
}

.hero-salary-row {
	display: flex;
	flex-direction: row;
	align-items: flex-end;
	margin-bottom: 28rpx;
}
.hero-salary-num {
	font-size: 72rpx;
	font-weight: 900;
	color: #fff;
	line-height: 1;
}
.hero-salary-desc {
	display: flex;
	flex-direction: row;
	align-items: flex-end;
	margin-left: 8rpx;
	margin-bottom: 8rpx;
}
.hero-salary-unit, .hero-salary-slash, .hero-salary-daily {
	font-size: 26rpx;
	color: rgba(255,255,255,0.85);
}

.hero-meta {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 16rpx;
}
.hero-meta-item {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 6rpx;
}
.hero-meta-text {
	font-size: 24rpx;
	color: rgba(255,255,255,0.85);
}
.hero-meta-divider {
	width: 1rpx;
	height: 24rpx;
	background: rgba(255,255,255,0.3);
}

/* 卡片 section */
.section-card {
	background: #fff;
	border-radius: 20rpx;
	margin: 24rpx 24rpx 0;
	padding: 28rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
}
.section-card-row {
	display: flex;
	flex-direction: row;
	align-items: center;
}
.section-icon-wrap {
	width: 60rpx;
	height: 60rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin-right: 20rpx;
}
.section-text-wrap {
	flex: 1;
}
.section-label {
	font-size: 24rpx;
	color: #999;
	display: block;
	margin-bottom: 4rpx;
}
.section-value {
	font-size: 28rpx;
	font-weight: 600;
	color: #1A1A1A;
	display: block;
}
.section-sub {
	font-size: 22rpx;
	color: #AAA;
	margin-top: 4rpx;
	display: block;
}
.map-preview {
	border-radius: 12rpx;
	overflow: hidden;
	margin-top: 20rpx;
}
.map-view {
	width: 100%;
	height: 200rpx;
}

/* 信息分组 */
.info-group {
	background: #fff;
	border-radius: 20rpx;
	margin: 20rpx 24rpx 0;
	padding: 28rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
}
.group-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #1A1A1A;
	display: block;
	margin-bottom: 24rpx;
	padding-left: 16rpx;
	border-left: 6rpx solid #3B82F6;
}

/* Grid 信息 */
.info-grid {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 0;
}
.info-cell {
	width: 50%;
	padding: 16rpx 0;
	border-bottom: 1rpx solid #F3F4F6;
}
.info-cell:nth-child(odd) {
	padding-right: 24rpx;
}
.info-cell-label {
	font-size: 22rpx;
	color: #999;
	display: block;
	margin-bottom: 6rpx;
}
.info-cell-value {
	font-size: 28rpx;
	color: #1A1A1A;
	font-weight: 600;
	display: block;
}
.salary-inline {
	color: #EF4444;
}

/* 工作要求 */
.req-list {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}
.req-item {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	gap: 14rpx;
}
.req-dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: #3B82F6;
	margin-top: 10rpx;
	flex-shrink: 0;
}
.req-text {
	font-size: 28rpx;
	color: #333;
	line-height: 1.6;
	flex: 1;
}

/* 联系方式 */
.contact-card {
	background: #F9FAFB;
	border-radius: 16rpx;
	padding: 24rpx;
}
.contact-row {
	display: flex;
	flex-direction: row;
	align-items: center;
}
.contact-avatar {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: #3B82F6;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
	flex-shrink: 0;
}
.contact-avatar-text {
	font-size: 28rpx;
	color: #fff;
	font-weight: bold;
}
.contact-info {
	flex: 1;
}
.contact-name {
	font-size: 30rpx;
	font-weight: bold;
	color: #1A1A1A;
	display: block;
	margin-bottom: 6rpx;
}
.contact-phone {
	font-size: 26rpx;
	color: #888;
}
.contact-call-btn {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: #EEF3FF;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 发布时间 */
.publish-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	padding: 24rpx 0 8rpx;
	gap: 8rpx;
}
.publish-text {
	font-size: 22rpx;
	color: #CCC;
}

/* 底部操作栏 */
.bottom-bar {
	position: sticky;
	bottom: 0;
	background: #fff;
	border-top: 1rpx solid #ECECEC;
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 20rpx 32rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	gap: 24rpx;
}
.bottom-salary {
	display: flex;
	flex-direction: row;
	align-items: baseline;
}
.bottom-salary-num {
	font-size: 44rpx;
	font-weight: 900;
	color: #EF4444;
}
.bottom-salary-unit {
	font-size: 24rpx;
	color: #EF4444;
	margin-left: 4rpx;
}
.apply-btn {
	flex: 1;
	background: #1A1A1A;
	color: #fff;
	border-radius: 80rpx;
	font-size: 30rpx;
	font-weight: bold;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
}
.apply-btn-disabled {
	background: #CCC;
}

/* 加载/错误 */
.loading-wrap, .error-wrap {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 100rpx 0;
	gap: 20rpx;
}
.error-text { font-size: 28rpx; color: #999; }
.retry-btn {
	padding: 14rpx 48rpx;
	background: #f0f0f0;
	border-radius: 40rpx;
}
.retry-text { font-size: 28rpx; color: #555; }
</style>
