<template>
	<view class="page">
		<scroll-view
			scroll-y
			class="scroll-body"
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="onLoadMore"
		>
			<!-- 加载中骨架 -->
			<view v-if="loading && list.length === 0" class="loading-wrap">
				<uni-load-more status="loading"></uni-load-more>
			</view>

			<!-- 空态 -->
			<view v-else-if="!loading && list.length === 0" class="empty-wrap">
				<uni-icons type="calendar" size="52" color="#cbd5e1"></uni-icons>
				<text class="empty-text">暂无已报课程</text>
			</view>

			<!-- 列表 -->
			<view v-else class="list-wrap">
				<view
					v-for="item in list"
					:key="item.id"
					class="course-card"
				>
					<!-- 左侧封面 -->
					<view class="cover-wrap">
						<image
							v-if="item.lectureCover"
							class="cover-img"
							:src="item.lectureCover"
							mode="aspectFill"
						></image>
						<view v-else class="cover-placeholder">
							<uni-icons type="calendar" size="22" color="rgba(255,255,255,0.85)"></uni-icons>
						</view>
					</view>

					<!-- 中间信息 -->
					<view class="course-info">
						<text class="course-name">{{ item.lectureName }}</text>
						<view class="course-meta-item">
							<uni-icons type="calendar" size="13" color="#3B82F6"></uni-icons>
							<text class="course-meta-text">
								开课时间：{{ formatTime(item.lectureTime) }}
							</text>
						</view>
						<view class="course-meta-item">
							<uni-icons type="location" size="13" color="#3B82F6"></uni-icons>
							<text class="course-meta-text course-location">{{ item.lectureLocation || '地点待定' }}</text>
						</view>
					</view>

					<!-- 右侧签到按钮 -->
					<view
						class="signin-btn"
						@click="goSignin(item)"
					>
						<text class="signin-btn-text">现场签到</text>
					</view>
				</view>
			</view>

			<!-- 底部加载更多 -->
			<view v-if="list.length > 0" class="load-more-wrap">
				<uni-load-more :status="noMore ? 'noMore' : (loadingMore ? 'loading' : 'more')"></uni-load-more>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { getMyRecords } from '@/api/wxmini/signin'

export default {
	data() {
		return {
			list: [],
			loading: false,
			refreshing: false,
			loadingMore: false,
			noMore: false
		}
	},
	onLoad() {
		this.loadList()
	},
	methods: {
		async loadList() {
			this.loading = true
			try {
				const res = await getMyRecords()
				this.list = res.rows || res.data || res || []
				this.noMore = true
			} catch (e) {
				uni.showToast({ title: '加载失败，请重试', icon: 'none' })
			} finally {
				this.loading = false
			}
		},
		async onRefresh() {
			this.refreshing = true
			this.noMore = false
			await this.loadList()
			this.refreshing = false
		},
		onLoadMore() {
			// 如需分页可在此扩展
		},
		goSignin(item) {
			uni.navigateTo({
				url: `/pages/growup/qrcode/index?id=${item.lectureId}&type=lecture&action=signin`
			})
		},
		formatTime(val) {
			if (!val) return '—'
			// 兼容字符串和 Date
			const d = new Date(val)
			if (isNaN(d.getTime())) return val
			const pad = n => String(n).padStart(2, '0')
			return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
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

.scroll-body {
	flex: 1;
	overflow: hidden;
}

/* ===== 空态 ===== */
.loading-wrap,
.empty-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80px 0;
	gap: 14px;
}

.empty-text {
	font-size: 14px;
	color: #94a3b8;
}

/* ===== 列表区 ===== */
.list-wrap {
	padding: 12px 16px 0;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

/* ===== 课程卡片 ===== */
.course-card {
	display: flex;
	flex-direction: row;
	align-items: center;
	background: #fff;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
	border: 1px solid #BFDBFE;
	padding: 14px 14px 14px 0;
	gap: 12px;
	position: relative;
}

/* 左侧蓝色竖条装饰，与 lecture-card 一致 */
.course-card::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 4px;
	height: 100%;
	background: linear-gradient(to bottom, #38BDF8, #3B82F6);
	border-radius: 4px 0 0 4px;
}

/* ===== 封面 ===== */
.cover-wrap {
	flex-shrink: 0;
	margin-left: 14px;
}

.cover-img {
	width: 80px;
	height: 80px;
	border-radius: 10px;
	display: block;
}

.cover-placeholder {
	width: 80px;
	height: 80px;
	border-radius: 10px;
	background: linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

/* ===== 中间信息 ===== */
.course-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 5px;
	min-width: 0;
}

.course-name {
	display: block;
	font-size: 15px;
	font-weight: 700;
	color: #1e293b;
	line-height: 1.4;
	/* 两行截断 */
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.course-meta-item {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 4px;
}

.course-meta-text {
	font-size: 12px;
	color: #64748b;
	flex: 1;
}

.course-location {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

/* ===== 签到按钮 ===== */
.signin-btn {
	flex-shrink: 0;
	background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
	border-radius: 20px;
	padding: 8px 14px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.signin-btn-text {
	font-size: 13px;
	font-weight: 600;
	color: #fff;
	white-space: nowrap;
}

/* ===== 底部加载更多 ===== */
.load-more-wrap {
	padding: 8px 0 30px;
	display: flex;
	justify-content: center;
}
</style>
