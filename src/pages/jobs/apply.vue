<template>
	<view class="page">
		<view class="page-body">

			<!-- ===== 发布提示卡片 ===== -->
			<view class="method-card method-hint">
				<view class="method-header">
					<view class="method-badge">
						<text class="method-num">!</text>
					</view>
					<text class="method-title">发布日结兼职</text>
				</view>
				<text class="method-desc">请如实填写工作信息，审核通过后将在平台展示。薪资按日结，工作日期请准确填写。</text>
			</view>

			<!-- ===== 基础信息表单 ===== -->
			<view class="method-card">
				<view class="method-header">
					<view class="method-badge method-badge-dark">
						<text class="method-num">1</text>
					</view>
					<text class="method-title">基础信息</text>
				</view>

				<!-- 工作标题 -->
				<view class="form-item">
					<text class="form-label">工作标题 *</text>
					<input
						class="form-input"
						v-model="form.title"
						placeholder="如：初中数学辅导日结兼职"
						maxlength="50"
					/>
				</view>

				<!-- 岗位分类 + 日结薪资 -->
				<view class="form-item">
					<text class="form-label">岗位分类 *</text>
					<view class="picker-row">
						<picker
							class="flex-1"
							mode="selector"
							:range="categoryOptions"
							range-key="label"
							:value="categoryIndex"
							@change="onCategoryChange"
						>
							<view class="picker-box">
								<text class="picker-text" :class="{ placeholder: !form.category }">
									{{ form.category !== '' ? getCatLabel(form.category) : '请选择分类' }}
								</text>
								<uni-icons type="bottom" size="14" color="#a0aec0"></uni-icons>
							</view>
						</picker>

						<view class="salary-input-wrap">
							<text class="form-label form-label-inline">日结薪资 *</text>
							<view class="salary-row">
								<text class="salary-prefix">¥</text>
								<input
									class="salary-input"
									v-model="form.salaryDay"
									type="digit"
									placeholder="0.00"
									maxlength="8"
								/>
								<text class="salary-suffix">/天</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 工作日期 -->
				<view class="form-item">
					<text class="form-label">工作日期 *</text>
					<picker mode="date" :value="form.workDate" @change="onDateChange">
						<view class="picker-full-box">
							<text class="picker-text" :class="{ placeholder: !form.workDate }">
								{{ form.workDate || '请选择日期' }}
							</text>
							<uni-icons type="calendar" size="14" color="#a0aec0"></uni-icons>
						</view>
					</picker>
				</view>

				<!-- 工作时段 -->
				<view class="form-item">
					<text class="form-label">工作时段 *</text>
					<view class="time-row">
						<picker
							mode="multiSelector"
							:range="timeRange"
							:value="startTimeIndex"
							@change="onStartTimeChange"
							@columnchange="onStartColumnChange"
						>
							<view class="picker-box">
								<text class="picker-text" :class="{ placeholder: !form.startTime }">
									{{ form.startTime || '开始时间' }}
								</text>
							</view>
						</picker>
						<text class="time-separator">至</text>
						<picker
							mode="multiSelector"
							:range="timeRange"
							:value="endTimeIndex"
							@change="onEndTimeChange"
							@columnchange="onEndColumnChange"
						>
							<view class="picker-box">
								<text class="picker-text" :class="{ placeholder: !form.endTime }">
									{{ form.endTime || '结束时间' }}
								</text>
							</view>
						</picker>
					</view>
				</view>
			</view>

			<!-- ===== 工作地点 ===== -->
			<view class="method-card">
				<view class="method-header">
					<view class="method-badge method-badge-dark">
						<text class="method-num">2</text>
					</view>
					<text class="method-title">工作地点</text>
				</view>

				<!-- 省市区 -->
				<area-picker v-model="form.region" @change="onRegionChange"></area-picker>

				<!-- 详细地址 -->
				<address-search
					v-model="form.location"
					:city="form.region.city"
					placeholder="搜索详细地址"
					@select="onAddressSelect"
				></address-search>
			</view>

			<!-- ===== 联系方式 ===== -->
			<view class="method-card">
				<view class="method-header">
					<view class="method-badge method-badge-dark">
						<text class="method-num">3</text>
					</view>
					<text class="method-title">联系方式</text>
				</view>

				<!-- 联系人姓名 -->
				<view class="form-item">
					<text class="form-label">联系人姓名 *</text>
					<input
						class="form-input"
						v-model="form.contacts"
						placeholder="请输入真实姓名"
						maxlength="20"
					/>
				</view>

				<!-- 联系电话 -->
				<view class="form-item">
					<text class="form-label">联系电话 *</text>
					<view class="form-input-row">
						<input
							class="form-input flex-1"
							v-model="form.phone"
							type="number"
							placeholder="请输入手机号"
							maxlength="11"
						/>
						<view class="use-phone-btn" @click="useLoginPhone">
							<text class="use-phone-text">用登录号</text>
						</view>
					</view>
				</view>
			</view>

			<!-- ===== 工作要求 ===== -->
			<view class="method-card">
				<view class="method-header">
					<view class="method-badge method-badge-dark">
						<text class="method-num">4</text>
					</view>
					<text class="method-title">工作要求</text>
				</view>

				<view class="form-item">
					<text class="form-label">具体要求描述 *</text>
					<textarea
						class="form-textarea"
						v-model="form.description"
						placeholder="请描述工作内容、着装要求、技能要求等..."
						:maxlength="500"
						auto-height
					/>
					<text class="word-count">{{ (form.description || '').length }}/500</text>
				</view>

				<view class="tips-row">
					<uni-icons type="info" size="12" color="#94a3b8"></uni-icons>
					<text class="tips-text">请确保信息真实有效，虚假信息将导致账号封禁。</text>
				</view>
			</view>

			<!-- 提交 -->
			<view class="submit-wrap">
				<view
					class="submit-btn"
					:class="{ disabled: submitting }"
					@click="handleSubmit"
				>
					<text class="submit-text">{{ submitting ? '提交中...' : '发布兼职' }}</text>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
import { addJobs } from '@/api/system/jobs'
import { getUserProfile } from '@/api/system/user'
import AreaPicker from '@/components/AreaPicker/AreaPicker.vue'
import AddressSearch from '@/components/AddressSearch/AddressSearch.vue'

const CATEGORY_OPTIONS = [
	{ value: '0', label: '家教' },
	{ value: '1', label: '助教' },
	{ value: '2', label: '派发' },
	{ value: '3', label: '其他' }
]

export default {
	components: { AreaPicker, AddressSearch },
	data() {
		return {
			submitting: false,
			userPhone: '',
			categoryOptions: CATEGORY_OPTIONS,
			timeRange: [
				Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + '时'),
				['00分', '30分']
			],
			startTimeIndex: [8, 0],
			endTimeIndex: [10, 0],
			form: {
				title: '',
				category: '',
				salaryDay: '',
				workDate: '',
				startTime: '',
				endTime: '',
				workTime: '',
				region: { province: '', city: '', district: '', code: '' },
				location: '',
				geo: '',
				districtId: '',
				contacts: '',
				phone: '',
				description: ''
			}
		}
	},
	computed: {
		categoryIndex() {
			const idx = CATEGORY_OPTIONS.findIndex(o => o.value === this.form.category)
			return idx < 0 ? 0 : idx
		}
	},
	onLoad() {
		this.loadUserPhone()
	},
	methods: {
		async loadUserPhone() {
			try {
				const res = await getUserProfile()
				this.userPhone = res.data.phonenumber || ''
				this.form.phone = this.userPhone
			} catch (e) {}
		},
		useLoginPhone() {
			if (this.userPhone) {
				this.form.phone = this.userPhone
				uni.showToast({ title: '已填入登录手机号', icon: 'none' })
			} else {
				uni.showToast({ title: '未获取到登录手机号', icon: 'none' })
			}
		},
		getCatLabel(val) {
			const found = CATEGORY_OPTIONS.find(o => o.value === String(val))
			return found ? found.label : '其他'
		},
		onCategoryChange(e) {
			this.form.category = (CATEGORY_OPTIONS[e.detail.value] && CATEGORY_OPTIONS[e.detail.value].value) || ''
		},
		onDateChange(e) {
			this.form.workDate = e.detail.value
		},
		indexToTime(hIdx, mIdx) {
			return String(hIdx).padStart(2, '0') + ':' + (mIdx === 0 ? '00' : '30')
		},
		onStartTimeChange(e) {
			const [h, m] = e.detail.value
			this.startTimeIndex = [h, m]
			this.form.startTime = this.indexToTime(h, m)
			this.form.workTime = this.form.startTime + (this.form.endTime ? '-' + this.form.endTime : '')
		},
		onStartColumnChange(e) {
			const cur = [...this.startTimeIndex]
			cur[e.detail.column] = e.detail.value
			this.startTimeIndex = cur
		},
		onEndTimeChange(e) {
			const [h, m] = e.detail.value
			this.endTimeIndex = [h, m]
			this.form.endTime = this.indexToTime(h, m)
			this.form.workTime = (this.form.startTime || '') + '-' + this.form.endTime
		},
		onEndColumnChange(e) {
			const cur = [...this.endTimeIndex]
			cur[e.detail.column] = e.detail.value
			this.endTimeIndex = cur
		},
		onRegionChange(val) {
			this.form.region = val
			this.form.districtId = val.code || ''
		},
		onAddressSelect(item) {
			if (!item) return
			this.form.location = item.address || item.title || ''
			this.form.geo = item.lng + ',' + item.lat
		},
		validate() {
			if (!this.form.title.trim()) {
				uni.showToast({ title: '请填写工作标题', icon: 'none' }); return false
			}
			if (this.form.category === '') {
				uni.showToast({ title: '请选择岗位分类', icon: 'none' }); return false
			}
			if (!this.form.salaryDay || isNaN(Number(this.form.salaryDay)) || Number(this.form.salaryDay) <= 0) {
				uni.showToast({ title: '请填写正确的日结薪资', icon: 'none' }); return false
			}
			if (!this.form.workDate) {
				uni.showToast({ title: '请选择工作日期', icon: 'none' }); return false
			}
			if (!this.form.startTime || !this.form.endTime) {
				uni.showToast({ title: '请选择工作时段', icon: 'none' }); return false
			}
			if (!this.form.region.district) {
				uni.showToast({ title: '请选择工作地址（省/市/区）', icon: 'none' }); return false
			}
			if (!this.form.location.trim()) {
				uni.showToast({ title: '请填写详细地址', icon: 'none' }); return false
			}
			if (!this.form.contacts.trim()) {
				uni.showToast({ title: '请填写联系人姓名', icon: 'none' }); return false
			}
			if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
				uni.showToast({ title: '请填写正确的手机号', icon: 'none' }); return false
			}
			if (!this.form.description.trim()) {
				uni.showToast({ title: '请填写工作要求描述', icon: 'none' }); return false
			}
			return true
		},
		async handleSubmit() {
			if (!this.validate()) return
			if (this.submitting) return
			this.submitting = true
			try {
				const payload = {
					title: this.form.title.trim(),
					category: this.form.category,
					salaryDay: this.form.salaryDay,
					workDate: this.form.workDate,
					workTime: this.form.workTime,
					location: this.form.location.trim(),
					districtId: this.form.districtId,
					contacts: this.form.contacts.trim(),
					phone: this.form.phone.trim(),
					description: this.form.description.trim(),
					geo: this.form.geo
				}
				await addJobs(payload)
				uni.showToast({ title: '发布成功', icon: 'success' })
				setTimeout(() => {
					uni.navigateBack()
				}, 1200)
			} catch (e) {
				console.error('发布失败', e)
				uni.showToast({ title: '发布失败，请重试', icon: 'none' })
			} finally {
				this.submitting = false
			}
		}
	}
}
</script>

<style lang="scss" scoped>
page {
	background: #f4f6fb;
}
.page {
	min-height: 100vh;
	background: #f4f6fb;
}
.page-body {
	padding: 16px;
}

/* 卡片 */
.method-card {
	background: #fff;
	border-radius: 16px;
	padding: 20px 16px;
	margin-bottom: 12px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
.method-hint {
	background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
}
.method-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 10px;
}
.method-badge {
	width: 26px;
	height: 26px;
	border-radius: 50%;
	background: #3B82F6;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 10px;
	flex-shrink: 0;
}
.method-badge-dark {
	background: #1e293b;
}
.method-num {
	color: #fff;
	font-size: 14px;
	font-weight: 700;
}
.method-title {
	font-size: 16px;
	font-weight: 600;
	color: #1e293b;
}
.method-desc {
	font-size: 13px;
	color: #64748b;
	line-height: 1.6;
}

/* 表单 */
.form-item {
	margin-bottom: 16px;
}
.form-label {
	display: block;
	font-size: 13px;
	color: #64748b;
	margin-bottom: 6px;
}
.form-label-inline {
	margin-bottom: 4px;
}
.form-input {
	width: 100%;
	height: 44px;
	background: #f8fafc;
	border: 1.5px solid #e2e8f0;
	border-radius: 10px;
	padding: 0 14px;
	font-size: 14px;
	color: #1e293b;
	box-sizing: border-box;
}
.form-input-row {
	display: flex;
	flex-direction: row;
	align-items: center;
}
.flex-1 {
	flex: 1;
}

/* 薪资输入 */
.salary-input-wrap {
	flex: 1;
	margin-left: 12px;
}
.salary-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	height: 44px;
	background: #f8fafc;
	border: 1.5px solid #e2e8f0;
	border-radius: 10px;
	padding: 0 12px;
}
.salary-prefix {
	font-size: 16px;
	color: #EF4444;
	font-weight: bold;
	margin-right: 4px;
}
.salary-input {
	flex: 1;
	font-size: 16px;
	color: #EF4444;
	font-weight: bold;
	height: 44px;
}
.salary-suffix {
	font-size: 12px;
	color: #94a3b8;
	white-space: nowrap;
}

/* picker */
.picker-row {
	display: flex;
	flex-direction: row;
	gap: 10px;
}
.picker-box {
	flex: 1;
	height: 44px;
	background: #f8fafc;
	border: 1.5px solid #e2e8f0;
	border-radius: 10px;
	padding: 0 12px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
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
}
.picker-text.placeholder {
	color: #a0aec0;
}

/* 时间行 */
.time-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8px;
}
.time-row .picker-box {
	flex: 1;
}
.time-separator {
	font-size: 14px;
	color: #94a3b8;
	white-space: nowrap;
	flex-shrink: 0;
}

/* 登录号按钮 */
.use-phone-btn {
	margin-left: 8px;
	background: #EFF6FF;
	border-radius: 8px;
	padding: 8px 10px;
}
.use-phone-text {
	font-size: 12px;
	color: #3B82F6;
	white-space: nowrap;
}

/* 文本域 */
.form-textarea {
	width: 100%;
	min-height: 100px;
	background: #f8fafc;
	border: 1.5px solid #e2e8f0;
	border-radius: 10px;
	padding: 12px 14px;
	font-size: 14px;
	color: #1e293b;
	box-sizing: border-box;
	line-height: 1.6;
}
.word-count {
	display: block;
	text-align: right;
	font-size: 11px;
	color: #94a3b8;
	margin-top: 4px;
}

/* 提示行 */
.tips-row {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	padding: 10px 12px;
	background: #f8fafc;
	border-radius: 8px;
}
.tips-text {
	font-size: 11px;
	color: #94a3b8;
	margin-left: 6px;
	line-height: 1.6;
	flex: 1;
}

/* 提交 */
.submit-wrap {
	margin-top: 8px;
	margin-bottom: 40px;
}
.submit-btn {
	background: #1e293b;
	border-radius: 14px;
	height: 52px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.submit-btn.disabled {
	opacity: 0.6;
}
.submit-text {
	color: #fff;
	font-size: 16px;
	font-weight: 600;
}
</style>
