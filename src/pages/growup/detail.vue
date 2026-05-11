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

						<view style="height: 130px;"></view>
					</view>
				</scroll-view>

				<!-- 底部操作栏 -->
				<view class="bottom-bar">
					<view class="btn-row">
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
import { getCourse } from '@/api/wxmini/growup'
import {
	buildLectureImageUrl,
	formatLectureImageVersion,
	getLectureImageSrc,
	resolveLectureCoverDirectoryId,
} from './lecture-cover'

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
			loading: true,
			error: false,
			detail: null,
			myEnrollmentCount: 0,
			topCoverLoadFailed: false,
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
	},
	methods: {
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
	flex-wrap: wrap;
	gap: 12px;
}

.teacher-card {
	position: relative;
	width: calc((100% - 12px) / 2);
	background: #fff;
	border-radius: 14px;
	padding: 14px 14px 12px;
	box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 10px;
	box-sizing: border-box;
}

.teacher-avatar-wrap {
	flex-shrink: 0;
	width: 66px;
	height: 66px;
	border-radius: 16px;
	border: 3px solid #f1f5f9;
	background: #e2e8f0;
	overflow: hidden;
}

.teacher-avatar {
	width: 100%;
	display: block;
	object-fit: cover;
	object-position: 50% 20%;
	transform: scale(0.92);
	transform-origin: 50% -90%;
}

.teacher-name {
	flex: 1;
	font-size: 14px;
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
</style>

