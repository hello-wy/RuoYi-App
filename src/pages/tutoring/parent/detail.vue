<template>
	<view class="page">
		<view v-if="loading" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<view v-else-if="error" class="error-wrap">
			<text>加载失败，请重试</text>
		</view>

		<view v-else-if="detail" class="content">
			<view class="status-bar">
				<view class="badge-recruiting">
					<text v-if="isAdminScene" class="badge-text">{{ detail.bound ? '已绑定' : '未绑定' }}</text>
					<template v-else>
						<text v-if="detail.status == 0" class="badge-text">招募中</text>
						<text v-if="detail.status == 1" class="badge-text">已完成</text>
						<text v-if="detail.status == 2" class="badge-text">已取消</text>
					</template>
				</view>
				<text class="post-time">发布于 {{ timeAgo(detail.createDate) }}</text>
			</view>

			<view class="title-section">
				<text class="order-title">{{ detail.name }}</text>
			</view>

			<view v-if="detailQuickTags.length" class="quick-tags">
				<view
					v-for="(tag, index) in detailQuickTags"
					:key="`${tag.dict}-${index}`"
					class="quick-tag"
				>
					<uni-icons :type="tag.icon" size="14" color="#3B82F6"></uni-icons>
					<dict-tag :options="dict.type[tag.dict]" :value="tag.value"/>
				</view>
			</view>

			<view class="divider-full"></view>

			<view class="section">
				<text class="section-title">基础信息</text>

				<view class="info-row">
					<uni-icons type="calendar" size="18" color="#666"></uni-icons>
					<view class="info-content">
						<text class="info-label">服务日期</text>
						<text class="info-value">{{ serviceDateText }}</text>
					</view>
				</view>

				<view class="info-row">
					<uni-icons type="calendar-filled" size="18" color="#666"></uni-icons>
					<view class="info-content">
						<text class="info-label">服务时段</text>
						<text class="info-value">{{ serviceTimeText }}</text>
					</view>
				</view>

				<view class="info-row">
					<uni-icons type="location" size="18" color="#666"></uni-icons>
					<view class="info-content">
						<text class="info-label">上课地点</text>
						<text class="info-value">{{ locationText }}</text>
					</view>
				</view>

				<view class="map-placeholder" @click="openMap">
					<map
						class="map-view"
						:longitude="mapLng"
						:latitude="mapLat"
						:markers="markers"
						:show-location="false"
						:enable-scroll="false"
					></map>
				</view>
			</view>

			<view class="divider-full"></view>

			<view class="section">
				<text class="section-title">服务需求项目</text>
				<view v-if="demandItemValues.length" class="demand-tag-wrap">
					<dict-tag :options="dict.type.sys_tutoring_demand_items" :value="demandItemValues" />
				</view>
				<text v-else class="empty-text">暂无服务需求项目</text>
			</view>

			<view class="divider-full"></view>

			<view class="section">
				<text class="section-title">学员情况</text>
				<view class="student-card">
					<view class="student-icon-wrap" style="background:#EEF9F0;">
						<uni-icons type="person" size="18" color="#10B981"></uni-icons>
					</view>
					<view class="student-item-content">
						<text class="student-item-label">目前水平</text>
						<text class="student-item-value">{{ detail.brief || '暂无描述' }}</text>
					</view>
				</view>
			</view>

			<view class="divider-full"></view>

			<view class="section">
				<text class="section-title">教员要求</text>
				<view v-if="detail.requirements" class="requirement-list">
					<view
						v-for="(req, i) in parseRequirements(detail.requirements)"
						:key="i"
						class="req-item"
					>
						<uni-icons type="checkmarkempty" size="16" color="#10B981"></uni-icons>
						<text class="req-text">{{ req }}</text>
					</view>
				</view>
				<text v-else class="empty-text">暂无特别要求</text>
			</view>

			<view style="height: 200rpx;"></view>
		</view>

		<view v-if="detail" class="bottom-bar">
			<template v-if="isAdminScene">
				<view class="btn-apply btn-apply-text" @click="openBindPopup">绑定学员</view>
			</template>
			<template v-else-if="isMineScene">
				<view class="btn-map" @click="handleDelete">
					<uni-icons type="trash" size="18" color="#DC2626"></uni-icons>
					<text class="btn-map-text btn-map-text-danger">删除需求</text>
				</view>
				<view class="btn-apply btn-apply-text" @click="handleEdit">编辑需求</view>
			</template>
			<template v-else>
				<view class="btn-map" @click="openMap">
					<uni-icons type="map" size="18" color="#333"></uni-icons>
					<text class="btn-map-text">查看地图</text>
				</view>
				<button class="btn-apply btn-apply-text" type="primary" size="small" open-type="contact">立即申请</button>
			</template>
		</view>

		<view v-if="showBindPopup" class="bind-mask" @click="closeBindPopup">
			<view class="bind-panel" @click.stop>
				<view class="bind-head">
					<text class="bind-title">绑定学员</text>
					<uni-icons type="closeempty" size="22" color="#6B7280" @click="closeBindPopup"></uni-icons>
				</view>

				<view class="bind-search">
					<input
						v-model="tutorKeyword"
						class="bind-input"
						placeholder="搜索真实姓名或手机号"
						confirm-type="search"
						@confirm="searchTutors(true)"
					/>
					<view class="bind-search-btn" @click="searchTutors(true)">搜索</view>
				</view>

				<view v-if="tutorLoading && tutorList.length === 0" class="bind-state">
					<uni-load-more status="loading"></uni-load-more>
				</view>
				<view v-else-if="tutorError && tutorList.length === 0" class="bind-state">
					<text class="bind-state-text">加载失败，请重试</text>
					<view class="bind-retry" @click="searchTutors(true)">重试</view>
				</view>
				<view v-else-if="tutorList.length === 0" class="bind-state">
					<text class="bind-state-text">暂无学员信息</text>
				</view>
				<scroll-view v-else scroll-y class="bind-list" @scrolltolower="loadMoreTutors">
					<view
						v-for="(item, index) in tutorList"
						:key="item.id || index"
						class="card bind-card"
					>
						<view class="card-main">
							<view class="avatar-wrap">
								<image class="avatar" :src="getTutorAvatarSrc(item)" mode="aspectFill"></image>
							</view>

							<view class="info-wrap">
								<view class="name-row">
									<text class="tutor-name">{{ formatTutorName(item) }}</text>
								</view>
								<view class="school-row">
									<text class="school-text">{{ formatTutorSchool(item) }}</text>
								</view>
								<view class="school-row phone-row">
									<text class="school-text">{{ formatTutorPhone(item) }}</text>
								</view>
								<view v-if="getSubjectLabel(item.subjects).length" class="card-tags">
									<dict-tag
										v-for="(value, tagIndex) in getSubjectLabel(item.subjects)"
										:key="'s' + tagIndex"
										:options="dict.type.sys_subject"
										:value="value"
									/>
								</view>
							</view>

							<view class="bind-action" @click="handleBindTutor(item)">
								<text class="bind-action-text">{{ bindingTutorId === item.id ? '绑定中' : '绑定' }}</text>
							</view>
						</view>
					</view>

					<uni-load-more :status="tutorLoadMoreStatus" @clickLoadMore="loadMoreTutors"></uni-load-more>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import config from '@/config'
import { deleteMyParentDemand, getParents as getWxParents } from '@/api/wxmini/tutoring'
import { getParents as getSystemParents } from '@/pages/tutoring/_api/system/parents'
import { listTutors } from '@/pages/tutoring/_api/system/tutors'
import { bindTutor } from '@/pages/tutoring/_api/system/tutoringAdmin'
import { buildParentDetailQuickTags } from './display.helpers'
import { getParentDemandItemValues, getParentDetailLocationText, getParentServiceDateText, getParentServiceTimeText, normalizeParentDetail } from './detail.helpers'
import { resolveTutorAvatarSrc } from '@/pages/tutoring/tutor/index.helpers'

const TUTOR_PAGE_SIZE = 10
const APPROVED_TUTOR_STATUS = 1

export default {
	dicts: ['sys_methods', 'sys_class', 'sys_subject', 'sys_tutoring_demand_items'],
	data() {
		return {
			orderId: '',
			scene: '',
			deleting: false,
			detail: null,
			loading: false,
			error: false,
			mapLat: 32.06,
			mapLng: 118.79,
			showBindPopup: false,
			tutorKeyword: '',
			tutorList: [],
			tutorPage: 1,
			tutorTotal: 0,
			tutorLoading: false,
			tutorFinished: false,
			tutorError: false,
			bindingTutorId: ''
		}
	},
	computed: {
		detailQuickTags() {
			return buildParentDetailQuickTags(this.detail)
		},
		markers() {
			if (!this.mapLat || !this.mapLng) return []
			return [{
				id: 1,
				latitude: this.mapLat,
				longitude: this.mapLng,
			}]
		},
		isMineScene() {
			return this.scene === 'mine'
		},
		isAdminScene() {
			return this.scene === 'admin'
		},
		locationText() {
			return getParentDetailLocationText(this.detail || {})
		},
		serviceDateText() {
			return getParentServiceDateText(this.detail || {})
		},
		serviceTimeText() {
			return getParentServiceTimeText(this.detail || {})
		},
		demandItemValues() {
			return getParentDemandItemValues(this.detail || {})
		},
		tutorLoadMoreStatus() {
			if (this.tutorLoading && this.tutorList.length > 0) {
				return 'loading'
			}
			return this.tutorFinished ? 'noMore' : 'more'
		}
	},
	onLoad(options) {
		this.orderId = options.id || ''
		this.scene = options.scene || ''
		this.loadDetail()
	},
	methods: {
		async loadDetail() {
			if (!this.orderId) return
			this.loading = true
			this.error = false
			try {
				const res = this.isAdminScene ? await getSystemParents(this.orderId) : await getWxParents(this.orderId)
				this.detail = normalizeParentDetail(res.data || res)
				if (!this.detail) {
					this.error = true
					return
				}
				const geo = String(this.detail.geo || '').split(',')
				if (geo.length === 2) {
					this.mapLng = Number(geo[0]) || this.mapLng
					this.mapLat = Number(geo[1]) || this.mapLat
				}
			} catch (e) {
				this.error = true
				console.error('加载家教订单详情失败', e)
			} finally {
				this.loading = false
			}
		},
		timeAgo(dateVal) {
			if (!dateVal) return ''
			const now = Date.now()
			const ts = new Date(dateVal).getTime()
			const diff = Math.floor((now - ts) / 1000)
			if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前'
			if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前'
			return Math.floor(diff / 86400) + ' 天前'
		},
		parseRequirements(text) {
			if (!text) return []
			return text.split(/[，,。\n]/).map(s => s.trim()).filter(Boolean).slice(0, 5)
		},
		openMap() {
			if (!this.detail) return
			uni.openLocation({
				latitude: this.mapLat,
				longitude: this.mapLng,
				name: this.detail.location || this.detail.region || '上课地点'
			})
		},
		handleEdit() {
			if (!this.orderId) return
			uni.navigateTo({ url: `/pages/tutoring/parent/apply?id=${this.orderId}&fromMine=1` })
		},
		handleDelete() {
			if (this.deleting || !this.orderId) return
			uni.showModal({
				title: '提示',
				content: '确认删除这条需求吗？',
				success: async ({ confirm }) => {
					if (!confirm) return
					this.deleting = true
					try {
						await deleteMyParentDemand(this.orderId)
						uni.showToast({ title: '删除成功', icon: 'success' })
						setTimeout(() => {
							uni.navigateBack({ delta: 1 })
						}, 600)
					} catch (e) {
						uni.showToast({ title: '删除失败，请重试', icon: 'none' })
					} finally {
						this.deleting = false
					}
				}
			})
		},
		openBindPopup() {
			this.showBindPopup = true
			if (this.tutorList.length === 0) {
				this.searchTutors(true)
			}
		},
		closeBindPopup() {
			this.showBindPopup = false
		},
		async searchTutors(reset = false) {
			if (this.tutorLoading) return
			if (reset) {
				this.tutorPage = 1
				this.tutorList = []
				this.tutorTotal = 0
				this.tutorFinished = false
				this.tutorError = false
			}
			this.tutorLoading = true
			try {
				const keyword = this.tutorKeyword.trim()
				const query = {
					pageNum: this.tutorPage,
					pageSize: TUTOR_PAGE_SIZE,
					status: APPROVED_TUTOR_STATUS,
					orderByColumn: 'createDate',
					isAsc: 'desc'
				}
				if (keyword) {
					if (/^\d+$/.test(keyword)) {
						query.phone = keyword
					} else {
						query.realName = keyword
					}
				}
				const res = await listTutors(query)
				const rows = Array.isArray(res.rows) ? res.rows : []
				this.tutorList = reset ? rows : this.tutorList.concat(rows)
				this.tutorTotal = Number(res.total || 0)
				this.tutorFinished = this.tutorList.length >= this.tutorTotal || rows.length === 0
				this.tutorPage += 1
				this.tutorError = false
			} catch (e) {
				this.tutorError = true
			} finally {
				this.tutorLoading = false
			}
		},
		loadMoreTutors() {
			if (this.tutorLoading || this.tutorFinished) return
			this.searchTutors(false)
		},
		async handleBindTutor(item) {
			if (!item || !item.id || this.bindingTutorId) return
			this.bindingTutorId = item.id
			try {
				await bindTutor(this.orderId, item.id)
				uni.showToast({ title: '绑定成功', icon: 'success' })
				this.closeBindPopup()
				await this.loadDetail()
			} catch (e) {
				uni.showToast({ title: '绑定失败，请重试', icon: 'none' })
			} finally {
				this.bindingTutorId = ''
			}
		},
		getTutorAvatarSrc(item) {
			return resolveTutorAvatarSrc({
				detail: item,
				baseUrl: config.baseUrl
			})
		},
		formatTutorName(item) {
			return item.realName || item.userName || item.nickname || '未命名学员'
		},
		formatTutorSchool(item) {
			return `${item.school || '--'}${item.major ? ' · ' + item.major : ''}`
		},
		formatTutorPhone(item) {
			return item.phone || '联系方式待完善'
		},
		getSubjectLabel(val) {
			if (!val) return []
			const source = Array.isArray(val) ? val : String(val).split(',')
			return source.map(v => {
				const text = String(v).trim()
				const found = (this.dict.type.sys_subject || []).find(d => String(d.value) === text)
				return found ? found.label : text
			}).filter(Boolean)
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background: #fff;
}
.status-bar {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 32rpx 12rpx;
}
.badge-recruiting {
	background: #EEF3FF;
	border-radius: 8rpx;
	padding: 4rpx 16rpx;
}
.badge-text {
	font-size: 24rpx;
	color: #3B82F6;
}
.post-time {
	font-size: 24rpx;
	color: #999;
}
.title-section {
	padding: 0 32rpx 20rpx;
}
.order-title {
	font-size: 44rpx;
	font-weight: bold;
	color: #1A1A1A;
	display: block;
	margin-bottom: 12rpx;
}
.quick-tags {
	display: flex;
	flex-direction: row;
	gap: 16rpx;
	padding: 0 32rpx 24rpx;
	flex-wrap: wrap;
}
.quick-tag {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 10rpx 18rpx;
	background: #F4F8FF;
	border-radius: 15rpx;
}
.divider-full {
	height: 16rpx;
	background: #F7F7F7;
}
.section {
	padding: 28rpx 32rpx;
}
.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #222;
	display: block;
	margin-bottom: 24rpx;
}
.info-row {
	display: flex;
	align-items: flex-start;
	gap: 18rpx;
	margin-bottom: 28rpx;
}
.info-content {
	flex: 1;
}
.info-label {
	display: block;
	font-size: 26rpx;
	color: #888;
	margin-bottom: 8rpx;
}
.info-value {
	font-size: 28rpx;
	color: #222;
	line-height: 1.6;
}
.map-placeholder {
	width: 100%;
	height: 280rpx;
	border-radius: 20rpx;
	overflow: hidden;
	background: #f5f5f5;
}
.map-view {
	width: 100%;
	height: 100%;
}
.demand-tag-wrap {
	display: flex;
	flex-wrap: wrap;
}
.student-card {
	display: flex;
	align-items: flex-start;
	gap: 18rpx;
	background: #FAFBFC;
	border-radius: 20rpx;
	padding: 24rpx;
}
.student-icon-wrap {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.student-item-content {
	flex: 1;
}
.student-item-label {
	display: block;
	font-size: 26rpx;
	color: #888;
	margin-bottom: 8rpx;
}
.student-item-value {
	font-size: 28rpx;
	color: #222;
	line-height: 1.7;
}
.requirement-list {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}
.req-item {
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
}
.req-text {
	flex: 1;
	font-size: 28rpx;
	color: #222;
	line-height: 1.7;
}
.empty-text {
	font-size: 28rpx;
	color: #999;
}
.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #fff;
	padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
	display: flex;
	align-items: center;
	gap: 20rpx;
	box-shadow: 0 -6rpx 24rpx rgba(0,0,0,0.06);
	z-index: 20;
}
.btn-map {
	width: 180rpx;
	height: 84rpx;
	border-radius: 18rpx;
	background: #F7F7F7;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
}
.btn-map-text {
	font-size: 28rpx;
	color: #333;
}
.btn-map-text-danger {
	color: #DC2626;
}
.btn-apply {
	flex: 1;
	height: 84rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 18rpx;
	background: linear-gradient(90deg, #3B82F6 0%, #2563EB 100%);
	border: none;
}
.btn-apply-text {
	font-size: 30rpx;
	font-weight: 600;
	color: #fff;
}
.bind-mask {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 99;
	background: rgba(15, 23, 42, 0.45);
	display: flex;
	align-items: flex-end;
}
.bind-panel {
	width: 100%;
	max-height: 86vh;
	background: #f6f7ee;
	border-radius: 32rpx 32rpx 0 0;
	padding: 28rpx 0 calc(28rpx + env(safe-area-inset-bottom));
}
.bind-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 32rpx 24rpx;
}
.bind-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #111827;
}
.bind-search {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 0 24rpx 16rpx;
}
.bind-input {
	flex: 1;
	height: 76rpx;
	border-radius: 16rpx;
	background: #fff;
	padding: 0 24rpx;
	font-size: 28rpx;
	color: #111827;
}
.bind-search-btn,
.bind-retry {
	height: 76rpx;
	padding: 0 28rpx;
	border-radius: 16rpx;
	background: #2563EB;
	color: #fff;
	font-size: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.bind-state {
	min-height: 360rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20rpx;
}
.bind-state-text {
	font-size: 28rpx;
	color: #6B7280;
}
.bind-list {
	height: 62vh;
}
.card {
	margin: 24rpx;
	background: linear-gradient(180deg, #ffffff 0%, #fdfdf7 100%);
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.06);
}
.bind-card {
	margin-top: 16rpx;
	margin-bottom: 16rpx;
}
.card-main {
	display: flex;
	gap: 24rpx;
	padding: 28rpx;
	align-items: flex-start;
}
.avatar-wrap {
	position: relative;
	width: 136rpx;
	height: 168rpx;
	flex-shrink: 0;
	margin-right: 0;
}
.avatar {
	width: 136rpx;
	height: 168rpx;
	border-radius: 16rpx;
	background-color: #eee;
}
.info-wrap {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
}
.name-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}
.tutor-name {
	font-size: 36rpx;
	font-weight: 700;
	line-height: 1.2;
	color: #1f2937;
}
.school-row {
	margin-top: 14rpx;
	margin-bottom: 0;
}
.phone-row {
	margin-top: 6rpx;
}
.school-text {
	font-size: 26rpx;
	line-height: 1.5;
	color: #6b7280;
	margin-left: 0;
}
.card-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 16rpx;
}
.bind-action {
	width: 104rpx;
	height: 64rpx;
	border-radius: 999rpx;
	background: #22C55E;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.bind-action-text {
	font-size: 26rpx;
	font-weight: 600;
	color: #fff;
}
.loading-wrap,
.error-wrap {
	padding: 80rpx 0;
	display: flex;
	justify-content: center;
	align-items: center;
	color: #999;
}
</style>
