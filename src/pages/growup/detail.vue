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
					<view class="enroll-stat-card" v-if="detail.enrolledCount !== undefined || detail.remainCount !== undefined">
						<view class="enroll-stat-row">
							<view class="stat-item">
								<text class="stat-label">已报名：</text>
								<text class="stat-value-dark">{{ detail.enrolledCount || 0 }}人</text>
							</view>
							<view class="stat-divider"></view>
							<view class="stat-item">
								<text class="stat-label">剩余报名：</text>
								<text class="stat-value-red">{{ detail.remainCount || 0 }}人</text>
							</view>
							<view class="stat-more" @click="viewEnrolledUsers">
								<text class="stat-more-text">更多</text>
								<uni-icons type="right" size="12" color="#94a3b8"></uni-icons>
							</view>
						</view>
						<view class="enrolled-users" v-if="detail.enrolledUsers && detail.enrolledUsers.length">
							<view
								class="enrolled-user-item"
								v-for="(user, idx) in detail.enrolledUsers.slice(0, 5)"
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

					<!-- 授课老师 -->
					<view class="section-block" v-if="detail.teachers && detail.teachers.length">
						<text class="section-title">授课老师</text>
						<view
							class="teacher-card"
							v-for="(teacher, idx) in detail.teachers"
							:key="idx"
							@click="viewTeacher(teacher)"
						>
							<image
								:src="teacher.avatar || '/static/images/default_avatar.png'"
								class="teacher-avatar"
								mode="aspectFill"
							></image>
							<text class="teacher-name">{{ teacher.name }}</text>
							<uni-icons type="right" size="16" color="#94a3b8"></uni-icons>
						</view>
					</view>

					<!-- 温馨提示 -->
					<view class="section-block" v-if="detail.tips">
						<text class="section-title">温馨提示</text>
						<view class="tips-card">
							<rich-text :nodes="detail.tips" class="tips-text"></rich-text>
						</view>
					</view>

					<!-- 课程详情 -->
					<view class="section-block detail-section" v-if="detail.detail || detail.description || posterUrls.length">
						<text class="section-title detail-section-title">课程详情</text>
						<view class="detail-content">
							<rich-text :nodes="detail.detail || detail.description" class="detail-text"></rich-text>
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
			const courseId = this.detail?.id || this.id
			const updateDate = this.detail?.updateDate
			const version = this.formatImageVersion(updateDate)
			const fallbackUrl = this.detail?.coverUrl ? `${this.detail.coverUrl}${version}` : ''
			if (!courseId) {
				return fallbackUrl
			}
			if (this.topCoverLoadFailed) {
				return fallbackUrl
			}
			return this.buildLectureImageUrl(courseId, 'cover.webp', updateDate)
		},
		posterUrls() {
			const coverCount = Number(this.detail?.cover) || 0
			const courseId = this.detail?.id || this.id
			const updateDate = this.detail?.updateDate
			if (!courseId || coverCount < 1) {
				return []
			}
			return Array.from(
				{ length: coverCount },
				(_, index) => this.buildLectureImageUrl(courseId, `${index + 1}.webp`, updateDate)
			)
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
			const version = String(updateDate || '').replace(/\D/g, '')
			return version ? `?v=${version}` : ''
		},
		buildLectureImageUrl(courseId, fileName, updateDate) {
			const baseUrl = String(config.baseUrl || '').replace(/\/+$/, '')
			return `${baseUrl}/lectures/${courseId}/${fileName}${this.formatImageVersion(updateDate)}`
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
	padding: 14px 16px;
	margin-bottom: 12px;
	box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.enroll-stat-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 14px;
}

.stat-item {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.stat-label {
	font-size: 13px;
	color: #64748b;
}

.stat-value-dark {
	font-size: 13px;
	font-weight: 600;
	color: #1e293b;
}

.stat-value-red {
	font-size: 13px;
	font-weight: 600;
	color: #ef4444;
}

.stat-divider {
	width: 1px;
	height: 14px;
	background: #e2e8f0;
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
	color: #94a3b8;
}

.enrolled-users {
	display: flex;
	flex-direction: row;
	gap: 16px;
	flex-wrap: wrap;
}

.enrolled-user-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.enrolled-avatar {
	width: 46px;
	height: 46px;
	border-radius: 50%;
	background: #e2e8f0;
}

.enrolled-name {
	font-size: 11px;
	color: #64748b;
	max-width: 48px;
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

.teacher-card {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 10px 12px;
	background: #f8fafc;
	border-radius: 12px;
	margin-bottom: 8px;
}

.teacher-avatar {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	background: #e2e8f0;
	margin-right: 14px;
}

.teacher-name {
	font-size: 15px;
	font-weight: 600;
	color: #1e293b;
	flex: 1;
}

.tips-card {
	background: #f8fafc;
	border-radius: 10px;
	padding: 12px;
}

.tips-text {
	font-size: 13px;
	color: #475569;
	line-height: 1.8;
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
