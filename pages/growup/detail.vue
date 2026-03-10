<template>
	<view class="page">
		<!-- 自定义悬浮导航 -->
		<view class="float-bar" :style="{ top: (statusBarHeight + 8) + 'px' }">
			<view class="float-btn" @click="goBack">
				<uni-icons type="left" size="20" color="#1e293b"></uni-icons>
			</view>
			<view v-if="detail" class="float-btn" @click="handleShare">
				<uni-icons type="redo" size="18" color="#1e293b"></uni-icons>
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
			<!-- 顶部蓝色装饰区（讲座封面） -->
			<view class="cover-banner">
				<view class="cover-decor-circle c1"></view>
				<view class="cover-decor-circle c2"></view>
				<view class="cover-tag">
					<text class="cover-tag-text">{{ typeLabel }}</text>
				</view>
				<text class="cover-title">{{ detail.name }}</text>
				<text class="cover-date">{{ detail.time || detail.startTime || detail.date }}</text>
			</view>

			<!-- 内容区 -->
			<scroll-view scroll-y class="content-scroll" :style="{ top: coverBannerHeight + 'px' }">
				<view class="content-wrap">

					<!-- 信息卡片 -->
					<view class="info-card">
						<!-- 时间 -->
						<view class="info-row" v-if="detail.time || detail.startTime || detail.date">
							<view class="info-icon-wrap blue-bg">
								<uni-icons type="calendar" size="15" color="#3B82F6"></uni-icons>
							</view>
							<view class="info-content">
								<text class="info-label">时间</text>
								<text class="info-value">{{ detail.time || detail.startTime || detail.date }}</text>
							</view>
						</view>

						<!-- 地点 -->
						<view class="info-row" v-if="detail.location" @click="openMap">
							<view class="info-icon-wrap green-bg">
								<uni-icons type="location" size="15" color="#10B981"></uni-icons>
							</view>
							<view class="info-content">
								<text class="info-label">地点</text>
								<text class="info-value">{{ detail.location }}</text>
								<view v-if="geoLat && geoLng" class="map-link-row">
									<text class="map-link-text">点击查看地图 →</text>
								</view>
							</view>
						</view>

						<!-- 讲师 / 主讲人 -->
						<view class="info-row" v-if="detail.speaker || detail.lecturer">
							<view class="info-icon-wrap purple-bg">
								<uni-icons type="person" size="15" color="#8B5CF6"></uni-icons>
							</view>
							<view class="info-content">
								<text class="info-label">主讲人</text>
								<text class="info-value">{{ detail.speaker || detail.lecturer }}</text>
							</view>
						</view>
					</view>

					<view class="divider"></view>

					<!-- 详情介绍 -->
					<view class="section-block" v-if="detail.detail || detail.description">
						<view class="section-block-header">
							<text class="block-title">{{ typeLabel }}详情</text>
						</view>
						<text class="block-text">{{ detail.detail || detail.description }}</text>
					</view>

					<!-- 注意事项（兼容旧数据） -->
					<view class="section-block" v-if="detail.notices && detail.notices.length">
						<view class="section-block-header">
							<text class="block-title">注意事项</text>
						</view>
						<view v-for="(notice, idx) in detail.notices" :key="idx" class="notice-item">
							<view class="notice-dot"></view>
							<text class="notice-text">{{ notice }}</text>
						</view>
					</view>

					<!-- 问卷题目 -->
					<view v-if="type === 'survey' && detail.questions && detail.questions.length">
						<view class="section-block" v-for="(q, qi) in detail.questions" :key="qi">
							<view class="section-block-header">
								<text class="block-title">{{ qi + 1 }}. {{ q.title }}</text>
							</view>
							<view v-if="q.type === 'radio' || q.type === 'checkbox'">
								<view
									v-for="(opt, oi) in q.options"
									:key="oi"
									class="survey-option"
									:class="{ 'survey-option-active': isSelected(qi, oi) }"
									@click="selectOption(qi, oi, q.type)"
								>
									<view class="option-indicator" :class="q.type === 'radio' ? 'radio-indicator' : 'check-indicator'">
										<view v-if="isSelected(qi, oi)" class="indicator-fill"></view>
									</view>
									<text class="option-text">{{ opt }}</text>
								</view>
							</view>
							<view v-else-if="q.type === 'text'">
								<textarea class="survey-textarea" v-model="answers[qi]" placeholder="请输入您的回答..." :show-confirm-bar="false"></textarea>
							</view>
						</view>
					</view>

					<!-- 底部占位 -->
					<view style="height: 110px;"></view>
				</view>
			</scroll-view>

			<!-- 底部操作栏 -->
			<view class="bottom-bar">
				<!-- 讲座/课程：签到 -->
				<view v-if="type === 'lecture' || type === 'course'"
					class="action-btn action-primary"
					:class="{ 'action-disabled': detail.signed }"
					@click="handleSignIn"
				>
					<uni-icons type="checkbox" size="18" color="#fff"></uni-icons>
					<text class="action-text">{{ detail.signed ? '已签到' : '立即签到' }}</text>
				</view>
				<!-- 沙龙：报名 -->
				<view v-else-if="type === 'salon'"
					class="action-btn action-primary"
					:class="{ 'action-disabled': detail.joined }"
					@click="handleJoin"
				>
					<uni-icons type="plusempty" size="18" color="#fff"></uni-icons>
					<text class="action-text">{{ detail.joined ? '已报名' : '立即报名' }}</text>
				</view>
				<!-- 问卷：提交 -->
				<view v-else-if="type === 'survey'"
					class="action-btn action-primary"
					:class="{ 'action-disabled': detail.answered || submitting }"
					@click="handleSubmitSurvey"
				>
					<uni-icons type="redo" size="18" color="#fff"></uni-icons>
					<text class="action-text">{{ detail.answered ? '已提交' : (submitting ? '提交中...' : '提交问卷') }}</text>
				</view>
			</view>
		</block>
	</view>
</template>

<script>
import { getLectures } from '@/api/system/lectures'
import { getCourse, getSalon, getSurvey, signInCourse, joinSalon } from '@/api/system/growup'
import request from '@/utils/request'

export default {
	data() {
		return {
			statusBarHeight: 0,
			coverBannerHeight: 200,
			type: 'lecture',
			id: '',
			loading: true,
			error: false,
			submitting: false,
			detail: null,
			answers: [],
			geoLat: null,
			geoLng: null
		}
	},
	computed: {
		typeLabel() {
			const map = { lecture: '讲座', course: '课程', salon: '活动', survey: '问卷' }
			return map[this.type] || '活动'
		}
	},
	onLoad(options) {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 0
		this.type = options.type || 'lecture'
		this.id = options.id || ''
		// 如果带 action=signin 参数，加载完后自动触发签到提示
		this._autoSignIn = options.action === 'signin'
		this.loadDetail()
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		async loadDetail() {
			this.loading = true
			this.error = false
			try {
				let res
				if (this.type === 'lecture') {
					res = await getLectures(this.id)
					// 解析 geo 字段 "lng,lat"
					const item = res.data || res
					if (item && item.geo) {
						const parts = String(item.geo).split(',')
						if (parts.length === 2) {
							this.geoLng = parseFloat(parts[0])
							this.geoLat = parseFloat(parts[1])
						}
					}
					this.detail = item
				} else if (this.type === 'course') {
					res = await getCourse(this.id)
					this.detail = res.data || res
				} else if (this.type === 'survey') {
					res = await getSurvey(this.id)
					this.detail = res.data || res
					if (this.detail && this.detail.questions) {
						this.answers = new Array(this.detail.questions.length).fill('')
					}
				} else {
					res = await getSalon(this.id)
					this.detail = res.data || res
				}
				// 自动弹签到
				if (this._autoSignIn && (this.type === 'lecture' || this.type === 'course')) {
					this.$nextTick(() => {
						uni.showModal({
							title: '确认签到',
							content: `确认为「${this.detail && this.detail.name}」签到？`,
							success: (r) => { if (r.confirm) this.handleSignIn() }
						})
					})
				}
			} catch (e) {
				this.error = true
			} finally {
				this.loading = false
			}
		},
		openMap() {
			if (!this.detail || !this.geoLat || !this.geoLng) return
			uni.openLocation({
				latitude: this.geoLat,
				longitude: this.geoLng,
				name: this.detail.location || '',
				address: this.detail.location || ''
			})
		},
		handleShare() {
			// #ifdef MP-WEIXIN
			uni.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
			// #endif
			// #ifndef MP-WEIXIN
			uni.showToast({ title: '请截图分享', icon: 'none' })
			// #endif
		},
		async handleSignIn() {
			if (!this.detail || this.detail.signed) return
			uni.showLoading({ title: '签到中...' })
			try {
				await signInCourse(this.id)
				this.detail = Object.assign({}, this.detail, { signed: true })
				uni.hideLoading()
				uni.showToast({ title: '签到成功', icon: 'success' })
			} catch (e) {
				uni.hideLoading()
				uni.showToast({ title: '签到失败，请重试', icon: 'none' })
			}
		},
		async handleJoin() {
			if (!this.detail || this.detail.joined) return
			uni.showLoading({ title: '报名中...' })
			try {
				await joinSalon(this.id)
				this.detail = Object.assign({}, this.detail, { joined: true })
				uni.hideLoading()
				uni.showToast({ title: '报名成功', icon: 'success' })
			} catch (e) {
				uni.hideLoading()
				uni.showToast({ title: '报名失败，请重试', icon: 'none' })
			}
		},
		isSelected(qi, oi) {
			const ans = this.answers[qi]
			if (Array.isArray(ans)) return ans.includes(oi)
			return ans === oi
		},
		selectOption(qi, oi, type) {
			if (type === 'radio') {
				this.$set(this.answers, qi, oi)
			} else {
				let arr = Array.isArray(this.answers[qi]) ? [...this.answers[qi]] : []
				const idx = arr.indexOf(oi)
				if (idx > -1) arr.splice(idx, 1)
				else arr.push(oi)
				this.$set(this.answers, qi, arr)
			}
		},
		async handleSubmitSurvey() {
			if (!this.detail || this.detail.answered || this.submitting) return
			if (this.detail.questions) {
				for (let i = 0; i < this.detail.questions.length; i++) {
					const q = this.detail.questions[i]
					const ans = this.answers[i]
					if (q.required && (ans === '' || ans === undefined || (Array.isArray(ans) && ans.length === 0))) {
						return uni.showToast({ title: `第${i + 1}题为必填项`, icon: 'none' })
					}
				}
			}
			this.submitting = true
			try {
				await request({ url: '/system/growup/survey/' + this.id + '/submit', method: 'post', data: { answers: this.answers } })
				this.detail = Object.assign({}, this.detail, { answered: true })
				uni.showToast({ title: '问卷提交成功', icon: 'success' })
			} catch (e) {
				uni.showToast({ title: '提交失败，请重试', icon: 'none' })
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

/* 悬浮按钮 */
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
	background: rgba(255,255,255,0.88);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

/* 加载 / 错误 */
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

/* 封面横幅 */
.cover-banner {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 200px;
	background: linear-gradient(135deg, #0EA5E9 0%, #38BDF8 60%, #7DD3FC 100%);
	z-index: 0;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	padding: 0 20px 20px;
	overflow: hidden;
}

.cover-decor-circle {
	position: absolute;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.08);
}

.c1 { width: 160px; height: 160px; top: -60px; right: -40px; }
.c2 { width: 100px; height: 100px; top: 20px; right: 60px; background: rgba(255,255,255,0.05); }

.cover-tag {
	display: inline-flex;
	background: rgba(255,255,255,0.22);
	border-radius: 12px;
	padding: 3px 10px;
	margin-bottom: 8px;
	align-self: flex-start;
}

.cover-tag-text {
	font-size: 12px;
	color: #fff;
	font-weight: 600;
	letter-spacing: 1px;
}

.cover-title {
	font-size: 20px;
	font-weight: 700;
	color: #fff;
	line-height: 1.4;
	text-shadow: 0 1px 8px rgba(0,0,0,0.15);
	margin-bottom: 4px;
}

.cover-date {
	font-size: 13px;
	color: rgba(255,255,255,0.85);
}

/* 内容滚动区 */
.content-scroll {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 10;
}

.content-wrap {
	background: #fff;
	border-radius: 24px 24px 0 0;
	padding: 22px 18px 0;
	min-height: 100vh;
}

/* 信息卡片 */
.info-card {
	background: #f8fafc;
	border-radius: 16px;
	padding: 16px;
	margin-bottom: 16px;
}

/* 地图链接行 */
.map-link-row {
	margin-top: 4px;
}

.map-link-text {
	font-size: 12px;
	color: #3B82F6;
}

/* 信息行 */
.info-row {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	margin-bottom: 14px;
}

.info-icon-wrap {
	width: 32px;
	height: 32px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin-right: 12px;
	margin-top: 2px;
}

.blue-bg   { background: #EFF6FF; }
.green-bg  { background: #ECFDF5; }
.purple-bg { background: #F5F3FF; }

.info-content {
	flex: 1;
}

.info-label {
	display: block;
	font-size: 12px;
	color: #94a3b8;
	margin-bottom: 2px;
}

.info-value {
	display: block;
	font-size: 14px;
	font-weight: 500;
	color: #1e293b;
	line-height: 1.5;
}

.info-tag {
	display: inline-flex;
	background: #EFF6FF;
	border-radius: 4px;
	padding: 1px 6px;
	margin-top: 4px;
}

.info-tag-text {
	font-size: 12px;
	color: #3B82F6;
}

.info-sub-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-top: 2px;
}

.info-sub-text {
	font-size: 12px;
	color: #64748b;
	flex: 1;
}

.map-link {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 2px;
}

.map-link-text {
	font-size: 12px;
	color: #3B82F6;
}

/* 分割线 */
.divider {
	height: 1px;
	background: #f1f5f9;
	margin: 4px 0 16px;
}

/* Section Block */
.section-block {
	margin-bottom: 20px;
}

.section-block-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10px;
}

.block-title {
	font-size: 16px;
	font-weight: 700;
	color: #1e293b;
	border-left: 4px solid #3B82F6;
	padding-left: 10px;
}

.block-text {
	font-size: 14px;
	color: #475569;
	line-height: 1.8;
}

/* 注意事项 */
.notice-item {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	margin-bottom: 8px;
}

.notice-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: #3B82F6;
	margin-top: 6px;
	margin-right: 10px;
	flex-shrink: 0;
}

.notice-text {
	font-size: 13px;
	color: #475569;
	line-height: 1.7;
	flex: 1;
}

/* 参与人员 */
.participant-count-badge {
	background: #EFF6FF;
	border-radius: 20px;
	padding: 2px 10px;
}

.participant-count-text {
	font-size: 12px;
	color: #3B82F6;
}

.participant-row {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.participant-avatar-wrap {
	position: relative;
}

.participant-avatar {
	width: 38px;
	height: 38px;
	border-radius: 50%;
	border: 2px solid #fff;
	background: #e2e8f0;
}

.participant-more {
	width: 38px;
	height: 38px;
	border-radius: 50%;
	background: #EFF6FF;
	border: 2px solid #fff;
	margin-left: -10px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.participant-more-text {
	font-size: 11px;
	color: #3B82F6;
	font-weight: 600;
}

/* 问卷 */
.survey-option {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 10px 14px;
	background: #f8fafc;
	border-radius: 10px;
	margin-bottom: 8px;
	border: 1.5px solid #e2e8f0;
}

.survey-option-active {
	border-color: #3B82F6;
	background: #EFF6FF;
}

.option-indicator {
	width: 18px;
	height: 18px;
	border: 2px solid #cbd5e1;
	margin-right: 10px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.radio-indicator { border-radius: 50%; }
.check-indicator { border-radius: 4px; }

.survey-option-active .option-indicator {
	border-color: #3B82F6;
}

.indicator-fill {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #3B82F6;
}

.check-indicator .indicator-fill {
	border-radius: 2px;
}

.option-text {
	font-size: 14px;
	color: #475569;
	flex: 1;
}

.survey-option-active .option-text {
	color: #3B82F6;
	font-weight: 500;
}

.survey-textarea {
	width: 100%;
	min-height: 80px;
	background: #f8fafc;
	border: 1.5px solid #e2e8f0;
	border-radius: 10px;
	padding: 10px 12px;
	font-size: 14px;
	color: #1e293b;
	box-sizing: border-box;
	line-height: 1.6;
}

/* 底部操作栏 */
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	padding: 12px 20px;
	padding-bottom: calc(12px + env(safe-area-inset-bottom));
	box-shadow: 0 -1px 0 #f1f5f9;
	z-index: 50;
}

.action-btn {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	height: 52px;
	border-radius: 14px;
	gap: 8px;
}

.action-primary {
	background: #1e293b;
}

.action-disabled {
	background: #e2e8f0;
}

.action-text {
	color: #fff;
	font-size: 16px;
	font-weight: 600;
}

.action-disabled .action-text {
	color: #94a3b8;
}
</style>
