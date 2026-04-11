<template>
	<view class="page">
		<!-- 分类快选栏 -->
		<scroll-view scroll-x class="category-bar">
			<view class="category-inner">
				<view
					v-for="cat in dict.type.sys_daily_category"
					:key="cat.value"
					class="cat-chip"
					:class="{ 'cat-chip-active': queryParams.category === cat.value }"
					@click="onCategoryClick(cat.value)"
				>
					<text class="cat-chip-text" :class="{ 'cat-chip-text-active': queryParams.category === cat.value }">
						{{ cat.label }}
					</text>
				</view>
			</view>
		</scroll-view>

		<!-- 筛选行：区域 + 状态 + 重置 -->
		<view class="filter-row">
			<picker
				mode="selector"
				:range="districtOptions"
				range-key="text"
				:value="districtIndex"
				@change="onDistrictChange"
			>
				<view class="filter-btn" :class="{ active: queryParams.districtId }">
					<text class="filter-btn-text">{{ districtLabel || '区域' }}</text>
					<uni-icons type="bottom" size="11" :color="queryParams.districtId ? '#3B82F6' : '#666'"></uni-icons>
				</view>
			</picker>

			<picker
				mode="selector"
				:range="statusOptions"
				range-key="label"
				:value="statusIndex"
				@change="onStatusChange"
			>
				<view class="filter-btn" :class="{ active: queryParams.status !== '' }">
					<text class="filter-btn-text">{{ statusLabel || '状态' }}</text>
					<uni-icons type="bottom" size="11" :color="queryParams.status !== '' ? '#3B82F6' : '#666'"></uni-icons>
				</view>
			</picker>

			<view v-if="hasFilter" class="filter-reset" @click="resetFilter">
				<text class="filter-reset-text">重置</text>
			</view>
		</view>

		<!-- 加载中 -->
		<view v-if="loading && list.length === 0" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<!-- 加载失败 -->
		<view v-else-if="error && list.length === 0" class="error-wrap">
			<text class="error-text">加载失败，请重试</text>
			<view class="retry-btn" @click="loadData(true)">
				<text class="retry-text">重试</text>
			</view>
		</view>

		<!-- 列表 -->
		<scroll-view
			v-else
			scroll-y
			class="list-scroll"
			@scrolltolower="loadMore"
		>
			<view
				v-for="(item, index) in list"
				:key="item.id || index"
				class="card"
				@click="goDetail(item.id)"
			>
				<!-- 顶部：分类标签 + 薪资 -->
				<view class="card-top">
					<view class="cat-tag" :style="getCatStyle(item.category)">
						<text class="cat-tag-text">{{ getCatLabel(item.category) }}</text>
					</view>
					<view class="salary-wrap">
						<text class="salary-value">¥{{ item.salaryDay }}</text>
						<text class="salary-unit">/日</text>
					</view>
				</view>

				<!-- 标题 -->
				<text class="card-title">{{ item.title }}</text>

				<!-- 时间行 -->
				<view class="card-info-row">
					<uni-icons type="calendar" size="13" color="#888"></uni-icons>
					<text class="card-info-text">{{ item.workDate }} {{ item.workTime }}</text>
				</view>

				<!-- 地点行 -->
				<view class="card-info-row">
					<uni-icons type="location-filled" size="13" color="#888"></uni-icons>
					<text class="card-info-text">{{ item.location || item.districtId }}</text>
				</view>

				<!-- 底部：状态 + ID -->
				<view class="card-bottom">
					<view class="status-badge" :class="getStatusClass(item.status)">
						<text class="status-badge-text">{{ getStatusLabel(item.status) }}</text>
					</view>
					<text class="card-id">ID #{{ formatId(item.id) }}</text>
				</view>
			</view>

			<uni-load-more
				:status="loadMoreStatus"
				@clickLoadMore="loadMore"
			></uni-load-more>
		</scroll-view>
	</view>
</template>

<script>
import { listJobs } from '@/api/system/jobs'
import { useLocationStore } from '@/store'

const CATEGORY_OPTIONS = [
	{ value: '', label: '全部' },
	{ value: '0', label: '家教' },
	{ value: '1', label: '助教' },
	{ value: '2', label: '派发' },
	{ value: '3', label: '其他' }
]

const CAT_STYLES = {
	'0': { bg: '#EAF3FF', color: '#3B82F6' },
	'1': { bg: '#EEF9F0', color: '#10B981' },
	'2': { bg: '#FFF8E6', color: '#F59E0B' },
	'3': { bg: '#F3F4F6', color: '#888' }
}

const STATUS_OPTIONS = [
	{ value: '', label: '全部状态' },
	{ value: '0', label: '招募中' },
	{ value: '1', label: '已满员' },
	{ value: '2', label: '已结束' }
]

export default {
	dicts:['sys_daily_category'],
	data() {
		return {
			list: [],
			loading: false,
			error: false,
			page: 1,
			pageSize: 10,
			total: 0,
			hasMore: false,
			categoryOptions: CATEGORY_OPTIONS,
			statusOptions: STATUS_OPTIONS,
			queryParams: {
				category: '',
				districtId: '',
				status: ''
			}
		}
	},
	computed: {
		loadMoreStatus() {
			if (this.loading && this.list.length > 0) return 'loading'
			if (!this.hasMore) return 'noMore'
			return 'more'
		},
		districtOptions() {
			return [{ value: '', text: '全部区域' }, ...useLocationStore().districts]
		},
		districtIndex() {
			const idx = this.districtOptions.findIndex(d => d.value === this.queryParams.districtId)
			return idx < 0 ? 0 : idx
		},
		districtLabel() {
			const found = this.districtOptions.find(d => d.value === this.queryParams.districtId)
			return found && found.value ? found.text : ''
		},
		statusIndex() {
			const idx = this.statusOptions.findIndex(s => s.value === this.queryParams.status)
			return idx < 0 ? 0 : idx
		},
		statusLabel() {
			const found = this.statusOptions.find(s => s.value === this.queryParams.status)
			return found && found.value !== '' ? found.label : ''
		},
		hasFilter() {
			return this.queryParams.category !== '' || this.queryParams.districtId !== '' || this.queryParams.status !== ''
		}
	},
	onLoad() {
		this.loadData(true)
	},
	onPullDownRefresh() {
		this.loadData(true)
	},
	onReachBottom() {
		this.loadMore()
	},
	methods: {
		async loadData(reset = false) {
			if (this.loading) return
			if (reset) {
				this.page = 1
				this.list = []
				this.error = false
				this.hasMore = false
			}
			this.loading = true
			try {
				const params = {
					pageNum: this.page,
					pageSize: this.pageSize,
					orderByColumn: 'createDate',
					isAsc: 'desc',
					...this.queryParams
				}
				Object.keys(params).forEach(k => {
					if (params[k] === '' || params[k] === null || params[k] === undefined) {
						delete params[k]
					}
				})
				const res = await listJobs(params)
				const rows = res.rows || []
				const total = res.total || 0
				if (reset) {
					this.list = rows
				} else {
					this.list = this.list.concat(rows)
				}
				this.total = total
				this.hasMore = this.list.length < total
				if (this.hasMore) this.page++
				this.error = false
			} catch (e) {
				this.error = true
				console.error('加载兼职列表失败', e)
			} finally {
				this.loading = false
				uni.stopPullDownRefresh()
			}
		},
		loadMore() {
			if (!this.hasMore || this.loading) return
			this.loadData(false)
		},
		onCategoryClick(val) {
			this.queryParams.category = val
			this.loadData(true)
		},
		onDistrictChange(e) {
			const item = this.districtOptions[e.detail.value]
			this.queryParams.districtId = item ? item.value : ''
			this.loadData(true)
		},
		onStatusChange(e) {
			const item = this.statusOptions[e.detail.value]
			this.queryParams.status = item ? item.value : ''
			this.loadData(true)
		},
		resetFilter() {
			this.queryParams = { category: '', districtId: '', status: '' }
			this.loadData(true)
		},
		getCatLabel(val) {
			const s = String(val)
			const map = { '0': '家教', '1': '助教', '2': '派发', '3': '其他' }
			return map[s] || '其他'
		},
		getCatStyle(val) {
			const s = String(val)
			const style = CAT_STYLES[s] || CAT_STYLES['3']
			return `background:${style.bg}; color:${style.color};`
		},
		getStatusLabel(val) {
			const map = { '0': '招募中', '1': '已满员', '2': '已结束' }
			return map[String(val)] || '--'
		},
		getStatusClass(val) {
			const map = { '0': 'status-open', '1': 'status-full', '2': 'status-end' }
			return map[String(val)] || ''
		},
		formatId(id) {
			if (!id) return '----'
			return String(id).slice(-8).toUpperCase()
		},
		goDetail(id) {
			uni.navigateTo({ url: '/pages/jobs/detail?id=' + id })
		}
	}
}
</script>

<style scoped>
.page {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #F5F5F5;
	overflow: hidden;
}

/* 分类快选 */
.category-bar {
	background: #fff;
	white-space: nowrap;
	border-bottom: 1rpx solid #F0F0F0;
}
.category-inner {
	display: flex;
	flex-direction: row;
	padding: 16rpx 24rpx;
	gap: 16rpx;
}
.cat-chip {
	display: inline-flex;
	align-items: center;
	padding: 10rpx 28rpx;
	border-radius: 10rpx;
	background: #F3F4F6;
	flex-shrink: 0;
}
.cat-chip-active {
	background: #1A1A1A;
}
.cat-chip-text {
	font-size: 26rpx;
	color: #555;
}
.cat-chip-text-active {
	color: #fff;
	font-weight: 600;
}

/* 筛选行 */
.filter-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 16rpx 24rpx;
	gap: 16rpx;
	background: #fff;
	border-bottom: 1rpx solid #F0F0F0;
}
.filter-btn {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 12rpx 20rpx;
	border-radius: 8rpx;
	background: #F3F4F6;
	gap: 6rpx;
}
.filter-btn.active {
	background: #EAF3FF;
}
.filter-btn-text {
	font-size: 26rpx;
	color: #555;
}
.filter-btn.active .filter-btn-text {
	color: #3B82F6;
}
.filter-reset {
	margin-left: auto;
	padding: 12rpx 20rpx;
}
.filter-reset-text {
	font-size: 26rpx;
	color: #EF4444;
}

/* 列表 */
.list-scroll {
	flex: 1;
	height: 0;
}

/* 卡片 */
.card {
	background: #fff;
	border-radius: 16rpx;
	margin: 20rpx 24rpx;
	padding: 28rpx 28rpx 22rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
}
.card-top {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 14rpx;
}
.cat-tag {
	padding: 4rpx 18rpx;
	border-radius: 20rpx;
}
.cat-tag-text {
	font-size: 22rpx;
	font-weight: 600;
}
.salary-wrap {
	display: flex;
	flex-direction: row;
	align-items: baseline;
}
.salary-value {
	font-size: 36rpx;
	font-weight: bold;
	color: #EF4444;
}
.salary-unit {
	font-size: 22rpx;
	color: #EF4444;
	margin-left: 2rpx;
}
.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #1A1A1A;
	margin-bottom: 16rpx;
	display: block;
}
.card-info-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 10rpx;
	gap: 8rpx;
}
.card-info-text {
	font-size: 24rpx;
	color: #888;
}
.card-bottom {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-top: 16rpx;
}
/* 状态徽章 */
.status-badge {
	padding: 4rpx 16rpx;
	border-radius: 8rpx;
}
.status-badge-text {
	font-size: 22rpx;
}
.status-open {
	background: #EEF9F0;
}
.status-open .status-badge-text {
	color: #10B981;
}
.status-full {
	background: #FFF8E6;
}
.status-full .status-badge-text {
	color: #F59E0B;
}
.status-end {
	background: #F3F4F6;
}
.status-end .status-badge-text {
	color: #888;
}
.card-id {
	font-size: 22rpx;
	color: #CCC;
}

/* 加载/错误 */
.loading-wrap, .error-wrap {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 60rpx 0;
	gap: 16rpx;
}
.error-text {
	font-size: 28rpx;
	color: #999;
}
.retry-btn {
	padding: 12rpx 40rpx;
	background: #f0f0f0;
	border-radius: 40rpx;
}
.retry-text {
	font-size: 28rpx;
	color: #555;
}
</style>
