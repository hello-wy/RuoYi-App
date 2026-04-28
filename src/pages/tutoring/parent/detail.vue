<template>
	<view class="page">
		<!-- 加载中 -->
		<view v-if="loading" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<!-- 加载失败 -->
		<view v-else-if="error" class="error-wrap">
			<text>加载失败，请重试</text>
		</view>

		<!-- 内容 -->
		<view v-else-if="detail" class="content">

			<!-- 状态栏 -->
			<view class="status-bar">
				<view class="badge-recruiting">
					<text v-if="detail.status == 0" class="badge-text">招募中</text>
					<text v-if="detail.status == 1" class="badge-text">已完成</text>
					<text v-if="detail.status == 2" class="badge-text">已取消</text>
				</view>
				<text class="post-time">发布于 {{ timeAgo(detail.createDate) }}</text>
			</view>

			<!-- 标题 -->
			<view class="title-section">
				<text class="order-title">{{ detail.name }}</text>
			</view>

			<!-- 快捷标签：仅保留方式 -->
			<view v-if="detailQuickTags.length" class="quick-tags">
				<view
					v-for="(tag, index) in detailQuickTags"
					:key="`${tag.dict}-${index}`"
					class="quick-tag"
				>
					<uni-icons :type="tag.icon" size="14" color="#3B82F6"></uni-icons>
					<dict-tag :options="dict.type[tag.dict]" :value="tag.value"/>
				</view>
			</view>

			<view class="divider-full"></view>

			<!-- 基础信息 -->
			<view class="section">
				<text class="section-title">基础信息</text>

				<view class="info-row">
					<uni-icons type="calendar" size="18" color="#666"></uni-icons>
					<view class="info-content">
						<text class="info-label">上课时间</text>
						<text class="info-value">{{ formatClassTime(detail.dayOfWeek, detail.startTime, detail.endTime) }}</text>
					</view>
				</view>

				<view class="info-row">
					<uni-icons type="location" size="18" color="#666"></uni-icons>
					<view class="info-content">
						<text class="info-label">上课地点</text>
						<text class="info-value">{{ detail.location || (detail.region + '（详细地址接单后可见）') }}</text>
					</view>
				</view>

				<view class="map-placeholder" @click="openMap">
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

			<view class="divider-full"></view>

			<!-- 学员情况 -->
			<view class="section">
				<text class="section-title">学员情况</text>
				<view class="student-card">
					<view class="student-icon-wrap" style="background:#EEF9F0;">
						<uni-icons type="person" size="18" color="#10B981"></uni-icons>
					</view>
					<view class="student-item-content">
						<text class="student-item-label">目前水平</text>
						<text class="student-item-value">{{ detail.brief || '暂无描述' }}</text>
					</view>

				</view>
			</view>

			<view class="divider-full"></view>

			<!-- 教员要求 -->
			<view class="section">
				<text class="section-title">教员要求</text>
				<view v-if="detail.requirements" class="requirement-list">
					<view
						v-for="(req, i) in parseRequirements(detail.requirements)"
						:key="i"
						class="req-item"
					>
						<uni-icons type="checkmarkempty" size="16" color="#10B981"></uni-icons>
						<text class="req-text">{{ req }}</text>
					</view>
				</view>
				<text v-else class="empty-text">暂无特别要求</text>
			</view>

			<view style="height: 200rpx;"></view>
		</view>

		<view class="bottom-bar">
			<view class="btn-map" @click="openMap">
				<uni-icons type="map" size="18" color="#333"></uni-icons>
				<text class="btn-map-text">查看地图</text>
			</view>
			<button class="btn-apply btn-apply-text" type="primary" size="small" open-type="contact">立即申请</button>
		</view>
	</view>
</template>

<script>
import { getParents } from '@/api/wxmini/tutoring'
import { buildParentDetailQuickTags } from './display.helpers'

export default {
	dicts: ['sys_methods'],
	data() {
		return {
			orderId: '',
			detail: null,
			loading: false,
			error: false,
			mapLat: 32.06,
			mapLng: 118.79,
		}
	},
	computed: {
		detailQuickTags() {
			return buildParentDetailQuickTags(this.detail)
		},
		markers() {
			if (!this.mapLat || !this.mapLng) return []
			return [{
				id: 1,
				latitude: this.mapLat,
				longitude: this.mapLng,
			}]
		}
	},
	onLoad(options) {
		this.orderId = options.id || ''
		this.loadDetail()
	},
	methods: {
		async loadDetail() {
			if (!this.orderId) return
			this.loading = true
			this.error = false
			try {
				const res = await getParents(this.orderId)
				this.detail = res.data || res
				this.mapLng = res.data.geo.split(',')[0]
				this.mapLat = res.data.geo.split(',')[1]
			} catch (e) {
				this.error = true
				console.error('加载家教订单详情失败', e)
			} finally {
				this.loading = false
			}
		},
		formatClassTime(dayOfWeek, startTime, endTime) {
			const dayMap = { '1': '周一', '2': '周二', '3': '周三', '4': '周四', '5': '周五', '6': '周六', '7': '周日' }
			const days = dayOfWeek
				? dayOfWeek.split(',').map(d => dayMap[d.trim()] || '').filter(Boolean).join('、')
				: ''
			const time = (startTime && endTime) ? startTime + '-' + endTime
				: (startTime || endTime || '')
			if (!days && !time) return '--'
			if (!time) return days
			if (!days) return time
			return days + ' ' + time
		},
		timeAgo(dateVal) {
			if (!dateVal) return ''
			const now = Date.now()
			const ts = new Date(dateVal).getTime()
			const diff = Math.floor((now - ts) / 1000)
			if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前'
			if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前'
			return Math.floor(diff / 86400) + ' 天前'
		},
		parseRequirements(text) {
			if (!text) return []
			return text.split(/[，,。\n]/).map(s => s.trim()).filter(Boolean).slice(0, 5)
		},
		openMap() {
			uni.openLocation({
				latitude: this.mapLat,
				longitude: this.mapLng,
				name: this.detail ? (this.detail.location || this.detail.region || '上课地点') : '上课地点'
			})
		},
		applyOrder() {
			uni.showToast({ title: '申请功能开发中', icon: 'none' })
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background: #fff;
}

/* 状态栏 */
.status-bar {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 32rpx 12rpx;
}
.badge-recruiting {
	background: #EEF3FF;
	border-radius: 8rpx;
	padding: 4rpx 16rpx;
}
.badge-text {
	font-size: 24rpx;
	color: #3B82F6;
}
.post-time {
	font-size: 24rpx;
	color: #999;
}

/* 标题 */
.title-section {
	padding: 0 32rpx 20rpx;
}
.order-title {
	font-size: 44rpx;
	font-weight: bold;
	color: #1A1A1A;
	display: block;
	margin-bottom: 12rpx;
}

/* 快捷标签 */
.quick-tags {
	display: flex;
	flex-direction: row;
	gap: 16rpx;
	padding: 0 32rpx 24rpx;
	flex-wrap: wrap;
}
.quick-tag {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 10rpx 18rpx;
	background: #F4F8FF;
	border-radius: 999rpx;
}
.divider-full {
	height: 16rpx;
	background: #F7F7F7;
}
.section {
	padding: 28rpx 32rpx;
}
.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #222;
	display: block;
	margin-bottom: 24rpx;
}
.info-row {
	display: flex;
	align-items: flex-start;
	gap: 18rpx;
	margin-bottom: 28rpx;
}
.info-content {
	flex: 1;
}
.info-label {
	display: block;
	font-size: 26rpx;
	color: #888;
	margin-bottom: 8rpx;
}
.info-value {
	font-size: 28rpx;
	color: #222;
	line-height: 1.6;
}
.map-placeholder {
	width: 100%;
	height: 280rpx;
	border-radius: 20rpx;
	overflow: hidden;
	background: #f5f5f5;
}
.map-view {
	width: 100%;
	height: 100%;
}
.student-card {
	display: flex;
	align-items: flex-start;
	gap: 18rpx;
	background: #FAFBFC;
	border-radius: 20rpx;
	padding: 24rpx;
}
.student-icon-wrap {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.student-item-content {
	flex: 1;
}
.student-item-label {
	display: block;
	font-size: 26rpx;
	color: #888;
	margin-bottom: 8rpx;
}
.student-item-value {
	font-size: 28rpx;
	color: #222;
	line-height: 1.7;
}
.requirement-list {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}
.req-item {
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
}
.req-text {
	flex: 1;
	font-size: 28rpx;
	color: #222;
	line-height: 1.7;
}
.empty-text {
	font-size: 28rpx;
	color: #999;
}
.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #fff;
	padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
	display: flex;
	align-items: center;
	gap: 20rpx;
	box-shadow: 0 -6rpx 24rpx rgba(0,0,0,0.06);
}
.btn-map {
	width: 180rpx;
	height: 84rpx;
	border-radius: 18rpx;
	background: #F7F7F7;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
}
.btn-map-text {
	font-size: 28rpx;
	color: #333;
}
.btn-apply {
	flex: 1;
	height: 84rpx;
	line-height: 84rpx;
	border-radius: 18rpx;
	background: linear-gradient(90deg, #3B82F6 0%, #2563EB 100%);
	border: none;
}
.btn-apply-text {
	font-size: 30rpx;
	font-weight: 600;
	color: #fff;
}
.loading-wrap,
.error-wrap {
	padding: 80rpx 0;
	display: flex;
	justify-content: center;
	align-items: center;
	color: #999;
}
</style>
