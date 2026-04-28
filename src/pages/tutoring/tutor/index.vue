<template>
	<view class="page">
		<view v-if="loading" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<view v-else-if="!isLoggedIn" class="empty-wrap">
			<uni-icons type="person" size="64" color="#CBD5E1"></uni-icons>
			<text class="empty-title">请先登录</text>
			<text class="empty-sub">登录后查看您的教员主页</text>
			<view class="action-btn" @click="goLogin">
				<text class="action-btn-text">立即登录</text>
			</view>
		</view>

		<view v-else-if="!profile" class="empty-wrap">
			<uni-icons type="compose" size="64" color="#CBD5E1"></uni-icons>
			<text class="empty-title">您还没有教员档案</text>
			<text class="empty-sub">完善信息后开始接单，匹配优质家庭</text>
			<view class="action-btn" @click="goApply">
				<text class="action-btn-text">立即申请做家教</text>
			</view>
		</view>

		<scroll-view v-else scroll-y class="scroll-body">
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

			<view class="status-card status-card-compact" :class="statusCardClass">
				<view class="status-icon-wrap" :class="statusIconClass">
					<uni-icons :type="statusIcon" size="20" :color="statusIconColor"></uni-icons>
				</view>
				<view class="status-info">
					<text class="status-title">{{ statusTitle }}</text>
					<text class="status-desc">{{ statusDesc }}</text>
				</view>
			</view>

			<view class="edit-action-wrap">
				<button class="edit-btn" @click="goEdit">编辑资料</button>
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
					<view v-if="certificatePreviewUrls.length" class="cert-preview" @click="previewCertificate">
						<image :src="certificatePreviewUrls[0]" class="cert-img" mode="aspectFit"></image>
						<text class="cert-hint">点击查看证书图片</text>
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

			<view class="bottom-placeholder"></view>
		</scroll-view>

		<LoginPopup :auto-open="shouldAutoOpenLogin" @close="shouldAutoOpenLogin = false" />
	</view>
</template>

<script>
import config from '@/config'
import { useUserStore, useLocationStore } from '@/store'
import { getMyTutor } from '@/api/wxmini/tutoring'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'
import {
	buildTutorCertificatePreviewUrls,
	buildTutorSubtitle,
	formatTutorIdentity,
	formatTutorListText,
	getTutorCertificateItems,
	getTutorDisplayName,
	getTutorExperienceList,
	getTutorValueByDict,
	mapTutorLabels
} from './index.helpers'

export default {
	components: { LoginPopup },
	dicts: ['sys_degree', 'sys_subject', 'sys_methods'],
	data() {
		return {
			loading: false,
			profile: null,
			shouldAutoOpenLogin: false
		}
	},
	computed: {
		isLoggedIn() {
			return !!useUserStore().token
		},
		districtOptions() {
			return useLocationStore().districts || []
		},
		avatarSrc() {
			return useUserStore().avatar || this.profile?.avatar || '/static/images/profile.png'
		},
		isCertified() {
			return String(this.profile?.status) === '1'
		},
		displayName() {
			return getTutorDisplayName(this.profile)
		},
		subtitleText() {
			return buildTutorSubtitle(this.profile)
		},
		districtDictOptions() {
			return (this.districtOptions || []).map(item => ({
				value: item.value,
				label: item.text,
				text: item.text
			}))
		},
		subjectList() {
			return mapTutorLabels(this.profile?.subjects, this.dict.type.sys_subject)
		},
		areaList() {
			return mapTutorLabels(this.profile?.areas, this.districtDictOptions)
		},
		methodLabels() {
			return mapTutorLabels(this.profile?.methods, this.dict.type.sys_methods, false)
		},
		degreeText() {
			return getTutorValueByDict(this.profile?.degree, this.dict.type.sys_degree || [], '暂未填写')
		},
		cityText() {
			return this.profile?.city || '暂未填写'
		},
		identityText() {
			return formatTutorIdentity(this.profile?.identity)
		},
		subjectText() {
			return formatTutorListText(this.subjectList, '暂未填写')
		},
		methodText() {
			return formatTutorListText(this.methodLabels, '暂未填写')
		},
		areaText() {
			return formatTutorListText(this.areaList, '暂未填写')
		},
		selfJudgeText() {
			return this.profile?.selfJudge || '暂未填写自我介绍'
		},
		certificateItems() {
			return getTutorCertificateItems(this.profile?.certificateList)
		},
		certificatePreviewUrls() {
			return buildTutorCertificatePreviewUrls(this.profile?.certificates, config.baseUrl)
		},
		experienceList() {
			return getTutorExperienceList(this.profile?.experience)
		},
		statusCardClass() {
			const s = this.profile?.status
			if (s === '1' || s === 1) return 'status-card-green'
			if (s === '2' || s === 2) return 'status-card-red'
			return 'status-card-yellow'
		},
		statusIconClass() {
			const s = this.profile?.status
			if (s === '1' || s === 1) return 'icon-green'
			if (s === '2' || s === 2) return 'icon-red'
			return 'icon-yellow'
		},
		statusIcon() {
			const s = this.profile?.status
			if (s === '1' || s === 1) return 'checkmarkempty'
			if (s === '2' || s === 2) return 'closeempty'
			return 'spinner-cycle'
		},
		statusIconColor() {
			const s = this.profile?.status
			if (s === '1' || s === 1) return '#10B981'
			if (s === '2' || s === 2) return '#EF4444'
			return '#F59E0B'
		},
		statusTitle() {
			const s = this.profile?.status
			if (s === '1' || s === 1) return '审核已通过，您可以开始接单'
			if (s === '2' || s === 2) return '审核未通过，请修改后重新提交'
			return '资料已提交，等待平台审核（1-3 个工作日）'
		},
		statusDesc() {
			const s = this.profile?.status
			if (s === '1' || s === 1) return '家长可以查看并联系您，祝您接单顺利！'
			if (s === '2' || s === 2) return '可点击“编辑资料”补充完善后重新提交。'
			return '审核通过后将通知您，请保持关注。'
		}
	},
	onLoad() {
		this.loadProfile()
	},
	onShow() {
		if (this.isLoggedIn) {
			this.loadProfile()
		}
	},
	methods: {
		async loadProfile() {
			if (!this.isLoggedIn) return
			this.loading = true
			try {
				const res = await getMyTutor()
				this.profile = res.data || null
			} catch (e) {
				this.profile = null
			} finally {
				this.loading = false
			}
		},
		goLogin() {
			this.shouldAutoOpenLogin = true
		},
		goApply() {
			uni.navigateTo({ url: '/pages/tutoring/tutor/apply' })
		},
		goEdit() {
			uni.navigateTo({ url: '/pages/tutoring/tutor/apply?mode=edit' })
		},
		previewCertificate() {
			if (!this.certificatePreviewUrls.length) return
			uni.previewImage({
				urls: this.certificatePreviewUrls,
				current: this.certificatePreviewUrls[0]
			})
		}
	}
}
</script>

<style lang="scss" scoped>
page {
	background: #f4f6fb;
}

.page {
	min-height: 100vh;
	background: #f4f6fb;
}

.loading-wrap,
.empty-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 40rpx;
	min-height: 60vh;
}

.empty-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #1e293b;
	margin-top: 32rpx;
}

.empty-sub {
	font-size: 26rpx;
	color: #94a3b8;
	margin-top: 12rpx;
	text-align: center;
	line-height: 1.6;
}

.action-btn {
	margin-top: 40rpx;
	background: linear-gradient(135deg, #2563EB, #3B82F6);
	border-radius: 999rpx;
	padding: 24rpx 72rpx;
}

.action-btn-text {
	color: #fff;
	font-size: 30rpx;
	font-weight: 700;
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
	width: 132rpx;
	height: 132rpx;
	margin-bottom: 20rpx;
	z-index: 2;
}

.avatar {
	width: 132rpx;
	height: 132rpx;
	border-radius: 50%;
	background: #e5e7eb;
	border: 6rpx solid #ffffff;
}

.avatar-badge {
	position: absolute;
	right: 2rpx;
	bottom: 4rpx;
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

.status-card,
.info-card {
	background: #fff;
	border-radius: 28rpx;
	box-shadow: 0 10rpx 24rpx rgba(37, 99, 235, 0.06);
}

.status-card {
	margin: 24rpx 24rpx 16rpx;
	padding: 22rpx 24rpx;
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.status-card-compact .status-title {
	font-size: 28rpx;
}

.status-card-compact .status-desc {
	font-size: 22rpx;
	line-height: 1.5;
}

.status-icon-wrap {
	width: 72rpx;
	height: 72rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.status-info {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.status-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #0f172a;
}

.status-desc {
	font-size: 24rpx;
	color: #64748b;
}

.status-card-green {
	background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
}

.status-card-yellow {
	background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);
}

.status-card-red {
	background: linear-gradient(180deg, #fef2f2 0%, #ffffff 100%);
}

.icon-green {
	background: #dcfce7;
}

.icon-yellow {
	background: #fef3c7;
}

.icon-red {
	background: #fee2e2;
}

.edit-action-wrap {
	padding: 0 24rpx 8rpx;
}

.edit-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	border: none;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
	color: #ffffff;
	font-size: 30rpx;
	font-weight: 700;
	box-shadow: 0 12rpx 24rpx rgba(37, 99, 235, 0.18);
}

.edit-btn::after {
	border: none;
}

.card-section {
	padding: 16rpx 24rpx 0;
}

.info-card {
	padding: 28rpx 24rpx;
	margin-bottom: 24rpx;
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

.cert-preview {
	margin-bottom: 20rpx;
	padding: 20rpx;
	border-radius: 20rpx;
	background: #f8fafc;
}

.cert-img {
	width: 100%;
	height: 280rpx;
	border-radius: 16rpx;
	background: #e2e8f0;
}

.cert-hint {
	margin-top: 12rpx;
	display: block;
	font-size: 24rpx;
	color: #64748b;
	text-align: center;
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

.bottom-placeholder {
	height: 80rpx;
}
</style>
