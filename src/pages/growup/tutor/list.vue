<template>
		<view class="page">
			<!-- 搜索栏 -->
			<!-- <view class="search-bar-wrap">
				<view class="search-bar">
					<uni-icons type="search" size="16" color="#94a3b8"></uni-icons>
					<input
						class="search-input"
						v-model="keyword"
						placeholder="搜索讲师姓名"
						placeholder-class="search-placeholder"
						@input="onSearch"
					/>
					<uni-icons v-if="keyword" type="clear" size="16" color="#94a3b8" @click="clearSearch"></uni-icons>
				</view>
			</view> -->

			<!-- 讲师列表 -->
			<scroll-view
				scroll-y
				class="scroll-body"
				refresher-enabled
				:refresher-triggered="refreshing"
				@refresherrefresh="onRefresh"
				@scrolltolower="loadMore"
			>
				<view v-if="list.length === 0 && !loading" class="empty-wrap">
					<image class="empty-img" src="/static/images/banner/default.jpg" mode="aspectFit"></image>
					<text class="empty-text">暂无讲师信息</text>
				</view>

				<view class="tutor-grid">
					<view
						v-for="tutor in list"
						:key="tutor.id"
						class="tutor-card"
						@click="navToDetail(tutor)"
					>
						<view class="tutor-avatar-wrap">
							<image
								class="tutor-avatar"
								:src="tutor.avatarUrl || '/static/images/tabbar/mine.png'"
								mode="aspectFill"
							></image>
						</view>
						<view class="tutor-info">
							<text class="tutor-name">{{ tutor.name }}</text>
							<view class="tutor-org">
								<text class="tutor-org-text">{{ tutor.intro }}</text>
							</view>
						</view>
						<uni-icons type="right" size="14" color="#cbd5e1"></uni-icons>
					</view>
				</view>

				<!-- 加载更多 -->
				<view v-if="hasMore" class="load-more" @click="loadMore">
					<text class="load-more-text">{{ loading ? '加载中...' : '查看更多' }}</text>
				</view>
				<view v-else-if="list.length > 0" class="no-more">
					<text class="no-more-text">已加载全部讲师</text>
				</view>
			</scroll-view>
		</view>
</template>

<script>
import { listProfile } from '@/pages/growup/_api/system/profile'

export default {
		data() {
			return {
				keyword: '',
				list: [],
				loading: false,
				refreshing: false,
				pageNum: 1,
				pageSize: 10,
				total: 0,
				searchTimer: null
			}
		},
		computed: {
			hasMore() {
				return this.list.length < this.total && this.total > 0
			}
		},
		onLoad() {
			this.load()
		},
		methods: {
			async load(reset = false) {
				if (this.loading) return
				if (reset) {
					this.pageNum = 1
					this.list = []
				}
				this.loading = true
				try {
					const res = await listProfile({
						pageNum: this.pageNum,
						pageSize: this.pageSize,
						name: this.keyword || undefined
					})
					const rows = res.rows || []
					this.total = res.total || 0
					this.list = reset ? rows : [...this.list, ...rows]
					this.pageNum++
				} catch (e) {
					uni.showToast({ title: '加载失败，请重试', icon: 'none' })
				} finally {
					this.loading = false
				}
			},
			// onSearch() {
			// 	clearTimeout(this.searchTimer)
			// 	this.searchTimer = setTimeout(() => {
			// 		this.load(true)
			// 	}, 400)
			// },
			// clearSearch() {
			// 	this.keyword = ''
			// 	this.load(true)
			// },
			async onRefresh() {
				this.refreshing = true
				await this.load(true)
				this.refreshing = false
			},
			loadMore() {
				if (!this.hasMore || this.loading) return
				this.load()
			},
			navToDetail(tutor) {
				uni.navigateTo({ url: '/pages/growup/tutor/detail?id=' + tutor.id })
			}
		}
}
</script>

<style lang="scss">
page {
		background: #f4f6fb;
		height: 100%;
}

.page {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: #f4f6fb;
}

/* ===== 搜索栏 ===== */
.search-bar-wrap {
		padding: 12px 16px;
		background: #fff;
		border-bottom: 1px solid #f1f5f9;
}

.search-bar {
		display: flex;
		flex-direction: row;
		align-items: center;
		background: #f4f6fb;
		border-radius: 24px;
		padding: 8px 14px;
		gap: 8px;
}

.search-input {
		flex: 1;
		font-size: 14px;
		color: #1e293b;
		height: 20px;
}

.search-placeholder {
		color: #94a3b8;
		font-size: 14px;
}

/* ===== 滚动区 ===== */
.scroll-body {
		flex: 1;
		height: 0;
}

/* ===== 空态 ===== */
.empty-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60px 0;
}

.empty-img {
		width: 120px;
		height: 120px;
		margin-bottom: 12px;
		opacity: 0.4;
}

.empty-text {
		font-size: 14px;
		color: #94a3b8;
}

/* ===== 讲师列表 ===== */
.tutor-grid {
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
}

.tutor-card {
		display: flex;
		flex-direction: row;
		align-items: center;
		background: #fff;
		border-radius: 16px;
		padding: 16px;
		box-shadow: 0 2px 12px rgba(0,0,0,0.05);
		gap: 14px;
}

.tutor-avatar-wrap {
		flex-shrink: 0;
		width: 66px;
		height: 66px;
		border-radius: 16px;
		border: 3px solid #f1f5f9;
		background: #e2e8f0;
		overflow: hidden;
}

.tutor-avatar {
		width: 100%;
		display: block;
		object-fit: cover;
		object-position: 50% 20%;
		transform: scale(0.92);
		transform-origin: 50% -90%;
}

.tutor-info {
		flex: 1;
}

.tutor-name {
		display: block;
		font-size: 16px;
		font-weight: 700;
		color: #1e293b;
		margin-bottom: 2px;
}

.tutor-title {
		display: block;
		font-size: 13px;
		color: #64748b;
		margin-bottom: 6px;
}

.tutor-tags {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 6px;
}

.tutor-tag {
		background: #EFF6FF;
		border-radius: 4px;
		padding: 2px 8px;
}

.tutor-tag-text {
		font-size: 11px;
		color: #3B82F6;
}

.tutor-org {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 4px;
}

.tutor-org-text {
		font-size: 12px;
		color: #94a3b8;
}

/* ===== 加载更多 ===== */
.load-more {
		padding: 16px;
		text-align: center;
}

.load-more-text {
		font-size: 13px;
		color: #3B82F6;
}

.no-more {
		padding: 20px;
		text-align: center;
}

.no-more-text {
		font-size: 12px;
		color: #cbd5e1;
}
</style>
