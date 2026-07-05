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

		<image
			class="banner-image"
			:src="banners[0].imageSrc"
			:alt="banners[0].alt"
			mode="widthFix"
			@click="openLoginPopup"
		></image>

		<LoginPopup :auto-open="shouldAutoOpenLogin" @close="handleLoginPopupClose" />

		<!-- 服务项目组件 -->
		<service-grid></service-grid>

		<!-- 分类速查组件 -->
		<!-- <category-quick-search></category-quick-search> -->

		<!-- 底部组件 -->
		<homebottom></homebottom>
	</view>
</template>

<script>
import homebottom from '@/components/HomeBottom/HomeBottom.vue'
// import CategoryQuickSearch from '@/components/CategoryQuickSearch/CategoryQuickSearch.vue'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'
import ServiceGrid from '@/components/ServiceGrid/ServiceGrid.vue'
import { listWxminiDept } from '@/api/wxmini/dept'
import { useLocationStore } from '@/store'
import { findCityNodeByName } from '@/utils/pca'
import { HOME_BANNER_ITEMS } from './home-banner'

export default {
	components: {
		homebottom,
		// CategoryQuickSearch,
		LoginPopup,
		ServiceGrid
	},
	data() {
		return {
			banners: HOME_BANNER_ITEMS,
			cityIndex: 0,
			range: [{ text: '南京市', value: undefined }],
			citys: [],
			selectedCityText: '南京市',
			shouldAutoOpenLogin: false
		}
	},
	computed: {

	},
	async mounted() {
		await this.loadDepartments()
		await this.getAreas()
	},
	methods: {
		async loadDepartments() {
			try {
				const res = await listWxminiDept({ deptName: '南京市' })
				const rows = Array.isArray(res?.data) ? res.data : []
				if (rows.length > 0) {
					this.range = rows.map(item => ({ text: item.deptName, value: item.deptId }))
				}
				const nanjingIndex = this.range.findIndex(item => item.text === '南京市')
				this.cityIndex = nanjingIndex >= 0 ? nanjingIndex : 0
				this.selectedCityText = this.range[this.cityIndex]?.text || '南京市'
				useLocationStore().setDepartment({
					deptId: this.range[this.cityIndex]?.value,
					deptName: this.selectedCityText
				})
			} catch (error) {
				console.error('加载部门失败', error)
			}
		},

		async getAreas() {
			const cityNode = await findCityNodeByName(this.selectedCityText)

			if (cityNode) {
				useLocationStore().setCity(cityNode)
			}
		},

		async change(e) {
			this.cityIndex = e.detail.value
			this.selectedCityText = this.range[this.cityIndex].text
			useLocationStore().setDepartment({
				deptId: this.range[this.cityIndex]?.value,
				deptName: this.selectedCityText
			})

			await this.getAreas()
		},

		openLoginPopup() {
			this.shouldAutoOpenLogin = true
		},

		handleLoginPopupClose() {
			this.shouldAutoOpenLogin = false
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
.banner-image {
	display: block;
	width: 100%;
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
