<template>
	<view class="filter-bar">
		<!-- 区域下拉框 -->
		<picker
			class="filter-picker"
			mode="selector"
			:range="districtOptions"
			range-key="text"
			:value="regionIndex"
			@change="onRegionChange"
		>
			<view class="filter-item" :class="{ active: value.region }">
				<text class="filter-text">{{ value.region ? getLabel(districtOptions, value.region) : '区域' }}</text>
				<uni-icons type="bottom" size="12" :color="value.region ? '#3B82F6' : '#555'"></uni-icons>
			</view>
		</picker>

		<!-- 科目下拉框 -->
		<picker
			class="filter-picker"
			mode="selector"
			:range="subjectOptions"
			range-key="text"
			:value="subjectIndex"
			@change="onSubjectChange"
		>
			<view class="filter-item" :class="{ active: value.subject }">
				<text class="filter-text">{{ value.subject ? getLabel(subjectOptions, value.subject) : '科目' }}</text>
				<uni-icons type="bottom" size="12" :color="value.subject ? '#3B82F6' : '#555'"></uni-icons>
			</view>
		</picker>

		<!-- 年级下拉框 -->
		<picker
			v-if="showGrade"
			class="filter-picker"
			mode="selector"
			:range="gradeOptions"
			range-key="text"
			:value="gradeIndex"
			@change="onGradeChange"
		>
			<view class="filter-item" :class="{ active: value.grade }">
				<text class="filter-text">{{ value.grade ? getLabel(gradeOptions, value.grade) : '年级' }}</text>
				<uni-icons type="bottom" size="12" :color="value.grade ? '#3B82F6' : '#555'"></uni-icons>
			</view>
		</picker>

		<!-- 授课方式下拉框 -->
		<picker
			class="filter-picker"
			mode="selector"
			:range="methodOptions"
			range-key="text"
			:value="methodIndex"
			@change="onMethodChange"
		>
			<view class="filter-item" :class="{ active: value.methods }">
				<text class="filter-text">{{ value.methods ? getLabel(methodOptions, value.methods) : '授课方式' }}</text>
				<uni-icons type="bottom" size="12" :color="value.methods ? '#3B82F6' : '#555'"></uni-icons>
			</view>
		</picker>

		<!-- 重置 -->
		<view v-if="hasFilter" class="filter-reset" @click="onReset">
			<text class="filter-reset-text">重置</text>
		</view>
	</view>
</template>

<script>
/**
 * TutoringFilterBar — 家教列表通用筛选栏
 *
 * Props:
 *   value         {Object}  当前筛选值，包含 { region, subject, grade, methods }
 *   districtOptions {Array} 区域选项列表，格式 [{ value, text }]
 *   subjectOptions  {Array} 科目选项列表，格式 [{ value, text }]
 *   gradeOptions    {Array} 年级选项列表，格式 [{ value, text }]
 *   methodOptions   {Array} 授课方式选项列表，格式 [{ value, text }]
 *
 * Events:
 *   change(newValue)  任意筛选项变化或重置时触发，newValue 是完整的新筛选对象
 *   reset()           点击重置时额外触发（value 已重置为空后）
 */
export default {
	name: 'TutoringFilterBar',
	props: {
		value: {
			type: Object,
			default: () => ({ region: '', subject: '', grade: '', methods: '' })
		},
		districtOptions: {
			type: Array,
			default: () => []
		},
		subjectOptions: {
			type: Array,
			default: () => []
		},
		gradeOptions: {
			type: Array,
			default: () => []
		},
		methodOptions: {
			type: Array,
			default: () => []
		},
		showGrade: {
			type: Boolean,
			default: true
		}
	},
	computed: {
		hasFilter() {
			return !!(this.value.region || this.value.subject || this.value.grade || this.value.methods)
		},
		regionIndex() {
			return Math.max(0, this.districtOptions.findIndex(o => o.value === this.value.region))
		},
		subjectIndex() {
			return Math.max(0, this.subjectOptions.findIndex(o => o.value === this.value.subject))
		},
		gradeIndex() {
			return Math.max(0, this.gradeOptions.findIndex(o => o.value === this.value.grade))
		},
		methodIndex() {
			return Math.max(0, this.methodOptions.findIndex(o => o.value === this.value.methods))
		}
	},
	methods: {
		getLabel(options, val) {
			const found = options.find(o => o.value === val)
			return found ? found.text : val
		},
		onRegionChange(e) {
			const idx = e.detail.value
			const region = (this.districtOptions[idx] && this.districtOptions[idx].value) || ''
			this.$emit('change', { ...this.value, region })
		},
		onSubjectChange(e) {
			const idx = e.detail.value
			const subject = (this.subjectOptions[idx] && this.subjectOptions[idx].value) || ''
			this.$emit('change', { ...this.value, subject })
		},
		onGradeChange(e) {
			const idx = e.detail.value
			const grade = (this.gradeOptions[idx] && this.gradeOptions[idx].value) || ''
			this.$emit('change', { ...this.value, grade })
		},
		onMethodChange(e) {
			const idx = e.detail.value
			const methods = (this.methodOptions[idx] && this.methodOptions[idx].value) || ''
			this.$emit('change', { ...this.value, methods })
		},
		onReset() {
			this.$emit('change', { region: '', subject: '', grade: '', methods: '' })
			this.$emit('reset')
		}
	}
}
</script>

<style scoped>
.filter-bar {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 20rpx 30rpx;
	background: #fff;
	border-bottom: 1rpx solid #ECECEC;
	gap: 16rpx;
	flex-wrap: wrap;
}

.filter-item {
	display: flex;
	flex-direction: row;
	align-items: center;
	background-color: #f3f4f6;
	/* border: 1rpx solid #DDD; */
	border-radius: 10rpx;
	padding: 12rpx 20rpx;
	gap: 6rpx;
	transition: all 0.2s;
}
.filter-item.active {
	border-color: #3B82F6;
	background-color: #EAF3FF;
}
.filter-item.active .filter-text {
	color: #3B82F6;
}
.filter-text {
	font-size: 26rpx;
	color: #333;
}

.filter-reset {
	margin-left: auto;
	padding: 8rpx 20rpx;
}
.filter-reset-text {
	font-size: 22rpx;
	color: #999;
}
</style>
