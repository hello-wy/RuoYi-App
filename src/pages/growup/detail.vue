<template>
	<view class="page">
		<!-- 自定义悬浮导航 -->
		<view class="float-bar" :style="{ top: (statusBarHeight + 8) + 'px' }">
			<view class="float-btn" @click="goBack">
				<uni-icons type="left" size="20" color="#fff"></uni-icons>
			</view>
		</view>

		<!-- 加载中 -->
		<view v-if="loading" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<!-- 加载失败 -->
		<view v-else-if="error" class="error-wrap">
			<uni-icons type="close-circle" size="40" color="#e2e8f0"></uni-icons>
			<text class="error-text">加载失败，请重试</text>
			<view class="retry-btn" @click="loadDetail">
				<text class="retry-text">重新加载</text>
			</view>
		</view>

		<block v-else-if="detail">
			<scroll-view scroll-y class="content-scroll">
				<!-- 顶部封面图 / 渐变横幅 -->
				<view class="cover-banner">
					<image
						v-if="topCoverUrl"
						:src="topCoverUrl"
						mode="aspectFill"
						class="cover-image"
						@error="handleTopCoverError"
					></image>
					<view v-else class="cover-gradient">
						<view class="cover-decor-circle c1"></view>
						<view class="cover-decor-circle c2"></view>
						<text class="cover-title-gradient">{{ detail.name }}</text>
						<text class="cover-date-gradient">{{ formatDateRange(detail.startTime, detail.endTime) }}</text>
					</view>
				</view>

				<view class="content-wrap">
					<view class="detail-tabs">
						<view
							class="detail-tab"
							:class="{ active: activeTab === 'detail' }"
							@click="switchTab('detail')"
						>
							<text>课程详情</text>
						</view>
						<view
							class="detail-tab"
							:class="{ active: activeTab === 'review' }"
							@click="switchTab('review')"
						>
							<text>课程评价</text>
						</view>
					</view>

					<view v-show="activeTab === 'detail'">
						<!-- 课程名称 + 基本信息 -->
						<view class="course-info-card">
							<text class="course-name">{{ detail.name }}</text>
							<view class="course-meta-list">
								<view class="course-meta-item" v-if="detail.time">
									<view class="meta-dot"></view>
									<text class="meta-label">上课时间：</text>
									<text class="meta-value">{{ formatMeta(detail.time) }}-{{ formatMeta(detail.endDate) }}</text>
								</view>
								<view class="course-meta-item" v-if="detail.endDate">
									<view class="meta-dot"></view>
									<text class="meta-label">报名截止时间：</text>
									<text class="meta-value">{{ detail.endDate }}</text>
								</view>
								<view class="course-meta-item" v-if="detail.location">
									<view class="meta-dot"></view>
									<text class="meta-label">上课地址：</text>
									<text class="meta-value">{{ detail.location }}</text>
								</view>
							</view>
						</view>

						<!-- 报名情况 -->
						<view class="enroll-stat-card">
							<view class="enroll-stat-row">
								<view class="stat-item">
									<text class="stat-label">已报名：</text>
									<text class="stat-value-dark">{{ enrolledCountDisplay }}人</text>
								</view>
								<view class="stat-divider"></view>
								<view class="stat-item">
									<text class="stat-label">剩余报名：</text>
									<text class="stat-value-red">{{ remainCountDisplay }}人</text>
								</view>
								<view class="stat-more" @click="viewEnrolledUsers">
									<text class="stat-more-text">更多</text>
									<uni-icons type="right" size="12" color="#b7b3d9"></uni-icons>
								</view>
							</view>
							<view class="enrolled-users" v-if="displayEnrolledUsers.length">
								<view
									class="enrolled-user-item"
									v-for="(user, idx) in displayEnrolledUsers"
									:key="idx"
								>
									<image
										:src="user.avatar || '/static/images/default_avatar.png'"
										class="enrolled-avatar"
										mode="aspectFill"
									></image>
									<text class="enrolled-name">{{ user.name || user.nickName }}</text>
								</view>
							</view>
						</view>

						<!-- 讲师信息 -->
						<view class="teacher-section" v-if="lecturers.length">
							<text class="section-title">授课老师</text>
							<view class="teacher-grid">
								<view
									class="teacher-card"
									v-for="teacher in lecturers"
									:key="teacher.id || teacher.name"
									@click="viewTeacher(teacher)"
								>
									<view class="teacher-avatar-wrap">
										<image
											:src="teacher.avatarUrl || teacher.avatar || '/static/images/tabbar/mine.png'"
											class="teacher-avatar"
											mode="aspectFill"
										></image>
									</view>
									<text class="teacher-name">{{ teacher.name }}</text>
									<uni-icons class="teacher-arrow" type="right" size="12" color="#c8bff4"></uni-icons>
								</view>
							</view>
						</view>

						<!-- 温馨提示 -->
						<view class="section-block">
							<text class="section-title">温馨提示</text>
							<view class="tips-card">
								<view class="tips-item" v-for="(tip, idx) in warmTips" :key="idx">
									<text class="tips-title">{{ tip.title }}</text>
									<text class="tips-text">{{ tip.content }}</text>
								</view>
							</view>
						</view>

						<!-- 课程详情 -->
						<view class="section-block detail-section" v-if="detail.detail || detail.description || posterUrls.length">
							<text class="section-title detail-section-title">课程详情</text>
							<view class="detail-content">
								<!-- <rich-text :nodes="detail.detail || detail.description" class="detail-text"></rich-text> -->
								<view v-if="posterUrls.length" class="detail-poster-list">
									<image
										v-for="(poster, idx) in posterUrls"
										:key="poster || idx"
										:src="poster"
										class="detail-poster-image"
										mode="widthFix"
									></image>
								</view>
							</view>
						</view>
					</view>

					<view v-show="activeTab === 'review'" class="review-panel">
						<view class="section-block review-card">
							<view class="review-title-row">
								<text class="section-title">课程评价</text>
								<text class="review-total">{{ reviews.length }} 条</text>
							</view>
							<view v-if="reviewLoading" class="review-loading">
								<uni-load-more status="loading"></uni-load-more>
							</view>
							<view v-else-if="reviews.length" class="review-list">
								<view v-for="review in reviews" :key="review.id" class="review-item">
									<image
										v-if="review.reviewerAvatarUrl"
										:src="review.reviewerAvatarUrl"
										class="review-avatar"
										mode="aspectFill"
									></image>
									<view v-else class="review-avatar review-avatar-fallback">
										<text>{{ getReviewerInitial(review.reviewerName) }}</text>
									</view>
									<view class="review-main">
										<view class="review-meta-row">
											<text class="reviewer-name">{{ review.reviewerName || '微信用户' }}</text>
											<text class="review-time">{{ formatReviewTime(review.updateTime || review.createTime) }}</text>
										</view>
										<text class="review-content">{{ review.content }}</text>
									</view>
								</view>
							</view>
							<view v-else class="review-empty">
								<text>暂时还没有评价，来发表第一条评价吧</text>
							</view>
						</view>

						<view class="section-block review-composer">
							<text class="section-title">写评价</text>
							<textarea
								v-model="reviewContent"
								class="review-textarea"
								maxlength="1000"
								placeholder="请输入你对本次课程的评价"
								placeholder-class="review-placeholder"
								:disabled="reviewSaving"
							/>
							<view class="review-footer">
								<text class="review-count">已报名用户可发送 · {{ reviewContent.length }}/1000</text>
								<view
									class="review-save-btn"
									:class="{ disabled: reviewSaving }"
									@click="handleSaveReview"
								>
									<text class="review-save-text">{{ reviewSaving ? '发送中...' : '发送' }}</text>
								</view>
							</view>
						</view>
					</view>

					<view style="height: 130px;"></view>
				</view>
			</scroll-view>

			<!-- 底部操作栏 -->
			<view class="bottom-bar">
				<view class="btn-row">
					<button class="btn-share" open-type="share">
						<view class="btn-share-inner">
							<uni-icons type="redo" size="24" color="#6B7280"></uni-icons>
							<text class="btn-share-text">分享</text>
						</view>
					</button>
					<view
						class="btn-enroll"
						:class="{ 'btn-disabled': detail.enrolled }"
						@click="handleEnroll"
					>
						<text class="btn-enroll-text">{{ detail.enrolled ? '已报名' : '前往报名' }}</text>
					</view>
				</view>
			</view>
		</block>
	</view>
</template>

<script>
import config from '@/config'
import { getCourse, getCourseReviews, saveCourseReview } from '@/api/wxmini/growup'
import { getMyReferralCode } from '@/api/wxmini/referral'
import { getToken } from '@/utils/auth'
import {
	buildLectureImageUrl,
	formatLectureImageVersion,
	getLectureImageSrc,
	resolveLectureCoverDirectoryId,
} from '@/utils/lecture-cover'

const DEFAULT_ENROLLED_COUNT = 0
const DEFAULT_REMAIN_COUNT = 150
const DEFAULT_WARM_TIPS = [
	{
		title: '取消报名说明：',
		content: '学员在开课时间42小时前可自行取消报名。取消报名后学籍及已缴押金自动退回，42小时后需联系工作人员取消，取消后将退还学籍，押金不退。'
	},
	{
		title: '住宿预定说明：',
		content: '学员可在开课前42小时预定住宿，42小时内将不能预定，取消政策同上。'
	}
]

export default {
	data() {
		return {
			statusBarHeight: 0,
			type: 'course',
			id: '',
			activeTab: 'detail',
			loading: true,
			error: false,
			detail: null,
			myEnrollmentCount: 0,
			topCoverLoadFailed: false,
			reviewContent: '',
			reviews: [],
			reviewLoading: false,
			reviewSaving: false,
			inviteCode: '',
		}
	},
	computed: {
		topCoverUrl() {
			const coverDirectoryId = resolveLectureCoverDirectoryId(this.detail || { id: this.id })
			const updateDate = this.detail?.updateDate
			const version = this.formatImageVersion(updateDate)
			const fallbackUrl = this.detail?.coverUrl ? `${this.detail.coverUrl}${version}` : ''
			if (!coverDirectoryId) {
				return fallbackUrl
			}
			if (this.topCoverLoadFailed) {
				return fallbackUrl
			}
			return getLectureImageSrc({
				baseUrl: config.baseUrl,
				lecture: { id: coverDirectoryId, updateDate },
				fileName: 'cover.webp'
			})
		},
		posterUrls() {
			const coverCount = Number(this.detail?.cover) || 0
			const coverDirectoryId = resolveLectureCoverDirectoryId(this.detail || { id: this.id })
			const updateDate = this.detail?.updateDate
			if (!coverDirectoryId || coverCount < 1) {
				return []
			}
			return Array.from(
				{ length: coverCount },
				(_, index) => this.buildLectureImageUrl(coverDirectoryId, `${index + 1}.webp`, updateDate)
			)
		},
		lecturers() {
			const speakers = this.detail?.speakers
			if (Array.isArray(speakers) && speakers.length) {
				return speakers.filter(item => item && (item.id || item.name))
			}
			const teachers = this.detail?.teachers
			if (Array.isArray(teachers) && teachers.length) {
				return teachers.filter(item => item && (item.id || item.name))
			}
			return []
		},
		enrolledCountDisplay() {
			const count = Number(this.detail?.enrolledCount)
			return Number.isFinite(count) ? count : DEFAULT_ENROLLED_COUNT
		},
		remainCountDisplay() {
			const count = Number(this.detail?.remainCount)
			return Number.isFinite(count) ? count : DEFAULT_REMAIN_COUNT
		},
		displayEnrolledUsers() {
			const users = Array.isArray(this.detail?.enrolledUsers) ? this.detail.enrolledUsers : []
			return users.slice(0, 5)
		},
		warmTips() {
			return DEFAULT_WARM_TIPS
		}
	},
	onLoad(options) {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 0
		this.type = options.type || 'course'
		this.id = options.id || ''
		this.loadDetail()
		this.loadInviteCode()
	},
	onShareAppMessage() {
		const title = this.detail?.name || '课程详情'
		const imageUrl = this.topCoverUrl || this.detail?.coverUrl || ''
		const path = this.buildSharePath()
		return { title, imageUrl, path }
	},
	onShareTimeline() {
		const title = this.detail?.name || '课程详情'
		const imageUrl = this.topCoverUrl || this.detail?.coverUrl || ''
		return { title, imageUrl, query: this.buildShareQuery() }
	},
	methods: {
		async loadInviteCode() {
			if (!getToken()) {
				this.inviteCode = ''
				return
			}
			try {
				const res = await getMyReferralCode()
				this.inviteCode = res?.data?.inviteCode || ''
			} catch (e) {
				this.inviteCode = ''
			}
		},
		buildShareQuery() {
			const query = `id=${encodeURIComponent(this.id)}&type=${encodeURIComponent(this.type)}`
			if (!this.inviteCode) return query
			return `${query}&inviteCode=${encodeURIComponent(this.inviteCode)}`
		},
		buildSharePath() {
			return `/pages/growup/detail?${this.buildShareQuery()}`
		},
		formatImageVersion(updateDate) {
			return formatLectureImageVersion(updateDate)
		},
		buildLectureImageUrl(courseId, fileName, updateDate) {
			return buildLectureImageUrl({
				baseUrl: config.baseUrl,
				lecture: { id: courseId, updateDate },
				fileName,
			})
		},
		goBack() {
			uni.navigateBack()
		},
		handleTopCoverError() {
			this.topCoverLoadFailed = true
		},
		formatMeta(dateStr) {
			if (!dateStr) return ''
			return String(dateStr).replace(/^(\d{4})-(\d{2})-(\d{2}).*/, '$1.$2.$3')
		},
		formatDateRange(start, end) {
			if (!start) return ''
			const s = this.formatMeta(start)
			const e = end ? this.formatMeta(end) : ''
			return e ? `${s}—${e}` : s
		},
		async loadDetail() {
			this.loading = true
			this.error = false
			this.topCoverLoadFailed = false
			try {
				const res = await getCourse(this.id)
				this.detail = res.data || res
			} catch (e) {
				this.error = true
			} finally {
				this.loading = false
			}
		},
		switchTab(tab) {
			this.activeTab = tab
			if (tab === 'review' && !this.reviewLoading) {
				this.loadReviews()
			}
		},
		async loadReviews() {
			this.reviewLoading = true
			try {
				this.reviews = await getCourseReviews(this.id)
			} catch (error) {
				uni.showToast({ title: error?.msg || '评价加载失败', icon: 'none' })
			} finally {
				this.reviewLoading = false
			}
		},
		formatReviewTime(value) {
			return value ? String(value).slice(0, 16).replace(/-/g, '.') : ''
		},
		getReviewerInitial(name) {
			return String(name || '微信用户').trim().slice(0, 1)
		},
		async handleSaveReview() {
			if (this.reviewSaving) return
			if (!getToken()) {
				uni.showToast({ title: '请先登录后发送评价', icon: 'none' })
				return
			}
			const content = this.reviewContent.trim()
			if (!content) {
				uni.showToast({ title: '请输入评价内容', icon: 'none' })
				return
			}
			if (content.length > 1000) {
				uni.showToast({ title: '评价内容不能超过1000字', icon: 'none' })
				return
			}
			this.reviewSaving = true
			try {
				await saveCourseReview(this.id, { content })
				this.reviewContent = ''
				await this.loadReviews()
				uni.showToast({ title: '发送成功', icon: 'success' })
			} catch (error) {
				uni.showToast({ title: error?.msg || '发送失败', icon: 'none' })
			} finally {
				this.reviewSaving = false
			}
		},
		viewEnrolledUsers() {
			uni.navigateTo({ url: `/pages/growup/course/enrolled?id=${this.id}` })
		},
		viewTeacher(teacher) {
			if (teacher.id) {
				uni.navigateTo({ url: `/pages/growup/tutor/detail?id=${teacher.id}` })
			}
		},
		handleEnroll() {
			if (!this.detail || this.detail.enrolled) return
			uni.navigateTo({
				url: `/pages/growup/course/notice?id=${this.id}`
			})
		},
	}
}
</script>

<style lang="scss">
page {
	background: #f4f6fb;
}

.page {
	min-height: 100vh;
	background: #f4f6fb;
}

.float-bar {
	position: fixed;
	left: 0;
	right: 0;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 0 16px;
	z-index: 100;
}

.float-btn {
	width: 36px;
	height: 36px;
	background: rgba(0, 0, 0, 0.35);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-wrap,
.error-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 200px;
	gap: 12px;
}

.error-text {
	font-size: 14px;
	color: #94a3b8;
}

.retry-btn {
	background: #3B82F6;
	border-radius: 20px;
	padding: 8px 20px;
}

.retry-text {
	color: #fff;
	font-size: 14px;
}

.content-scroll {
	height: 100vh;
}

.cover-banner {
	position: relative;
	height: 240px;
	background: linear-gradient(160deg, #1e293b 0%, #3B82F6 100%);
	overflow: hidden;
}

.cover-image {
	display: block;
	width: 100%;
	height: 240px;
}

.cover-gradient {
	width: 100%;
	height: 240px;
	background: linear-gradient(160deg, #1e293b 0%, #3B82F6 100%);
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	padding: 0 20px 24px;
	overflow: hidden;
	position: relative;
}

.cover-decor-circle {
	position: absolute;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.08);
}

.c1 {
	width: 180px;
	height: 180px;
	top: -60px;
	right: -40px;
}

.c2 {
	width: 120px;
	height: 120px;
	top: 30px;
	right: 70px;
	background: rgba(255, 255, 255, 0.05);
}

.cover-title-gradient {
	font-size: 20px;
	font-weight: 700;
	color: #fff;
	line-height: 1.4;
	margin-bottom: 6px;
}

.cover-date-gradient {
	font-size: 13px;
	color: rgba(255, 255, 255, 0.8);
}

.content-wrap {
	position: relative;
	margin-top: -18px;
	background: #f4f6fb;
	border-radius: 20px 20px 0 0;
	padding: 16px 14px 0;
	min-height: calc(100vh - 222px);
	z-index: 1;
}

.detail-tabs {
	display: flex;
	flex-direction: row;
	background: #fff;
	border-radius: 14px;
	padding: 4px;
	margin-bottom: 12px;
	box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.detail-tab {
	flex: 1;
	height: 38px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
	font-weight: 600;
	color: #64748b;
}

.detail-tab.active {
	background: linear-gradient(135deg, #3B82F6 0%, #6366f1 100%);
	color: #fff;
}

.detail-tab.disabled {
	color: #cbd5e1;
}

.course-info-card {
	background: #fff;
	border-radius: 14px;
	padding: 16px;
	margin-bottom: 12px;
	box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.course-name {
	font-size: 17px;
	font-weight: 700;
	color: #1e293b;
	line-height: 1.5;
	display: block;
	margin-bottom: 12px;
}

.course-meta-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.course-meta-item {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
}

.meta-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: #94a3b8;
	margin-top: 6px;
	margin-right: 8px;
	flex-shrink: 0;
}

.meta-label {
	font-size: 13px;
	color: #64748b;
	flex-shrink: 0;
}

.meta-value {
	font-size: 13px;
	color: #1e293b;
	flex: 1;
	line-height: 1.5;
}

.enroll-stat-card {
	background: #fff;
	border-radius: 14px;
	padding: 0;
	margin-bottom: 16px;
	overflow: hidden;
	box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.enroll-stat-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 10px 14px;
	background: linear-gradient(180deg, #f4f1ff 0%, #ece8ff 100%);
}

.stat-item {
	display: flex;
	flex-direction: row;
	align-items: center;
	flex-shrink: 0;
}

.stat-label {
	font-size: 13px;
	color: #7c6bb4;
}

.stat-value-dark {
	font-size: 13px;
	font-weight: 600;
	color: #5b4dc7;
}

.stat-value-red {
	font-size: 13px;
	font-weight: 600;
	color: #f05b98;
}

.stat-divider {
	width: 1px;
	height: 14px;
	background: #d9d1ff;
	margin: 0 14px;
}

.stat-more {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-left: auto;
	gap: 2px;
}

.stat-more-text {
	font-size: 13px;
	color: #a09abf;
}

.enrolled-users {
	display: flex;
	flex-direction: row;
	gap: 18px;
	padding: 14px 16px 16px;
	flex-wrap: wrap;
	background: #fff;
}

.enrolled-user-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	width: 52px;
}

.enrolled-avatar {
	width: 52px;
	height: 52px;
	border-radius: 50%;
	background: #e2e8f0;
}

.enrolled-name {
	font-size: 12px;
	color: #5b556f;
	max-width: 64px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	text-align: center;
}

.section-block {
	background: #fff;
	border-radius: 14px;
	padding: 16px;
	margin-bottom: 12px;
	box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.section-title {
	font-size: 15px;
	font-weight: 700;
	color: #1e293b;
	display: block;
	margin-bottom: 12px;
}

.teacher-section {
	margin-bottom: 12px;
}

.teacher-grid {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 10px;
}

.teacher-card {
	position: relative;
	max-width: 100%;
	background: #fff;
	border-radius: 12px;
	padding: 8px 12px;
	box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
	display: inline-flex;
	flex-direction: row;
	align-items: center;
	gap: 10px;
	box-sizing: border-box;
}

.teacher-avatar-wrap {
	flex-shrink: 0;
	width: 44px;
	height: 44px;
	border-radius: 50%;
	border: 2px solid #f1f5f9;
	background: #e2e8f0;
	overflow: hidden;
}

.teacher-avatar {
	width: 100%;
	height: 100%;
	display: block;
	object-fit: cover;
	object-position: 50% 15%;
}

.teacher-name {
	min-width: 0;
	max-width: calc(100vw - 164px);
	font-size: 15px;
	font-weight: 500;
	color: #1e293b;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.teacher-arrow {
	flex-shrink: 0;
}

.tips-card {
	background: #fff;
	border-radius: 10px;
}

.tips-item + .tips-item {
	margin-top: 14px;
}

.tips-title {
	font-size: 14px;
	font-weight: 500;
	color: #4b5563;
}

.tips-text {
	display: block;
	margin-top: 8px;
	font-size: 13px;
	color: #9ca3af;
	line-height: 1.9;
}

.detail-section {
	padding-left: 10px;
	padding-right: 10px;
}

.detail-section-title,
.detail-text {
	padding: 0 6px;
}

.detail-content {
	width: 100%;
}

.detail-text {
	font-size: 14px;
	color: #475569;
	line-height: 1.8;
}

.detail-poster-list {
	margin-top: 16px;
	display: flex;
	flex-direction: column;
	gap: 0;
}

.detail-poster-image {
	display: block;
	width: 100%;
	border-radius: 0;
	overflow: hidden;
	background: #f8fafc;
}

.review-panel {
	min-height: 320px;
}

.review-card {
	padding: 16px;
}

.review-composer {
	margin-top: 12px;
	padding: 16px;
}

.review-title-row,
.review-meta-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

.review-total,
.review-time {
	font-size: 12px;
	color: #94a3b8;
}

.review-list {
	margin-top: 16px;
}

.review-item {
	display: flex;
	flex-direction: row;
	gap: 10px;
	padding: 14px 0;
	border-top: 1px solid #edf2f7;
}

.review-avatar {
	width: 36px;
	height: 36px;
	flex: 0 0 36px;
	border-radius: 50%;
	overflow: hidden;
}

.review-avatar-fallback {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #dbeafe;
	color: #2563eb;
	font-size: 14px;
	font-weight: 700;
}

.review-main {
	min-width: 0;
	flex: 1;
}

.reviewer-name {
	font-size: 14px;
	font-weight: 600;
	color: #1e293b;
}

.review-content {
	display: block;
	margin-top: 6px;
	font-size: 14px;
	line-height: 1.7;
	color: #475569;
	word-break: break-all;
}

.review-empty {
	padding: 28px 0 12px;
	text-align: center;
	font-size: 13px;
	color: #94a3b8;
}

.review-loading {
	padding: 30px 0;
}

.review-textarea {
	width: 100%;
	min-height: 180px;
	box-sizing: border-box;
	background: #f8fafc;
	border-radius: 12px;
	padding: 12px;
	font-size: 14px;
	line-height: 1.7;
	color: #1e293b;
}

.review-placeholder {
	color: #94a3b8;
}

.review-footer {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-top: 12px;
}

.review-count {
	font-size: 12px;
	color: #94a3b8;
}

.review-save-btn {
	border-radius: 999px;
	padding: 9px 18px;
	background: linear-gradient(135deg, #3B82F6 0%, #6366f1 100%);
}

.review-save-btn.disabled {
	background: #cbd5e1;
}

.review-save-text {
	font-size: 13px;
	font-weight: 700;
	color: #fff;
}

.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	padding: 10px 16px;
	padding-bottom: calc(10px + env(safe-area-inset-bottom));
	box-shadow: 0 -1px 0 #f1f5f9;
	z-index: 50;
}

.btn-row {
	display: flex;
	flex-direction: row;
	gap: 12px;
}

.btn-enroll {
	flex: 2.5;
	height: 50px;
	border-radius: 25px;
	background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-enroll.btn-disabled {
	background: #e2e8f0;
}

.btn-enroll-text {
	font-size: 15px;
	color: #fff;
	font-weight: 700;
}

.btn-enroll.btn-disabled .btn-enroll-text {
	color: #94a3b8;
}

.btn-share {
	margin: 0;
	padding: 0;
	width: 50px;
	height: 50px;
	background: transparent !important;
	border: none !important;
	box-shadow: none !important;
	line-height: 1 !important;
	font-size: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.btn-share::after {
	display: none !important;
	border: none !important;
}

.btn-share-inner {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4px;
}

.btn-share-text {
	font-size: 11px;
	color: #6B7280;
	font-weight: 400;
	line-height: 1;
}
</style>
