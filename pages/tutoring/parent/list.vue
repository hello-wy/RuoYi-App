<template>
	<view class="page">
		<!-- 筛选栏 -->
		<tutoring-filter-bar
			:value="queryParams"
			:district-options="districtOptions"
			:subject-options="subjectOptions"
			:grade-options="gradeOptions"
			:method-options="methodOptions"
			@change="onFilterChange"
			@reset="loadData(true)"
		></tutoring-filter-bar>

		<!-- 加载中 -->
		<view v-if="loading && list.length === 0" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<!-- 加载失败 -->
		<view v-else-if="error && list.length === 0" class="error-wrap">
			<text>加载失败，请重试</text>
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
				<!-- 顶部：ID + 标签 -->
				<view class="card-top">
					<text class="card-id">ID: #{{ formatId(item.id) }}</text>
					<dict-tag :options="dict.type.sys_methods" :value="item.methods"/>
				</view>

				<!-- 标题 -->
				<text class="card-title">{{ item.name }}</text>

				<!-- 区域 -->
				<view class="card-location">
					<uni-icons type="location-filled" size="14" color="#888"></uni-icons>
					<text class="card-region">{{ item.region }}</text>
				</view>

				<!-- 科目/年级标签 -->
				<view class="card-tags">
					<dict-tag :options="dict.type.sys_class" :value="item.grade"/>
					<dict-tag :options="dict.type.sys_subject" :value="item.subject"/>
				</view>
			</view>

			<!-- 加载更多 -->
			<uni-load-more
				:status="loadMoreStatus"
				@clickLoadMore="loadMore"
			></uni-load-more>
		</scroll-view>
	</view>
</template>

<script>
import { listParents } from '@/api/system/parents'
import { useLocationStore } from '@/store'
import TutoringFilterBar from '@/components/TutoringFilterBar/TutoringFilterBar.vue'

export default {
	components: { TutoringFilterBar },
	dicts: ['sys_subject', 'sys_class', 'sys_methods'],
	data() {
		return {
			list: [],
			loading: false,
			error: false,
			page: 1,
			pageSize: 10,
			total: 0,
			hasMore: false,
			queryParams: {
				region: '',
				subject: '',
				grade: '',
				methods: ''
			}
		}
	},
	computed: {
		loadMoreStatus() {
			if (this.loading && this.list.length > 0) return 'loading'
			if (!this.hasMore) return 'noMore'
			return 'more'
		},
		// 区域选项：从 store 读取当前城市的区县列表
		districtOptions() {			
			return useLocationStore().districts
		},
		// 科目选项：从字典转换为 picker 格式
		subjectOptions() {
			return (this.dict.type.sys_subject || []).map(item => ({
				value: item.value,
				text: item.label
			}))
		},
		// 年级选项：从 sys_class 字典转换为 picker 格式
		gradeOptions() {
			return (this.dict.type.sys_class || []).map(item => ({
				value: item.value,
				text: item.label
			}))
		},
		methodOptions() {
			return (this.dict.type.sys_methods || []).map(item => ({
				value: item.value,
				text: item.label
			}))
		}
	},
	onLoad(options) {
		// 支持从首页分类速查直接跳转并预填筛选条件
		// e.g. ?region=320102  或  ?subject=1
		if (options && options.region) {
			this.queryParams.region = decodeURIComponent(options.region)
		}
		if (options && options.subject) {
			this.queryParams.subject = decodeURIComponent(options.subject)
		}
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
				// 去除空值参数
				Object.keys(params).forEach(k => {
					if (params[k] === '' || params[k] === null || params[k] === undefined) {
						delete params[k]
					}
				})
				const res = await listParents(params)
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
				console.error('加载家教订单列表失败', e)
			} finally {
				this.loading = false
				uni.stopPullDownRefresh()
			}
		},
		loadMore() {
			if (!this.hasMore || this.loading) return
			this.loadData(false)
		},
		/** 筛选栏变化回调 */
		onFilterChange(newParams) {
			this.queryParams = newParams
			this.loadData(true)
		},
		formatId(id) {
			if (!id) return '----'
			const s = String(id)
			return s.slice(-8).toUpperCase()
		},
		goDetail(id) {
			uni.navigateTo({ url: '/pages/tutoring/parent/detail?id=' + id })
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

/* 列表滚动区 */
.list-scroll {
	flex: 1;
	height: 0;
}

/* 卡片 */
.card {
	background: #fff;
	border-radius: 16rpx;
	margin: 20rpx 24rpx;
	padding: 28rpx 28rpx 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
}

.card-top {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
}
.card-id {
	font-size: 22rpx;
	color: #999;
}

/* 方式标签 */
.tag-weekend {
	background-color: #EAF3FF;
	color: #3B82F6;
	font-size: 22rpx;
	padding: 4rpx 14rpx;
	border-radius: 20rpx;
}
.tag-daily {
	background-color: #E6F9F0;
	color: #10B981;
	font-size: 22rpx;
	padding: 4rpx 14rpx;
	border-radius: 20rpx;
}
.tag-urgent-red {
	background-color: #FFF0F0;
	color: #EF4444;
	font-size: 22rpx;
	padding: 4rpx 14rpx;
	border-radius: 20rpx;
}

.card-title {
	font-size: 34rpx;
	font-weight: bold;
	color: #1A1A1A;
	margin-bottom: 12rpx;
	display: block;
}

.card-location {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 16rpx;
}
.card-region {
	font-size: 24rpx;
	color: #888;
	margin-left: 6rpx;
}

/* 科目标签 */
.card-tags {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 20rpx;
}
.tag {
	background-color: #F3F4F6;
	color: #555;
	font-size: 24rpx;
	padding: 6rpx 18rpx;
	border-radius: 8rpx;
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

.retry-btn {
	padding: 12rpx 40rpx;
	background-color: #f0f0f0;
	border-radius: 40rpx;
}
.retry-text {
	font-size: 28rpx;
	color: #555;
}
</style>
