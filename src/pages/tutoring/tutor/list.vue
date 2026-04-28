<template>
	<view class="page">
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

		<view v-if="loading && list.length === 0" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<view v-else-if="error && list.length === 0" class="error-wrap">
			<text>加载失败，请重试</text>
			<view class="retry-btn" @click="loadData(true)">
				<text class="retry-text">重试</text>
			</view>
		</view>

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
				@click="goDetail(item)"
			>
				<view class="card-main">
					<view class="avatar-wrap">
						<image
							class="avatar"
							:src="getAvatarSrc(item)"
							mode="aspectFill"
						></image>
						<text v-if="item.distance" class="distance-badge">{{ item.distance }}</text>
					</view>

					<view class="info-wrap">
						<view class="name-row">
							<text class="tutor-name">{{ formatName(item) }}</text>
						</view>

						<view class="school-row">
							<text class="school-text">
								{{ item.school || '--' }}{{ item.major ? ' · ' + item.major : '' }}
							</text>
						</view>

						<view class="card-tags">
							<dict-tag
								v-for="(value, tagIndex) in getDistrictLabel(item.areas)"
								:key="'d' + tagIndex"
								:options="districtDictOptions"
								:value="value"
							/>
							<dict-tag
								v-for="(value, tagIndex) in getSubjectLabel(item.subjects)"
								:key="'s' + tagIndex"
								:options="dict.type.sys_subject"
								:value="value"
							/>
						</view>
					</view>
				</view>

				<view class="card-footer">
					<view class="footer-left">
						<view class="footer-item">
							<uni-icons type="auth-filled" size="16" color="#2196F3"></uni-icons>
							<text class="footer-item-text">{{ String(item.status) === '1' ? '实名认证' : '资料待认证' }}</text>
						</view>
						<view class="footer-item">
							<uni-icons type="staff-filled" size="16" color="#22C55E"></uni-icons>
							<text class="footer-item-text">{{ item.school ? '学籍核验' : '院校待完善' }}</text>
						</view>
						<view class="footer-item">
							<uni-icons type="star-filled" size="16" color="#F59E0B"></uni-icons>
							<text class="footer-item-text">{{ getCurrentGradeText(item.currentGrade) }}</text>
						</view>
					</view>
					<view class="footer-right">
						<text class="detail-text">查看详情</text>
						<uni-icons type="right" size="16" color="#22C55E"></uni-icons>
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
import config from '@/config'
import { listTutors } from '@/api/wxmini/tutoring'
import { useLocationStore } from '@/store'
import TutoringFilterBar from '@/components/TutoringFilterBar/TutoringFilterBar.vue'
import { buildTutorDetailUrl } from '@/pages/tutoring/tutor/index.helpers'

export default {
	components: { TutoringFilterBar },
	dicts: ['sys_subject', 'sys_class', 'sys_methods', 'sys_degree'],
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
		districtOptions() {
			return useLocationStore().districts
		},
		districtDictOptions() {
			return (useLocationStore().districts || []).map(d => ({
				value: d.value,
				label: d.text,
				elTagType: '',
				elTagClass: ''
			}))
		},
		subjectOptions() {
			return (this.dict.type.sys_subject || []).map(item => ({
				value: item.value,
				text: item.label
			}))
		},
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
		onFilterChange(newParams) {
			this.queryParams = newParams
			this.loadData(true)
		},
		getAvatarSrc(item) {			
			return item.uid ? `${config.baseUrl}/profile/avatar/${item.uid}.png` : '/static/images/profile.png'
		},
		getDegreeText(value) {
			const found = (this.dict.type.sys_degree || []).find(item => String(item.value) === String(value))
			return found ? found.label : '学历待完善'
		},
		formatName(item) {
			const sourceName = item.realName || item.nickname || ''
			const lastName = sourceName ? sourceName.slice(0, 1) : ''
			const suffixMap = {
				0: '同学',
				1: '老师',
				2: '教员'
			}
			const suffix = suffixMap[Number(item.identity)] || '教员'
			return lastName ? lastName + suffix : suffix
		},
		getDistrictLabel(val) {
			if (!val) return []
			const arr = []
			val.split(',').map(v => {
				v = v.trim()
				const found = (this.districtDictOptions || []).find(d => String(d.value) === String(v))
				arr.push(found ? found.label : v)
			})
			return arr
		},
		getSubjectLabel(val) {
			if (!val) return []
			const arr = []
			val.split(',').map(v => {
				v = v.trim()
				const found = (this.dict.type.sys_subject || []).find(d => String(d.value) === String(v))
				arr.push(found ? found.label : v)
			})
			return arr
		},
		goDetail(item) {
			uni.navigateTo({ url: buildTutorDetailUrl(item.id, this.getAvatarSrc(item)) })
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background-color: #f6f7ee;
}

.list-scroll {
	flex: 1;
}

.card {
	margin: 24rpx;
	background: linear-gradient(180deg, #ffffff 0%, #fdfdf7 100%);
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.06);
}

.card-main {
	display: flex;
	gap: 24rpx;
	padding: 28rpx;
}

.avatar-wrap {
	position: relative;
	width: 136rpx;
	height: 168rpx;
	flex-shrink: 0;
	margin-right: 0;
}

.avatar {
	width: 136rpx;
	height: 168rpx;
	border-radius: 16rpx;
	background-color: #eee;
}

.distance-badge {
	position: absolute;
	left: 12rpx;
	bottom: 12rpx;
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	background: rgba(17, 24, 39, 0.72);
	font-size: 24rpx;
	line-height: 1;
	color: #fff;
}

.info-wrap {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
}

.name-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.tutor-name {
	font-size: 40rpx;
	font-weight: 700;
	line-height: 1.2;
	color: #1f2937;
}

.school-row {
	margin-top: 18rpx;
	margin-bottom: 0;
}

.school-text {
	font-size: 28rpx;
	line-height: 1.5;
	color: #6b7280;
	margin-left: 0;
}

.card-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 20rpx;
}

.card-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	padding: 22rpx 28rpx;
	border-top: 1rpx solid #edf0f2;
}

.footer-left {
	display: flex;
	flex-wrap: wrap;
	gap: 18rpx;
	flex: 1;
}

.footer-item {
	display: flex;
	align-items: center;
	gap: 6rpx;
	font-size: 24rpx;
	line-height: 1.5;
	color: #4b5563;
}

.footer-item-text {
	font-size: 24rpx;
	line-height: 1.5;
	color: #4b5563;
}

.footer-right {
	display: flex;
	align-items: center;
	gap: 8rpx;
	flex-shrink: 0;
}

.detail-text {
	font-size: 30rpx;
	color: #4b5563;
}

.loading-wrap,
.error-wrap {
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
