<template>
	<view class="page-container">
		<scroll-view scroll-y class="scroll-container">
			<uni-card title="免责声明" :is-shadow="false">
				<view class="content-section">
					<text class="section-title">1. 服务范围</text>
					<text class="section-content">
						学优职傢网作为教育服务信息平台，致力于为学生和家长提供家教信息咨询服务。我们提供的服务仅限于信息发布、匹配推荐等，不直接参与教学活动。
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">2. 信息准确性</text>
					<text class="section-content">
						我们努力确保平台上发布的信息真实、准确，但不对信息的完整性、及时性、准确性做出保证。用户在使用服务时应自行核实相关信息，谨慎做出决策。
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">3. 教学质量</text>
					<text class="section-content">
						虽然我们会对教师进行筛选，但教学效果受多种因素影响，包括学生自身情况、学习态度、教学方法等。我们不对最终的教学效果做任何保证。
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">4. 第三方链接</text>
					<text class="section-content">
						本平台可能包含指向第三方网站的链接。我们对这些第三方网站的内容、隐私政策或做法不承担责任。用户访问第三方网站时应自行承担风险。
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">5. 责任限制</text>
					<text class="section-content">
						在法律允许的最大范围内，我们对以下情况不承担责任：
						<text class="list-item">• 因不可抗力导致的服务中断或延迟</text>
						<text class="list-item">• 用户自身原因造成的损失</text>
						<text class="list-item">• 第三方行为导致的任何损失</text>
						<text class="list-item">• 网络故障或技术问题造成的影响</text>
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">6. 用户行为</text>
					<text class="section-content">
						用户应遵守国家法律法规和平台规则，不得利用本平台从事违法违规活动。用户因违规行为造成的后果由用户自行承担。
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">7. 知识产权</text>
					<text class="section-content">
						本平台的所有内容，包括但不限于文字、图片、logo、界面设计等，均受知识产权法保护。未经授权，不得复制、传播或用于商业目的。
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">8. 争议解决</text>
					<text class="section-content">
						因使用本平台服务产生的争议，应首先通过友好协商解决。协商不成的，可向平台所在地有管辖权的人民法院提起诉讼。
					</text>
				</view>

				<view class="content-section">
					<text class="section-title">9. 声明更新</text>
					<text class="section-content">
						我们保留随时修改本免责声明的权利。修改后的声明将在本页面发布，继续使用服务即表示您接受修改后的声明。
					</text>
				</view>

				<view class="footer-note">
					<text class="note-text">本声明的最终解释权归学优职傢网所有</text>
					<text class="note-text">如有疑问请联系：17327736231</text>
				</view>
			</uni-card>
		</scroll-view>
	</view>
</template>

<script>
export default {
	name: 'DisclaimerPage',
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

.footer-note {
	margin-top: 30rpx;
	padding: 20rpx;
	background-color: #FFF9F0;
	border-radius: 10rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.note-text {
	font-size: 26rpx;
	color: #FF9500;
	margin-bottom: 5rpx;
}
</style>
