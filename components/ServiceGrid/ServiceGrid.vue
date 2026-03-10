<template>
	<view class="service-grid">
        <uni-section title="服务项目" type="line" titleFontSize="18px"></uni-section>
		<!-- <view class="section-title">服务项目</view> -->
		<uni-grid :column="gridColumn" :showBorder="false" :square="false" :highlight="true">
			<uni-grid-item v-for="(item, index) in serviceList" :key="index">
				<view class="grid-item" @click="handleClick(item)">
					<view class="icon-wrapper">
						<uni-icons :type="item.icon" size="32" :color="item.color"></uni-icons>
					</view>
					<text class="item-text">{{ item.name }}</text>
				</view>
			</uni-grid-item>
		</uni-grid>
	</view>
</template>

<script>
export default {
	name: 'ServiceGrid',
	data() {
		return {
			gridColumn: 4, // 每行显示4个
			serviceList: [
				{
					name: '学员库',
					icon: 'person-filled',
					color: '#333',
					path: '/pages/tutoring/parent/list'
				},
				{
					name: '教员库',
					icon: 'contact-filled',
					color: '#333',
					path: '/pages/tutoring/tutor/list'
				},
				{
					name: '请家教',
					icon: 'calendar-filled',
					color: '#333',
					path: '/pages/tutoring/parent/apply'
				},
				{
					name: '做教员',
					icon: 'vip-filled',
					color: '#333',
					path: '/pages/tutoring/tutor/apply'
				},
				{
					name: '育见成长',
					icon: 'star-filled',
					color: '#333',
					path: '/pages/growup/index'
				},
				{
					name: '兼职日结',
					icon: 'wallet-filled',
					color: '#333',
					path: '/pages/jobs/list'
				},
				{
					name: '活动沙龙',
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
			// 路由跳转
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

.section-title {
	font-size: 18px;
	font-weight: bold;
	color: #333;
	margin-bottom: 15px;
}

.grid-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 15px 0;
}

.icon-wrapper {
	width: 60px;
	height: 60px;
	background-color: #F5F5F5;
	border-radius: 50%;
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
