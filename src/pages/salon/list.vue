<template>
	<view class="page">
		<!-- 加载中（首次） -->
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
			:enable-pull-directions="['top']"
			@refresherrefresh="onRefresh"
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
		>
			<view class="waterfall">
				<view class="waterfall-column">
					<view
						v-for="(item, index) in leftList"
						:key="item.id || `left-${index}`"
						class="card"
						@click="goDetail(item.id)"
					>
						<image
							class="card-cover"
							:src="item.coverImg || '/static/images/banner/default.jpg'"
							mode="widthFix"
						></image>

						<view class="card-body">
							<text class="card-title">{{ item.title }}</text>
							<text class="card-subtitle">{{ item.subtitle }}</text>

							<view class="price-row">
								<text class="price-current">¥{{ formatPrice(item.currentPrice) }}</text>
								<text class="price-original" v-if="item.originalPrice">¥{{ formatPrice(item.originalPrice) }}</text>
							</view>

							<view class="meta-row">
								<text class="meta-text">{{ buildMetaText(item) }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="waterfall-column">
					<view
						v-for="(item, index) in rightList"
						:key="item.id || `right-${index}`"
						class="card"
						@click="goDetail(item.id)"
					>
						<image
							class="card-cover"
							:src="item.coverImg || '/static/images/banner/default.jpg'"
							mode="widthFix"
						></image>

						<view class="card-body">
							<text class="card-title">{{ item.title }}</text>
							<text class="card-subtitle">{{ item.subtitle }}</text>

							<view class="price-row">
								<text class="price-current">¥{{ formatPrice(item.currentPrice) }}</text>
								<text class="price-original" v-if="item.originalPrice">¥{{ formatPrice(item.originalPrice) }}</text>
							</view>

							<view class="meta-row">
								<text class="meta-text">{{ buildMetaText(item) }}</text>
							</view>
						</view>
					</view>
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
import { listInfo } from '@/api/system/info'

export default {
	data() {
		return {
			list: [],
			loading: false,
			error: false,
			refreshing: false,
			page: 1,
			pageSize: 10,
			total: 0,
			hasMore: false
		}
	},
	computed: {
		loadMoreStatus() {
			if (this.loading && this.list.length > 0) return 'loading'
			if (!this.hasMore) return 'noMore'
			return 'more'
		},
		leftList() {
			return this.list.filter((_, index) => index % 2 === 0)
		},
		rightList() {
			return this.list.filter((_, index) => index % 2 === 1)
		}
	},
	onLoad() {
		this.loadData(true)
	},
	onPullDownRefresh() {
		this.loadData(true)
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
				const res = await listInfo({
					pageNum: this.page,
					pageSize: this.pageSize,
					status: 1
				})
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
				console.error('加载沙龙列表失败', e)
			} finally {
				this.loading = false
				this.refreshing = false
				uni.stopPullDownRefresh()
			}
		},
		loadMore() {
			if (!this.hasMore || this.loading) return
			this.loadData(false)
		},
		onRefresh() {
			this.refreshing = true
			this.loadData(true)
		},
		goDetail(id) {
			uni.navigateTo({ url: '/pages/salon/detail?id=' + id })
		},
		formatPrice(val) {
			if (val === null || val === undefined) return '0.00'
			return Number(val).toFixed(2)
		},
		buildMetaText(item) {
			const parts = []
			if (item.salesVolume && Number(item.salesVolume) > 0) {
				parts.push('已售' + item.salesVolume + '+')
			} else {
				parts.push('销量≤10')
			}
			return parts.join(' | ')
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

.list-scroll {
	height: 100vh;
}

.waterfall {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 20rpx;
	padding: 20rpx 16rpx 0;
	box-sizing: border-box;
}

.waterfall-column {
	flex: 1;
	min-width: 0;
}

.card {
	background: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-cover {
	width: 100%;
	display: block;
}

.card-body {
	padding: 16rpx;
}

.card-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #1a1a1a;
	line-height: 1.4;
	margin-bottom: 6rpx;
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.card-subtitle {
	display: block;
	font-size: 22rpx;
	color: #888;
	margin-bottom: 12rpx;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.price-row {
	display: flex;
	flex-direction: row;
	align-items: baseline;
	margin-bottom: 10rpx;
}

.price-current {
	font-size: 32rpx;
	font-weight: 700;
	color: #E53E3E;
}

.price-original {
	font-size: 22rpx;
	color: #aaa;
	text-decoration: line-through;
	margin-left: 8rpx;
}

.meta-row {
	border-top: 1rpx solid #f0f0f0;
	padding-top: 10rpx;
}

.meta-text {
	font-size: 20rpx;
	color: #999;
}
</style>
