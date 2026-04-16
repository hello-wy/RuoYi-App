<template>
	<view class="page">
		<view v-if="loading" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<view v-else-if="error" class="error-wrap">
			<text class="error-text">加载失败，请重试</text>
			<view class="retry-btn" @click="loadDetail">
				<text class="retry-text">重试</text>
			</view>
		</view>

		<view v-else-if="detail" class="content">
			<view class="hero" :class="heroClass">
				<view class="hero-status-badge" :class="statusBadgeClass">
					<text class="hero-status-text">{{ statusLabel }}</text>
				</view>
				<view class="hero-status-badge" style="margin-left: 10rpx;">
					<text class="hero-status-text">{{ catLabel }}</text>
				</view>
				<text class="hero-title">{{ detail.title }}</text>
				<view class="hero-salary-row">
					<text class="hero-salary-num">¥{{ detail.salaryDay }}</text>
					<view class="hero-salary-desc">
						<text class="hero-salary-unit">元</text>
						<text class="hero-salary-slash"> / </text>
						<text class="hero-salary-daily">日结</text>
					</view>
				</view>
				<view class="hero-meta">
					<view class="hero-meta-item">
						<uni-icons type="calendar" size="14" color="rgba(255,255,255,0.85)"></uni-icons>
						<text class="hero-meta-text">{{ detail.workDate }}</text>
					</view>
					<view class="hero-meta-divider"></view>
					<view class="hero-meta-item">
						<uni-icons type="time" size="14" color="rgba(255,255,255,0.85)"></uni-icons>
						<text class="hero-meta-text">{{ detail.workTime || '时段待定' }}</text>
					</view>
				</view>
			</view>

			<view class="section-card" @click="openMap">
				<view class="section-card-row">
					<view class="section-icon-wrap" style="background:#EEF3FF;">
						<uni-icons type="location-filled" size="18" color="#3B82F6"></uni-icons>
					</view>
					<view class="section-text-wrap">
						<text class="section-label">工作地点</text>
						<text class="section-value">{{ detail.location || '详细地址接单后可见' }}</text>
						<text v-if="detail.districtId" class="section-sub">{{ detail.districtId }}</text>
					</view>
					<uni-icons type="right" size="16" color="#CCC"></uni-icons>
				</view>
				<view v-if="mapLat && mapLng" class="map-preview">
					<map class="map-view" :longitude="mapLng" :latitude="mapLat" :markers="markers" :show-location="false" :enable-scroll="false"></map>
				</view>
			</view>

			<view class="info-group">
				<text class="group-title">工作详情</text>
				<view class="info-grid">
					<view class="info-cell"><text class="info-cell-label">工作日期</text><text class="info-cell-value">{{ detail.workDate || '--' }}</text></view>
					<view class="info-cell"><text class="info-cell-label">工作时段</text><text class="info-cell-value">{{ detail.workTime || '--' }}</text></view>
					<view class="info-cell"><text class="info-cell-label">岗位分类</text><text class="info-cell-value">{{ catLabel }}</text></view>
					<view class="info-cell"><text class="info-cell-label">结算方式</text><text class="info-cell-value salary-inline">日结 ¥{{ detail.salaryDay }}/天</text></view>
				</view>
			</view>

			<view class="info-group" v-if="detail.description">
				<text class="group-title">工作要求</text>
				<view class="req-list">
					<view v-for="(req, i) in parseDesc(detail.description)" :key="i" class="req-item">
						<view class="req-dot"></view>
						<text class="req-text">{{ req }}</text>
					</view>
				</view>
			</view>

			<view class="info-group">
				<text class="group-title">联系方式</text>
				<view class="contact-card">
					<view class="contact-row">
						<view class="contact-avatar"><text class="contact-avatar-text">{{ avatarChar }}</text></view>
						<view class="contact-info"><text class="contact-name">{{ detail.contacts }}</text><text class="contact-phone">{{ detail.phone }}</text></view>
						<view class="contact-call-btn" @click="callPhone"><uni-icons type="phone-filled" size="18" color="#3B82F6"></uni-icons></view>
					</view>
				</view>
			</view>

			<view class="publish-row">
				<uni-icons type="info" size="12" color="#CCC"></uni-icons>
				<text class="publish-text">发布于 {{ timeAgo(detail.createDate) }} · ID #{{ formatId(detail.id) }}</text>
			</view>
			<view style="height: 160rpx;"></view>
		</view>

		<view class="bottom-bar" v-if="detail">
			<view class="bottom-salary">
				<text class="bottom-salary-num">¥{{ detail.salaryDay }}</text>
				<text class="bottom-salary-unit">/日</text>
			</view>
			<button class="apply-btn" :disabled="applyDisabled" :class="{ 'apply-btn-disabled': applyDisabled }" @click="handleApply">
				{{ applyButtonText }}
			</button>
		</view>
		<LoginPopup :auto-open="shouldAutoOpenLogin" @close="handleLoginPopupClose" />
	</view>
</template>

<script>
import { getJobs } from '@/api/system/jobs'
import { useJobSignupOrderStore, useUserStore } from '@/store'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'

const CAT_MAP = { '0': '家教', '1': '助教', '2': '派发', '3': '其他' }
const HERO_CLASSES = { '0': 'hero-blue', '1': 'hero-green', '2': 'hero-amber', '3': 'hero-slate' }
const STATUS_LABEL = { '0': '招募中', '1': '已满员', '2': '已结束' }
const STATUS_BADGE_CLASS = { '0': 'badge-open', '1': 'badge-full', '2': 'badge-end' }

export default {
	components: { LoginPopup },
	data() {
		return {
			jobId: '',
			detail: null,
			loading: false,
			error: false,
			mapLat: 0,
			mapLng: 0,
			isSignedUp: false,
			shouldAutoOpenLogin: false
		}
	},
	computed: {
		catLabel() { return CAT_MAP[String(this.detail && this.detail.category)] || '其他' },
		heroClass() { return HERO_CLASSES[String(this.detail && this.detail.category)] || 'hero-slate' },
		statusLabel() { return STATUS_LABEL[String(this.detail && this.detail.status)] || '--' },
		statusBadgeClass() { return STATUS_BADGE_CLASS[String(this.detail && this.detail.status)] || '' },
		markers() { return !this.mapLat || !this.mapLng ? [] : [{ id: 1, latitude: this.mapLat, longitude: this.mapLng }] },
		avatarChar() { const name = (this.detail && this.detail.contacts) || ''; return name ? name.slice(-1) : '人' },
		applyButtonText() {
			if (!this.detail) return '立即报名'
			if (Number(this.detail.status) === 1) return '已满员'
			if (Number(this.detail.status) === 2) return '已结束'
			return this.isSignedUp ? '已报名' : '立即报名'
		},
		applyDisabled() {
			if (!this.detail) return true
			return Number(this.detail.status) !== 0 || this.isSignedUp
		}
	},
	onLoad(options) {
		this.jobId = options.id || ''
		this.syncSignupState()
		this.loadDetail()
	},
	onShow() {
		this.syncSignupState()
	},
	methods: {
		async loadDetail() {
			if (!this.jobId) return
			this.loading = true
			this.error = false
			try {
				const res = await getJobs(this.jobId)
				this.detail = res.data || res
				this.syncSignupState()
				if (this.detail.geo) {
					const parts = this.detail.geo.split(',')
					this.mapLng = parseFloat(parts[0]) || 0
					this.mapLat = parseFloat(parts[1]) || 0
				}
			} catch (e) {
				this.error = true
				console.error('加载兼职详情失败', e)
			} finally {
				this.loading = false
			}
		},
		syncSignupState() {
			const userStore = useUserStore()
			if (!userStore.token) {
				this.isSignedUp = false
				return
			}
			const orderStore = useJobSignupOrderStore()
			orderStore.hydrate()
			this.isSignedUp = orderStore.hasPaidOrder(this.jobId)
		},
		parseDesc(text) { return !text ? [] : text.split(/[，,。\n；;]/).map(s => s.trim()).filter(Boolean) },
		timeAgo(dateVal) {
			if (!dateVal) return ''
			const diff = Math.floor((Date.now() - new Date(dateVal).getTime()) / 1000)
			if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前'
			if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前'
			return Math.floor(diff / 86400) + ' 天前'
		},
		formatId(id) { return !id ? '----' : String(id).slice(-4).toUpperCase() },
		openMap() {
			if (!this.mapLat || !this.mapLng) return
			uni.openLocation({ latitude: this.mapLat, longitude: this.mapLng, name: (this.detail && this.detail.location) || '工作地点' })
		},
		callPhone() {
			const phone = (this.detail && this.detail.phone) || ''
			if (!phone) return uni.showToast({ title: '暂无联系电话', icon: 'none' })
			uni.makePhoneCall({ phoneNumber: phone })
		},
		handleApply() {
			if (!this.detail || this.applyDisabled) return
			const userStore = useUserStore()
			if (!userStore.token) {
				this.shouldAutoOpenLogin = true
				return
			}
			uni.navigateTo({ url: `/pages/jobs/notice?id=${this.jobId}` })
		},
		handleLoginPopupClose() {
			this.shouldAutoOpenLogin = false
		}
	}
}
</script>

<style scoped>
.page { min-height: 100vh; background: #F5F5F5; }
.loading-wrap,.error-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:120rpx 0; }
.error-text { font-size:28rpx; color:#999; margin-bottom:24rpx; }
.retry-btn { padding:16rpx 48rpx; background:#3B82F6; border-radius:40rpx; }
.retry-text { font-size:28rpx; color:#fff; }
.hero { position:relative; padding:48rpx 36rpx 40rpx; overflow:hidden; }
.hero::after { content:''; position:absolute; right:-40rpx; bottom:-40rpx; width:240rpx; height:240rpx; border-radius:50%; background:rgba(255,255,255,0.08); }
.hero::before { content:''; position:absolute; right:60rpx; top:-30rpx; width:160rpx; height:160rpx; border-radius:50%; background:rgba(255,255,255,0.06); }
.hero-blue { background: linear-gradient(135deg, #2563EB 0%, #3B82F6 60%, #60A5FA 100%); }
.hero-green { background: linear-gradient(135deg, #059669 0%, #10B981 60%, #34D399 100%); }
.hero-amber { background: linear-gradient(135deg, #D97706 0%, #F59E0B 60%, #FCD34D 100%); }
.hero-slate { background: linear-gradient(135deg, #374151 0%, #6B7280 60%, #9CA3AF 100%); }
.hero-status-badge { display:inline-flex; align-items:center; padding:6rpx 20rpx; border-radius:20rpx; margin-bottom:20rpx; }
.badge-open { background: rgba(255,255,255,0.25); }
.badge-full { background: rgba(0,0,0,0.2); }
.badge-end { background: rgba(0,0,0,0.25); }
.hero-status-text { font-size:22rpx; color:#fff; font-weight:600; }
.hero-title { display:block; font-size:40rpx; font-weight:bold; color:#fff; margin-bottom:24rpx; line-height:1.4; }
.hero-salary-row { display:flex; flex-direction:row; align-items:flex-end; margin-bottom:28rpx; }
.hero-salary-num { font-size:72rpx; font-weight:900; color:#fff; line-height:1; }
.hero-salary-desc { display:flex; flex-direction:row; align-items:flex-end; margin-left:8rpx; margin-bottom:8rpx; }
.hero-salary-unit,.hero-salary-slash,.hero-salary-daily,.hero-meta-text { font-size:26rpx; color:rgba(255,255,255,0.85); }
.hero-meta { display:flex; flex-direction:row; align-items:center; gap:16rpx; }
.hero-meta-item { display:flex; flex-direction:row; align-items:center; gap:6rpx; }
.hero-meta-divider { width:1rpx; height:24rpx; background:rgba(255,255,255,0.3); }
.section-card,.info-group { background:#fff; border-radius:20rpx; margin:24rpx 24rpx 0; padding:28rpx; box-shadow:0 2rpx 12rpx rgba(0,0,0,0.05); }
.section-card-row,.contact-row { display:flex; flex-direction:row; align-items:center; }
.section-icon-wrap,.contact-avatar,.contact-call-btn { display:flex; align-items:center; justify-content:center; }
.section-icon-wrap { width:60rpx; height:60rpx; border-radius:16rpx; margin-right:20rpx; }
.section-text-wrap,.contact-info { flex:1; display:flex; flex-direction:column; }
.section-label,.info-cell-label,.publish-text { color:#94a3b8; font-size:24rpx; }
.section-value,.contact-name,.info-cell-value { color:#111827; font-size:28rpx; }
.section-sub,.contact-phone { color:#64748b; font-size:24rpx; margin-top:6rpx; }
.map-preview { margin-top:20rpx; overflow:hidden; border-radius:16rpx; }
.map-view { width:100%; height:220rpx; }
.group-title { display:block; color:#111827; font-size:30rpx; font-weight:700; margin-bottom:20rpx; }
.info-grid { display:grid; grid-template-columns:1fr 1fr; gap:20rpx; }
.info-cell { background:#F8FAFC; border-radius:16rpx; padding:20rpx; display:flex; flex-direction:column; gap:8rpx; }
.salary-inline { color:#2563EB; font-weight:700; }
.req-list { display:flex; flex-direction:column; gap:16rpx; }
.req-item { display:flex; flex-direction:row; align-items:flex-start; gap:14rpx; }
.req-dot { width:12rpx; height:12rpx; margin-top:12rpx; border-radius:50%; background:#3B82F6; flex-shrink:0; }
.req-text { color:#374151; font-size:28rpx; line-height:1.6; }
.contact-card { background:#F8FAFC; border-radius:18rpx; padding:24rpx; }
.contact-avatar { width:84rpx; height:84rpx; border-radius:50%; background:linear-gradient(135deg,#DBEAFE,#BFDBFE); margin-right:20rpx; }
.contact-avatar-text { font-size:30rpx; font-weight:700; color:#1D4ED8; }
.contact-name { font-weight:700; }
.contact-call-btn { width:84rpx; height:84rpx; border-radius:24rpx; background:#EFF6FF; }
.publish-row { display:flex; flex-direction:row; align-items:center; gap:10rpx; margin:28rpx 24rpx 0; }
.bottom-bar { position:fixed; left:0; right:0; bottom:0; display:flex; align-items:center; justify-content:space-between; padding:24rpx 28rpx calc(24rpx + env(safe-area-inset-bottom)); background:#fff; box-shadow:0 -8rpx 24rpx rgba(15,23,42,0.08); }
.bottom-salary { display:flex; align-items:flex-end; gap:6rpx; }
.bottom-salary-num { font-size:44rpx; font-weight:800; color:#111827; }
.bottom-salary-unit { font-size:24rpx; color:#64748b; margin-bottom:6rpx; }
.apply-btn { margin:0; min-width:280rpx; height:88rpx; line-height:88rpx; border-radius:999rpx; background:linear-gradient(135deg,#2563EB,#3B82F6); color:#fff; font-size:30rpx; font-weight:700; }
.apply-btn-disabled { background:#CBD5E1 !important; color:#fff !important; }
</style>
