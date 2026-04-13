<template>
	<view class="page">
		<!-- 加载中 -->
		<view v-if="loading" class="loading-wrap">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<!-- 加载失败 -->
		<view v-else-if="error" class="error-wrap">
			<text>加载失败，请重试</text>
		</view>

		<!-- 内容 -->
		<view v-else-if="detail" class="content">

			<!-- 顶部 Profile -->
			<view class="profile-header">
				<view class="avatar-wrap">
					<image
						class="avatar"
						:src="detail.avatar || '/static/images/profile.jpg'"
						mode="aspectFill"
					></image>
					<view v-if="detail.isCertified === '已通过'" class="cert-dot">
						<uni-icons type="checkmarkempty" size="12" color="#fff"></uni-icons>
					</view>
				</view>
				<text class="profile-name">{{ getName(detail) }}</text>
				<text class="profile-sub">{{ detail.school || '--' }} · {{ detail.major || '--' }}</text>
				<view v-if="detail.isCertified === '已通过'" class="cert-badge">
					<uni-icons type="checkmarkempty" size="14" color="#10B981"></uni-icons>
					<text class="cert-text">实名认证已通过</text>
				</view>
			</view>

			<!-- 基本信息 -->
			<view class="section">
				<view class="section-header">
					<view class="section-bar"></view>
					<text class="section-title">基本信息</text>
				</view>
				<view class="info-grid">
					<view class="info-cell">
						<text class="info-key">姓名：</text>
						<text class="info-val">{{ getName(detail) }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">城市：</text>
						<text class="info-val">{{ getFirstArea(detail) }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">学历：</text>
						<dict-tag :options="dict.type.sys_degree" :value="detail.degree"/>
					</view>
					<view class="info-cell">
						<text class="info-key">院校：</text>
						<text class="info-val">{{ detail.school || '--' }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">专业：</text>
						<text class="info-val">{{ detail.major || '--' }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">生活：</text>
						<text class="info-val">{{ detail.live || '--' }}</text>
					</view>
					<view class="info-cell">
						<text class="info-key">工作：</text>
						<text class="info-val">{{ detail.work || '--' }}</text>
					</view>
				</view>
			</view>

			<!-- 擅长科目 -->
			<view class="section">
				<view class="section-header">
					<view class="section-bar"></view>
					<text class="section-title">擅长科目</text>
				</view>
				<view class="area-text">
					{{ getSubjectLabel(detail.subjects).join(',') || '暂未设置' }}
				</view>
			</view>

			<!-- 可授课区域 -->
			<view class="section">
				<view class="section-header">
					<view class="section-bar"></view>
					<text class="section-title">可授课区域</text>
				</view>
				<view class="area-row">
					<uni-icons type="location" size="16" color="#666"></uni-icons>

					<text class="area-text">
						{{ getDistrictLabel(detail.areas).join(',') }}。
					</text>
					<text class="area-text" v-if="detail.methods !== 0">支持线上授课。</text>
				</view>
			</view>

			<!-- 教学经历 -->
			<view class="section" v-if="detail.experience">
				<view class="section-header">
					<view class="section-bar"></view>
					<text class="section-title">教学经历</text>
				</view>
				<view class="exp-card">
					<view class="exp-dot-wrap">
						<view class="exp-dot"><uni-icons type="checkmarkempty" size="10" color="#fff"></uni-icons></view>
						<view class="exp-line"></view>
					</view>
					<view class="exp-body">
						<text class="exp-desc">{{ detail.experience }}</text>
					</view>
				</view>
			</view>

			<!-- 辅导方式 -->
			<view class="section">
				<view class="section-header">
					<view class="section-bar"></view>
					<text class="section-title">辅导方式</text>
				</view>
				<dict-tag :options="dict.type.sys_methods" :value="detail.methods"/>
			</view>

			<!-- 薪资要求 -->
			<view class="section">
				<view class="section-header">
					<view class="section-bar"></view>
					<text class="section-title">薪资要求</text>
				</view>
				<navigator url="/pages/price/list" class="salary-link">
					<uni-icons type="list" size="16" color="#3B82F6"></uni-icons>
					<text class="salary-link-text">查看薪资详情</text>
					<uni-icons type="right" size="14" color="#3B82F6"></uni-icons>
				</navigator>
			</view>

			<!-- 经历 -->
			<view class="section" v-if="detail.experience">
				<view class="section-header">
					<view class="section-bar"></view>
					<text class="section-title">经历</text>
				</view>
				<text class="rich-text">{{ detail.experience }}</text>
			</view>

			<!-- 证书 -->
			<view class="section" v-if="detail.certificate">
				<view class="section-header">
					<view class="section-bar"></view>
					<text class="section-title">证书</text>
				</view>
				<text class="rich-text">{{ detail.certificate }}</text>
			</view>

			<!-- 自我评价 -->
			<view class="section" v-if="detail.selfJudge">
				<view class="section-header">
					<view class="section-bar"></view>
					<text class="section-title">自我评价</text>
				</view>
				<text class="rich-text">{{ detail.selfJudge }}</text>
			</view>

			<!-- 底部占位 -->
			<view style="height: 240rpx;"></view>
		</view>

		<!-- 底部栏 -->
		<view class="bottom-bar">
			<button class="btn-apply btn-apply-text" type="primary" size="small" open-type="contact">立即申请</button>
		</view>
	</view>
</template>

<script>
import { getTutors } from '@/api/wxmini/tutoring'
import { useLocationStore } from '@/store'

export default {
	dicts: ['sys_degree','sys_subject','sys_methods'],
	data() {
		return {
			tutorId: '',
			detail: null,
			loading: false,
			error: false
		}
	},
	onLoad(options) {
		this.tutorId = options.id || ''
		this.loadDetail()
	},
	computed: {
		districtDictOptions() {
			return (useLocationStore().districts || []).map(d => ({
				value: d.value,
				label: d.text,
				elTagType: '',
				elTagClass: ''
			}))
		},
	},
	methods: {
		async loadDetail() {
			if (!this.tutorId) return
			this.loading = true
			this.error = false
			try {
				const res = await getTutors(this.tutorId)
				this.detail = res.data || res
			} catch (e) {
				this.error = true
				console.error('加载教员详情失败', e)
			} finally {
				this.loading = false
			}
		},
		getDistrictLabel(val) {
			const arr=[]
			val.split(',').map(v => {
				v=v.trim()
				const found = (this.districtDictOptions || []).find(d => String(d.value) === String(v))
				arr.push(found ? found.label : v)
			})	
			return arr
		},
		getSubjectLabel(val) {
			const arr=[]
			val.split(',').map(v => {
				v=v.trim()
				const found = (this.dict.type.sys_subject || []).find(d => String(d.value) === String(v))
				arr.push(found ? found.label : v)
			})	
			return arr
		},
		getName(item) {
			if (!item) return ''
			const nickname = item.nickname || ''
			return (nickname ? nickname.slice(0, 1) : '') + (item.title || '')
		},
		getFirstArea(item) {			
			return useLocationStore().city.name
		},
		formatAreas(areas) {
			if (!areas || !areas.length) return '暂未设置'
			return areas.replace(/,/g, '、')
		},
		book() {
			uni.showToast({ title: '预约功能开发中', icon: 'none' })
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background: #fff;
}

/* Profile 顶部 */
.profile-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 32rpx 28rpx;
	background: #fff;
}
.avatar-wrap {
	position: relative;
	width: 150rpx;
	height: 150rpx;
	margin-bottom: 16rpx;
}
.avatar {
	width: 150rpx;
	height: 150rpx;
	border-radius: 8rpx;
	background: #EEE;
}
.cert-dot {
	position: absolute;
	right: 0;
	bottom: 0;
	width: 36rpx;
	height: 36rpx;
	background: #1A1A1A;
	border-radius: 50%;
	border: 2rpx solid #fff;
	display: flex;
	align-items: center;
	justify-content: center;
}
.profile-name {
	font-size: 40rpx;
	font-weight: bold;
	color: #1A1A1A;
	margin-bottom: 8rpx;
}
.profile-sub {
	font-size: 26rpx;
	color: #888;
	margin-bottom: 16rpx;
}
.cert-badge {
	display: flex;
	flex-direction: row;
	align-items: center;
	background: #F0FDF4;
	border: 1rpx solid #BBF7D0;
	border-radius: 20rpx;
	padding: 6rpx 20rpx;
	gap: 6rpx;
}
.cert-text {
	font-size: 24rpx;
	color: #10B981;
}

/* 统计栏 */
.stats-bar {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	padding: 28rpx 32rpx;
	border-top: 1rpx solid #F0F0F0;
	border-bottom: 1rpx solid #F0F0F0;
	margin-bottom: 10rpx;
}
.stat-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.stat-num {
	font-size: 36rpx;
	font-weight: bold;
	color: #1A1A1A;
}
.stat-label {
	font-size: 22rpx;
	color: #999;
	margin-top: 4rpx;
}
.stat-divider {
	width: 1rpx;
	height: 48rpx;
	background: #DDD;
}

/* 章节 */
.section {
	padding: 28rpx 32rpx;
	border-bottom: 1rpx solid #F5F5F5;
}
.section-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 20rpx;
}
.section-bar {
	width: 6rpx;
	height: 32rpx;
	background: #1A1A1A;
	border-radius: 4rpx;
	margin-right: 12rpx;
}
.section-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #1A1A1A;
}

/* 基本信息网格 */
.info-grid {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	row-gap: 16rpx;
}
.info-cell {
	display: flex;
	flex-direction: row;
	width: 50%;
	align-items: flex-start;
}
.info-key {
	font-size: 26rpx;
	color: #888;
	width: 100rpx;
	flex-shrink: 0;
}
.info-val {
	font-size: 26rpx;
	color: #333;
	flex: 1;
	word-break: break-all;
}

/* 富文本段落 */
.rich-text {
	font-size: 26rpx;
	color: #555;
	line-height: 1.8;
	word-break: break-all;
}

/* 科目标签 */
.subject-tags {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 12rpx;
}
.subject-tag {
	background: #F3F4F6;
	color: #444;
	font-size: 26rpx;
	padding: 8rpx 22rpx;
	border-radius: 8rpx;
}

/* 区域 */
.area-row {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	gap: 8rpx;
}
.area-text {
	font-size: 26rpx;
	color: #555;
	line-height: 1.6;
	flex: 1;
}

/* 经历 */
.exp-card {
	display: flex;
	flex-direction: row;
}
.exp-dot-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-right: 16rpx;
}
.exp-dot {
	width: 28rpx;
	height: 28rpx;
	background: #10B981;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.exp-line {
	width: 2rpx;
	flex: 1;
	background: #E5E7EB;
	margin-top: 4rpx;
}
.exp-body {
	flex: 1;
	padding-bottom: 16rpx;
}
.exp-desc {
	font-size: 26rpx;
	color: #555;
	line-height: 1.7;
}

/* 辅导方式 */
.method-tags {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 16rpx;
}
.method-tag {
	border: 1rpx solid #E5E7EB;
	border-radius: 8rpx;
	padding: 10rpx 28rpx;
}
.method-text {
	font-size: 26rpx;
	color: #333;
}

/* 薪资链接 */
.salary-link {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 10rpx;
	background: #EFF6FF;
	border: 1rpx solid #BFDBFE;
	border-radius: 12rpx;
	padding: 20rpx 24rpx;
}
.salary-link-text {
	flex: 1;
	font-size: 28rpx;
	color: #3B82F6;
	font-weight: 500;
}

/* 薪资表格 */
.salary-table {
	background: #F9FAFB;
	border-radius: 12rpx;
	padding: 20rpx 24rpx;
}
.salary-row-header {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	margin-bottom: 12rpx;
}
.salary-th {
	font-size: 24rpx;
	color: #999;
	font-weight: 500;
}
.salary-tr {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 12rpx 0;
	border-top: 1rpx solid #EBEBEB;
}
.salary-td-label {
	font-size: 26rpx;
	color: #555;
}
.salary-td-val {
	font-size: 26rpx;
	color: #1A1A1A;
	font-weight: 500;
}
.salary-note {
	font-size: 22rpx;
	color: #999;
	display: block;
	margin-top: 12rpx;
}

/* 底部栏 */
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	border-top: 1rpx solid #ECECEC;
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 20rpx 32rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	gap: 24rpx;
}
.bottom-price {
	display: flex;
	flex-direction: row;
	align-items: baseline;
}
.bottom-price-num {
	font-size: 40rpx;
	font-weight: bold;
	color: #1A1A1A;
}
.bottom-price-unit {
	font-size: 24rpx;
	color: #888;
	margin-left: 4rpx;
}

/* 加载/错误 */
.loading-wrap, .error-wrap {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 100rpx 0;
}
.bottom-bar {
	position: sticky;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	border-top: 1rpx solid #ECECEC;
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 20rpx 32rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	gap: 24rpx;
}
.btn-apply {
	flex: 1;
	background: #1A1A1A;
	border-radius: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 9rpx 0;
}
.btn-apply-text {
	font-size: 30rpx;
	color: #fff;
	font-weight: bold;
}

</style>
