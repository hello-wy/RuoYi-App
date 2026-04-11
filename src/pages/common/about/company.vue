<template>
	<view class="page-container">
		<uni-card title="公司简介" :is-shadow="false">
			<view class="content-section">
				<text class="section-title">企业愿景</text>
				<text class="section-content">
					天天家教网致力于成为国内领先的教育服务平台，为学生和家长提供优质的家教资源，帮助每一个孩子实现学业梦想，共同成长每一天！
				</text>
			</view>

			<view class="content-section">
				<text class="section-title">发展历程</text>
				<text class="section-content">
					自2003年成立以来，天天家教网已经服务了数万名学生和家长，积累了丰富的教育资源和服务经验。我们始终坚持以用户为中心，不断优化服务质量，为教育事业贡献力量。
				</text>
			</view>

			<view class="content-section">
				<text class="section-title">服务理念</text>
				<text class="section-content">
					我们秉承"专业、诚信、高效"的服务理念，为学生精心匹配优秀教师，提供个性化的教学方案。通过严格的教师筛选和培训体系，确保每一位学生都能获得最优质的教育服务。
				</text>
			</view>

			<view class="content-section">
				<text class="section-title">服务范围</text>
				<text class="section-content">
					我们的服务覆盖南京及周边地区，提供小学、初中、高中各科目的一对一家教服务，以及艺术、体育等特长培训。无论您的需求是什么，我们都将竭诚为您服务。
				</text>
			</view>
		</uni-card>
	</view>
</template>

<script>
export default {
	name: 'CompanyPage',
	data() {
		return {}
	}
}
</script>

<style scoped>
.page-container {
	background-color: #F5F5F5;
	min-height: 100vh;
	padding: 20rpx;
}

.content-section {
	display: flex;
	flex-direction: column;
	margin-bottom: 30rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 15rpx;
}

.section-content {
	font-size: 28rpx;
	color: #666;
	line-height: 1.8;
	text-align: justify;
}
</style>
