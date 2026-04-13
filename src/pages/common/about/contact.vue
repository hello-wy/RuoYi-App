<template>
	<view class="page-container">
		<uni-card title="联系我们" :is-shadow="false">
			<uni-list>
				<uni-list-item 
					title="客服热线" 
					:show-arrow="false"
					clickable
					@click="makePhoneCall"
				>
					<template v-slot:footer>
						<text class="phone-number">17327736231</text>
					</template>
				</uni-list-item>

				<uni-list-item 
					title="微信服务号" 
					:show-arrow="false"
				>
					<template v-slot:footer>
						<text class="service-name">学优职傢网</text>
					</template>
				</uni-list-item>

				<uni-list-item 
					title="工作时间" 
					:show-arrow="false"
				>
					<template v-slot:footer>
						<text class="info-text">9:00-20:00 节假无休</text>
					</template>
				</uni-list-item>

				<uni-list-item 
					title="联系地址" 
					:show-arrow="false"
				>
					<template v-slot:footer>
						<text class="info-text">江苏省南京市</text>
					</template>
				</uni-list-item>
			</uni-list>

			<view class="contact-tips">
				<text class="tips-title">温馨提示</text>
				<text class="tips-content">• 客服热线工作时间为9:00-20:00，节假日照常服务</text>
				<text class="tips-content">• 您可以通过电话、微信等方式联系我们</text>
				<text class="tips-content">• 我们将在第一时间为您提供专业的咨询服务</text>
			</view>
		</uni-card>
	</view>
</template>

<script>
export default {
	name: 'ContactPage',
	data() {
		return {}
	},
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
		}
	}
}
</script>

<style scoped>
.page-container {
	background-color: #F5F5F5;
	min-height: 100vh;
	padding: 20rpx;
}

.phone-number {
	font-size: 28rpx;
	color: #FF9500;
	font-weight: bold;
}

.service-name {
	font-size: 28rpx;
	color: #FF9500;
}

.info-text {
	font-size: 28rpx;
	color: #666;
}

.contact-tips {
	margin-top: 30rpx;
	padding: 20rpx;
	background-color: #FFF9F0;
	border-radius: 10rpx;
	display: flex;
	flex-direction: column;
}

.tips-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #FF9500;
	margin-bottom: 15rpx;
}

.tips-content {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
	margin-bottom: 8rpx;
}
</style>
