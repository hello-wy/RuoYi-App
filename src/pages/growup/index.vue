<template>
	<view class="page">
		<scroll-view
			scroll-y
			class="scroll-body"
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- ===== 顶部 Swiper ===== -->
			<view class="swiper-wrap">
				<swiper
					class="banner-swiper"
					circular
					:autoplay="true"
					:interval="4000"
					:duration="400"
					indicator-dots
					indicator-color="rgba(255,255,255,0.5)"
					indicator-active-color="#ffffff"
				>
					<swiper-item v-for="(item, idx) in banners" :key="idx" @click="onBannerClick(item)">
						<view class="banner-blue-bg">
							<image
								v-if="item.imageSrc"
								class="banner-image"
								:src="item.imageSrc"
								mode="aspectFill"
							></image>
							<view class="banner-content-overlay">
								<text class="banner-title">{{ item.title }}</text>
								<!-- <text v-if="item.subtitle" class="banner-sub">{{ item.subtitle }}</text> -->
							</view>
						</view>
					</swiper-item>
				</swiper>
				<!-- 扫码按钮悬浮在 Swiper 上方 -->
				<view class="swiper-scan-btn" @click="handleScan">
					<uni-icons type="scan" size="22" color="#ffffff"></uni-icons>
				</view>
			</view>

			<!-- ===== 最近课程 ===== -->
			<view class="section-wrap">
				<view class="section-head">
					<view class="section-head-left">
						<view class="section-dot blue-dot"></view>
						<text class="section-title">最近课程</text>
					</view>
					<view v-if="featuredCourse" class="section-more" @click="navTo('/pages/growup/detail?id=' + featuredCourse.id)">
						<text class="section-more-text">详情</text>
						<uni-icons type="right" size="12" color="#3B82F6"></uni-icons>
					</view>
				</view>

				<view v-if="!featuredCourse && !coursesLoading" class="empty-card">
					<uni-icons type="calendar" size="28" color="#cbd5e1"></uni-icons>
					<text class="empty-text">暂无活动</text>
				</view>

				<view v-if="featuredCourse" class="lecture-card">
					<view class="lecture-header" @click="navTo('/pages/growup/detail?id=' + featuredCourse.id + '&type=lecture')">
						<text class="lecture-name">{{ featuredCourse.name }}</text>
					</view>
					<!-- <text class="lecture-detail" @click="navTo('/pages/growup/detail?id=' + featuredCourse.id + '&type=lecture')">{{ featuredCourse.detail }}</text> -->
					<view class="lecture-footer">
						<view class="lecture-meta-item">
							<uni-icons type="person" size="13" color="#3B82F6"></uni-icons>
							<text class="lecture-meta-text">{{ featuredCourse.speakerNames }}</text>
						</view>
						<view class="lecture-meta-item">
							<uni-icons type="calendar" size="13" color="#3B82F6"></uni-icons>
							<text class="lecture-meta-text">{{ featuredCourse.time }}</text>
						</view>
						<view class="lecture-meta-item">
							<uni-icons type="location" size="13" color="#3B82F6"></uni-icons>
							<text class="lecture-meta-text lecture-location">{{ featuredCourse.location }}</text>
						</view>
					</view>
					<!-- 签到操作行 -->
					<view class="lecture-action-row">
						<view class="lecture-detail-btn" @click="navTo('/pages/growup/detail?id=' + featuredCourse.id + '&type=lecture')">
							<text class="lecture-detail-btn-text">查看详情</text>
						</view>
						<view class="lecture-signin-btn" @click="handleSignIn(featuredCourse)">
							<uni-icons type="checkbox" size="15" color="#fff"></uni-icons>
							<text class="lecture-signin-btn-text">去签到</text>
						</view>
					</view>
				</view>
			</view>

			<!-- ===== 快捷入口：资料中心 + 讲师风采 ===== -->
			<view class="quick-grid">
				<!-- 资料中心 -->
				<view class="quick-item" @click="navTo('/pages/growup/material/list')">
					<view class="quick-icon-wrap" style="background: #EEF2FF;">
						<uni-icons type="paperplane-filled" size="24" color="#6366F1"></uni-icons>
					</view>
					<text class="quick-name">资料中心</text>
					<text class="quick-desc">学习资料下载</text>
				</view>

				<!-- 讲师风采 -->
				<view class="quick-item" @click="navTo('/pages/growup/tutor/list')">
					<view class="quick-icon-wrap" style="background: #FFF7ED;">
						<uni-icons type="contact-filled" size="24" color="#F59E0B"></uni-icons>
					</view>
					<text class="quick-name">讲师风采</text>
					<text class="quick-desc">查看全部讲师</text>
				</view>
			</view>

			<!-- ===== 全部课程 ===== -->
			<view class="section-wrap">
				<view class="section-head">
					<view class="section-head-left">
						<view class="section-dot green-dot"></view>
						<text class="section-title">全部课程</text>
					</view>
					<view v-if="showAllCoursesMore" class="section-more" @click="toggleAllCoursesExpanded">
						<text class="section-more-text">{{ allCoursesExpanded ? '收起' : '更多' }}</text>
						<uni-icons :type="allCoursesExpanded ? 'top' : 'right'" size="12" color="#3B82F6"></uni-icons>
					</view>
				</view>

				<view v-if="allCourses.length === 0" class="empty-card">
					<text class="empty-text">暂无活动</text>
				</view>

				<view
					v-for="course in displayedCourses"
					:key="course.id"
					class="all-course-card"
					@click="navTo('/pages/growup/detail?id=' + course.id)"
				>
					<view class="all-course-cover-placeholder">
						<image
							v-if="course.id && !coverLoadFailed[course.id]"
							class="all-course-cover-image"
							:src="getLectureCoverUrl(course)"
							mode="aspectFill"
							@error="handleLectureCoverError(course.id)"
						></image>
						<uni-icons v-else type="calendar" size="22" color="rgba(255,255,255,0.8)"></uni-icons>
					</view>
					<view class="all-course-info">
						<text class="all-course-name">{{ course.name }}</text>
						<view class="all-course-time-row">
							<text class="all-course-time-label">开课时间：</text>
							<text class="all-course-time">{{ course.time }}</text>
						</view>
						<view
							class="all-course-location-row"
							:class="{ 'all-course-location-row-multiline': locationMultilineMap[course.id] }"
						>
							<uni-icons type="location" size="12" color="#c4bfcf"></uni-icons>
							<text
								:id="`course-location-${course.id}`"
								class="all-course-location"
							>{{ course.location || '待定' }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- ===== 沙龙活动 ===== -->
			<!-- <view class="section-wrap">
				<view class="section-head">
					<view class="section-head-left">
						<view class="section-dot orange-dot"></view>
						<text class="section-title">沙龙活动</text>
					</view>
					<view class="section-more" @click="navTo('/pages/growup/salon/list')">
						<text class="section-more-text">更多</text>
						<uni-icons type="right" size="12" color="#3B82F6"></uni-icons>
					</view>
				</view>

				<view v-if="salons.length === 0" class="empty-card">
					<text class="empty-text">暂无沙龙活动</text>
				</view>

				<scroll-view v-else scroll-x class="h-scroll" :show-scrollbar="false">
					<view class="h-scroll-inner">
						<view
							v-for="salon in salons"
							:key="salon.id"
							class="salon-card"
							@click="navTo('/pages/growup/detail?type=salon&id=' + salon.id)"
						>
							<image
								class="salon-cover"
								:src="salon.cover || '/static/images/banner/default.jpg'"
								mode="aspectFill"
							></image>
							<view class="salon-info">
								<view class="salon-status-row">
									<view class="salon-status-badge" :class="getSalonStatusClass(salon.status)">
										<text class="salon-status-text">{{ getSalonStatusText(salon.status) }}</text>
									</view>
								</view>
								<text class="salon-name">{{ salon.name }}</text>
								<view class="salon-meta">
									<uni-icons type="calendar" size="12" color="#94a3b8"></uni-icons>
									<text class="salon-meta-text">{{ salon.date }}</text>
								</view>
								<view class="salon-meta">
									<uni-icons type="location" size="12" color="#94a3b8"></uni-icons>
									<text class="salon-meta-text">{{ salon.location }}</text>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view> -->

			<!-- ===== 问卷活动 ===== -->
			<view class="section-wrap" style="margin-bottom: 30px;">
				<view class="section-head">
					<view class="section-head-left">
						<view class="section-dot red-dot"></view>
						<text class="section-title">问卷活动</text>
					</view>
					<!-- <view class="section-more" @click="navTo('/pages/growup/survey/list')">
						<text class="section-more-text">更多</text>
						<uni-icons type="right" size="12" color="#3B82F6"></uni-icons>
					</view> -->
				</view>

				<view v-if="!isLoggedIn" class="empty-card survey-login-card" @click="shouldAutoOpenLogin = true">
					<uni-icons type="person" size="28" color="#cbd5e1"></uni-icons>
					<text class="empty-text">登录后查看问卷活动</text>
				</view>

				<view v-else-if="!hasSurveyGroups && !surveysLoading" class="empty-card">
					<text class="empty-text">暂无问卷</text>
				</view>

				<view v-for="group in surveyGroups" :key="group.courseId" class="survey-course-group">
					<text class="survey-course-name">{{ group.courseName }}</text>
					<view
						v-for="survey in group.assignments"
						:key="survey.assignmentId"
						class="survey-card"
						:class="{ submitted: survey.submitted }"
						@click="handleSurveyClick(survey)"
					>
						<view class="survey-icon-wrap">
							<uni-icons type="list" size="20" color="#EF4444"></uni-icons>
						</view>
						<view class="survey-info">
							<text class="survey-name">{{ survey.title }}</text>
							<text v-if="survey.assignedAt" class="survey-deadline">发放：{{ formatDateOnly(survey.assignedAt) }}</text>
						</view>
						<view class="survey-action">
							<text class="survey-action-text" :class="{ submitted: survey.submitted }">{{ survey.submitted ? '已提交' : '去填写' }}</text>
							<uni-icons v-if="!survey.submitted" type="right" size="13" color="#3B82F6"></uni-icons>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		<LoginPopup v-if="shouldAutoOpenLogin" :auto-open="shouldAutoOpenLogin" @close="handleLoginPopupClose" />
	</view>
</template>

<script>
import config from '@/config'
import {
	listCourse
} from '@/api/wxmini/growup'
import { getPaidCourseOrder, scanCourseSignIn } from '@/api/wxmini/coursePay'
import { listSurveyAssignments } from '@/api/wxmini/survey'
import { useUserStore } from '@/store'
import { isAdminUser } from '@/utils/admin'
import { getToken } from '@/utils/auth'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'
import {
	getLectureImageSrc,
	prefetchLectureCovers,
} from '@/utils/lecture-cover'

const DEFAULT_BANNER_TITLE = '育见成长·讲座活动'
const DEFAULT_BANNER_SUBTITLE = '名师专家 · 精品公益讲座'

export default {
	components: { LoginPopup },
	data() {
		return {
			refreshing: false,
			coursesLoading: false,
			featuredCourse: null,
			allCourses: [],
			allCoursesExpanded: false,
			salons: [],
			surveyGroups: [],
			surveysLoading: false,
			hasLoadedSurveys: false,
			coverLoadFailed: {},
			locationMultilineMap: {},
			banners: [],
			shouldAutoOpenLogin: false
		}
	},
	onLoad() {
		this.loadAll()
	},
	onShow() {
		if (this.hasLoadedSurveys) {
			this.loadSurveys()
		}
	},
	computed: {
		showAllCoursesMore() {
			return this.allCourses.length > 3
		},
		displayedCourses() {
			return this.allCoursesExpanded ? this.allCourses : this.allCourses.slice(0, 3)
		},
		isLoggedIn() {
			return !!useUserStore().token
		},
		hasSurveyGroups() {
			return this.surveyGroups.some(group => group.assignments && group.assignments.length)
		}
	},
	methods: {
		formatDateOnly(value) {
			return String(value || '').slice(0, 10)
		},
		formatBannerTitle(course) {
			return course?.name || DEFAULT_BANNER_TITLE
		},
		formatBannerSubtitle(course) {
			return course?.speakerNames || DEFAULT_BANNER_SUBTITLE
		},
		buildBannerItems(courses = []) {
			return courses
				.filter(course => course?.id)
				.map(course => ({
					id: course.id,
					title: this.formatBannerTitle(course),
					subtitle: this.formatBannerSubtitle(course),
					url: `/pages/growup/detail?id=${course.id}`,
					imageSrc: getLectureImageSrc({
						baseUrl: config.baseUrl,
						lecture: course,
						fileName: 'cover.webp'
					})
				}))
		},
		async prefetchBannerAndCourseCovers(courses = [], options = {}) {
			const { expanded = this.allCoursesExpanded } = options
			const bannerCourses = courses.filter(course => course?.id)
			const visibleCourses = (expanded ? courses : courses.slice(0, 3)).filter(course => course?.id)
			await prefetchLectureCovers({
				baseUrl: config.baseUrl,
				lectures: [...bannerCourses, ...visibleCourses],
				fileName: 'cover.webp'
			})
			this.banners = this.buildBannerItems(courses)
		},
		getLectureCoverUrl(course) {
			return getLectureImageSrc({
				baseUrl: config.baseUrl,
				lecture: course,
				fileName: 'cover.webp'
			})
		},
		handleLectureCoverError(id) {
			this.coverLoadFailed = {
				...this.coverLoadFailed,
				[id]: true
			}
		},
		toggleAllCoursesExpanded() {
			this.allCoursesExpanded = !this.allCoursesExpanded
			this.$nextTick(async () => {
				await this.prefetchBannerAndCourseCovers(this.allCourses, { expanded: this.allCoursesExpanded })
				this.updateLocationAlignment()
			})
		},
		updateLocationAlignment() {
			const courses = this.displayedCourses.filter(course => course?.id)
			if (!courses.length) {
				this.locationMultilineMap = {}
				return
			}
			const query = uni.createSelectorQuery().in(this)
			courses.forEach(course => {
				query.select(`#course-location-${course.id}`).boundingClientRect()
			})
			query.exec((rects = []) => {
				const nextMap = {}
				rects.forEach((rect, index) => {
					const course = courses[index]
					if (!course?.id || !rect?.height) return
					nextMap[course.id] = rect.height > 18
				})
				this.locationMultilineMap = nextMap
			})
		},
		async loadAll() {
			await Promise.all([this.loadCourses(), this.loadSurveys()])
		},
		async loadCourses() {
			this.coursesLoading = true
			try {
				const res = await listCourse()
				const courses = Array.isArray(res.rows) ? res.rows : []
				this.allCourses = courses
				this.allCoursesExpanded = false
				this.featuredCourse = courses.find(course => course?.isTop === true) || courses[0] || null
				await this.prefetchBannerAndCourseCovers(courses)
				this.$nextTick(() => {
					this.updateLocationAlignment()
				})
			} catch (e) {
				console.error('[growup] 加载活动失败', e)
				this.featuredCourse = null
				this.allCourses = []
				this.allCoursesExpanded = false
				this.banners = this.buildBannerItems([])
				this.locationMultilineMap = {}
			} finally {
				this.coursesLoading = false
			}
		},
		async loadSurveys() {
			this.hasLoadedSurveys = true
			if (!this.isLoggedIn) {
				this.surveyGroups = []
				this.surveysLoading = false
				return
			}
			this.surveysLoading = true
			try {
				const groups = await listSurveyAssignments()
				this.surveyGroups = groups.filter(group => group.assignments && group.assignments.length)
			} catch (e) {
				this.surveyGroups = []
			} finally {
				this.surveysLoading = false
			}
		},
		handleSurveyClick(survey) {
			if (survey.submitted) {
				uni.showToast({ title: '问卷已提交', icon: 'none' })
				return
			}
			uni.navigateTo({ url: `/pages/growup/survey/answer?assignmentId=${survey.assignmentId}` })
		},
		async onRefresh() {
			this.refreshing = true
			await this.loadAll()
			this.refreshing = false
			uni.stopPullDownRefresh()
		},
		navTo(url) {
			uni.navigateTo({ url })
		},
		onBannerClick(item) {
			if (item.url) uni.navigateTo({ url: item.url })
		},
		handleScan() {
			if (!this.isCurrentUserAdmin()) {
				uni.showToast({ title: '无扫码签到权限', icon: 'none' })
				return
			}
			if (!this.featuredCourse || !this.featuredCourse.id) {
				uni.showToast({ title: '暂无可签到课程', icon: 'none' })
				return
			}
			uni.scanCode({
				onlyFromCamera: false,
				success: async (res) => {
					await this.submitScanSignIn(res.result)
				},
				fail: () => {
					uni.showToast({ title: '扫码失败，请重试', icon: 'none' })
				}
			})
		},
		isCurrentUserAdmin() {
			return isAdminUser(getToken(), useUserStore().roles)
		},
		async submitScanSignIn(result) {
			const userId = this.parseScannedUserId(result)
			if (!userId) {
				uni.showModal({ title: '签到失败', content: '二维码内容不是有效用户 ID', showCancel: false })
				return
			}
			try {
				const res = await scanCourseSignIn(this.featuredCourse.id, userId)
				const message = res.msg || res.message || '签到成功'
				uni.showModal({ title: '签到结果', content: message, showCancel: false })
			} catch (e) {
				const message = e?.msg || e?.message || '签到失败'
				uni.showModal({ title: '签到失败', content: message, showCancel: false })
			}
		},
		parseScannedUserId(result) {
			const text = String(result || '').trim()
			if (!text || text.length > 64) return ''
			return /^[A-Za-z0-9_-]+$/.test(text) ? text : ''
		},
		async handleSignIn(course) {
			const userStore = useUserStore()
			if (!userStore.token) {
				this.shouldAutoOpenLogin = true
				return
			}
			try {
				const order = await getPaidCourseOrder(course.id)
				if (![1, 2].includes(Number(order.status))) {
					uni.showToast({ title: '请先购买该课程', icon: 'none' })
					return
				}
				uni.navigateTo({ url: `/pages/growup/qrcode/index?id=${course.id}&type=lecture&action=signin` })
			} catch (e) {
				const message = e?.msg || e?.message || '请先购买该课程'
				uni.showToast({ title: message, icon: 'none' })
			}
		},
		handleLoginPopupClose() {
			this.shouldAutoOpenLogin = false
		},
		getSalonStatusText(status) {
			const map = { '0': '报名中', '1': '进行中', '2': '已结束' }
			return map[status] || '报名中'
		},
		getSalonStatusClass(status) {
			const map = { '0': 'status-open', '1': 'status-on', '2': 'status-end' }
			return map[status] || 'status-open'
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
	background: #f4f6fb;
	display: flex;
	flex-direction: column;
}

/* ===== 滚动区 ===== */
.scroll-body {
	flex: 1;
	overflow: hidden;
	padding-bottom: 40rpx;
}

/* ===== Swiper 包裹层（用于定位扫码按钮）===== */
.swiper-wrap {
	position: relative;
	width: 100%;
}

/* 扫码按钮：绝对定位，透明背景，z-index 9999 */
.swiper-scan-btn {
	position: absolute;
	top: 16px;
	right: 16px;
	z-index: 9999;
	width: 40px;
	height: 40px;
	border-radius: 20px;
	background: rgba(255, 255, 255, 0.18);
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(4px);
}

/* ===== Banner Swiper ===== */
.banner-swiper {
	width: 100%;
	height: 220px;
}

.banner-blue-bg {
	position: relative;
	width: 100%;
	height: 220px;
	background: transparent;
	display: flex;
	align-items: flex-end;
	justify-content: flex-start;
	padding: 0 20px 24px;
	overflow: hidden;
}

.banner-image {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
}


.banner-content-overlay {
	position: relative;
	z-index: 1;
	padding: 0;
}

.banner-title {
	display: block;
	font-size: 20px;
	font-weight: 700;
	color: #fff;
	text-shadow: 0 1px 8px rgba(0,0,0,0.25);
	margin-bottom: 4px;
}

.banner-sub {
	display: block;
	font-size: 13px;
	color: rgba(255,255,255,0.88);
}

/* ===== Section 通用 ===== */
.section-wrap {
	margin: 12px 16px 0;
	background: #fff;
	border-radius: 16px;
	padding: 16px;
	box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.section-head {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 14px;
}

.section-head-left {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8px;
}

.section-dot {
	width: 4px;
	height: 16px;
	border-radius: 2px;
}

.blue-dot   { background: #3B82F6; }
.green-dot  { background: #10B981; }
.orange-dot { background: #F59E0B; }
.red-dot    { background: #EF4444; }

.section-title {
	font-size: 16px;
	font-weight: 700;
	color: #1e293b;
}

.section-more {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 2px;
}

.section-more-text {
	font-size: 13px;
	color: #3B82F6;
}

/* ===== 空态 ===== */
.empty-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px 0;
	gap: 8px;
}

.empty-text {
	font-size: 13px;
	color: #94a3b8;
}

/* ===== 快捷入口 Grid ===== */
.quick-grid {
	margin: 12px 16px 0;
	display: flex;
	flex-direction: row;
	gap: 10px;
}

.quick-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	background: #fff;
	border-radius: 14px;
	padding: 16px 14px;
	box-shadow: 0 2px 12px rgba(0,0,0,0.05);
	gap: 6px;
}

.quick-icon-wrap {
	width: 46px;
	height: 46px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin-bottom: 4px;
}

.quick-name {
	display: block;
	font-size: 15px;
	font-weight: 700;
	color: #1e293b;
}

.quick-desc {
	font-size: 12px;
	color: #94a3b8;
}

/* ===== 讲座课程卡片 ===== */
.lecture-card {
	background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%);
	border-radius: 14px;
	padding: 16px;
	border: 1px solid #BFDBFE;
	position: relative;
	overflow: hidden;
}

.lecture-card::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 4px;
	height: 100%;
	background: linear-gradient(to bottom, #38BDF8, #3B82F6);
	border-radius: 4px 0 0 4px;
}

.lecture-header {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	justify-content: space-between;
	gap: 10px;
	margin-bottom: 8px;
	padding-left: 10px;
}

.lecture-name {
	flex: 1;
	font-size: 16px;
	font-weight: 700;
	color: #1e293b;
	line-height: 1.4;
}

.lecture-date-badge {
	background: #3B82F6;
	border-radius: 6px;
	padding: 3px 10px;
	flex-shrink: 0;
}

.lecture-date-text {
	font-size: 11px;
	color: #fff;
	font-weight: 600;
}

.lecture-detail {
	display: block;
	font-size: 13px;
	color: #475569;
	line-height: 1.7;
	margin-bottom: 12px;
	padding-left: 10px;
}

.lecture-footer {
	display: flex;
	flex-direction: column;
	gap: 5px;
	padding-left: 10px;
}

.lecture-meta-item {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 5px;
}

.lecture-meta-text {
	font-size: 12px;
	color: #64748b;
}

.lecture-location {
	flex: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

/* ===== 全部课程卡片 ===== */
.all-course-card {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 12px;
	background: #f8fafc;
	border-radius: 12px;
	overflow: hidden;
}

.all-course-cover-placeholder {
	width: 90px;
	height: 74px;
	flex-shrink: 0;
	background: linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.all-course-cover-image {
	width: 100%;
	height: 100%;
	display: block;
}

.all-course-info {
	flex: 1;
	padding: 8px 12px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-width: 0;
}

.all-course-name {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	overflow: hidden;
	font-size: 14px;
	font-weight: 600;
	color: #1e293b;
	line-height: 1.45;
	margin-bottom: 6px;
}

.all-course-time-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 6px;
	min-width: 0;
}

.all-course-time-label {
	font-size: 11px;
	color: #94a3b8;
	flex-shrink: 0;
}

.all-course-time {
	font-size: 11px;
	color: #94a3b8;
	min-width: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.all-course-location-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 4px;
	min-width: 0;
}

.all-course-location-row-multiline {
	align-items: flex-start;
}

.all-course-location {
	flex: 1;
	font-size: 11px;
	color: #b0aabc;
	line-height: 1.35;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	overflow: hidden;
}

/* ===== 沙龙活动 ===== */
.h-scroll {
	white-space: nowrap;
	overflow: hidden;
	margin: 0 -16px;
	padding: 0 16px;
}

.h-scroll-inner {
	display: flex;
	flex-direction: row;
	gap: 12px;
	padding: 4px 0 8px;
}

.salon-card {
	width: 210px;
	flex-shrink: 0;
	background: #f8fafc;
	border-radius: 12px;
	overflow: hidden;
}

.salon-cover {
	width: 210px;
	height: 120px;
	background: #e2e8f0;
}

.salon-info {
	padding: 10px 12px;
}

.salon-status-row {
	margin-bottom: 4px;
}

.salon-status-badge {
	display: inline-flex;
	padding: 2px 8px;
	border-radius: 4px;
}

.salon-status-badge.status-open { background: #EFF6FF; }
.salon-status-badge.status-on   { background: #ECFDF5; }
.salon-status-badge.status-end  { background: #f1f5f9; }

.salon-status-text { font-size: 11px; font-weight: 600; }
.status-open .salon-status-text { color: #3B82F6; }
.status-on   .salon-status-text { color: #10B981; }
.status-end  .salon-status-text { color: #94a3b8; }

.salon-name {
	display: block;
	font-size: 14px;
	font-weight: 600;
	color: #1e293b;
	margin-bottom: 6px;
	white-space: normal;
	word-break: break-all;
}

.salon-meta {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 4px;
	margin-bottom: 2px;
}

.salon-meta-text {
	font-size: 11px;
	color: #64748b;
}

/* ===== 问卷卡片 ===== */
.survey-login-card {
	cursor: pointer;
}

.survey-course-group {
	margin-bottom: 14px;
}

.survey-course-name {
	display: block;
	font-size: 13px;
	font-weight: 700;
	color: #64748b;
	margin: 2px 0 8px;
}

.survey-card {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 12px 14px;
	background: #f8fafc;
	border-radius: 12px;
	margin-bottom: 8px;
}

.survey-icon-wrap {
	width: 40px;
	height: 40px;
	background: #FEF2F2;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin-right: 12px;
}

.survey-info {
	flex: 1;
	min-width: 0;
}

.survey-name {
	display: block;
	font-size: 14px;
	font-weight: 600;
	color: #1e293b;
	margin-bottom: 2px;
}

.survey-deadline {
	font-size: 12px;
	color: #94a3b8;
}

.survey-card.submitted {
	opacity: 0.72;
}

.survey-action {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 2px;
	flex-shrink: 0;
}

.survey-action-text {
	font-size: 12px;
	font-weight: 600;
	color: #3B82F6;
}

.survey-action-text.submitted {
	color: #94a3b8;
}

.lecture-action-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 10px;
	margin-top: 14px;
	padding-left: 10px;
}

.lecture-detail-btn {
	flex: 1;
	height: 38px;
	border-radius: 10px;
	border: 1.5px solid #3B82F6;
	display: flex;
	align-items: center;
	justify-content: center;
}

.lecture-detail-btn-text {
	font-size: 14px;
	color: #3B82F6;
	font-weight: 600;
}

.lecture-signin-btn {
	flex: 1;
	height: 38px;
	border-radius: 10px;
	background: linear-gradient(135deg, #3B82F6 0%, #0EA5E9 100%);
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	gap: 5px;
}

.lecture-signin-btn-text {
	font-size: 14px;
	color: #fff;
	font-weight: 600;
}
</style>
