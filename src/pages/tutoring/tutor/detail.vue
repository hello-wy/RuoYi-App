<template>
	<view class="page">
		<view v-if="loading" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<view v-else-if="error" class="error-wrap">
			<text class="error-text">加载失败，请重试</text>
		</view>

		<scroll-view v-else-if="detail" scroll-y class="scroll-body">
			<view class="hero-section">
				<view class="hero-bg circle-one"></view>
				<view class="hero-bg circle-two"></view>

				<view class="avatar-wrap">
					<image class="avatar" :src="avatarSrc" mode="aspectFill"></image>
					<view v-if="isCertified" class="avatar-badge">
						<uni-icons type="checkmarkempty" size="14" color="#FFFFFF"></uni-icons>
					</view>
				</view>

				<text class="hero-name">{{ displayName }}</text>
				<text class="hero-subtitle">{{ subtitleText }}</text>

				<view class="status-row">
					<view v-if="isCertified" class="status-chip">
						<uni-icons type="auth-filled" size="14" color="#16A34A"></uni-icons>
						<text class="status-chip-text">身份已认证</text>
					</view>
					<view class="status-chip">
						<uni-icons type="staff-filled" size="14" color="#16A34A"></uni-icons>
						<text class="status-chip-text">{{ identityText }}</text>
					</view>
				</view>
			</view>

			<view class="card-section">
				<view class="info-card">
					<view class="card-title-row">
						<uni-icons type="calendar-filled" size="20" color="#2563EB"></uni-icons>
						<text class="card-title">概览</text>
					</view>
					<view class="overview-grid">
						<view class="overview-item">
							<view class="overview-icon blue">
								<uni-icons type="location-filled" size="20" color="#2563EB"></uni-icons>
							</view>
							<view class="overview-content">
								<text class="overview-label">城市</text>
								<text class="overview-value">{{ cityText }}</text>
							</view>
						</view>
						<view class="overview-item">
							<view class="overview-icon blue">
								<uni-icons type="person-filled" size="20" color="#2563EB"></uni-icons>
							</view>
							<view class="overview-content">
								<text class="overview-label">身份</text>
								<text class="overview-value">{{ identityText }}</text>
							</view>
						</view>
						<view class="overview-item">
							<view class="overview-icon blue">
								<uni-icons type="medal-filled" size="20" color="#2563EB"></uni-icons>
							</view>
							<view class="overview-content">
								<text class="overview-label">学历</text>
								<text class="overview-value">{{ degreeText }}</text>
							</view>
						</view>
						<view class="overview-item">
							<view class="overview-icon blue">
								<uni-icons type="paperplane-filled" size="20" color="#2563EB"></uni-icons>
							</view>
							<view class="overview-content">
								<text class="overview-label">授课方式</text>
								<text class="overview-value">{{ methodText }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="info-card">
					<view class="card-title-row">
						<uni-icons type="star-filled" size="20" color="#2563EB"></uni-icons>
						<text class="card-title">擅长与授课区域</text>
					</view>
					<view class="plain-info-list">
						<view class="plain-info-row">
							<text class="plain-info-label">擅长</text>
							<text class="plain-info-value">{{ subjectText }}</text>
						</view>
						<view class="plain-info-row">
							<text class="plain-info-label">授课区域</text>
							<text class="plain-info-value">{{ areaText }}</text>
						</view>
					</view>
				</view>

				<view class="info-card">
					<view class="card-title-row">
						<uni-icons type="star-filled" size="20" color="#16A34A"></uni-icons>
						<text class="card-title">教学亮点</text>
					</view>
					<view v-if="experienceList.length" class="bullet-list">
						<view v-for="(item, index) in experienceList" :key="index" class="bullet-item">
							<view class="bullet-dot">
								<uni-icons type="checkmarkempty" size="10" color="#FFFFFF"></uni-icons>
							</view>
							<text class="bullet-text">{{ item }}</text>
						</view>
					</view>
					<text v-else class="empty-text">暂未填写教学亮点</text>
				</view>

				<view class="info-card">
					<view class="card-title-row">
						<uni-icons type="person-filled" size="20" color="#F59E0B"></uni-icons>
						<text class="card-title">自我介绍</text>
					</view>
					<text class="description-text">{{ selfJudgeText }}</text>
				</view>

				<view class="info-card">
					<view class="card-title-row">
						<uni-icons type="medal-filled" size="20" color="#2563EB"></uni-icons>
						<text class="card-title">证书</text>
					</view>
					<view class="certificate-row">
						<view v-for="(item, index) in certificateItems" :key="index" class="certificate-chip">
							<text class="certificate-chip-text">{{ item }}</text>
						</view>
						<view v-if="certificateItems.length === 0" class="certificate-chip">
							<text class="certificate-chip-text">暂未填写</text>
						</view>
					</view>
				</view>
			</view>

			<view :style="{ height: `${bottomPlaceholderHeight}rpx` }"></view>
		</scroll-view>

		<view v-if="detail" class="bottom-bar">
			<view v-if="auditMode" class="audit-action-row">
				<button
					v-for="action in bottomActions"
					:key="action.key"
					class="audit-btn"
					:class="action.key === 'reject' ? 'reject-btn' : 'pass-btn'"
					:disabled="reviewing"
					@click="submitReview(action.status)"
				>
					{{ action.text }}
				</button>
			</view>
			<button v-else class="contact-btn" open-type="contact">
				<uni-icons type="chatboxes-filled" size="18" color="#FFFFFF"></uni-icons>
				<text class="contact-btn-text">立即联系</text>
			</button>
		</view>
	</view>
</template>

<script>
import config from '@/config'
import { getTutors as getTutorDetail } from '@/api/wxmini/tutoring'
import { reviewTutors } from '@/api/system/tutors'
import { useLocationStore } from '@/store'
import {
	buildTutorDetailBottomActions,
	getReviewResultToast,
	isTutorAuditMode
} from '@/pages/mine/admin/tutor-review.helpers'

export default {
	dicts: ['sys_degree', 'sys_subject', 'sys_methods'],
	data() {
		return {
			tutorId: '',
			auditMode: false,
			reviewing: false,
			detail: null,
			loading: false,
			error: false
		}
	},
	onLoad(options) {
		this.tutorId = options.id || ''
		this.auditMode = isTutorAuditMode(options)
		this.loadDetail()
	},
	computed: {
		avatarSrc() {
			const userId = this.detail?.userId || this.detail?.user_id || ''
			return userId ? `${config.baseUrl}/profile/avatar/${userId}.png` : '/static/images/profile.jpg'
		},
		isCertified() {
			return String(this.detail?.status) === '1'
		},
		displayName() {
			return this.detail?.realName || '教员'
		},
		subtitleText() {
			const school = this.detail?.school || ''
			const major = this.detail?.major || ''
			if (school && major) return `${school}  ${major}`
			return school || major || '暂未完善院校与专业信息'
		},
		districtDictOptions() {
			return (useLocationStore().districts || []).map(d => ({
				value: d.value,
				label: d.text,
				elTagType: '',
				elTagClass: ''
			}))
		},
		subjectLabels() {
			return this.mapLabels(this.detail?.subjects, this.dict.type.sys_subject)
		},
		areaLabels() {
			return this.mapLabels(this.detail?.areas, this.districtDictOptions)
		},
		methodLabels() {
			return this.mapLabels(this.detail?.methods, this.dict.type.sys_methods, false)
		},
		degreeText() {
			const found = (this.dict.type.sys_degree || []).find(item => String(item.value) === String(this.detail?.degree))
			return found ? found.label : '暂未填写'
		},
		cityText() {
			return this.detail?.city || '暂未填写'
		},
		identityText() {
			const mapping = {
				0: '大学生教员',
				1: '在职教师',
				2: '其他'
			}
			return mapping[Number(this.detail?.identity)] || '大学生教员'
		},
		subjectText() {
			return this.subjectLabels.join(' / ') || '暂未填写'
		},
		methodText() {
			return this.methodLabels.join(' / ') || '暂未填写'
		},
		areaText() {
			return this.areaLabels.join(' / ') || '暂未填写'
		},
		selfJudgeText() {
			return this.detail?.selfJudge || '暂未填写自我介绍'
		},
		certificateItems() {
			const source = this.detail?.certificateList || ''
			if (!source) return []
			return source.split(/[，,、\n]/).map(item => item.trim()).filter(Boolean)
		},
		experienceList() {
			const source = this.detail?.experience || ''
			if (!source) return []
			return source.split(/[\n；;。]/).map(item => item.trim()).filter(Boolean).slice(0, 5)
		},
		bottomPlaceholderHeight() {
			return this.auditMode ? 220 : 160
		},
		bottomActions() {
			return buildTutorDetailBottomActions(this.auditMode)
		}
	},
	methods: {
		async loadDetail() {
			if (!this.tutorId) return
			this.loading = true
			this.error = false
			try {
				const res = await getTutorDetail(this.tutorId)
				this.detail = res.data || res
			} catch (e) {
				this.error = true
				console.error('加载教员详情失败', e)
			} finally {
				this.loading = false
			}
		},
		mapLabels(val, options, split = true) {
			if (val === null || val === undefined || val === '') return []
			const values = split ? String(val).split(',') : [String(val)]
			return values.map(v => String(v).trim()).filter(Boolean).map(v => {
				const found = (options || []).find(item => String(item.value) === v)
				return found ? found.label : v
			})
		},
		async submitReview(status) {
			if (this.reviewing || !this.tutorId) return
			this.reviewing = true
			try {
				await reviewTutors({ id: this.tutorId, status })
				this.$modal.showToast(getReviewResultToast(status))
				setTimeout(() => {
					uni.navigateBack({ delta: 1 })
				}, 400)
			} catch (e) {
				console.error('审核教员失败', e)
			} finally {
				this.reviewing = false
			}
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background: #f3f7ff;
}

.scroll-body {
	height: 100vh;
}

.hero-section {
	position: relative;
	overflow: hidden;
	padding: 40rpx 32rpx 28rpx;
	background: linear-gradient(180deg, #ffffff 0%, #edf4ff 100%);
	display: flex;
	flex-direction: column;
	align-items: center;
}

.hero-bg {
	position: absolute;
	border-radius: 50%;
	background: rgba(59, 130, 246, 0.08);
}

.circle-one {
	width: 260rpx;
	height: 260rpx;
	right: 60rpx;
	top: 20rpx;
}

.circle-two {
	width: 180rpx;
	height: 180rpx;
	right: -20rpx;
	top: 80rpx;
}

.avatar-wrap {
	position: relative;
	width: 176rpx;
	height: 176rpx;
	margin-bottom: 24rpx;
	z-index: 2;
}

.avatar {
	width: 176rpx;
	height: 176rpx;
	border-radius: 50%;
	background: #e5e7eb;
	border: 6rpx solid #ffffff;
}

.avatar-badge {
	position: absolute;
	right: 6rpx;
	bottom: 8rpx;
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	background: #3b82f6;
	border: 4rpx solid #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
}

.hero-name {
	font-size: 44rpx;
	font-weight: 700;
	color: #111827;
	line-height: 1.2;
	z-index: 2;
}

.hero-subtitle {
	margin-top: 12rpx;
	font-size: 24rpx;
	color: #6b7280;
	line-height: 1.5;
	z-index: 2;
}

.status-row {
	margin-top: 20rpx;
	display: flex;
	gap: 16rpx;
	flex-wrap: wrap;
	justify-content: center;
	z-index: 2;
}

.status-chip {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.status-chip-text {
	font-size: 24rpx;
	color: #16a34a;
}

.card-section {
	padding: 24rpx;
}

.info-card {
	background: #fff;
	border-radius: 28rpx;
	padding: 28rpx 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 10rpx 24rpx rgba(37, 99, 235, 0.06);
}

.card-title-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 24rpx;
}

.card-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #111827;
}

.overview-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 24rpx;
}

.overview-item {
	display: flex;
	gap: 16rpx;
	padding: 20rpx;
	border: 2rpx solid #eef2ff;
	border-radius: 20rpx;
}

.overview-icon {
	width: 56rpx;
	height: 56rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #eff6ff;
	flex-shrink: 0;
}

.overview-content {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.overview-label {
	font-size: 24rpx;
	color: #94a3b8;
}

.overview-value {
	font-size: 28rpx;
	font-weight: 600;
	color: #1e293b;
	line-height: 1.5;
}

.plain-info-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.plain-info-row {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.plain-info-label {
	font-size: 24rpx;
	color: #94a3b8;
}

.plain-info-value,
.description-text,
.bullet-text,
.empty-text {
	font-size: 28rpx;
	color: #334155;
	line-height: 1.7;
}

.bullet-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.bullet-item {
	display: flex;
	align-items: flex-start;
	gap: 16rpx;
}

.bullet-dot {
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	background: #16a34a;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 6rpx;
	flex-shrink: 0;
}

.certificate-row {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.certificate-chip {
	padding: 14rpx 24rpx;
	border-radius: 999rpx;
	background: #eff6ff;
}

.certificate-chip-text {
	font-size: 24rpx;
	color: #2563eb;
}

.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 20rpx 24rpx 28rpx;
	background: linear-gradient(180deg, rgba(243,247,255,0) 0%, #f3f7ff 24%, #f3f7ff 100%);
}

.audit-action-row {
	display: flex;
	gap: 20rpx;
}

.audit-btn {
	flex: 1;
	height: 92rpx;
	border: none;
	border-radius: 999rpx;
	font-size: 30rpx;
	font-weight: 600;
}

.reject-btn {
	background: #fee2e2;
	color: #dc2626;
}

.pass-btn {
	background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
	color: #ffffff;
}

.contact-btn {
	height: 96rpx;
	border: none;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	box-shadow: 0 14rpx 32rpx rgba(37, 99, 235, 0.24);
}

.contact-btn-text {
	font-size: 30rpx;
	font-weight: 600;
	color: #ffffff;
}

.loading-wrap,
.error-wrap {
	display: flex;
	align-items: center;
	justify-content: center;
	padding-top: 240rpx;
}

.error-text {
	font-size: 28rpx;
	color: #64748b;
}
</style>
