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
						<image
							:src="course.coverUrl || '/static/images/default_cover.png'"
							class="course-thumb"
							mode="aspectFill"
						></image>
						<view class="course-card-info">
							<text class="course-card-name">{{ course.name }}</text>
							<text class="course-card-time">开课时间：{{ formatMeta(course.startTime) }}-{{ formatMeta(course.endTime) }}</text>
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
					<view class="form-section">
						<text class="section-title">学籍信息</text>
						<view class="form-divider"></view>

						<view class="enrollment-tip">
							<text class="tip-desc">请按照您的需求，选择需要消耗学籍的类型。</text>
							<view class="tip-item">
								<text class="tip-bold">复训学籍：</text>
								<text class="tip-text">在复训的有效时长内可重复报名该课程系列下的课程，且不需要再扣学籍；</text>
							</view>
							<view class="tip-item">
								<text class="tip-bold">非复训学籍：</text>
								<text class="tip-text">下次报名课程仍然需要扣学籍</text>
							</view>
						</view>

						<view class="enrollment-select-row" @click="selectEnrollment">
							<text class="enrollment-select-label">选择学籍复训资格：</text>
							<text class="enrollment-select-value" v-if="selectedEnrollment">{{ selectedEnrollment.typeName || selectedEnrollment.name }}</text>
							<text class="enrollment-select-placeholder" v-else>请选择</text>
							<uni-icons type="right" size="16" color="#94a3b8"></uni-icons>
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
				<view class="deposit-info" v-if="course.deposit">
					<text class="deposit-label">席位预定金</text>
					<text class="deposit-amount">¥{{ course.deposit }}</text>
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
import { getCourse, enrollCourse } from '@/api/system/growup'
import { getUserProfile } from '@/api/system/user'
import { getMyEnrollment } from '@/api/system/enrollment'

export default {
	data() {
		return {
			statusBarHeight: 0,
			navHeight: 44,
			courseId: '',
			loading: true,
			submitting: false,
			course: null,
			myEnrollments: [],
			selectedEnrollment: null,
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
		formatMeta(dateStr) {
			if (!dateStr) return ''
			return String(dateStr).replace(/^(\d{4})-(\d{2})-(\d{2}).*/, '$1.$2.$3')
		},
		async loadData() {
			this.loading = true
			try {
				const [courseRes, profileRes, enrollRes] = await Promise.all([
					getCourse(this.courseId),
					getUserProfile().catch(() => null),
					getMyEnrollment().catch(() => null),
				])
				this.course = courseRes.data || courseRes
				if (profileRes) {
					const p = profileRes.data || profileRes
					this.form.name = p.nickName || p.name || ''
					this.form.phone = p.phonenumber || p.phone || ''
					this.form.gender = p.sex || '0'
				}
				if (enrollRes) {
					const e = enrollRes.data || enrollRes
					this.myEnrollments = Array.isArray(e) ? e : (e.list || [])
				}
			} catch(e) {
				uni.showToast({ title: '加载失败', icon: 'none' })
			} finally {
				this.loading = false
			}
		},
		selectEnrollment() {
			if (!this.myEnrollments.length) {
				return uni.showToast({ title: '暂无可用学籍', icon: 'none' })
			}
			const items = this.myEnrollments.map(e => e.typeName || e.name || `学籍${e.id}`)
			uni.showActionSheet({
				itemList: items,
				success: (res) => {
					this.selectedEnrollment = this.myEnrollments[res.tapIndex]
				}
			})
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
					enrollmentId: this.selectedEnrollment ? this.selectedEnrollment.id : undefined,
				}
				const res = await enrollCourse(this.courseId, data)
				const result = res.data || res
				uni.showToast({ title: '报名成功', icon: 'success' })
				// 跳转订单支付页
				setTimeout(() => {
					const orderId = result.orderId || result.id
					if (orderId) {
						uni.navigateTo({ url: `/pages/growup/course/pay?orderId=${orderId}&courseId=${this.courseId}` })
					} else {
						uni.navigateBack({ delta: 2 })
					}
				}, 1000)
			} catch(e) {
				const msg = (e && e.msg) || '报名失败，请重试'
				uni.showToast({ title: msg, icon: 'none' })
			} finally {
				this.submitting = false
			}
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

.course-thumb {
	width: 72px;
	height: 72px;
	border-radius: 8px;
	background: #e2e8f0;
	flex-shrink: 0;
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

/* 学籍选择提示 */
.enrollment-tip {
	background: #f8fafc;
	border-radius: 8px;
	padding: 10px 12px;
	margin-bottom: 12px;
	gap: 4px;
	display: flex;
	flex-direction: column;
}

.tip-desc {
	font-size: 12px;
	color: #64748b;
	margin-bottom: 6px;
}

.tip-item {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
}

.tip-bold {
	font-size: 12px;
	font-weight: 600;
	color: #475569;
}

.tip-text {
	font-size: 12px;
	color: #64748b;
	flex: 1;
	line-height: 1.6;
}

.enrollment-select-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 10px 0;
	border-top: 1px solid #f1f5f9;
}

.enrollment-select-label {
	font-size: 14px;
	color: #1e293b;
	flex: 1;
}

.enrollment-select-value {
	font-size: 14px;
	color: #3B82F6;
	margin-right: 4px;
}

.enrollment-select-placeholder {
	font-size: 14px;
	color: #cbd5e1;
	margin-right: 4px;
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
