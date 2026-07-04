<template>
	<view class="page">
		<scroll-view
			scroll-y
			class="scroll-body"
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="onLoadMore"
		>
			<!-- 加载中骨架 -->
			<view v-if="loading && list.length === 0" class="loading-wrap">
				<uni-load-more status="loading"></uni-load-more>
			</view>

			<!-- 空态 -->
			<view v-else-if="!loading && list.length === 0" class="empty-wrap">
				<uni-icons type="calendar" size="52" color="#cbd5e1"></uni-icons>
				<text class="empty-text">暂无课程订单</text>
			</view>

			<!-- 列表 -->
			<view v-else class="list-wrap">
				<view
					v-for="item in list"
					:key="item.orderNo || item.id"
					class="course-card"
				>
					<view class="course-main" @click="goDetail(item)">
						<!-- 左侧封面 -->
						<view class="cover-wrap">
							<image
								v-if="getCourseCover(item)"
								class="cover-img"
								:src="getCourseCover(item)"
								mode="aspectFill"
							></image>
							<view v-else class="cover-placeholder">
								<uni-icons type="calendar" size="22" color="rgba(255,255,255,0.85)"></uni-icons>
							</view>
						</view>

						<!-- 中间信息 -->
						<view class="course-info">
							<text class="course-name">{{ item.courseName || '未命名课程' }}</text>
							<view class="course-meta-item">
								<uni-icons type="calendar" size="13" color="#3B82F6"></uni-icons>
								<text class="course-meta-text">
									开课时间：{{ formatTime(item.courseTime) }}
								</text>
							</view>
							<view class="course-meta-item">
								<uni-icons type="location" size="13" color="#3B82F6"></uni-icons>
								<text class="course-meta-text course-location">{{ item.courseLocation || '地点待定' }}</text>
							</view>
							<view class="status-row">
								<text class="status-pill" :class="`status-${Number(item.status)}`">{{ formatStatus(item.status) }}</text>
								<text v-if="item.orderNo" class="order-no">{{ item.orderNo }}</text>
							</view>
						</view>
					</view>

					<view class="action-row">
						<view
							v-if="isPending(item)"
							class="action-btn pay-btn"
							:class="{ 'action-disabled': operatingOrderNo === item.orderNo }"
							@click.stop="payOrder(item)"
						>
							<text class="action-btn-text">{{ operatingOrderNo === item.orderNo ? '处理中' : '去支付' }}</text>
						</view>
						<view
							v-if="canShowSignin(item)"
							class="action-btn signin-btn"
							@click.stop="goSignin(item)"
						>
							<text class="action-btn-text">现场签到</text>
						</view>
						<view
							v-if="canCancel(item)"
							class="action-btn cancel-btn"
							:class="{ 'action-disabled': operatingOrderNo === item.orderNo }"
							@click.stop="cancelOrder(item)"
						>
							<text class="cancel-btn-text">取消订单</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部加载更多 -->
			<view v-if="list.length > 0" class="load-more-wrap">
				<uni-load-more :status="noMore ? 'noMore' : (loadingMore ? 'loading' : 'more')"></uni-load-more>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import config from '@/config'
import { cancelCoursePayOrder, createCoursePayOrder, listMyCourseOrders, queryCoursePayOrder } from '@/api/wxmini/coursePay'
import { getLectureImageSrc } from '@/utils/lecture-cover'
import { requestWxPayment } from '@/utils/wxPayment'

const STATUS_PENDING = 0
const STATUS_PAID_WAIT_SIGN = 1
const STATUS_SIGNED = 2
const STATUS_REFUNDED = 3
const STATUS_CANCELED = 4
const PAY_SUCCESS_STATUSES = [STATUS_PAID_WAIT_SIGN, STATUS_SIGNED]
const POLL_MAX_ATTEMPTS = 6
const POLL_INTERVAL_MS = 800

export default {
	data() {
		return {
			list: [],
			loading: false,
			refreshing: false,
			loadingMore: false,
			noMore: false,
			operatingOrderNo: ''
		}
	},
	onLoad() {
		this.loadList()
	},
	methods: {
		async loadList() {
			this.loading = true
			try {
				const orders = await listMyCourseOrders()
				this.list = orders.filter(item => Number(item.status) !== STATUS_CANCELED)
				this.noMore = true
			} catch (e) {
				uni.showToast({ title: '加载失败，请重试', icon: 'none' })
			} finally {
				this.loading = false
			}
		},
		async onRefresh() {
			this.refreshing = true
			this.noMore = false
			await this.loadList()
			this.refreshing = false
		},
		onLoadMore() {
			// 如需分页可在此扩展
		},
		goDetail(item) {
			const courseId = item.courseId || item.lectureId
			if (!courseId) {
				uni.showToast({ title: '课程信息缺失', icon: 'none' })
				return
			}
			const orderNo = item.orderNo ? `&orderNo=${encodeURIComponent(item.orderNo)}` : ''
			uni.navigateTo({
				url: `/pages/growup/detail?id=${courseId}&type=course${orderNo}`
			})
		},
		goSignin(item) {
			const courseId = item.courseId || item.lectureId
			if (!courseId) {
				uni.showToast({ title: '课程信息缺失', icon: 'none' })
				return
			}
			uni.navigateTo({
				url: `/pages/growup/qrcode/index?id=${courseId}&type=lecture&action=signin`
			})
		},
		async payOrder(item) {
			if (this.operatingOrderNo) return
			this.operatingOrderNo = item.orderNo || ''
			try {
				const result = await createCoursePayOrder(this.buildPayPayload(item))
				await requestWxPayment(result.payParam)
				await this.confirmPaid(result.orderNo)
				await this.loadList()
			} catch (e) {
				const msg = (e && (e.msg || e.errMsg || e.message)) || '支付未完成'
				uni.showToast({ title: msg, icon: 'none' })
			} finally {
				this.operatingOrderNo = ''
			}
		},
		async cancelOrder(item) {
			if (this.operatingOrderNo) return
			uni.showModal({
				title: '取消订单',
				content: '确定要取消该课程订单吗？',
				success: async (res) => {
					if (!res.confirm) return
					this.operatingOrderNo = item.orderNo || ''
					try {
						await cancelCoursePayOrder(item.orderNo)
						uni.showToast({ title: '订单已取消', icon: 'success' })
						await this.loadList()
					} catch (e) {
						const msg = (e && (e.msg || e.errMsg || e.message)) || '取消失败'
						uni.showToast({ title: msg, icon: 'none' })
					} finally {
						this.operatingOrderNo = ''
					}
				}
			})
		},
		buildPayPayload(item) {
			return {
				courseId: item.courseId,
				name: item.name,
				gender: item.gender,
				phone: item.phone,
				company: item.company,
				accommodation: item.accommodation,
				enrollmentId: item.enrollmentId
			}
		},
		async confirmPaid(orderNo) {
			for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
				const order = await queryCoursePayOrder(orderNo)
				if (PAY_SUCCESS_STATUSES.includes(Number(order.status))) {
					uni.showToast({ title: '支付成功', icon: 'success' })
					return
				}
				await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
			}
			uni.showToast({ title: '支付结果确认中，请稍后刷新', icon: 'none' })
		},
		getCourseCover(item) {
			if (item.courseCover && /^https?:\/\//i.test(item.courseCover)) {
				return item.courseCover
			}
			if (!item.courseCoverId && !item.courseId) {
				return ''
			}
			return getLectureImageSrc({
				baseUrl: config.baseUrl,
				lecture: {
					id: item.courseCoverId || item.courseId,
					coverId: item.courseCoverId,
					updateDate: item.updateDate
				},
				fileName: 'cover.webp'
			})
		},
		isPending(item) {
			return Number(item.status) === STATUS_PENDING
		},
		canShowSignin(item) {
			return Number(item.status) === STATUS_PAID_WAIT_SIGN
		},
		canCancel(item) {
			return Number(item.status) === STATUS_PENDING
		},
		formatStatus(status) {
			const map = {
				[STATUS_PENDING]: '待支付',
				[STATUS_PAID_WAIT_SIGN]: '已支付',
				[STATUS_SIGNED]: '已签到',
				[STATUS_REFUNDED]: '已退款',
				[STATUS_CANCELED]: '已取消'
			}
			return map[Number(status)] || '未知状态'
		},
		formatTime(val) {
			if (!val) return '—'
			const d = new Date(val)
			if (isNaN(d.getTime())) return val
			const pad = n => String(n).padStart(2, '0')
			return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
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
	display: flex;
	flex-direction: column;
	background: #f4f6fb;
}

.scroll-body {
	flex: 1;
	overflow: hidden;
}

/* ===== 空态 ===== */
.loading-wrap,
.empty-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80px 0;
	gap: 14px;
}

.empty-text {
	font-size: 14px;
	color: #94a3b8;
}

/* ===== 列表区 ===== */
.list-wrap {
	padding: 12px 16px 0;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

/* ===== 课程卡片 ===== */
.course-card {
	display: flex;
	flex-direction: column;
	background: #fff;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
	border: 1px solid #BFDBFE;
	padding: 14px;
	gap: 12px;
	position: relative;
}

.course-card::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 4px;
	height: 100%;
	background: linear-gradient(to bottom, #38BDF8, #3B82F6);
	border-radius: 4px 0 0 4px;
}

.course-main {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 12px;
	min-width: 0;
}

/* ===== 封面 ===== */
.cover-wrap {
	flex-shrink: 0;
}

.cover-img {
	width: 80px;
	height: 80px;
	border-radius: 10px;
	display: block;
}

.cover-placeholder {
	width: 80px;
	height: 80px;
	border-radius: 10px;
	background: linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

/* ===== 中间信息 ===== */
.course-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 5px;
	min-width: 0;
}

.course-name {
	display: block;
	font-size: 15px;
	font-weight: 700;
	color: #1e293b;
	line-height: 1.4;
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.course-meta-item {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 4px;
}

.course-meta-text {
	font-size: 12px;
	color: #64748b;
	flex: 1;
}

.course-location {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.status-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8px;
	min-width: 0;
}

.status-pill {
	flex-shrink: 0;
	border-radius: 999px;
	padding: 2px 8px;
	font-size: 11px;
	font-weight: 600;
	color: #2563eb;
	background: #dbeafe;
}

.status-0 {
	color: #d97706;
	background: #fef3c7;
}

.status-2 {
	color: #059669;
	background: #d1fae5;
}

.status-3,
.status-4 {
	color: #64748b;
	background: #e2e8f0;
}

.order-no {
	font-size: 10px;
	color: #94a3b8;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.action-row {
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	align-items: center;
	gap: 8px;
	padding-left: 92px;
}

.action-btn {
	flex-shrink: 0;
	border-radius: 20px;
	padding: 8px 14px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.pay-btn {
	background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.signin-btn {
	background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
}

.cancel-btn {
	background: #fff;
	border: 1px solid #cbd5e1;
}

.action-disabled {
	opacity: 0.6;
}

.action-btn-text {
	font-size: 13px;
	font-weight: 600;
	color: #fff;
	white-space: nowrap;
}

.cancel-btn-text {
	font-size: 13px;
	font-weight: 600;
	color: #64748b;
	white-space: nowrap;
}

/* ===== 底部加载更多 ===== */
.load-more-wrap {
	padding: 8px 0 30px;
	display: flex;
	justify-content: center;
}
</style>
