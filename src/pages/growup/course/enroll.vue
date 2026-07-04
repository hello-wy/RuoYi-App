<template>
	<view class="page">
		<!-- 导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-back" @click="goBack">
				<uni-icons type="left" size="20" color="#1e293b"></uni-icons>
			</view>
			<text class="nav-title">课程报名</text>
			<view style="width: 44px;"></view>
		</view>

		<!-- 加载中 -->
		<view v-if="loading" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<block v-else-if="course">
			<scroll-view scroll-y class="scroll-content" :style="{ top: navHeight + 'px' }">
				<view class="content-wrap">

					<!-- 课程信息卡 -->
					<view class="course-card">
						<view class="course-card-info">
							<text class="course-card-name">{{ course.name }}</text>
							<text class="course-card-time">开课时间：{{ courseTimeText }}</text>
							<text class="course-card-addr" v-if="course.location">{{ course.location }}</text>
						</view>
					</view>

					<!-- 报名信息 -->
					<view class="form-section">
						<text class="section-title">报名信息</text>
						<view class="form-divider"></view>

						<view class="form-item">
							<text class="form-label">姓名：</text>
							<input
								class="form-input"
								v-model="form.name"
								placeholder="请输入姓名"
								placeholder-class="ph"
							/>
						</view>
						<view class="form-divider-light"></view>

						<view class="form-item">
							<text class="form-label">性别：</text>
							<view class="gender-row">
								<view
									class="gender-opt"
									:class="{ 'gender-active': form.gender === '0' }"
									@click="form.gender = '0'"
								>
									<text class="gender-text">男</text>
								</view>
								<view
									class="gender-opt"
									:class="{ 'gender-active': form.gender === '1' }"
									@click="form.gender = '1'"
								>
									<text class="gender-text">女</text>
								</view>
							</view>
						</view>
						<view class="form-divider-light"></view>

						<view class="form-item">
							<text class="form-label">手机号码：</text>
							<input
								class="form-input"
								v-model="form.phone"
								type="number"
								placeholder="请输入手机号"
								placeholder-class="ph"
								maxlength="11"
							/>
						</view>
						<view class="form-divider-light"></view>

						<view class="form-item">
							<text class="form-label">公司名称：</text>
							<input
								class="form-input"
								v-model="form.company"
								placeholder="请输入公司名称"
								placeholder-class="ph"
							/>
						</view>
					</view>

					<!-- 学籍信息 -->
					<view v-if="requiresEnrollment" class="form-section">
						<text class="section-title">学籍信息</text>
						<view class="form-divider"></view>

						<view class="enrollment-balance-row">
							<text class="enrollment-balance-label">当前课程余额：</text>
							<text class="enrollment-balance-value">{{ courseEnrollmentText }}</text>
						</view>
					</view>

					<!-- 住宿信息 -->
					<view class="form-section">
						<text class="section-title">住宿信息</text>
						<view class="form-divider"></view>

						<view class="accommodation-row">
							<text class="form-label">是否住宿：</text>
							<view class="radio-group">
								<view
									class="radio-item"
									v-for="opt in accommodationOpts"
									:key="opt.value"
									@click="form.accommodation = opt.value"
								>
									<view class="radio-circle" :class="{ 'radio-active': form.accommodation === opt.value }">
										<view v-if="form.accommodation === opt.value" class="radio-inner"></view>
									</view>
									<text class="radio-label">{{ opt.label }}</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 占位 -->
					<view style="height: 110px;"></view>
				</view>
			</scroll-view>

			<!-- 底部操作栏 -->
			<view class="bottom-bar">
				<view class="deposit-info">
					<text class="deposit-label">席位预定金</text>
					<text class="deposit-amount">¥{{ course.registrationFee || course.deposit || 100 }}</text>
					<text class="deposit-note">签到自动退还</text>
				</view>
				<view
					class="submit-btn"
					:class="{ 'submit-disabled': submitting }"
					@click="handleSubmit"
				>
					<text class="submit-text">{{ submitting ? '提交中...' : '立即报名' }}</text>
				</view>
			</view>
		</block>
	</view>
</template>

<script>
import { getCourse, getCourseEnrollment } from '@/api/wxmini/growup'
import { getWxUserProfileDetail } from '@/api/wxmini/profile'
import { createCoursePayOrder, queryCoursePayOrder } from '@/api/wxmini/coursePay'
import { requestWxPayment } from '@/utils/wxPayment'
import {
	buildCourseEnrollmentText,
	buildCourseTimeText,
	canSubmitCourseEnrollment,
	courseRequiresEnrollment
} from './enroll.helpers'

const PAID_STATUSES = [1, 2]
const POLL_MAX_ATTEMPTS = 6
const POLL_INTERVAL_MS = 800

export default {
	data() {
		return {
			statusBarHeight: 0,
			navHeight: 44,
			courseId: '',
			loading: true,
			submitting: false,
			course: null,
			courseEnrollment: null,
			form: {
				name: '',
				gender: '0',
				phone: '',
				company: '',
				accommodation: '',
			},
			accommodationOpts: [
				{ label: '不住宿', value: '0' },
				{ label: '需要住宿', value: '1' },
				{ label: '待定', value: '2' },
			],
		}
	},
	computed: {
		courseEnrollmentText() {
			return buildCourseEnrollmentText(this.courseEnrollment)
		},
		requiresEnrollment() {
			return courseRequiresEnrollment(this.course || {})
		},
		courseTimeText() {
			return buildCourseTimeText(this.course || {})
		}
	},
	onLoad(options) {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 0
		this.navHeight = (sys.statusBarHeight || 0) + 44
		this.courseId = options.id || ''
		this.loadData()
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		async loadData() {
			this.loading = true
			try {
				const [courseRes, profileRes] = await Promise.all([
					getCourse(this.courseId),
					getWxUserProfileDetail().catch(() => null),
				])
				this.course = courseRes.data || courseRes
				if (this.requiresEnrollment) {
					await this.loadCourseEnrollment()
				}
				if (profileRes) {
					const p = profileRes.data || profileRes
					this.form.name = p.realName || p.userName || p.displayName || ''
					this.form.phone = p.phone || ''
					this.form.gender = String(p.gender ?? '0')
					this.form.company = p.companyName || ''
				}
			} catch(e) {
				uni.showToast({ title: '加载失败', icon: 'none' })
			} finally {
				this.loading = false
			}
		},
		async loadCourseEnrollment() {
			if (!this.courseId) return
			const res = await getCourseEnrollment(this.courseId).catch(() => null)
			this.courseEnrollment = res ? (res.data || null) : null
		},
		validate() {
			if (!this.form.name.trim()) {
				uni.showToast({ title: '请填写姓名', icon: 'none' })
				return false
			}
			if (!this.form.phone || !/^1\d{10}$/.test(this.form.phone)) {
				uni.showToast({ title: '请填写正确的手机号', icon: 'none' })
				return false
			}
			const enrollmentResult = canSubmitCourseEnrollment({
				course: this.course,
				enrollment: this.courseEnrollment,
			})
			if (!enrollmentResult.ok) {
				uni.showToast({ title: enrollmentResult.message, icon: 'none' })
				return false
			}
			return true
		},
		async handleSubmit() {
			if (this.submitting) return
			if (!this.validate()) return
			this.submitting = true
			try {
				const data = {
					courseId: this.courseId,
					name: this.form.name,
					gender: this.form.gender,
					phone: this.form.phone,
					company: this.form.company,
					accommodation: this.form.accommodation,
					enrollmentId: this.requiresEnrollment && this.courseEnrollment ? this.courseEnrollment.id : undefined,
				}
				const result = await createCoursePayOrder(data)
				await requestWxPayment(result.payParam)
				await this.confirmPaidAndNavigate(result.orderNo)
			} catch(e) {
				const msg = (e && (e.msg || e.errMsg || e.message)) || '报名支付未完成'
				uni.showModal({ title: '报名未完成', content: msg, showCancel: false })
			} finally {
				this.submitting = false
			}
		},
		async confirmPaidAndNavigate(orderNo) {
			for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
				const order = await queryCoursePayOrder(orderNo)
				if (PAID_STATUSES.includes(Number(order.status))) {
					uni.showToast({ title: '报名成功', icon: 'success' })
					setTimeout(() => {
						uni.redirectTo({ url: '/pages/mine/order-center/index?type=course' })
					}, 600)
					return
				}
				await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
			}
			uni.showModal({
				title: '支付结果确认中',
				content: '支付结果尚未确认，请稍后在订单中心查看课程订单。',
				showCancel: false,
				success: () => uni.redirectTo({ url: '/pages/mine/order-center/index?type=course' })
			})
		}
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

/* 导航 */
.nav-bar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	background: #fff;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 0 4px;
	z-index: 100;
	box-shadow: 0 1px 0 #f1f5f9;
}

.nav-back {
	width: 44px;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-title {
	font-size: 16px;
	font-weight: 700;
	color: #1e293b;
}

/* 加载 */
.loading-wrap {
	display: flex;
	align-items: center;
	justify-content: center;
	padding-top: 200px;
}

/* 滚动 */
.scroll-content {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
}

.content-wrap {
	padding: 12px 14px 0;
}

/* 课程卡片 */
.course-card {
	background: #fff;
	border-radius: 12px;
	padding: 12px;
	margin-bottom: 12px;
	display: flex;
	flex-direction: row;
	gap: 12px;
	box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.course-card-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 4px;
}

.course-card-name {
	font-size: 14px;
	font-weight: 600;
	color: #1e293b;
	line-height: 1.4;
}

.course-card-time {
	font-size: 12px;
	color: #64748b;
}

.course-card-addr {
	font-size: 12px;
	color: #94a3b8;
	line-height: 1.4;
}

/* 表单区 */
.form-section {
	background: #fff;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 12px;
	box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.section-title {
	font-size: 15px;
	font-weight: 700;
	color: #1e293b;
	display: block;
	margin-bottom: 10px;
}

.form-divider {
	height: 1px;
	background: #f1f5f9;
	margin-bottom: 12px;
}

.form-divider-light {
	height: 1px;
	background: #f8fafc;
	margin: 4px 0;
}

.form-item {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 10px 0;
	min-height: 44px;
}

.form-label {
	font-size: 14px;
	color: #1e293b;
	width: 80px;
	flex-shrink: 0;
}

.form-input {
	flex: 1;
	font-size: 14px;
	color: #1e293b;
	text-align: right;
}

.ph {
	color: #cbd5e1;
}

/* 性别选择 */
.gender-row {
	flex: 1;
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	gap: 8px;
}

.gender-opt {
	padding: 4px 14px;
	border-radius: 16px;
	border: 1px solid #e2e8f0;
	background: #f8fafc;
}

.gender-opt.gender-active {
	background: #EFF6FF;
	border-color: #3B82F6;
}

.gender-text {
	font-size: 13px;
	color: #475569;
}

.gender-opt.gender-active .gender-text {
	color: #3B82F6;
}

.enrollment-balance-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 10px 0;
}

.enrollment-balance-label {
	font-size: 14px;
	color: #1e293b;
	flex: 1;
}

.enrollment-balance-value {
	font-size: 14px;
	color: #3B82F6;
	font-weight: 600;
}

/* 住宿 */
.accommodation-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 6px 0;
}

.radio-group {
	flex: 1;
	display: flex;
	flex-direction: row;
	gap: 16px;
}

.radio-item {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 6px;
}

.radio-circle {
	width: 18px;
	height: 18px;
	border-radius: 50%;
	border: 1.5px solid #cbd5e1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.radio-circle.radio-active {
	border-color: #3B82F6;
}

.radio-inner {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #3B82F6;
}

.radio-label {
	font-size: 13px;
	color: #475569;
}

/* 底部操作栏 */
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	padding: 12px 16px;
	padding-bottom: calc(12px + env(safe-area-inset-bottom));
	box-shadow: 0 -1px 0 #f1f5f9;
	z-index: 50;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 12px;
}

.deposit-info {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.deposit-label {
	font-size: 11px;
	color: #94a3b8;
}

.deposit-amount {
	font-size: 18px;
	font-weight: 700;
	color: #ef4444;
	line-height: 1.2;
}

.deposit-note {
	font-size: 10px;
	color: #94a3b8;
}

.submit-btn {
	flex: 1;
	height: 50px;
	border-radius: 25px;
	background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.submit-btn.submit-disabled {
	background: #e2e8f0;
}

.submit-text {
	font-size: 16px;
	font-weight: 700;
	color: #fff;
}

.submit-btn.submit-disabled .submit-text {
	color: #94a3b8;
}
</style>
