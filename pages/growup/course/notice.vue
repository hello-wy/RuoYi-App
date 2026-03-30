<template>
	<view class="page">
		<!-- 导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-back" @click="goBack">
				<uni-icons type="left" size="20" color="#1e293b"></uni-icons>
			</view>
			<text class="nav-title">报名须知</text>
			<view style="width: 44px;"></view>
		</view>

		<scroll-view scroll-y class="scroll-content" :style="{ top: navHeight + 'px' }">
				<view class="content-wrap">

					<!-- 报名须知 -->
					<view class="notice-section">
						<text class="notice-section-title">报名须知</text>
						<view class="notice-text-wrap">
							<text class="notice-plain">{{ noticeContent }}</text>
						</view>
					</view>

					<!-- 预定住宿须知 -->
					<view class="notice-section">
						<text class="notice-section-title">预定住宿须知</text>
						<view class="notice-text-wrap">
							<text class="notice-plain">{{ hotelContent }}</text>
						</view>
					</view>

					<!-- 占位 -->
					<view style="height: 160px;"></view>
				</view>
		</scroll-view>

			<!-- 底部协议确认 -->
			<view class="bottom-bar">
				<view class="agree-row" @click="toggleAgree">
					<view class="checkbox-wrap" :class="{ 'checked': agreed }">
						<uni-icons v-if="agreed" type="checkmarkempty" size="12" color="#fff"></uni-icons>
					</view>
					<text class="agree-text">我已阅读厚德企管的《报名须知》和《预定住宿须知》</text>
				</view>
				<view
					class="agree-btn"
					:class="{ 'agree-btn-disabled': !agreed }"
					@click="handleAgree"
				>
					<text class="agree-btn-text">我同意</text>
				</view>
			</view>
	</view>

</template>

<script>
export default {
	data() {
		return {
			statusBarHeight: 0,
			navHeight: 44,
			courseId: '',
			agreed: false,
			noticeContent: `尊敬的学员您好：\n欢迎您参加厚德企管的课程，为了您有更好的学习体验，请在仔细阅读须知后再报名。\n\n一、课程选择：\n1、在首页选择您想要报名参加的课程；\n2、如需了解自己的学籍情况，可点击右下角"我的"里面进行查看。\n\n二、报名操作：\n1、小程序首页选择您要参加的课程并点击；\n2、进入课程报名页面后会您的学籍数量提示，在有学籍的情况下，点击"前往报名"；\n3、阅读完须知后勾选我已阅读，并点击"我同意"进行下一步；\n4、在报名页面核对您的报名信息，点击"立即报名"；\n5、进行报名押金支付，支付成功后即报名成功。\n\n三、报名押金：\n1、为防止虚假报名影响课程开设，有些课程报名设置了押金，完成支付方可报名成功；\n2、距开课42小时前可以取消报名，取消后押金自动退还，距开课42小时内不能取消退还；\n3、现场扫码签到，经审核后报名押金会退还至支付账户。\n\n四、现场签到：\n1、现场签到时请根据工作人员的指引有序排队签到；\n2、签到前请您提前准备好出示签到二维码；\n3、签到二维码在小程序首页右下角"我的"→"我的课程"→"现场签到"即可查看。\n再次感谢您的关注和参与，如报名操作遇到有问题，请随时与我们联系。`,
			hotelContent: `尊敬的学员您好：\n课程学习的强度较大需要充足的休息，为保持良好的学习状态，同时方便和同学交流，建议您全程住在开课酒店。您可以选择自己在网上预定酒店，也可以选择通过厚德预定（按照厚德协议价办理入住）。如您选择通过我们预定酒店，请您仔细阅读以下预定住宿须知。`,
		}
	},
	onLoad(options) {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 0
		this.navHeight = (sys.statusBarHeight || 0) + 44
		this.courseId = options.id || options.courseId || ''
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		toggleAgree() {
			this.agreed = !this.agreed
		},
		handleAgree() {
			if (!this.agreed) {
				return uni.showToast({ title: '请先勾选同意协议', icon: 'none' })
			}
			uni.navigateTo({
				url: `/pages/growup/course/enroll?id=${this.courseId}`
			})
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

/* 导航 */
.nav-bar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: auto;
	background: #fff;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 0 4px 0 4px;
	padding-bottom: 0;
	z-index: 100;
	box-shadow: 0 1px 0 #f1f5f9;
}

.nav-back {
	width: 44px;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-title {
	font-size: 16px;
	font-weight: 700;
	color: #1e293b;
}

/* 加载 */
.loading-wrap {
	display: flex;
	align-items: center;
	justify-content: center;
	padding-top: 200px;
}

/* 滚动内容 */
.scroll-content {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	margin-bottom: 50rpx;
}

.content-wrap {
	padding: 16px 14px 0;
}

/* 须知 section */
.notice-section {
	background: #fff;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 12px;
	box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.notice-section-title {
	font-size: 16px;
	font-weight: 700;
	color: #1e293b;
	display: block;
	margin-bottom: 12px;
}

.notice-text-wrap {
	background: #f8fafc;
	border-radius: 8px;
	padding: 12px;
}

.notice-rich {
	font-size: 13px;
	color: #475569;
	line-height: 1.9;
}

.notice-plain {
	font-size: 13px;
	color: #475569;
	line-height: 1.9;
	white-space: pre-wrap;
	word-break: break-all;
}

/* 底部协议栏 */
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	padding: 12px 16px;
	padding-bottom: calc(12px + env(safe-area-inset-bottom));
	box-shadow: 0 -1px 0 #f1f5f9;
	z-index: 50;
}

.agree-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 12px;
	gap: 8px;
}

.checkbox-wrap {
	width: 18px;
	height: 18px;
	border-radius: 4px;
	border: 1.5px solid #cbd5e1;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.checkbox-wrap.checked {
	background: #3B82F6;
	border-color: #3B82F6;
}

.agree-text {
	font-size: 12px;
	color: #64748b;
	flex: 1;
	line-height: 1.5;
}

.agree-btn {
	height: 50px;
	border-radius: 25px;
	background: #3B82F6;
	display: flex;
	align-items: center;
	justify-content: center;
}

.agree-btn.agree-btn-disabled {
	background: #e2e8f0;
}

.agree-btn-text {
	font-size: 16px;
	font-weight: 700;
	color: #fff;
}

.agree-btn.agree-btn-disabled .agree-btn-text {
	color: #94a3b8;
}
</style>
