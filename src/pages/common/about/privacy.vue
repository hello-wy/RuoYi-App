<template>
	<view class="page-container">
		<scroll-view scroll-y class="scroll-container">
			<uni-card title="隐私保护政策" :is-shadow="false">
				<view class="content-section">
					<text class="section-title">1. 信息收集</text>
					<text class="section-content">
						我们会收集您在使用服务时主动提供的信息，包括但不限于：姓名、联系方式、学习需求等。我们承诺仅在必要的范围内收集您的个人信息，用于提供更优质的家教服务。
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">2. 信息使用</text>
					<text class="section-content">
						我们收集的个人信息将用于：
						<text class="list-item">• 为您匹配合适的家教老师</text>
						<text class="list-item">• 提供客户服务和技术支持</text>
						<text class="list-item">• 改进我们的产品和服务</text>
						<text class="list-item">• 发送服务相关的通知和更新</text>
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">3. 信息共享</text>
					<text class="section-content">
						我们不会将您的个人信息出售或出租给第三方。仅在以下情况下，我们可能会共享您的信息：
						<text class="list-item">• 获得您的明确同意</text>
						<text class="list-item">• 为提供服务所必需</text>
						<text class="list-item">• 遵守法律法规的要求</text>
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">4. 信息存储与保护</text>
					<text class="section-content">
						我们采用行业标准的安全措施保护您的个人信息，包括数据加密、访问控制等技术手段。您的信息将存储在安全的服务器上，我们会定期进行安全审查和更新。
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">5. 您的权利</text>
					<text class="section-content">
						您有权：
						<text class="list-item">• 访问和更新您的个人信息</text>
						<text class="list-item">• 要求删除您的个人信息</text>
						<text class="list-item">• 撤回您的授权同意</text>
						<text class="list-item">• 投诉和举报信息安全问题</text>
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">6. 未成年人保护</text>
					<text class="section-content">
						我们重视未成年人的个人信息保护。如果您是未成年人，请在监护人的陪同下阅读本政策，并在监护人同意的情况下使用我们的服务。
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">7. 政策更新</text>
					<text class="section-content">
						我们可能会不定期更新本隐私政策。更新后的政策将在本页面发布，重大变更我们会通过适当方式通知您。
					</text>
				</view>

				<view class="contact-info">
					<text class="contact-text">如有任何疑问，请联系我们：17327736231</text>
				</view>
			</uni-card>
		</scroll-view>
	</view>
</template>

<script>
export default {
	name: 'PrivacyPage',
	data() {
		return {}
	}
}
</script>

<style scoped>
.page-container {
	background-color: #F5F5F5;
	height: 100vh;
}

.scroll-container {
	height: 100%;
	padding: 20rpx;
}

.content-section {
	display: flex;
	flex-direction: column;
	margin-bottom: 30rpx;
}

.section-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 12rpx;
}

.section-content {
	font-size: 28rpx;
	color: #666;
	line-height: 1.8;
	text-align: justify;
	display: flex;
	flex-direction: column;
}

.list-item {
	font-size: 28rpx;
	color: #666;
	line-height: 1.8;
	margin-top: 8rpx;
	padding-left: 10rpx;
}

.contact-info {
	margin-top: 20rpx;
	padding: 20rpx;
	background-color: #FFF9F0;
	border-radius: 10rpx;
	text-align: center;
}

.contact-text {
	font-size: 26rpx;
	color: #FF9500;
}
</style>
