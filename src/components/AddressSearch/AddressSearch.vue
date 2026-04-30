<template>
	<view class="address-search-wrap">
		<text class="form-label">详细地址</text>
		<view class="search-input-row">
			<input
				class="form-input flex-1"
				:value="modelValue"
				:placeholder="placeholder"
				@input="onInput"
				@focus="onFocus"
				@blur="onBlur"
			/>
			<!-- 清空按钮 -->
			<view v-if="modelValue" class="clear-btn" @click="onClear">
				<uni-icons type="clear" size="16" color="#aaa"></uni-icons>
			</view>
		</view>

		<!-- 建议列表 -->
		<view v-if="showSuggestions && suggestions.length > 0" class="suggestions-wrap">
			<scroll-view scroll-y class="suggestions-list" :style="{ maxHeight: '240px' }">
				<view
					v-for="(item, index) in suggestions"
					:key="index"
					class="suggestion-item"
					@click="selectSuggestion(item)"
				>
					<view class="suggestion-icon">
						<uni-icons type="location-filled" size="14" color="#3B82F6"></uni-icons>
					</view>
					<view class="suggestion-content">
						<text class="suggestion-title">{{ item.title }}</text>
						<text class="suggestion-address" v-if="item.address">{{ item.address }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 加载中 -->
		<view v-if="loading" class="loading-tip">
			<text class="loading-text">搜索中...</text>
		</view>
	</view>
</template>

<script>
const TENCENT_MAP_KEY = 'BNTBZ-UATWM-HE56Y-66QCJ-USA4Q-Z3F3Z'

export default {
	name: 'AddressSearch',
	props: {
		modelValue: {
			type: String,
			default: ''
		},
		city: {
			type: String,
			default: ''
		},
		placeholder: {
			type: String,
			default: '请输入小区/街道/标志性建筑'
		}
	},
	emits: ['update:modelValue', 'change', 'select', 'update:location', 'update:geo', 'update:region'],
	data() {
		return {
			suggestions: [],
			showSuggestions: false,
			loading: false,
			debounceTimer: null,
			// 标记是否刚刚选中了一个建议（避免 blur 时立即关闭导致点击失效）
			selecting: false
		}
	},
	methods: {
		onInput(e) {
			const val = e.detail.value
			this.$emit('update:modelValue', val)
			this.$emit('change', val)

			if (this.debounceTimer) clearTimeout(this.debounceTimer)

			if (!val || val.trim().length < 1) {
				this.suggestions = []
				this.showSuggestions = false
				return
			}

			this.debounceTimer = setTimeout(() => {
				this.fetchSuggestions(val)
			}, 300)
		},

		onFocus() {
			if (this.suggestions.length > 0) {
				this.showSuggestions = true
			}
		},

		onBlur() {
			// 延迟隐藏，让 click 事件先触发
			setTimeout(() => {
				if (!this.selecting) {
					this.showSuggestions = false
				}
				this.selecting = false
			}, 200)
		},

		onClear() {
			this.$emit('update:modelValue', '')
			this.$emit('change', '')
			this.suggestions = []
			this.showSuggestions = false
		},

		selectSuggestion(item) {
			this.selecting = true
			// 输入框 v-model
			this.$emit('update:modelValue', item.title)
			this.$emit('change', item.title)

			// address → location
			const location = item.address || ''
			this.$emit('update:location', location)

			// {lat, lng} → "lng,lat" 字符串 → geo
			const loc = item.location
			const geo = (loc && loc.lng != null && loc.lat != null)
				? `${loc.lng},${loc.lat}`
				: ''
			this.$emit('update:geo', geo)

			// district → region
			const region = item.district
			this.$emit('update:region', region)

			// 完整数据
			this.$emit('select', { ...item, location, geo, region })

			this.showSuggestions = false
			this.suggestions = []
		},

		fetchSuggestions(keyword) {
			if (!keyword) return
			this.loading = true

			const params = {
				keyword,
				key: TENCENT_MAP_KEY,
				output: 'json'
			}
			if (this.city) {
				params.region = this.city
				params.region_fix = 1
			}

			// 构建 URL
			const query = Object.keys(params)
				.map(k => `${k}=${encodeURIComponent(params[k])}`)
				.join('&')
			const url = `https://apis.map.qq.com/ws/place/v1/suggestion?${query}`

			uni.request({
				url,
				method: 'GET',
				success: (res) => {
					if (res.statusCode === 200 && res.data && res.data.status === 0) {
						this.suggestions = (res.data.data || []).map(item => ({
							title: item.title || '',
							address: item.address || '',
							location: item.location || null,
							district: item.district || '',
							id: item.id || ''
						}))
						this.showSuggestions = this.suggestions.length > 0
					} else {
						this.suggestions = []
						this.showSuggestions = false
					}
				},
				fail: (err) => {
					console.error('[AddressSearch] 搜索失败', err)
					this.suggestions = []
					this.showSuggestions = false
				},
				complete: () => {
					this.loading = false
				}
			})
		}
	},
	beforeDestroy() {
		if (this.debounceTimer) clearTimeout(this.debounceTimer)
	}
}
</script>

<style lang="scss" scoped>
.address-search-wrap {
	margin-bottom: 16px;
	position: relative;
}

.form-label {
	display: block;
	font-size: 13px;
	color: #64748b;
	margin-bottom: 6px;
}

.search-input-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	background: #f8fafc;
	border: 1.5px solid #e2e8f0;
	border-radius: 10px;
	padding: 0 14px;
	height: 44px;
	box-sizing: border-box;
}

.form-input {
	flex: 1;
	height: 44px;
	font-size: 14px;
	color: #1e293b;
	background: transparent;
	border: none;
	padding: 0;
}

.clear-btn {
	margin-left: 6px;
	display: flex;
	align-items: center;
	padding: 4px;
}

.suggestions-wrap {
	position: absolute;
	left: 0;
	right: 0;
	top: 72px;
	background: #fff;
	border-radius: 12px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
	z-index: 999;
	overflow: hidden;
}

.suggestions-list {
	max-height: 240px;
}

.suggestion-item {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	padding: 12px 14px;
	border-bottom: 1px solid #f1f5f9;

	&:last-child {
		border-bottom: none;
	}

	&:active {
		background: #f8fafc;
	}
}

.suggestion-icon {
	margin-right: 10px;
	margin-top: 2px;
	flex-shrink: 0;
}

.suggestion-content {
	flex: 1;
}

.suggestion-title {
	font-size: 14px;
	color: #1e293b;
	display: block;
	line-height: 1.4;
}

.suggestion-address {
	font-size: 12px;
	color: #94a3b8;
	display: block;
	margin-top: 2px;
	line-height: 1.4;
}

.loading-tip {
	padding: 8px 14px;
}

.loading-text {
	font-size: 12px;
	color: #94a3b8;
}
</style>
