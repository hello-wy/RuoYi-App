<template>
	<view class="service-grid">
		<view class="section-title-wrap">
			<view class="section-title-bar"></view>
			<text class="section-title">服务项目</text>
		</view>
		<view class="grid-list">
			<view v-for="(item, index) in serviceList" :key="index" class="grid-cell" @click="handleClick(item)">
				<view class="icon-wrapper">
					<uni-icons :type="item.icon" size="32" :color="item.color"></uni-icons>
				</view>
				<text class="item-text">{{ item.name }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'ServiceGrid',
	data() {
		return {
			serviceList: [
				{
					name: '请家教',
					icon: 'calendar-filled',
					color: '#333',
					path: '/pages/tutoring/parent/apply'
				},
				{
					name: '教员库',
					icon: 'contact-filled',
					color: '#333',
					path: '/pages/tutoring/tutor/list'
				},
				{
					name: '学员库',
					icon: 'person-filled',
					color: '#333',
					path: '/pages/tutoring/parent/list'
				},
				{
					name: '做教员',
					icon: 'vip-filled',
					color: '#333',
					path: '/pages/tutoring/tutor/apply'
				},
				{
					name: '兼职日结',
					icon: 'wallet-filled',
					color: '#333',
					path: '/pages/jobs/list'
				},
				{
					name: '育见成长',
					icon: 'star-filled',
					color: '#333',
					path: '/pages/growup/index'
				},
				{
					name: '热门沙龙',
					icon: 'gift-filled',
					color: '#333',
					path: '/pages/salon/list'
				},
				{
					name: '价格',
					icon: 'paperplane-filled',
					color: '#333',
					path: '/pages/price/list'
				}
			]
		}
	},
	methods: {
		handleClick(item) {
			uni.navigateTo({
				url: item.path
			})
		}
	}
}
</script>

<style scoped>
.service-grid {
	background-color: #fff;
	padding: 15px;
	margin-bottom: 10px;
}

.section-title-wrap {
	display: flex;
	align-items: center;
	margin-bottom: 15px;
}

.section-title-bar {
	width: 8rpx;
	height: 32rpx;
	background-color: #3b82f6;
	border-radius: 999rpx;
	margin-right: 12rpx;
}

.section-title {
	font-size: 18px;
	font-weight: bold;
	color: #333;
}

.grid-list {
	display: flex;
	flex-wrap: wrap;
}

.grid-cell {
	width: 25%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 15px 0;
	box-sizing: border-box;
}

.icon-wrapper {
	width: 60px;
	height: 60px;
	background-color: #f5f5f5;
	border-radius: 10rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 8px;
}

.item-text {
	font-size: 14px;
	color: #333;
	text-align: center;
}
</style>
