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

		<scroll-view v-else scroll-y class="content-scroll">
			<view class="profile-header">
				<view class="profile-bg"></view>
				<view class="profile-body">
					<view class="avatar-wrap">
						<image class="avatar" :src="profile.avatar || '/static/images/profile.jpg'" mode="aspectFill"></image>
						<view v-if="profile.status === '1' || profile.status === 1" class="cert-dot">
							<uni-icons type="checkmarkempty" size="12" color="#fff"></uni-icons>
						</view>
					</view>
					<text class="profile-name">{{ getName(profile) }}</text>
					<text class="profile-sub">{{ profile.school || '--' }} · {{ profile.major || '--' }}</text>

					<view class="badge-row">
						<view v-if="profile.status === '1' || profile.status === 1" class="badge badge-green">
							<uni-icons type="checkmarkempty" size="12" color="#10B981"></uni-icons>
							<text class="badge-text">实名认证</text>
						</view>
						<view class="badge" :class="statusBadgeClass">
							<text class="badge-text">{{ statusLabel }}</text>
						</view>
					</view>

					<view class="quick-actions">
						<view class="quick-btn" @click="goEdit">
							<uni-icons type="compose" size="16" color="#3B82F6"></uni-icons>
							<text class="quick-btn-text">编辑资料</text>
						</view>
						<view class="quick-btn" @click="goDetail">
							<uni-icons type="eye" size="16" color="#10B981"></uni-icons>
							<text class="quick-btn-text">预览主页</text>
						</view>
					</view>
				</view>
			</view>

			<view class="status-card" :class="statusCardClass">
				<view class="status-icon-wrap" :class="statusIconClass">
					<uni-icons :type="statusIcon" size="22" :color="statusIconColor"></uni-icons>
				</view>
				<view class="status-info">
					<text class="status-title">{{ statusTitle }}</text>
					<text class="status-desc">{{ statusDesc }}</text>
				</view>
			</view>

			<view class="section-card">
				<view class="section-header">
					<view class="section-icon-wrap blue">
						<uni-icons type="person-filled" size="16" color="#3B82F6"></uni-icons>
					</view>
					<text class="section-title">基本信息</text>
				</view>
				<view class="info-grid">
					<view class="info-cell">
						<text class="info-key">真实姓名</text>
						<text class="info-val">{{ profile.realName || '--' }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">身份</text>
						<text class="info-val">{{ getIdentityLabel(profile.identity) }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">学历</text>
						<text class="info-val">{{ getDegreeLabel(profile.degree) }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">城市</text>
						<text class="info-val">{{ profile.city || '--' }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">院校</text>
						<text class="info-val">{{ profile.school || '--' }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">专业</text>
						<text class="info-val">{{ profile.major || '--' }}</text>
					</view>
				</view>
			</view>

			<view class="section-card">
				<view class="section-header">
					<view class="section-icon-wrap orange">
						<uni-icons type="compose" size="16" color="#F59E0B"></uni-icons>
					</view>
					<text class="section-title">教学概况</text>
				</view>

				<view class="info-block">
					<text class="info-block-label">可教科目</text>
					<view class="tag-row">
						<view v-for="(sub, index) in subjectList" :key="index" class="info-tag">
							<text class="info-tag-text">{{ sub }}</text>
						</view>
						<text v-if="subjectList.length === 0" class="info-empty">暂未设置</text>
					</view>
				</view>

				<view class="info-block">
					<text class="info-block-label">可授课区域</text>
					<view class="tag-row">
						<view v-for="(area, index) in areaList" :key="index" class="info-tag info-tag-area">
							<text class="info-tag-text-area">{{ area }}</text>
						</view>
						<text v-if="areaList.length === 0" class="info-empty">暂未设置</text>
					</view>
				</view>

				<view class="info-block">
					<text class="info-block-label">授课方式</text>
					<dict-tag :options="dict.type.sys_methods" :value="profile.methods" />
				</view>

				<view v-if="profile.experience" class="info-block">
					<text class="info-block-label">教学经历</text>
					<text class="info-text">{{ profile.experience }}</text>
				</view>
			</view>

			<view class="section-card">
				<view class="section-header">
					<view class="section-icon-wrap purple">
						<uni-icons type="medal-filled" size="16" color="#8B5CF6"></uni-icons>
					</view>
					<text class="section-title">资质认证</text>
				</view>

				<view v-if="profile.certificates" class="cert-preview">
					<image :src="profile.certificates" class="cert-img" mode="aspectFit"></image>
					<text class="cert-hint">已上传证书图片</text>
				</view>
				<view v-else class="cert-empty">
					<text class="cert-empty-text">未上传证书，请编辑资料补充</text>
				</view>
				<view class="tag-row" style="margin-top: 16rpx;">
					<view v-for="(item, index) in certificateItems" :key="index" class="info-tag">
						<text class="info-tag-text">{{ item }}</text>
					</view>
				</view>
			</view>

			<view class="section-card salary-nav" @click="goSalary">
				<view class="section-header">
					<view class="section-icon-wrap green">
						<uni-icons type="list" size="16" color="#10B981"></uni-icons>
					</view>
					<text class="section-title">薪资参考</text>
				</view>
				<view class="salary-link-row">
					<text class="salary-link-text">查看详细薪资参考表</text>
					<uni-icons type="right" size="14" color="#3B82F6"></uni-icons>
				</view>
			</view>

			<view class="bottom-placeholder"></view>
		</scroll-view>

		<LoginPopup :auto-open="shouldAutoOpenLogin" @close="shouldAutoOpenLogin = false" />
	</view>
</template>

<script>
import { useUserStore, useLocationStore } from '@/store'
import { getMyTutor } from '@/api/wxmini/tutoring'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'

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
		statusLabel() {
			const s = this.profile?.status
			if (s === '0' || s === 0) return '待审核'
			if (s === '1' || s === 1) return '已通过'
			if (s === '2' || s === 2) return '已拒绝'
			return '未知'
		},
		statusBadgeClass() {
			const s = this.profile?.status
			if (s === '1' || s === 1) return 'badge-green'
			if (s === '2' || s === 2) return 'badge-red'
			return 'badge-yellow'
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
		},
		subjectList() {
			const subjects = this.profile?.subjects
			if (!subjects) return []
			return subjects.split(',').map(v => {
				v = v.trim()
				const found = (this.dict.type.sys_subject || []).find(d => String(d.value) === String(v))
				return found ? found.label : v
			}).filter(Boolean)
		},
		areaList() {
			const areas = this.profile?.areas
			if (!areas) return []
			return areas.split(',').map(v => {
				v = v.trim()
				const found = this.districtOptions.find(d => String(d.value) === String(v))
				return found ? found.text : v
			}).filter(Boolean)
		},
		certificateItems() {
			const source = this.profile?.certificateList || ''
			if (!source) return []
			return source.split(/[，,、\n]/).map(item => item.trim()).filter(Boolean)
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
		getName(item) {
			if (!item) return ''
			return item.realName || '教员'
		},
		getIdentityLabel(identity) {
			const mapping = { 0: '大学生教员', 1: '在职教师', 2: '其他' }
			return mapping[Number(identity)] || '未知'
		},
		getDegreeLabel(val) {
			const item = (this.dict.type.sys_degree || []).find(o => o.value === val)
			return item ? item.label : (val || '--')
		},
		goLogin() {
			this.shouldAutoOpenLogin = true
		},
		goApply() {
			uni.navigateTo({ url: '/pages/tutoring/tutor/apply' })
		},
		goEdit() {
			uni.navigateTo({ url: '/pages/tutoring/tutor/apply' })
		},
		goDetail() {
			if (this.profile?.id) {
				uni.navigateTo({ url: `/pages/tutoring/tutor/detail?id=${this.profile.id}` })
			}
		},
		goSalary() {
			uni.navigateTo({ url: '/pages/price/list' })
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

.content-scroll {
	height: 100vh;
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

.profile-header {
	position: relative;
	margin-bottom: 14rpx;
}

.profile-bg {
	height: 280rpx;
	background: linear-gradient(135deg, #1e3a5f 0%, #2563EB 50%, #3B82F6 100%);
}

.profile-body {
	position: relative;
	background: #fff;
	margin: 0 24rpx;
	margin-top: -60rpx;
	border-radius: 24rpx;
	padding: 0 32rpx 32rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 4px 20px rgba(30, 58, 95, 0.12);
}

.avatar-wrap {
	position: relative;
	width: 160rpx;
	height: 160rpx;
	margin-top: -60rpx;
	margin-bottom: 20rpx;
}

.avatar {
	width: 160rpx;
	height: 160rpx;
	border-radius: 999rpx;
	border: 6rpx solid #fff;
	background: #E2E8F0;
}

.cert-dot {
	position: absolute;
	right: 0;
	bottom: 0;
	width: 40rpx;
	height: 40rpx;
	background: #10B981;
	border-radius: 50%;
	border: 4rpx solid #fff;
	display: flex;
	align-items: center;
	justify-content: center;
}

.profile-name {
	font-size: 40rpx;
	font-weight: 800;
	color: #1e293b;
	margin-bottom: 8rpx;
}

.profile-sub {
	font-size: 26rpx;
	color: #64748b;
	margin-bottom: 24rpx;
}

.badge-row {
	display: flex;
	flex-direction: row;
	gap: 12rpx;
	margin-bottom: 32rpx;
}

.badge {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 6rpx;
	border-radius: 999rpx;
	padding: 8rpx 20rpx;
	background: #F1F5F9;
}

.badge-green { background: #ECFDF5; }
.badge-yellow { background: #FFFBEB; }
.badge-red { background: #FEF2F2; }

.badge-text {
	font-size: 22rpx;
	color: #475569;
	font-weight: 600;
}

.badge-green .badge-text { color: #10B981; }
.badge-yellow .badge-text { color: #D97706; }
.badge-red .badge-text { color: #EF4444; }

.quick-actions {
	display: flex;
	width: 100%;
	gap: 20rpx;
}

.quick-btn {
	flex: 1;
	background: #F8FAFC;
	border-radius: 18rpx;
	padding: 22rpx 0;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
}

.quick-btn-text {
	font-size: 26rpx;
	font-weight: 600;
	color: #334155;
}

.status-card,
.section-card {
	margin: 0 24rpx 20rpx;
	background: #fff;
	border-radius: 24rpx;
	padding: 28rpx 24rpx;
	box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
}

.status-card {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.status-card-yellow { background: #FFFBEA; }
.status-card-green { background: #ECFDF5; }
.status-card-red { background: #FEF2F2; }

.status-icon-wrap {
	width: 72rpx;
	height: 72rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-yellow { background: #FEF3C7; }
.icon-green { background: #D1FAE5; }
.icon-red { background: #FEE2E2; }

.status-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.status-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #1E293B;
}

.status-desc {
	font-size: 24rpx;
	color: #64748B;
	line-height: 1.6;
}

.section-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 18rpx;
}

.section-icon-wrap {
	width: 56rpx;
	height: 56rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12rpx;
}

.section-icon-wrap.blue { background: #EFF6FF; }
.section-icon-wrap.orange { background: #FFFBEB; }
.section-icon-wrap.purple { background: #F5F3FF; }
.section-icon-wrap.green { background: #ECFDF5; }

.section-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #1E293B;
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 20rpx;
}

.info-cell {
	background: #F8FAFC;
	border-radius: 16rpx;
	padding: 20rpx;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.info-key {
	font-size: 24rpx;
	color: #94A3B8;
}

.info-val,
.info-text,
.salary-link-text,
.cert-empty-text {
	font-size: 26rpx;
	color: #334155;
	line-height: 1.6;
}

.info-block {
	margin-bottom: 20rpx;
}

.info-block:last-child {
	margin-bottom: 0;
}

.info-block-label {
	display: block;
	font-size: 24rpx;
	color: #64748B;
	margin-bottom: 12rpx;
}

.tag-row {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.info-tag {
	padding: 10rpx 20rpx;
	border-radius: 999rpx;
	background: #EFF6FF;
}

.info-tag-area {
	background: #ECFDF5;
}

.info-tag-text {
	font-size: 22rpx;
	color: #2563EB;
}

.info-tag-text-area {
	font-size: 22rpx;
	color: #10B981;
}

.info-empty {
	font-size: 24rpx;
	color: #94A3B8;
}

.cert-preview {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.cert-img {
	width: 220rpx;
	height: 220rpx;
	border-radius: 18rpx;
	background: #F8FAFC;
}

.cert-hint {
	font-size: 22rpx;
	color: #8B5CF6;
	margin-top: 12rpx;
}

.salary-nav {
	padding-bottom: 24rpx;
}

.salary-link-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.bottom-placeholder {
	height: 60rpx;
}
</style>
