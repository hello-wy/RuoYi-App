<template>
	<view class="page">
		<!-- 筛选栏 -->
		<tutoring-filter-bar
			:value="queryParams"
			:district-options="districtOptions"
			:subject-options="subjectOptions"
			:grade-options="gradeOptions"
			:method-options="methodOptions"
			:show-grade="false"
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
				<!-- 左：头像区（头像 + 认证角标） -->
				<view class="avatar-wrap">
					<image
						class="avatar"
						:src="item.avatar || '/static/images/profile.jpg'"
						mode="aspectFill"
					></image>
				</view>

				<!-- 右：信息区 -->
				<view class="info-wrap">
					<!-- 第一行：姓名 + 认证文字 + 箭头 -->
					<view class="info-row-top">
						<view class="name-cert">
							<text class="tutor-name">
								{{ formatName(item) }}
							</text>
						</view>
						<uni-icons type="right" size="16" color="#CCC"></uni-icons>
					</view>

					<!-- 第二行：学校 · 专业 -->
					<view class="school-row">
						<uni-icons type="school" size="14" color="#999"></uni-icons>
						<text class="school-text">
							{{ item.school || '--' }}{{ item.major ? ' · ' + item.major : '' }}
						</text>
					</view>

					<!-- 区域 + 科目标签 -->
					<view class="card-tags">
						<dict-tag v-for="(value, index) in getDistrictLabel(item.areas)" :key="'d'+index" :options="districtDictOptions" :value="value"/>
						<dict-tag v-for="(value, index) in getSubjectLabel(item.subjects)" :key="'s'+index" :options="dict.type.sys_subject" :value="value"/>
					</view>

					<!-- 学历（独立一行，右对齐） -->
					<view class="degree-row">
						<dict-tag :options="dict.type.sys_degree" :value="item.degree"/>
					</view>
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
import { listTutors } from '@/api/wxmini/tutoring'
import { useLocationStore } from '@/store'
import TutoringFilterBar from '@/components/TutoringFilterBar/TutoringFilterBar.vue'

export default {
	components: { TutoringFilterBar },
	dicts: ['sys_subject', 'sys_class', 'sys_methods','sys_degree'],
	data() {
		return {
			list: [],
			loading: false,
			error: false,
			page: 1,
			pageSize: 15,
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
		// dict-tag 期望 { label, value } 格式，districts 是 { text, value }，需转换
		districtDictOptions() {
			return (useLocationStore().districts || []).map(d => ({
				value: d.value,
				label: d.text,
				elTagType: '',
				elTagClass: ''
			}))
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
				const res = await listTutors({
					pageNum: this.page,
					pageSize: this.pageSize,
					orderByColumn: 'createDate',
					isAsc: 'desc',
					...this.queryParams
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
				console.error('加载教员列表失败', e)
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
		formatName(item) {
			// 姓（第一个字）+ title，如 李老师
			const nickname = item.nickname || ''
			const lastName = nickname ? nickname.slice(0, 1) : ''
			const title = item.title || ''
			return lastName + title
		},
		/** 根据区域 value 查找 text */
		getDistrictLabel(val) {
			const arr=[]
			val.split(',').map(v => {
				v=v.trim()
				const found = (this.districtDictOptions || []).find(d => String(d.value) === String(v))
				arr.push(found ? found.label : v)
			})
			return arr
		},
		/** 根据科目 value 查找 label */
		getSubjectLabel(val) {
			const arr=[]
			val.split(',').map(v => {
				v=v.trim()
				const found = (this.dict.type.sys_subject || []).find(d => String(d.value) === String(v))
				arr.push(found ? found.label : v)
			})
			return arr
		},
		goDetail(id) {
			uni.navigateTo({ url: '/pages/tutoring/tutor/detail?id=' + id })
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background-color: #F5F5F5;
}

/* 列表滚动区 */
.list-scroll {
	flex: 1;
}

/* 卡片 */
.card {
	background: #fff;
	border-radius: 16rpx;
	margin: 20rpx 24rpx;
	padding: 24rpx;
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
	position: relative;
}

/* 头像 */
.avatar-wrap {
	position: relative;
	width: 96rpx;
	height: 96rpx;
	margin-right: 24rpx;
	flex-shrink: 0;
}
.avatar {
	width: 96rpx;
	height: 96rpx;
	border-radius: 8rpx;
	background-color: #EEE;
}
.cert-badge {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 30rpx;
	height: 30rpx;
	border-radius: 50%;
	background-color: #1A1A1A;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 信息区 */
.info-wrap {
	flex: 1;
	display: flex;
	flex-direction: column;
	position: relative;
}

.info-row-top {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8rpx;
}
.name-cert {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 12rpx;
}
.tutor-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #1A1A1A;
}
.cert-label {
	background-color: #F0F0F0;
	border-radius: 8rpx;
	padding: 2rpx 10rpx;
}
.cert-text {
	font-size: 22rpx;
	color: #666;
}

/* 学校行 */
.school-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 16rpx;
}
.school-text {
	font-size: 24rpx;
	color: #888;
	margin-left: 6rpx;
}

/* 区域 + 科目标签行 */
.card-tags {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 8rpx;
	margin-top: 8rpx;
}

/* 旧 subject-tags 保留兼容 */
.subject-tags {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 10rpx;
}
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
.subject-tag {
	background-color: #F3F4F6;
	color: #444;
	font-size: 24rpx;
	padding: 6rpx 18rpx;
	border-radius: 8rpx;
}

/* 学历行（独立行，右对齐） */
.degree-row {
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	margin-top: 10rpx;
}

/* 学历角标（兼容旧样式，保留但不再使用绝对定位） */
.degree-badge-wrap {
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	margin-top: 10rpx;
}
.degree-badge {
	font-size: 22rpx;
	color: #6B7280;
	background-color: #F3F4F6;
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	font-weight: 500;
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
