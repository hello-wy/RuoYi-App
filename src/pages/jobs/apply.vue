<template>
	<view class="page">
		<view class="page-body">

			<view class="method-card method-hint">
				<view class="method-header">
					<view class="method-badge">
						<text class="method-num">!</text>
					</view>
					<text class="method-title">发布招聘</text>
				</view>
				<text class="method-desc">仅商家身份可发布招聘，联系方式默认带出当前账号手机号，支持手动修改。</text>
			</view>

			<view class="method-card">
				<view class="method-header">
					<view class="method-badge method-badge-dark">
						<text class="method-num">1</text>
					</view>
					<text class="method-title">基础信息</text>
				</view>

				<view class="form-item">
					<text class="form-label">工作标题 *</text>
					<input class="form-input" v-model="form.title" placeholder="如：初中数学辅导日结兼职" maxlength="50" />
				</view>

				<view class="form-item">
					<text class="form-label">岗位分类 *</text>
					<view class="picker-row">
						<picker class="flex-1" mode="selector" :range="categoryOptions" range-key="label" :value="categoryIndex" @change="onCategoryChange">
							<view class="picker-box">
								<text class="picker-text" :class="{ placeholder: form.category === '' }">{{ form.category !== '' ? getCatLabel(form.category) : '请选择分类' }}</text>
								<uni-icons type="bottom" size="14" color="#a0aec0"></uni-icons>
							</view>
						</picker>
						<view class="salary-input-wrap">
							<text class="form-label form-label-inline">日结薪资 *</text>
							<view class="salary-row">
								<text class="salary-prefix">¥</text>
								<input class="salary-input" v-model="form.salaryDay" type="digit" placeholder="0.00" maxlength="8" />
								<text class="salary-suffix">/天</text>
							</view>
						</view>
					</view>
				</view>

				<view class="form-item">
					<text class="form-label">工作日期 *</text>
					<picker mode="date" :value="form.workDate" @change="onDateChange">
						<view class="picker-full-box">
							<text class="picker-text" :class="{ placeholder: !form.workDate }">{{ form.workDate || '请选择日期' }}</text>
							<uni-icons type="calendar" size="14" color="#a0aec0"></uni-icons>
						</view>
					</picker>
				</view>

				<view class="form-item">
					<text class="form-label">报名人数 *</text>
					<input class="form-input" v-model="form.signupLimit" type="number" placeholder="请输入报名人数" maxlength="4" />
				</view>

				<view class="form-item">
					<text class="form-label">工作时段 *</text>
					<view class="time-row">
						<picker mode="multiSelector" :range="timeRange" :value="startTimeIndex" @change="onStartTimeChange" @columnchange="onStartColumnChange">
							<view class="picker-box">
								<text class="picker-text" :class="{ placeholder: !form.startTime }">{{ form.startTime || '开始时间' }}</text>
							</view>
						</picker>
						<text class="time-separator">至</text>
						<picker mode="multiSelector" :range="timeRange" :value="endTimeIndex" @change="onEndTimeChange" @columnchange="onEndColumnChange">
							<view class="picker-box">
								<text class="picker-text" :class="{ placeholder: !form.endTime }">{{ form.endTime || '结束时间' }}</text>
							</view>
						</picker>
					</view>
				</view>
			</view>

			<view class="method-card">
				<view class="method-header">
					<view class="method-badge method-badge-dark">
						<text class="method-num">2</text>
					</view>
					<text class="method-title">工作地点</text>
				</view>
				<area-picker v-model="form.region" @change="onRegionChange"></area-picker>
				<address-search v-model="form.location" :city="form.region.city" placeholder="搜索详细地址" @select="onAddressSelect"></address-search>
			</view>

			<view class="method-card">
				<view class="method-header">
					<view class="method-badge method-badge-dark">
						<text class="method-num">3</text>
					</view>
					<text class="method-title">联系方式</text>
				</view>
				<view class="form-item">
					<text class="form-label">联系人姓名 *</text>
					<input class="form-input" v-model="form.contacts" placeholder="请输入真实姓名" maxlength="20" />
				</view>
				<view class="form-item">
					<text class="form-label">联系电话 *</text>
					<view class="form-input-row">
						<input class="form-input flex-1" v-model="form.phone" type="number" placeholder="请输入手机号" maxlength="11" />
						<view class="use-phone-btn" @click="useLoginPhone"><text class="use-phone-text">用默认号</text></view>
					</view>
				</view>
			</view>

			<view class="method-card">
				<view class="method-header">
					<view class="method-badge method-badge-dark">
						<text class="method-num">4</text>
					</view>
					<text class="method-title">工作要求</text>
				</view>
				<view class="form-item">
					<text class="form-label">具体要求描述 *</text>
					<textarea class="form-textarea" v-model="form.description" placeholder="请描述工作内容、技能要求、到岗要求等..." :maxlength="500" auto-height />
					<text class="word-count">{{ (form.description || '').length }}/500</text>
				</view>
			</view>

			<view class="submit-wrap">
				<view class="submit-btn" :class="{ disabled: submitting }" @click="handleSubmit">
					<text class="submit-text">{{ submitting ? '提交中...' : '发布招聘' }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { addWxJob, getJobPublishDefaults } from '@/api/wxmini/jobs'
import { useUserStore } from '@/store'
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
			timeRange: [Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + '时'), ['00分', '30分']],
			startTimeIndex: [8, 0],
			endTimeIndex: [10, 0],
			form: {
				title: '',
				category: '',
				salaryDay: '',
				workDate: '',
				signupLimit: '',
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
		this.guardMerchant()
		this.loadUserDefaults()
	},
	methods: {
		guardMerchant() {
			const userStore = useUserStore()
			if (userStore.userType !== 2) {
				uni.showToast({ title: '仅商家可发布招聘', icon: 'none' })
				setTimeout(() => {
					uni.navigateBack({ delta: 1 })
				}, 1200)
			}
		},
		async loadUserDefaults() {
			try {
				const res = await getJobPublishDefaults()
				const data = res.data || {}
				this.userPhone = data.phone || ''
				this.form.phone = data.phone || ''
				this.form.contacts = data.contacts || ''
			} catch (e) {}
		},
		useLoginPhone() {
			if (this.userPhone) {
				this.form.phone = this.userPhone
				uni.showToast({ title: '已填入默认手机号', icon: 'none' })
			} else {
				uni.showToast({ title: '未获取到默认手机号', icon: 'none' })
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
			if (!/^\d+$/.test(String(this.form.signupLimit)) || Number(this.form.signupLimit) <= 0) {
				uni.showToast({ title: '请填写正确的报名人数', icon: 'none' }); return false
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
					signupLimit: Number(this.form.signupLimit),
					location: this.form.location.trim(),
					districtId: this.form.districtId,
					contacts: this.form.contacts.trim(),
					phone: this.form.phone.trim(),
					description: this.form.description.trim(),
					geo: this.form.geo
				}
				await addWxJob(payload)
				uni.showToast({ title: '发布成功', icon: 'success' })
				setTimeout(() => {
					uni.navigateBack()
				}, 1200)
			} catch (e) {
				uni.showToast({ title: e?.msg || '发布失败，请重试', icon: 'none' })
			} finally {
				this.submitting = false
			}
		}
	}
}
</script>

<style lang="scss" scoped>
page { background: #f4f6fb; }
.page { min-height: 100vh; background: #f4f6fb; }
.page-body { padding: 16px; }
.method-card { background: #fff; border-radius: 16px; padding: 20px 16px; margin-bottom: 12px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); }
.method-hint { background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); }
.method-header { display: flex; flex-direction: row; align-items: center; margin-bottom: 10px; }
.method-badge { width: 26px; height: 26px; border-radius: 50%; background: #3B82F6; display: flex; align-items: center; justify-content: center; margin-right: 10px; flex-shrink: 0; }
.method-badge-dark { background: #1e293b; }
.method-num { color: #fff; font-size: 14px; font-weight: 700; }
.method-title { font-size: 16px; font-weight: 600; color: #1e293b; }
.method-desc { font-size: 13px; color: #64748b; line-height: 1.6; }
.form-item { margin-bottom: 16px; }
.form-label { display: block; font-size: 13px; color: #64748b; margin-bottom: 6px; }
.form-label-inline { margin-bottom: 4px; }
.form-input { width: 100%; height: 44px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0 14px; font-size: 14px; color: #1e293b; box-sizing: border-box; }
.form-input-row { display: flex; flex-direction: row; align-items: center; }
.flex-1 { flex: 1; }
.use-phone-btn { margin-left: 10px; padding: 0 12px; height: 40px; border-radius: 10px; background: #eff6ff; display: flex; align-items: center; justify-content: center; }
.use-phone-text { font-size: 12px; color: #2563eb; }
.picker-row { display: flex; gap: 12px; }
.picker-box, .picker-full-box { height: 44px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0 14px; display: flex; align-items: center; justify-content: space-between; }
.picker-text { font-size: 14px; color: #1e293b; }
.picker-text.placeholder { color: #94a3b8; }
.salary-input-wrap { width: 42%; }
.salary-row { height: 44px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; display: flex; align-items: center; padding: 0 12px; box-sizing: border-box; }
.salary-prefix, .salary-suffix { color: #64748b; font-size: 13px; }
.salary-input { flex: 1; text-align: center; font-size: 14px; color: #1e293b; }
.time-row { display: flex; align-items: center; gap: 8px; }
.time-separator { color: #64748b; font-size: 13px; }
.form-textarea { width: 100%; min-height: 120px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; box-sizing: border-box; font-size: 14px; color: #1e293b; }
.word-count { display: block; text-align: right; color: #94a3b8; font-size: 12px; margin-top: 6px; }
.submit-wrap { padding: 8px 0 24px; }
.submit-btn { height: 48px; border-radius: 24px; background: #3B82F6; display: flex; align-items: center; justify-content: center; }
.submit-btn.disabled { background: #cbd5e1; }
.submit-text { color: #fff; font-size: 16px; font-weight: 700; }
</style>
