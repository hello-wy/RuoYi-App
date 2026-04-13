<template>
	<view class="footer-container">
		<!-- 标语区域 -->
		<view class="slogan">
			<text class="slogan-text">共同成长每一天！</text>
		</view>

		<!-- 热线区域 -->
		<view class="hotline-section">
			<text class="hotline-title">南京家教热线</text>
			<view class="phone-button" @click="makePhoneCall">
				<text class="phone-text">17327736231</text>
			</view>
			<text class="phone-tip">欢迎点击拨打南京家教热线</text>
			<text class="work-time">工作时间: 9:00-20:00 节假无休</text>
		</view>

		<!-- 服务信息区域 -->
		<!-- <view class="service-section">
			<text class="service-text">微信服务号：</text>
			<text class="service-name">天天家教网</text>
		</view> -->

		<!-- 版权信息 -->
		<!-- <view class="copyright-section">
			<text class="copyright-text">© 2003-2026 天天家教网</text>
		</view> -->

		<!-- 链接导航区域 -->
		<view class="nav-section">
			<view class="nav-row">
				<text class="nav-link" @click="navigateTo('company')">公司简介</text>
				<text class="nav-link" @click="navigateTo('contact')">联系我们</text>
			</view>
			<view class="nav-row">
				<text class="nav-link" @click="navigateTo('privacy')">隐私保护</text>
				<text class="nav-link" @click="navigateTo('disclaimer')">免责声明</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'BottomFooter',
	methods: {
		makePhoneCall() {
			uni.makePhoneCall({
				phoneNumber: '17327736231',
				fail: (err) => {
					console.error('拨打电话失败', err);
					uni.showToast({
						title: '拨打电话失败',
						icon: 'none'
					});
				}
			});
		},
		navigateTo(page) {
			uni.navigateTo({
				url: `/pages/common/about/${page}`,
				fail: (err) => {
					console.error('页面跳转失败', err);
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					});
				}
			});
		}
	}
}
</script>

<style scoped>
.footer-container {
	background-color: #F5F5F5;
	padding: 30rpx 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

/* 标语区域 */
.slogan {
	margin-bottom: 20rpx;
}

.slogan-text {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	text-align: center;
}

/* 热线区域 */
.hotline-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 30rpx;
}

.hotline-title {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 15rpx;
}

.phone-button {
	border: 2rpx solid #3B82F6;
	border-radius: 40rpx;
	padding: 10rpx 40rpx;
	margin: 10rpx 0;
}

.phone-text {
	font-size: 32rpx;
	color: #3B82F6;
	font-weight: bold;
}

.phone-tip {
	font-size: 24rpx;
	color: #999;
	margin-top: 10rpx;
}

.work-time {
	font-size: 24rpx;
	color: #999;
	margin-top: 5rpx;
}

/* 服务信息区域 */
.service-section {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 15rpx;
}

.service-text {
	font-size: 26rpx;
	color: #666;
}

.service-name {
	font-size: 26rpx;
	color: #3B82F6;
	font-weight: bold;
}

/* 版权信息 */
.copyright-section {
	margin-bottom: 25rpx;
}

.copyright-text {
	font-size: 24rpx;
	color: #999;
}

/* 链接导航区域 */
.nav-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
}

.nav-row {
	display: flex;
	flex-direction: row;
	justify-content: center;
	margin-bottom: 15rpx;
}

.nav-link {
	font-size: 26rpx;
	color: #666;
	margin: 0 20rpx;
	cursor: pointer;
}

.nav-link:active {
	color: #3B82F6;
}
</style>
