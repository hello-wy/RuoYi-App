<template>
	<view class="home-page">
		<!-- 在这里添加一个地图选择以及定位 -->
		<view style="padding: 20rpx; background-color: #fff; display: flex; flex-direction: row; align-items: center; justify-content: flex-start;">
			<uni-icons type="location-filled" size="20" color="#000"></uni-icons>
			<picker style="margin-left: 5rpx;" :range="range" range-key="text" :value="cityIndex" @change="change">
				<view class="city-picker">
					<text class="city-name">{{ selectedCityText }}</text>
					<uni-icons type="down" size="12" color="#000"></uni-icons>
				</view>
			</picker>
      <!-- <uni-data-picker placeholder="请选择城市" :localdata="citys" v-model="cityValue" @change="changeCity" popup-title="请选择城市">
      </uni-data-picker> -->
		</view>

		<swiper class="swiper" circular :indicator-dots="true" :autoplay="true" :interval="5000"
			:duration="duration" style="padding: 20rpx;">
			<swiper-item style="background-color: red;">
				<view >A</view>
			</swiper-item>
			<swiper-item style="background-color: green;">
				<view >B</view>
			</swiper-item>
			<swiper-item style="background-color: blue;">
				<view>C</view>
			</swiper-item>
		</swiper>

		<!-- 服务项目组件 -->
		<service-grid></service-grid>

		<!-- 分类速查组件 -->
		<!-- <category-quick-search></category-quick-search> -->

		<!-- 底部组件 -->
		<homebottom></homebottom>
	</view>
</template>

<script>
import homebottom from '@/pages/common/bottom/bottom'
// import CategoryQuickSearch from '@/components/CategoryQuickSearch/CategoryQuickSearch.vue'
import ServiceGrid from '@/components/ServiceGrid/ServiceGrid.vue'
import { useLocationStore } from '@/store'
import { findCityNodeByName } from '@/utils/pca'

export default {
	components: {
		homebottom,
		// CategoryQuickSearch,
		ServiceGrid
	},
	data() {
		return {
			cityIndex: 0,
			range: [{ text: '南京市', value: '3201' }],
			citys: [],
			selectedCityText: '南京市',
			duration: 500
		}
	},
	computed: {

	},
	async mounted() {
		await this.getAreas()
	},
	methods: {
		async getAreas() {
			const cityNode = await findCityNodeByName(this.selectedCityText)

			if (cityNode) {
				useLocationStore().setCity(cityNode)
			}
		},

		async change(e) {
			this.cityIndex = e.detail.value
			this.selectedCityText = this.range[this.cityIndex].text

			await this.getAreas()
		},

		// changeCity(e) {
    //   let cityNode = null
		// 	this.cityIndex = e.detail.value[1].value
    //   if (e.detail.value[1].text == "市辖区"){
    //     this.selectedCityText = e.detail.value[0].text
    //     cityNode = pcaData.find(p => p.text == this.selectedCityText)
    //   }else{
    //     this.selectedCityText = e.detail.value[1].text
    //     cityNode = pcaData.find(p => p.children.find(c => c.text == this.selectedCityText))
    //   }
    //   console.log(this.selectedCityText);

		// 	console.log(cityNode);

		// 	if (cityNode) {
		// 		// 同步到 store，更新区县列表
		// 		useLocationStore().setCity(cityNode)
		// 	}

		// }
	}
}
</script>

<style scoped>
.home-page {
	min-height: 100vh;
	background-color: #e2e8f0;
}
.city-picker {
	display: flex;
	flex-direction: row;
	align-items: center;
}
.city-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #000;
	margin-right: 6rpx;
}
.city-arrow {
	font-size: 22rpx;
	color: #000;
	line-height: 1;
}
</style>
