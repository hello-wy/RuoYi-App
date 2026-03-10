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

			<!-- 快捷标签：年级 + 科目 + 方式 -->
			<view class="quick-tags">
				<view class="quick-tag">
					<uni-icons type="person" size="14" color="#3B82F6"></uni-icons>
					<dict-tag :options="dict.type.sys_class" :value="detail.grade ? detail.grade.split(',') : []"/>
				</view>
				<view class="quick-tag">
					<uni-icons type="compose" size="14" color="#3B82F6"></uni-icons>
					<dict-tag :options="dict.type.sys_subject" :value="detail.subject ? detail.subject.split(',') : []"/>
				</view>
				<view v-if="detail.methods && detail.methods.length" class="quick-tag">
					<uni-icons type="time" size="14" color="#3B82F6"></uni-icons>
					<dict-tag :options="dict.type.sys_methods" :value="detail.methods ? detail.methods.split(',') : []"/>
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

				<!-- 地图占位 -->
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

			<!-- 底部占位（防止被底栏遮住） -->
			<view style="height: 140rpx;"></view>
		</view>

		<!-- 底部操作栏 -->
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
import { getParents } from '@/api/system/parents'

export default {
	dicts: ['sys_subject', 'sys_class', 'sys_methods'],
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
	flex-wrap: wrap;
	padding: 0 32rpx 24rpx;
	gap: 16rpx;
}
.quick-tag {
	display: flex;
	flex-direction: row;
	align-items: center;
	background: #F3F4F6;
	border-radius: 15rpx;
	padding: 5rpx 15rpx;
	gap: 8rpx;
}
.quick-tag-text {
	font-size: 26rpx;
	color: #333;
}

/* 分割线 */
.divider-full {
	height: 16rpx;
	background: #F5F5F5;
}

/* 章节 */
.section {
	padding: 32rpx;
}
.section-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #1A1A1A;
	display: block;
	margin-bottom: 24rpx;
}

/* 基础信息行 */
.info-row {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	margin-bottom: 24rpx;
}
.info-content {
	margin-left: 16rpx;
	flex: 1;
}
.info-label {
	font-size: 28rpx;
	font-weight: 600;
	color: #1A1A1A;
	display: block;
	margin-bottom: 6rpx;
}
.info-value {
	font-size: 26rpx;
	color: #666;
}

/* 地图 */
.map-placeholder {
	border-radius: 12rpx;
	overflow: hidden;
	margin-top: 12rpx;
}
.map-view {
	width: 100%;
	height: 240rpx;
}

/* 学员情况 */
.student-card {
	background: #F9FAFB;
	border-radius: 16rpx;
	padding: 24rpx;
}
.student-item {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	margin-bottom: 24rpx;
}
.student-item:last-child {
	margin-bottom: 0;
}
.student-icon-wrap {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin-right: 20rpx;
}
.student-item-content {
	flex: 1;
}
.student-item-label {
	font-size: 28rpx;
	font-weight: 600;
	color: #1A1A1A;
	display: block;
	margin-bottom: 6rpx;
}
.student-item-value {
	font-size: 26rpx;
	color: #555;
	line-height: 1.6;
}

/* 教员要求 */
.requirement-list {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}
.req-item {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	gap: 12rpx;
}
.req-text {
	font-size: 28rpx;
	color: #333;
	line-height: 1.6;
	flex: 1;
}
.empty-text {
	font-size: 26rpx;
	color: #999;
}

/* 底部操作栏 */
.bottom-bar {
	position: sticky;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	border-top: 1rpx solid #ECECEC;
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 20rpx 32rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	gap: 24rpx;
}
.btn-map {
	display: flex;
	flex-direction: row;
	align-items: center;
	border: 1rpx solid #CCC;
	border-radius: 12rpx;
	padding: 18rpx 28rpx;
	gap: 8rpx;
}
.btn-map-text {
	font-size: 28rpx;
	color: #333;
}
.btn-apply {
	flex: 1;
	background: #1A1A1A;
	border-radius: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 9rpx 0;
}
.btn-apply-text {
	font-size: 30rpx;
	color: #fff;
	font-weight: bold;
}

/* 加载/错误 */
.loading-wrap, .error-wrap {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 100rpx 0;
}
</style>
