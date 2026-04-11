<template>
	<view class="area-picker-wrap">
		<text class="form-label">授课地址（省/市/区）</text>
		<picker
			mode="multiSelector"
			:range="columns"
			range-key="text"
			:value="pickerIndexes"
			@columnchange="onColumnChange"
			@change="onChange"
			@cancel="onCancel"
		>
			<view class="picker-full-box">
				<text class="picker-text" :class="{ placeholder: !displayText }">
					{{ displayText || '请选择省 / 市 / 区' }}
				</text>
				<uni-icons type="bottom" size="12" color="#aaa"></uni-icons>
			</view>
		</picker>
	</view>
</template>

<script>
import { loadPcaData } from '@/utils/pca'
import { useLocationStore } from '@/store'

export default {
	name: 'AreaPicker',
	props: {
		modelValue: {
			type: Object,
			default: () => ({ province: '', city: '', district: '', code: '' })
		}
	},
	emits: ['update:modelValue', 'change'],
	data() {
		return {
			pcaData: [],
			// 当前三列的选中索引
			pickerIndexes: [0, 0, 0],
			// 三列数据 [ 省列表, 市列表, 区列表 ]
			columns: [[], [], []]
		}
	},
	computed: {
		displayText() {
			const v = this.modelValue
			if (!v || !v.district) return ''
			const parts = []
			if (v.province) parts.push(v.province)
			if (v.city && v.city !== v.province) parts.push(v.city)
			if (v.district) parts.push(v.district)
			return parts.join(' / ')
		}
	},
	async mounted() {
		this.pcaData = await loadPcaData()
		this.buildColumns()
		this.initFromStore()
	},
	methods: {
		// 构建所有省份列表（第一列）
		buildColumns() {
			const provinces = this.pcaData.map(p => ({ text: p.text, value: p.value, raw: p }))
			this.columns = [provinces, [], []]
			this.refreshCityColumn(0)
		},

		// 根据省索引刷新市列，然后触发区列刷新
		refreshCityColumn(provIndex) {
			const province = this.pcaData[provIndex]
			if (!province) return

			// 直辖市判断：第一个子节点 text 为 "市辖区"
			const isMunicipality =
				province.children &&
				province.children.length > 0 &&
				province.children[0].text === '市辖区'

			let cities = []
			if (isMunicipality) {
				// 直辖市只显示省本身作为市
				cities = [{ text: province.text, value: province.value, raw: province }]
			} else {
				cities = (province.children || []).map(c => ({ text: c.text, value: c.value, raw: c }))
			}

			this.$set(this.columns, 1, cities)
			this.refreshDistrictColumn(provIndex, 0, isMunicipality)
		},

		// 根据省/市索引刷新区列
		refreshDistrictColumn(provIndex, cityIndex, isMunicipality) {
			const province = this.pcaData[provIndex]
			if (!province) return

			let districts = []
			if (isMunicipality) {
				// 直辖市：展开所有 市辖区 下的子节点
				province.children.forEach(sub => {
					if (sub.children) {
						districts = districts.concat(
							sub.children.map(d => ({ text: d.text, value: d.value, raw: d }))
						)
					}
				})
			} else {
				const city = (province.children || [])[cityIndex]
				districts = city
					? (city.children || []).map(d => ({ text: d.text, value: d.value, raw: d }))
					: []
			}
			this.$set(this.columns, 2, districts)
		},

		// 列变化（滚动中）
		onColumnChange(e) {
			const { column, value } = e.detail
			const indexes = [...this.pickerIndexes]
			indexes[column] = value

			if (column === 0) {
				// 省变化 → 重置市和区索引为 0
				indexes[1] = 0
				indexes[2] = 0
				this.pickerIndexes = indexes
				const isMunicipality =
					this.pcaData[value] &&
					this.pcaData[value].children &&
					this.pcaData[value].children[0] &&
					this.pcaData[value].children[0].text === '市辖区'
				this.refreshCityColumn(value)
				this.refreshDistrictColumn(value, 0, isMunicipality)
			} else if (column === 1) {
				// 市变化 → 重置区索引为 0
				indexes[2] = 0
				this.pickerIndexes = indexes
				const provIndex = indexes[0]
				const isMunicipality =
					this.pcaData[provIndex] &&
					this.pcaData[provIndex].children &&
					this.pcaData[provIndex].children[0] &&
					this.pcaData[provIndex].children[0].text === '市辖区'
				this.refreshDistrictColumn(provIndex, value, isMunicipality)
			} else {
				this.pickerIndexes = indexes
			}
		},

		// 确认选择
		onChange(e) {
			const [pi, ci, di] = e.detail.value
			this.pickerIndexes = [pi, ci, di]

			const province = this.columns[0][pi]
			const city = this.columns[1][ci]
			const district = this.columns[2][di]

			const result = {
				province: province ? province.text : '',
				city: city ? city.text : '',
				district: district ? district.text : '',
				code: district ? district.value : (city ? city.value : '')
			}
			this.$emit('update:modelValue', result)
			this.$emit('change', result)
		},

		onCancel() {},

		// 初始化：从 store 的当前城市设置默认值
		initFromStore() {
			// 如果父组件已经传入了有效值，优先使用
			if (this.modelValue && this.modelValue.district) {
				this.syncFromModelValue()
				return
			}

			const storeCity = useLocationStore().getCity()
			if (!storeCity || !storeCity.name) return

			// 在 pca 中找到该城市所在的省和市
			for (let pi = 0; pi < this.pcaData.length; pi++) {
				const province = this.pcaData[pi]
				const isMunicipality =
					province.children &&
					province.children.length > 0 &&
					province.children[0].text === '市辖区'

				if (isMunicipality) {
					if (province.text === storeCity.name) {
						this.refreshCityColumn(pi)
						const indexes = [pi, 0, 0]
						this.pickerIndexes = indexes

						// 发出根据第一个区的值
						const district = this.columns[2][0]
						const result = {
							province: province.text,
							city: province.text,
							district: district ? district.text : '',
							code: district ? district.value : ''
						}
						this.$emit('update:modelValue', result)
						this.$emit('change', result)
						return
					}
				} else {
					const ci = (province.children || []).findIndex(c => c.text === storeCity.name)
					if (ci >= 0) {
						this.refreshCityColumn(pi)
						const indexes = [pi, ci, 0]
						this.pickerIndexes = indexes
						this.refreshDistrictColumn(pi, ci, false)

						const district = this.columns[2][0]
						const result = {
							province: province.text,
							city: storeCity.name,
							district: district ? district.text : '',
							code: district ? district.value : ''
						}
						this.$emit('update:modelValue', result)
						this.$emit('change', result)
						return
					}
				}
			}
		},

		// 从 modelValue 同步 pickerIndexes（父组件有初始值时）
		syncFromModelValue() {
			const v = this.modelValue
			if (!v || !v.province) return

			for (let pi = 0; pi < this.pcaData.length; pi++) {
				if (this.pcaData[pi].text === v.province) {
					const isMunicipality =
						this.pcaData[pi].children &&
						this.pcaData[pi].children[0] &&
						this.pcaData[pi].children[0].text === '市辖区'
					this.refreshCityColumn(pi)

					let ci = 0
					if (!isMunicipality) {
						ci = Math.max(0, this.columns[1].findIndex(c => c.text === v.city))
					}
					this.refreshDistrictColumn(pi, ci, isMunicipality)

					const di = Math.max(0, this.columns[2].findIndex(d => d.text === v.district))
					this.pickerIndexes = [pi, ci, di]
					return
				}
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.area-picker-wrap {
	margin-bottom: 16px;
}

.form-label {
	display: block;
	font-size: 13px;
	color: #64748b;
	margin-bottom: 6px;
}

.picker-full-box {
	width: 100%;
	height: 44px;
	background: #f8fafc;
	border: 1.5px solid #e2e8f0;
	border-radius: 10px;
	padding: 0 14px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
}

.picker-text {
	font-size: 14px;
	color: #1e293b;
	flex: 1;
}

.picker-text.placeholder {
	color: #a0aec0;
}
</style>
