<template>
	<view>
		<!-- 横幅样式 -->
		<view v-if="type === 'banner'" class="verify-banner" @click="handleClick">
			<view class="verify-left">
				<uni-icons type="auth-filled" size="20" :color="verified ? '#10B981' : '#3B82F6'"></uni-icons>
				<view class="verify-info">
					<text class="verify-title">{{ verified ? '已完成实人认证' : '实人认证' }}</text>
					<text class="verify-sub">{{ verified ? '身份已核验，可发布需求' : '认证后提高可信度，更快匹配到优质资源' }}</text>
				</view>
			</view>
			<view class="verify-action">
				<text class="verify-action-text">{{ verified ? '已认证' : '去认证' }}</text>
				<uni-icons v-if="!verified" type="right" size="14" color="#3B82F6"></uni-icons>
			</view>
		</view>

		<!-- 按钮样式 -->
		<view
			v-else-if="type === 'button'"
			class="verify-btn"
			:class="verified ? 'verify-btn-success' : 'verify-btn-primary'"
			@click="handleClick"
		>
			<uni-icons
				:type="verified ? 'checkmarkempty' : 'auth-filled'"
				size="17"
				:color="verified ? '#10B981' : '#3B82F6'"
			></uni-icons>
			<text class="verify-btn-text" :class="{ 'verified-text': verified }">
				{{ verified ? '实人认证已通过' : '点击进行实人认证' }}
			</text>
			<uni-icons v-if="!verified" type="right" size="14" color="#3B82F6"></uni-icons>
		</view>

		<!-- 实人认证弹窗 —— 自定义 overlay，不依赖 uni-popup -->
		<view v-if="popupVisible" class="rv-overlay" @touchmove.stop.prevent>
			<view
				class="rv-mask"
				:class="{ 'rv-mask--active': popupShown }"
				@click="closePopup"
			></view>
			<view
				class="rv-sheet"
				:class="{ 'rv-sheet--active': popupShown }"
			>
				<view class="verify-popup">
					<view class="popup-header">
						<text class="popup-title">实人认证</text>
						<uni-icons type="closeempty" size="20" color="#666" @click="closePopup"></uni-icons>
					</view>

					<text class="popup-subtitle">请填写真实信息，仅用于平台身份核验，信息严格保密。</text>
					<view class="popup-form-item">
						<text class="popup-label">真实姓名</text>
						<input class="popup-input" :value="realName" @input="$emit('update:realName', $event.detail.value)" placeholder="请输入真实姓名" />
					</view>
					<view class="popup-form-item">
						<text class="popup-label">身份证号</text>
						<input class="popup-input" :value="idCard" @input="$emit('update:idCard', $event.detail.value)" placeholder="请输入18位身份证号" maxlength="18" />
					</view>

					<view
						class="popup-btn"
						:class="{ 'popup-btn-disabled': verifying }"
						@click="submitVerify"
					>
						<text class="popup-btn-text">{{ verifying ? '认证中...' : '立即认证' }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { nextTick } from 'vue'

export default {
	name: 'RealVerify',
	props: {
		// v-model 绑定认证状态
		verified: {
			type: Boolean,
			default: false
		},
		// 可选：外部传入姓名（tutor模式从表单读取）
		realName: {
			type: String,
			default: ''
		},
		// 可选：外部传入身份证（tutor模式从表单读取）
		idCard: {
			type: String,
			default: ''
		},
		// 显示样式：'banner' | 'button'
		type: {
			type: String,
			default: 'banner'
		}
	},
	emits: ['update:verified', 'update:realName', 'update:idCard'],
	data() {
		return {
			verifying: false,
			popupVisible: false,
			popupShown: false
		}
	},
	methods: {
		handleClick() {
			if (this.verified) {
				uni.showToast({ title: '您已完成实人认证', icon: 'success' })
				return
			}
			this.openPopup()
		},
		openPopup() {
			this.popupVisible = true
			nextTick(() => {
				setTimeout(() => {
					this.popupShown = true
				}, 30)
			})
		},
		closePopup() {
			this.popupShown = false
			setTimeout(() => {
				this.popupVisible = false
			}, 300)
		},
		async submitVerify() {
			if (this.verifying) return

			if (!this.realName.trim()) {
				return uni.showToast({ title: '请输入真实姓名', icon: 'none' })
			}
			if (!/^\d{17}[\dXx]$/.test(this.idCard)) {
				return uni.showToast({ title: '请输入正确的18位身份证号', icon: 'none' })
			}

			this.verifying = true
			try {
				await verifyRealName({ realName: this.realName, idCard: this.idCard })
				this.$emit('update:verified', true)
				this.closePopup()
				uni.showToast({ title: '实人认证成功', icon: 'success' })
			} catch (e) {
				uni.showToast({ title: '认证失败，请检查信息后重试', icon: 'none' })
			} finally {
				this.verifying = false
			}
		}
	}
}
</script>

<style lang="scss">
/* 横幅样式 */
.verify-banner {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	background: #EFF6FF;
	border-radius: 10px;
	padding: 12px 14px;
	margin-bottom: 16px;
}

.verify-left {
	display: flex;
	flex-direction: row;
	align-items: center;
	flex: 1;
}

.verify-info {
	margin-left: 10px;
	flex: 1;
}

.verify-title {
	font-size: 14px;
	font-weight: 600;
	color: #1e293b;
	display: block;
}

.verify-sub {
	font-size: 11px;
	color: #64748b;
	margin-top: 2px;
	display: block;
}

.verify-action {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.verify-action-text {
	font-size: 13px;
	color: #3B82F6;
	font-weight: 600;
}

/* 按钮样式 */
.verify-btn {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	border-radius: 10px;
	padding: 12px 16px;
	margin-top: 4px;
}

.verify-btn-primary {
	background: #EFF6FF;
	border: 1.5px solid #BFDBFE;
}

.verify-btn-success {
	background: #ECFDF5;
	border: 1.5px solid #A7F3D0;
}

.verify-btn-text {
	font-size: 14px;
	color: #3B82F6;
	font-weight: 600;
	margin: 0 6px;
}

.verified-text {
	color: #10B981;
}

/* ===== 自定义 overlay 弹窗 ===== */
.rv-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9000;
	display: flex;
	align-items: center;
	justify-content: center;
}

.rv-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0);
	transition: background 0.3s ease;
}

.rv-mask--active {
	background: rgba(0, 0, 0, 0.5);
}

.rv-sheet {
	position: relative;
	z-index: 1;
	width: 680rpx;
	border-radius: 20px;
	opacity: 0;
	transform: scale(0.92);
	transition: opacity 0.28s ease, transform 0.28s ease;
}

.rv-sheet--active {
	opacity: 1;
	transform: scale(1);
}

/* 弹窗内容 */
.verify-popup {
	background: #fff;
	border-radius: 20px;
	padding: 24px 20px;
}

.popup-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
}

.popup-title {
	font-size: 18px;
	font-weight: 700;
	color: #1e293b;
}

.popup-subtitle {
	font-size: 12px;
	color: #94a3b8;
	display: block;
	margin-bottom: 20px;
	line-height: 1.6;
}

.popup-form-item {
	margin-bottom: 14px;
}

.popup-label {
	display: block;
	font-size: 13px;
	color: #64748b;
	margin-bottom: 6px;
}

.popup-input {
	width: 100%;
	height: 44px;
	background: #f8fafc;
	border: 1.5px solid #e2e8f0;
	border-radius: 10px;
	padding: 0 14px;
	font-size: 14px;
	color: #1e293b;
	box-sizing: border-box;
}

.popup-btn {
	margin-top: 20px;
	background: #3B82F6;
	border-radius: 12px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.popup-btn-disabled {
	opacity: 0.6;
}

.popup-btn-text {
	color: #fff;
	font-size: 15px;
	font-weight: 600;
}
</style>
