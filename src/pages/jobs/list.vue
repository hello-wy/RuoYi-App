<template>
	<view class="page">
		<!-- 分类快选栏 -->
		<scroll-view scroll-x class="category-bar">
			<view class="category-inner">
				<view
					v-for="cat in dict.type.sys_daily_category"
					:key="cat.value"
					class="cat-chip"
					:class="{ 'cat-chip-active': queryParams.category === cat.value }"
					@click="onCategoryClick(cat.value)"
				>
					<text class="cat-chip-text" :class="{ 'cat-chip-text-active': queryParams.category === cat.value }">
						{{ cat.label }}
					</text>
				</view>
			</view>
		</scroll-view>

		<!-- 筛选行：区域 + 状态 + 重置 -->
		<view class="filter-row">
			<picker
				mode="selector"
				:range="districtOptions"
				range-key="text"
				:value="districtIndex"
				@change="onDistrictChange"
			>
				<view class="filter-btn" :class="{ active: queryParams.districtId }">
					<text class="filter-btn-text">{{ districtLabel || '区域' }}</text>
					<uni-icons type="bottom" size="11" :color="queryParams.districtId ? '#3B82F6' : '#666'"></uni-icons>
				</view>
			</picker>

			<picker
				mode="selector"
				:range="statusOptions"
				range-key="label"
				:value="statusIndex"
				@change="onStatusChange"
			>
				<view class="filter-btn" :class="{ active: queryParams.status !== '' }">
					<text class="filter-btn-text">{{ statusLabel || '状态' }}</text>
					<uni-icons type="bottom" size="11" :color="queryParams.status !== '' ? '#3B82F6' : '#666'"></uni-icons>
				</view>
			</picker>

			<view v-if="hasFilter" class="filter-reset" @click="resetFilter">
				<text class="filter-reset-text">重置</text>
			</view>
		</view>

		<view v-if="showMerchantToolbar" class="merchant-toolbar">
			<view class="merchant-toolbar-text">
				<text class="merchant-toolbar-title">商家工作台</text>
				<text class="merchant-toolbar-desc">管理招聘与工资结算</text>
			</view>
			<view class="merchant-actions">
				<view class="merchant-action" @click="goMerchantPublish">
					<uni-icons type="compose" size="16" color="#2563eb"></uni-icons>
					<text class="merchant-action-text">发布招聘</text>
				</view>
				<view class="merchant-action primary" @click="goMerchantSignupUsers">
					<uni-icons type="list" size="16" color="#ffffff"></uni-icons>
					<text class="merchant-action-text primary-text">日结查询</text>
				</view>
			</view>
		</view>

		<!-- 加载中 -->
		<view v-if="loading && list.length === 0" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<!-- 加载失败 -->
		<view v-else-if="error && list.length === 0" class="error-wrap">
			<text class="error-text">加载失败，请重试</text>
			<view class="retry-btn" @click="loadData(true)">
				<text class="retry-text">重试</text>
			</view>
		</view>

		<!-- 列表 -->
		<scroll-view
			v-else
			scroll-y
			class="list-scroll"
			@scrolltolower="loadMore"
		>
			<view
				v-for="(item, index) in list"
				:key="item.id || index"
				class="card"
				@click="goDetail(item.id)"
			>
				<!-- 顶部：分类标签 + 薪资 -->
				<view class="card-top">
					<view class="cat-tag" :style="getCatStyle(item.category)">
						<text class="cat-tag-text">{{ getCatLabel(item.category) }}</text>
					</view>
					<view class="salary-wrap">
						<text class="salary-value">¥{{ item.salaryDay }}</text>
						<text class="salary-unit">/日</text>
					</view>
				</view>

				<!-- 标题 -->
				<text class="card-title">{{ item.title }}</text>

				<!-- 时间行 -->
				<view class="card-info-row">
					<uni-icons type="calendar" size="13" color="#888"></uni-icons>
					<text class="card-info-text">{{ item.workDate }} {{ item.workTime }}</text>
				</view>

				<!-- 地点行 -->
				<view class="card-info-row">
					<uni-icons type="location-filled" size="13" color="#888"></uni-icons>
					<text class="card-info-text">{{ item.location || getDistrictLabel(item.districtId) || '地点待定' }}</text>
				</view>

				<!-- 底部：状态 + ID -->
				<view class="card-bottom">
					<view class="status-badge" :class="getStatusClass(item.status)">
						<text class="status-badge-text">{{ getStatusLabel(item.status) }}</text>
					</view>
					<text class="card-id">ID #{{ formatId(item.id) }}</text>
				</view>
			</view>

			<uni-load-more
				:status="loadMoreStatus"
				@clickLoadMore="loadMore"
			></uni-load-more>
		</scroll-view>
	</view>
</template>

<script>
import { listJobs } from '@/api/system/jobs'
import { useLocationStore, useUserStore } from '@/store'
import { findDistrictNodeByCode } from '@/utils/pca'
import { USER_TYPES } from '@/utils/userType'
import { CATEGORY_OPTIONS, STATUS_OPTIONS, formatId, getCatLabel, getCatStyle, getStatusClass, getStatusLabel } from './list.helpers'

export default {
	dicts:['sys_daily_category'],
	data() {
		return {
			list: [],
			loading: false,
			error: false,
			page: 1,
			pageSize: 10,
			total: 0,
			hasMore: false,
			categoryOptions: CATEGORY_OPTIONS,
			statusOptions: STATUS_OPTIONS,
			queryParams: {
				category: '',
				districtId: '',
				status: ''
			}
		}
	},
	computed: {
		loadMoreStatus() {
			if (this.loading && this.list.length > 0) return 'loading'
			if (!this.hasMore) return 'noMore'
			return 'more'
		},
		districtOptions() {
			return [{ value: '', text: '全部区域' }, ...useLocationStore().districts]
		},
		districtIndex() {
			const idx = this.districtOptions.findIndex(d => String(d.value) === String(this.queryParams.districtId))
			return idx < 0 ? 0 : idx
		},
		districtLabel() {
			const found = this.districtOptions.find(d => String(d.value) === String(this.queryParams.districtId))
			return found && found.value ? found.text : ''
		},
		statusIndex() {
			const idx = this.statusOptions.findIndex(s => s.value === this.queryParams.status)
			return idx < 0 ? 0 : idx
		},
		statusLabel() {
			const found = this.statusOptions.find(s => s.value === this.queryParams.status)
			return found && found.value !== '' ? found.label : ''
		},
		hasFilter() {
			return this.queryParams.category !== '' || this.queryParams.districtId !== '' || this.queryParams.status !== ''
		},
		showMerchantToolbar() {
			return useUserStore().userType === USER_TYPES.MERCHANT
		}
	},
	onLoad() {
		this.loadData(true)
	},
	onPullDownRefresh() {
		this.loadData(true)
	},
	onReachBottom() {
		this.loadMore()
	},
	methods: {
		async loadData(reset = false) {
			if (this.loading) return
			if (reset) {
				this.page = 1
				this.list = []
				this.error = false
				this.hasMore = false
			}
			this.loading = true
			try {
				const params = {
					pageNum: this.page,
					pageSize: this.pageSize,
					orderByColumn: 'createDate',
					isAsc: 'desc',
					...this.queryParams
				}
				Object.keys(params).forEach(k => {
					if (params[k] === '' || params[k] === null || params[k] === undefined) {
						delete params[k]
					}
				})
				const res = await listJobs(params)
				const rows = res.rows || []
				const total = res.total || 0
				if (reset) {
					this.list = rows
				} else {
					this.list = this.list.concat(rows)
				}
				this.total = total
				this.hasMore = this.list.length < total
				if (this.hasMore) this.page++
				this.error = false
			} catch (e) {
				this.error = true
				console.error('加载兼职列表失败', e)
			} finally {
				this.loading = false
				uni.stopPullDownRefresh()
			}
		},
		loadMore() {
			if (!this.hasMore || this.loading) return
			this.loadData(false)
		},
		onCategoryClick(val) {
			this.queryParams.category = val
			this.loadData(true)
		},
		onDistrictChange(e) {
			const item = this.districtOptions[e.detail.value]
			this.queryParams.districtId = item ? item.value : ''
			this.loadData(true)
		},
		onStatusChange(e) {
			const item = this.statusOptions[e.detail.value]
			this.queryParams.status = item ? item.value : ''
			this.loadData(true)
		},
		resetFilter() {
			this.queryParams = { category: '', districtId: '', status: '' }
			this.loadData(true)
		},
		getCatLabel,
		getCatStyle,
		getStatusLabel,
		getStatusClass,
		formatId,
		getDistrictLabel(val) {
			if (!val) return ''
			const found = (this.districtOptions || []).find(d => String(d.value) === String(val))
			if (found) return found.text

			const district = findDistrictNodeByCode(val)
			return district ? district.text : ''
		},
		goDetail(id) {
			uni.navigateTo({ url: '/pages/jobs/detail?id=' + id })
		},
		goMerchantPublish() {
			uni.navigateTo({ url: '/pages/jobs/apply' })
		},
		goMerchantSignupUsers() {
			uni.navigateTo({ url: '/pages/jobs/signup-users' })
		}
	}
}
</script>

<style scoped src="./list.scss"></style>
