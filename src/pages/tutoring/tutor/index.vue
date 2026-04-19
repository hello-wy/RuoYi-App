<template>
	<view class="page">
		<!-- 加载中 -->
		<view v-if="loading" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<!-- 未登录提示 -->
		<view v-else-if="!isLoggedIn" class="empty-wrap">
			<uni-icons type="person" size="64" color="#CBD5E1"></uni-icons>
			<text class="empty-title">请先登录</text>
			<text class="empty-sub">登录后查看您的教员主页</text>
			<view class="action-btn" @click="goLogin">
				<text class="action-btn-text">立即登录</text>
			</view>
		</view>

		<!-- 无教员档案 -->
		<view v-else-if="!profile" class="empty-wrap">
			<uni-icons type="compose" size="64" color="#CBD5E1"></uni-icons>
			<text class="empty-title">您还没有教员档案</text>
			<text class="empty-sub">完善信息后开始接单，匹配优质家庭</text>
			<view class="action-btn" @click="goApply">
				<text class="action-btn-text">立即申请做家教</text>
			</view>
		</view>

		<!-- 教员主页内容 -->
		<scroll-view v-else scroll-y class="content-scroll">
			<!-- ===== 顶部 Profile ===== -->
			<view class="profile-header">
				<view class="profile-bg"></view>
				<view class="profile-body">
					<view class="avatar-wrap">
						<image
							class="avatar"
							:src="profile.avatar || '/static/images/profile.jpg'"
							mode="aspectFill"
						></image>
						<view v-if="profile.isCertified === '已通过'" class="cert-dot">
							<uni-icons type="checkmarkempty" size="12" color="#fff"></uni-icons>
						</view>
					</view>
					<text class="profile-name">{{ getName(profile) }}</text>
					<text class="profile-sub">{{ profile.school || '--' }} · {{ profile.major || '--' }}</text>

					<!-- 状态徽章 -->
					<view class="badge-row">
						<view v-if="profile.isCertified === '已通过'" class="badge badge-green">
							<uni-icons type="checkmarkempty" size="12" color="#10B981"></uni-icons>
							<text class="badge-text">实名认证</text>
						</view>
						<view class="badge" :class="statusBadgeClass">
							<text class="badge-text">{{ statusLabel }}</text>
						</view>
					</view>

					<!-- 快捷操作 -->
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

			<!-- ===== 审核状态 ===== -->
			<view class="status-card" :class="statusCardClass">
				<view class="status-icon-wrap" :class="statusIconClass">
					<uni-icons :type="statusIcon" size="22" :color="statusIconColor"></uni-icons>
				</view>
				<view class="status-info">
					<text class="status-title">{{ statusTitle }}</text>
					<text class="status-desc">{{ statusDesc }}</text>
				</view>
			</view>

			<!-- ===== 基本信息 ===== -->
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
						<text class="info-key">学历</text>
						<text class="info-val">{{ getDegreeLabel(profile.degree) }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">院校</text>
						<text class="info-val">{{ profile.school || '--' }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">专业</text>
						<text class="info-val">{{ profile.major || '--' }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">生活地点</text>
						<text class="info-val">{{ getLiveLabel(profile.live) }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">工作地点</text>
						<text class="info-val">{{ getWorkLabel(profile.work) }}</text>
					</view>
				</view>
			</view>

			<!-- ===== 教学概况 ===== -->
			<view class="section-card">
				<view class="section-header">
					<view class="section-icon-wrap orange">
						<uni-icons type="compose" size="16" color="#F59E0B"></uni-icons>
					</view>
					<text class="section-title">教学概况</text>
				</view>

				<!-- 可教科目 -->
				<view class="info-block">
					<text class="info-block-label">可教科目</text>
					<view class="tag-row">
						<view
							v-for="(sub, index) in subjectList"
							:key="index"
							class="info-tag"
						>
							<text class="info-tag-text">{{ sub }}</text>
						</view>
						<text v-if="subjectList.length === 0" class="info-empty">暂未设置</text>
					</view>
				</view>

				<!-- 可授课区域 -->
				<view class="info-block">
					<text class="info-block-label">可授课区域</text>
					<view class="tag-row">
						<view
							v-for="(area, index) in areaList"
							:key="index"
							class="info-tag info-tag-area"
						>
							<text class="info-tag-text-area">{{ area }}</text>
						</view>
						<text v-if="areaList.length === 0" class="info-empty">暂未设置</text>
					</view>
				</view>

				<!-- 授课方式 -->
				<view class="info-block">
					<text class="info-block-label">授课方式</text>
					<dict-tag :options="dict.type.sys_methods" :value="profile.methods" />
				</view>

				<!-- 教学经历 -->
				<view v-if="profile.experience" class="info-block">
					<text class="info-block-label">教学经历</text>
					<text class="info-text">{{ profile.experience }}</text>
				</view>
			</view>

			<!-- ===== 资质认证 ===== -->
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
			</view>

			<!-- ===== 薪资参考 ===== -->
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

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 登录弹窗 -->
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
			if (s === '2' || s === 2) return '可点击"编辑资料"查看拒绝原因并补充完善。'
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
				// 未找到教员档案时 profile 为 null，显示引导卡片
				this.profile = null
			} finally {
				this.loading = false
			}
		},
		getName(item) {
			if (!item) return ''
			const nickname = item.nickname || ''
			return (nickname ? nickname.slice(0, 1) : '') + (item.title || item.realName || '')
		},
		getDegreeLabel(val) {
			const item = (this.dict.type.sys_degree || []).find(o => o.value === val)
			return item ? item.label : (val || '--')
		},
		getLiveLabel(val) {
			const item = this.districtOptions.find(o => String(o.value) === String(val))
			return item ? item.text : (val || '--')
		},
		getWorkLabel(val) {
			const item = this.districtOptions.find(o => String(o.value) === String(val))
			return item ? item.text : (val || '--')
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

/* ===== 空状态 ===== */
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

/* ===== Profile Header ===== */
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

.badge-green {
	background: #ECFDF5;
}

.badge-yellow {
	background: #FFFBEB;
}

.badge-red {
	background: #FEF2F2;
}

.badge-text {
	font-size: 22rpx;
	color: #475569;
	font-weight: 600;
}

.badge-green .badge-text {
	color: #10B981;
}

.badge-yellow .badge-text {
	color: #D97706;
}

.badge-red .badge-text {
	color: #EF4444;
}

.quick-actions {
	display: flex;
	flex-direction: row;
	gap: 20rpx;
}

.quick-btn {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8rpx;
	background: #F8FAFC;
	border: 1.5rpx solid #E2E8F0;
	border-radius: 999rpx;
	padding: 14rpx 32rpx;
}

.quick-btn-text {
	font-size: 26rpx;
	color: #475569;
	font-weight: 600;
}

/* ===== 状态卡片 ===== */
.status-card {
	margin: 0 24rpx 14rpx;
	border-radius: 20rpx;
	padding: 24rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 20rpx;
	background: #FFFBEB;
}

.status-card-green { background: #ECFDF5; }
.status-card-yellow { background: #FFFBEB; }
.status-card-red { background: #FEF2F2; }

.status-icon-wrap {
	width: 72rpx;
	height: 72rpx;
	border-radius: 999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.icon-green { background: #D1FAE5; }
.icon-yellow { background: #FEF3C7; }
.icon-red { background: #FEE2E2; }

.status-info {
	flex: 1;
}

.status-title {
	font-size: 28rpx;
	font-weight: 700;
	color: #1e293b;
	display: block;
	margin-bottom: 6rpx;
}

.status-desc {
	font-size: 24rpx;
	color: #64748b;
	line-height: 1.5;
}

/* ===== Section 卡片 ===== */
.section-card {
	background: #fff;
	border-radius: 20rpx;
	padding: 32rpx 28rpx;
	margin: 0 24rpx 14rpx;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 24rpx;
}

.section-icon-wrap {
	width: 56rpx;
	height: 56rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 16rpx;
	flex-shrink: 0;
}

.section-icon-wrap.blue { background: #EFF6FF; }
.section-icon-wrap.green { background: #ECFDF5; }
.section-icon-wrap.orange { background: #FFFBEB; }
.section-icon-wrap.purple { background: #F5F3FF; }

.section-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #1e293b;
	flex: 1;
}

/* ===== 信息网格 ===== */
.info-grid {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	row-gap: 20rpx;
}

.info-cell {
	width: 50%;
	display: flex;
	flex-direction: column;
}

.info-key {
	font-size: 22rpx;
	color: #94a3b8;
	margin-bottom: 4rpx;
}

.info-val {
	font-size: 28rpx;
	color: #1e293b;
	font-weight: 600;
}

/* ===== 信息块 ===== */
.info-block {
	margin-bottom: 24rpx;
}

.info-block:last-child {
	margin-bottom: 0;
}

.info-block-label {
	font-size: 24rpx;
	color: #94a3b8;
	display: block;
	margin-bottom: 12rpx;
}

.info-text {
	font-size: 26rpx;
	color: #475569;
	line-height: 1.7;
}

.info-empty {
	font-size: 26rpx;
	color: #CBD5E1;
}

.tag-row {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 10rpx;
}

.info-tag {
	background: #EFF6FF;
	border-radius: 999rpx;
	padding: 8rpx 24rpx;
}

.info-tag-text {
	font-size: 24rpx;
	color: #3B82F6;
	font-weight: 600;
}

.info-tag-area {
	background: #ECFDF5;
}

.info-tag-text-area {
	font-size: 24rpx;
	color: #10B981;
	font-weight: 600;
}

/* ===== 证书 ===== */
.cert-preview {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
}

.cert-img {
	width: 100%;
	height: 360rpx;
	border-radius: 12rpx;
	background: #f8fafc;
}

.cert-hint {
	font-size: 24rpx;
	color: #10B981;
}

.cert-empty {
	padding: 20rpx 0;
}

.cert-empty-text {
	font-size: 26rpx;
	color: #94a3b8;
}

/* ===== 薪资跳转 ===== */
.salary-nav {
	cursor: pointer;
}

.salary-link-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	background: #EFF6FF;
	border-radius: 12rpx;
	padding: 20rpx 24rpx;
}

.salary-link-text {
	font-size: 28rpx;
	color: #3B82F6;
	font-weight: 500;
}

.bottom-placeholder {
	height: 80rpx;
}
</style>
