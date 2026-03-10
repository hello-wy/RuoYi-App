<template>
	<view class="data-list-wrap">
		<!-- 加载中 -->
		<view v-if="loading && list.length === 0" class="state-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<!-- 加载失败 -->
		<view v-else-if="error && list.length === 0" class="state-wrap">
			<uni-icons type="info" size="40" color="#ccc"></uni-icons>
			<text class="state-text">加载失败，点击重试</text>
			<view class="retry-btn" @click="refresh">
				<text class="retry-text">重试</text>
			</view>
		</view>

		<!-- 暂无数据 -->
		<view v-else-if="!loading && list.length === 0" class="state-wrap">
			<uni-icons type="list" size="40" color="#ccc"></uni-icons>
			<text class="state-text">暂无数据</text>
		</view>

		<!-- 数据插槽 -->
		<slot v-else :list="list" :loading="loading" :error="error" :hasMore="hasMore"></slot>

		<!-- 底部加载更多（列表有数据时显示） -->
		<uni-load-more
			v-if="list.length > 0"
			:status="loadMoreStatus"
			@clickLoadMore="loadMore"
		></uni-load-more>
	</view>
</template>

<script>
export default {
	name: 'DataList',
	props: {
		// 数据加载函数，接受 { page, pageSize } 参数，返回 Promise
		loadFn: {
			type: Function,
			required: true
		},
		pageSize: {
			type: Number,
			default: 10
		}
	},
	data() {
		return {
			list: [],
			loading: false,
			error: false,
			page: 1,
			total: 0,
			hasMore: false
		}
	},
	computed: {
		loadMoreStatus() {
			if (this.loading && this.list.length > 0) return 'loading'
			if (!this.hasMore) return 'noMore'
			return 'more'
		}
	},
	mounted() {
		this.refresh()
	},
	methods: {
		/**
		 * 刷新列表（重置到第1页）
		 */
		async refresh() {
			if (this.loading) return
			this.page = 1
			this.list = []
			this.error = false
			this.hasMore = false
			await this._load()
		},
		/**
		 * 加载更多
		 */
		async loadMore() {
			if (this.loading || !this.hasMore) return
			await this._load()
		},
		async _load() {
			this.loading = true
			try {
				const res = await this.loadFn({ page: this.page, pageSize: this.pageSize })
				// 兼容若依标准返回：{ rows: [], total: N } 或 { data: [], total: N }
				const rows = res.rows || res.data || []
				const total = res.total !== undefined ? res.total : rows.length
				if (this.page === 1) {
					this.list = rows
				} else {
					this.list = this.list.concat(rows)
				}
				this.total = total
				this.hasMore = this.list.length < total
				if (this.hasMore) {
					this.page++
				}
				this.error = false
			} catch (e) {
				this.error = true
				console.error('[DataList] 加载失败', e)
			} finally {
				this.loading = false
				uni.stopPullDownRefresh()
			}
		}
	}
}
</script>

<style scoped>
.data-list-wrap {
	width: 100%;
}

.state-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 0;
	gap: 16rpx;
}

.state-text {
	font-size: 28rpx;
	color: #999;
}

.retry-btn {
	margin-top: 8rpx;
	padding: 12rpx 40rpx;
	background-color: #f5f5f5;
	border-radius: 40rpx;
}

.retry-text {
	font-size: 28rpx;
	color: #555;
}
</style>
