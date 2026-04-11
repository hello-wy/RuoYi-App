<template>
	<view class="page">
		<!-- 筛选 Tab -->
		<view class="tab-bar">
			<view
				v-for="(tab, idx) in tabs"
				:key="idx"
				class="tab-item"
				:class="activeTab === idx ? 'tab-active' : ''"
				@click="switchTab(idx)"
			>
				<text class="tab-text" :class="activeTab === idx ? 'tab-text-active' : ''">{{ tab }}</text>
			</view>
		</view>

		<scroll-view
			scroll-y
			class="scroll-body"
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="loadMore"
		>
			<!-- 搜索栏 -->
			<view class="search-wrap">
				<view class="search-bar">
					<uni-icons type="search" size="15" color="#94a3b8"></uni-icons>
					<input
						class="search-input"
						v-model="keyword"
						placeholder="搜索资料名称"
						placeholder-class="search-placeholder"
						@input="onSearch"
					/>
					<uni-icons v-if="keyword" type="clear" size="15" color="#94a3b8" @click="clearSearch"></uni-icons>
				</view>
			</view>

			<view v-if="list.length === 0 && !loading" class="empty-wrap">
				<uni-icons type="folder-filled" size="52" color="#e2e8f0"></uni-icons>
				<text class="empty-text">暂无资料</text>
			</view>

			<view class="list-wrap">
				<view
					v-for="item in list"
					:key="item.id"
					class="material-card"
					@click="openMaterial(item)"
				>
					<!-- 文件类型图标 -->
					<view class="file-icon-wrap" :style="{ background: getFileColor(item.fileType) }">
						<text class="file-icon-text">{{ getFileExt(item.filePath) }}</text>
					</view>

					<view class="material-info">
						<text class="material-name">{{ item.name }}</text>
						<view class="material-meta">
							<text class="material-size">{{ item.fileSize || '--' }}</text>
							<text class="meta-dot">·</text>
							<text class="material-date">{{ item.createTime }}</text>
						</view>
						<view class="material-tags">
							<view v-if="item.category" class="material-tag">
								<text class="material-tag-text">{{ item.category }}</text>
							</view>
						</view>
					</view>

					<view class="material-action" @click.stop="downloadMaterial(item)">
						<uni-icons type="download-filled" size="20" color="#3B82F6"></uni-icons>
					</view>
				</view>
			</view>

			<view v-if="hasMore" class="load-more">
				<text class="load-more-text">{{ loading ? '加载中...' : '' }}</text>
			</view>
			<view v-else-if="list.length > 0" class="no-more">
				<text class="no-more-text">已加载全部资料</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { listMaterials } from '@/api/system/growup'

export default {
	data() {
		return {
			tabs: ['全部', 'PPT', 'PDF', '视频', '其他'],
			activeTab: 0,
			keyword: '',
			list: [],
			loading: false,
			refreshing: false,
			pageNum: 1,
			pageSize: 10,
			total: 0,
			searchTimer: null
		}
	},
	computed: {
		hasMore() {
			return this.list.length < this.total && this.total > 0
		},
		currentType() {
			const map = ['', 'ppt', 'pdf', 'video', 'other']
			return map[this.activeTab] || ''
		}
	},
	onLoad() {
		this.load()
	},
	methods: {
		async load(reset = false) {
			if (this.loading) return
			if (reset) {
				this.pageNum = 1
				this.list = []
			}
			this.loading = true
			try {
				const res = await listMaterials({
					pageNum: this.pageNum,
					pageSize: this.pageSize,
					name: this.keyword || undefined,
					fileType: this.currentType || undefined
				})
				const rows = res.rows || []
				this.total = res.total || 0
				this.list = reset ? rows : [...this.list, ...rows]
				this.pageNum++
			} catch (e) {
				uni.showToast({ title: '加载失败，请重试', icon: 'none' })
			} finally {
				this.loading = false
			}
		},
		switchTab(idx) {
			if (this.activeTab === idx) return
			this.activeTab = idx
			this.load(true)
		},
		onSearch() {
			clearTimeout(this.searchTimer)
			this.searchTimer = setTimeout(() => this.load(true), 400)
		},
		clearSearch() {
			this.keyword = ''
			this.load(true)
		},
		async onRefresh() {
			this.refreshing = true
			await this.load(true)
			this.refreshing = false
		},
		loadMore() {
			if (!this.hasMore || this.loading) return
			this.load()
		},
		openMaterial(item) {
			if (item.filePath) {
				uni.navigateTo({
					url: '/pages/common/webview/index?url=' + encodeURIComponent(item.filePath) + '&title=' + encodeURIComponent(item.name)
				})
			}
		},
		downloadMaterial(item) {
			if (!item.filePath) {
				uni.showToast({ title: '文件不存在', icon: 'none' })
				return
			}
			uni.showLoading({ title: '准备下载...' })
			uni.downloadFile({
				url: item.filePath,
				success: (res) => {
					uni.hideLoading()
					if (res.statusCode === 200) {
						uni.openDocument({
							filePath: res.tempFilePath,
							showMenu: true,
							fail: () => {
								uni.showToast({ title: '无法打开该文件', icon: 'none' })
							}
						})
					}
				},
				fail: () => {
					uni.hideLoading()
					uni.showToast({ title: '下载失败，请重试', icon: 'none' })
				}
			})
		},
		getFileExt(path) {
			if (!path) return 'FILE'
			const parts = path.split('.')
			return (parts[parts.length - 1] || 'FILE').toUpperCase().slice(0, 4)
		},
		getFileColor(type) {
			const map = {
				ppt:   '#FF6B35',
				pdf:   '#EF4444',
				video: '#8B5CF6',
				doc:   '#3B82F6',
				xls:   '#10B981'
			}
			return map[type] || '#64748b'
		}
	}
}
</script>

<style lang="scss">
page {
	background: #f4f6fb;
	height: 100%;
}

.page {
	height: 100%;
	display: flex;
	flex-direction: column;
	background: #f4f6fb;
}

/* ===== Tab ===== */
.tab-bar {
	display: flex;
	flex-direction: row;
	background: #fff;
	padding: 0 16px;
	border-bottom: 1px solid #f1f5f9;
}

.tab-item {
	padding: 12px 14px;
	position: relative;
}

.tab-text {
	font-size: 14px;
	color: #64748b;
}

.tab-text-active {
	color: #3B82F6;
	font-weight: 700;
}

.tab-active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 14px;
	right: 14px;
	height: 2px;
	background: #3B82F6;
	border-radius: 1px;
}

/* ===== 滚动区 ===== */
.scroll-body {
	flex: 1;
	height: 0;
}

/* ===== 搜索 ===== */
.search-wrap {
	padding: 12px 16px;
}

.search-bar {
	display: flex;
	flex-direction: row;
	align-items: center;
	background: #fff;
	border-radius: 24px;
	padding: 9px 14px;
	gap: 8px;
	box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}

.search-input {
	flex: 1;
	font-size: 14px;
	color: #1e293b;
	height: 20px;
}

.search-placeholder {
	color: #94a3b8;
	font-size: 14px;
}

/* ===== 空态 ===== */
.empty-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 60px 0;
	gap: 12px;
}

.empty-text {
	font-size: 14px;
	color: #94a3b8;
}

/* ===== 列表 ===== */
.list-wrap {
	padding: 0 16px 16px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.material-card {
	display: flex;
	flex-direction: row;
	align-items: center;
	background: #fff;
	border-radius: 14px;
	padding: 14px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.05);
	gap: 12px;
}

.file-icon-wrap {
	width: 46px;
	height: 46px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.file-icon-text {
	font-size: 11px;
	font-weight: 700;
	color: #fff;
	letter-spacing: -0.5px;
}

.material-info {
	flex: 1;
}

.material-name {
	display: block;
	font-size: 14px;
	font-weight: 600;
	color: #1e293b;
	margin-bottom: 4px;
}

.material-meta {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 6px;
	margin-bottom: 4px;
}

.material-size,
.material-date {
	font-size: 11px;
	color: #94a3b8;
}

.meta-dot {
	font-size: 11px;
	color: #cbd5e1;
}

.material-tags {
	display: flex;
	flex-direction: row;
	gap: 6px;
}

.material-tag {
	background: #EFF6FF;
	border-radius: 4px;
	padding: 2px 7px;
}

.material-tag-text {
	font-size: 11px;
	color: #3B82F6;
}

.material-action {
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #EFF6FF;
	border-radius: 8px;
	flex-shrink: 0;
}

/* ===== 加载更多 ===== */
.load-more {
	padding: 12px;
	text-align: center;
}

.load-more-text {
	font-size: 13px;
	color: #94a3b8;
}

.no-more {
	padding: 20px;
	text-align: center;
}

.no-more-text {
	font-size: 12px;
	color: #cbd5e1;
}
</style>
