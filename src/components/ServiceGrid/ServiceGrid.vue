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
					icon: 'calendar',
					color: '#a5673f',
					path: '/pages/tutoring/parent/apply'
				},
				{
					name: '教员库',
					icon: 'contact',
					color: '#a5673f',
					path: '/pages/tutoring/tutor/list'
				},
				{
					name: '学员库',
					icon: 'person',
					color: '#a5673f',
					path: '/pages/tutoring/parent/list'
				},
				{
					name: '做教员',
					icon: 'vip',
					color: '#a5673f',
					path: '/pages/tutoring/tutor/apply'
				},
				{
					name: '兼职/全职',
					icon: 'wallet',
					color: '#a5673f',
					path: '/pages/jobs/list'
				},
				{
					name: '育见成长',
					icon: 'star',
					color: '#a5673f',
					path: '/pages/growup/index'
				},
				{
					name: '热门沙龙',
					icon: 'gift',
					color: '#a5673f',
					path: '/pages/salon/list'
				},
				{
					name: '性格测试',
					icon: 'heart',
					color: '#a5673f',
					path: '/pages/personality/start'
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
	padding: 12px 15px 4px 15px;
	margin-bottom: 10px;
}

.section-title-wrap {
	display: flex;
	align-items: center;
	margin-bottom: 10px;
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
	padding: 8px 0;
	box-sizing: border-box;
}

.icon-wrapper {
	width: 44px;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 4px;
}

.item-text {
	font-size: 14px;
	color: #333;
	text-align: center;
}
</style>
