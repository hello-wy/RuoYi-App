<template>
	<view class="category-quick-search">
		<uni-section title="家教分类速查" type="line" titleFontSize="18px">
		</uni-section>

		<view style="padding: 0 20px;">
			<!-- 区域分类 -->
			<view class="category-section">
				<view class="category-header">
					<text class="category-title">区域</text>
					<view class="more-btn" @click="toggleSection('area')">
						<text class="more-text">{{ expandedSections.area ? '收起' : '更多' }}</text>
						<text class="more-icon">{{ expandedSections.area ? '-' : '+' }}</text>
					</view>
				</view>
				<view class="category-content select-tags" :class="{ 'expanded': expandedSections.area }">
					<view
						v-for="item in areaList"
						:key="item.value"
						class="select-tag"
						@click="onItemClick('region', item)"
					>
						<text class="select-tag-text">{{ item.text }}</text>
					</view>
				</view>
			</view>

			<!-- 科目分类 -->
			<view class="category-section">
				<view class="category-header">
					<text class="category-title">科目</text>
					<view class="more-btn" @click="toggleSection('subject')">
						<text class="more-text">{{ expandedSections.subject ? '收起' : '更多' }}</text>
						<text class="more-icon">{{ expandedSections.subject ? '-' : '+' }}</text>
					</view>
				</view>
				<view class="category-content select-tags" :class="{ 'expanded': expandedSections.subject }">
					<view
						v-for="item in subjectList"
						:key="item.value"
						class="select-tag"
						@click="onItemClick('subject', item)"
					>
						<text class="select-tag-text">{{ item.text }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import dictMixin from '@/mixins/dict'
import { useLocationStore } from '@/store'

export default {
	name: 'CategoryQuickSearch',
	dicts: ['sys_subject'],
	mixins: [dictMixin],
	data() {
		return {
			expandedSections: {
				area: false,
				subject: false
			}
		}
	},
	computed: {
		/**
		 * 区域列表：来自 LocationStore 中当前城市的区县数据
		 * 格式：[{ value: '320102', text: '玄武区' }, ...]
		 */
		areaList() {
			return useLocationStore().districts
		},
		/**
		 * 科目列表：来自字典 sys_subject
		 * 格式：[{ value: '1', text: '语文' }, ...]
		 */
		subjectList() {
			return (this.dict.type.sys_subject || []).map(item => ({
				value: item.value,
				text: item.label
			}))
		}
	},
	methods: {
		toggleSection(section) {
			this.expandedSections[section] = !this.expandedSections[section]
		},
		/**
		 * 点击某个标签，跳转到学员库并预设筛选条件
		 * @param {string} filterKey - 'region' | 'subject'
		 * @param {{ value: string, text: string }} item
		 */
		onItemClick(filterKey, item) {
			if (filterKey === 'region') {
				// 区域需要传 value（如 320102），学员库根据这个值进行筛选
				uni.navigateTo({
					url: `/pages/tutoring/parent/list?${filterKey}=${encodeURIComponent(item.text)}`
				})
			} else {
				// 科目直接传 text（如 语文），学员库根据这个值进行筛选
				uni.navigateTo({
					url: `/pages/tutoring/parent/list?${filterKey}=${encodeURIComponent(item.value)}`
				})
			}
		}
	}
}
</script>

<style lang="scss" scoped>
@import '@/static/scss/select-tag.scss';

.category-quick-search {
	background-color: #fff;
	padding: 10px 15px;
}

/* 头部 */
.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15px;
}

.title {
	display: flex;
	align-items: center;
}

.icon {
	color: #FF6600;
	font-size: 20px;
	font-weight: bold;
	margin-right: 5px;
}

.title-text {
	font-size: 18px;
	font-weight: bold;
	color: #333;
}

/* 搜索框 */
.search-box {
	position: relative;
	margin-bottom: 20px;
}

.search-input {
	width: 100%;
	height: 40px;
	background-color: #F5F5F5;
	border-radius: 20px;
	padding: 0 40px 0 15px;
	font-size: 14px;
	box-sizing: border-box;
}

.search-icon {
	position: absolute;
	right: 15px;
	top: 50%;
	transform: translateY(-50%);
	font-size: 16px;
}

/* 分类区域 */
.category-section {
	margin-bottom: 20px;
}

.category-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
}

.category-title {
	font-size: 16px;
	font-weight: bold;
	padding: 0 10px;
	/* color: #FF6600; */
}

.more-btn {
	display: flex;
	align-items: center;
	color: #71717A;
	cursor: pointer;
}

.more-text {
	font-size: 14px;
	margin-right: 3px;
}

.more-icon {
	font-size: 18px;
	font-weight: bold;
}

.category-content {
	display: flex;
	flex-wrap: wrap;
	max-height: 40px; /* 只显示第一行，约40px */
	overflow: hidden;
	transition: max-height 0.3s ease;
}

.category-content.expanded {
	max-height: 1000px; /* 展开时的最大高度 */
}

/* .select-tag 样式由 @/static/scss/select-tag.scss 提供 */
</style>
