<template>
	<view class="page">

		<view class="body" :style="{ paddingTop: (statusBarHeight + 44) + 'px' }">
			<!-- 卡片 -->
			<view class="card">
				<!-- 头像区 -->
				<view class="avatar-wrap">
					<image
						class="avatar"
						:src="avatar || '/static/images/profile.jpg'"
						mode="aspectFill"
					></image>
				</view>
				<text class="user-name">{{ userName || '用户' }}</text>

				<!-- 二维码区域 -->
				<view class="qr-wrap">
					<view v-if="qrLoading" class="qr-loading">
						<uni-load-more status="loading"></uni-load-more>
					</view>
					<canvas
						v-show="!qrLoading"
						canvas-id="qrCanvas"
                        id="myQrcode"
						class="qr-canvas"
						:style="{ width: canvasSize + 'px', height: canvasSize + 'px' }"
					></canvas>
				</view>

				<text class="qr-tip">管理员扫描二维码即可签到</text>

				<!-- 分割线 -->
				<view class="card-divider"></view>

				<!-- ID 大字展示 -->
				<view class="id-display-row">
					<text class="id-display-label">ID</text>
					<text class="id-display-value">{{ userId }}</text>
					<view class="copy-btn" @click="copyUserId">
						<uni-icons type="copy" size="14" color="#3B82F6"></uni-icons>
						<text class="copy-text">复制</text>
					</view>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
import { useUserStore } from '@/store'
import UQRCode from '@/uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
			canvasSize: 200,
			qrLoading: true,
			userId: '',
			userName: '',
			avatar: ''
		}
	},
	onLoad() {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 0

		const store = useUserStore()
		this.userId = store.id || ''
		this.userName = store.name || ''
		this.avatar = store.avatar || ''

		this.$nextTick(() => {
			this.drawQRCode(String(this.userId))
		})
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		copyUserId() {
			uni.setClipboardData({
				data: String(this.userId),
				success: () => uni.showToast({ title: '已复制', icon: 'success' })
			})
		},
		drawQRCode(data) {
			const ctx = uni.createCanvasContext('qrCanvas', this);
			const uqrcode = new UQRCode();
			uqrcode.data = String(data || this.userId);
			uqrcode.size = this.canvasSize;
			uqrcode.canvasContext = ctx;
			uqrcode.make();
			uqrcode.drawCanvas().then(() => {
				this.qrLoading = false;
			}).catch((e) => {
				console.error('[QRCode]', e);
				this.qrLoading = false;
			});
		},
	}
}
</script>

<style lang="scss">
page {
	background: linear-gradient(160deg, #0EA5E9 0%, #38BDF8 40%, #e0f2fe 100%);
	min-height: 100vh;
}

.page {
	min-height: 100vh;
	background: linear-gradient(160deg, #0EA5E9 0%, #38BDF8 40%, #e0f2fe 100%);
}

/* 导航栏 */
.nav-bar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
}

.nav-inner {
	height: 44px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 0 12px;
}

.nav-back {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-title {
	font-size: 17px;
	font-weight: 700;
	color: #fff;
}

/* 主体 */
.body {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px 20px 40px;
}

/* 卡片 */
.card {
	width: 100%;
	background: #fff;
	border-radius: 24px;
	padding: 30px 20px 24px;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 8px 40px rgba(14, 165, 233, 0.2);
}

/* 头像 */
.avatar-wrap {
	width: 72px;
	height: 72px;
	border-radius: 50%;
	overflow: hidden;
	border: 3px solid #e0f2fe;
	margin-bottom: 12px;
}

.avatar {
	width: 72px;
	height: 72px;
}

.user-name {
	font-size: 18px;
	font-weight: 700;
	color: #1e293b;
	margin-bottom: 4px;
}

.user-id-label {
	font-size: 13px;
	color: #94a3b8;
	margin-bottom: 24px;
}

/* 二维码 */
.qr-wrap {
	width: 220px;
	height: 220px;
	background: #f8fafc;
	border-radius: 16px;
	border: 1.5px solid #e2e8f0;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	margin-bottom: 16px;
	padding: 10px;
}

.qr-loading {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.qr-canvas {
	display: block;
	width: 200px;
	height: 200px;
}

.qr-tip {
	font-size: 12px;
	color: #94a3b8;
	text-align: center;
	margin-bottom: 20px;
}

/* 分割线 */
.card-divider {
	width: 100%;
	height: 1px;
	background: #f1f5f9;
	margin-bottom: 16px;
}

/* ID 展示行 */
.id-display-row {
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
	background: #f8fafc;
	border-radius: 12px;
	padding: 12px 16px;
	gap: 10px;
}

.id-display-label {
	font-size: 12px;
	color: #94a3b8;
	font-weight: 600;
	flex-shrink: 0;
}

.id-display-value {
	flex: 1;
	font-size: 18px;
	font-weight: 700;
	color: #1e293b;
	letter-spacing: 2px;
}

.copy-btn {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 3px;
	background: #EFF6FF;
	border-radius: 8px;
	padding: 5px 10px;
}

.copy-text {
	font-size: 12px;
	color: #3B82F6;
	font-weight: 600;
}

/* 底部提示 */
.bottom-hint {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.75);
	text-align: center;
	margin-top: 20px;
}
</style>
