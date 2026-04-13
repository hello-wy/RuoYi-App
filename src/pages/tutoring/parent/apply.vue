<template>
	<view class="page">
		<view class="page-body">

			<!-- ===== 方法一：打电话 ===== -->
			<view class="method-card method-phone">
				<view class="method-header">
					<view class="method-badge">
						<text class="method-num">1</text>
					</view>
					<text class="method-title">拨打电话，快速发布</text>
				</view>
				<text class="method-desc">致电我们的客服顾问，由专人为您登记家教需求，快捷省心。</text>
				<view class="phone-btn" @click="callService">
					<uni-icons type="phone-filled" size="18" color="#fff"></uni-icons>
					<text class="phone-btn-text">立即拨打：17327736231</text>
				</view>
			</view>

			<!-- 分割线 OR -->
			<view class="divider-or">
				<view class="divider-line"></view>
				<text class="divider-or-text">或</text>
				<view class="divider-line"></view>
			</view>

			<!-- ===== 方法二：填写表单 ===== -->
			<view class="method-card">
				<view class="method-header">
					<view class="method-badge">
						<text class="method-num">2</text>
					</view>
					<text class="method-title">在线填写需求表单</text>
				</view>

				<!-- 联系人姓名 -->
				<view class="form-item">
					<text class="form-label">简单描述你的需求（这个将作为标题）</text>
					<input
						class="form-input"
						v-model="form.name"
						placeholder="如：小学生数学辅导，每周三次，线上授课等..."
						maxlength="30"
					/>
				</view>

				<!-- 手机号码 -->
				<view class="form-item">
					<text class="form-label">手机号码</text>
					<view class="form-input-row">
						<input
							class="form-input"
							v-model="form.phone"
							placeholder="请输入联系手机"
							maxlength="11"
							type="number"
						/>
					</view>
				</view>

				<!-- 年级科目 -->
				<view class="form-item">
					<text class="form-label">年级科目</text>
					<view class="picker-row">
						<!-- 年级 -->
						<picker
							mode="selector"
							:range="gradeOptions"
							range-key="label"
							:value="gradeIndex"
							@change="onGradeChange"
						>
							<view class="picker-box">
								<text class="picker-text" :class="{ placeholder: !form.grade }">
									{{ form.grade ? getLabel(gradeOptions, form.grade) : '选择年级' }}
								</text>
								<uni-icons type="bottom" size="12" color="#aaa"></uni-icons>
							</view>
						</picker>
						<!-- 科目 -->
						<picker
							mode="selector"
							:range="subjectOptions"
							range-key="label"
							:value="subjectIndex"
							@change="onSubjectChange"
						>
							<view class="picker-box">
								<text class="picker-text" :class="{ placeholder: !form.subject }">
									{{ form.subject ? getLabel(subjectOptions, form.subject) : '选择科目' }}
								</text>
								<uni-icons type="bottom" size="12" color="#aaa"></uni-icons>
							</view>
						</picker>
					</view>
				</view>

				<!-- 授课地址：省市区 -->
				<area-picker v-model="form.region" @change="onRegionChange"></area-picker>

				<!-- 授课地址：详细地址 -->
				<address-search
					v-model="form.detail"
					v-model:location="form.location"
					v-model:geo="form.geo"
					v-model:region="form.region_district"
					:city="form.region.city"
				></address-search>

				<!-- 每周频次 -->
				<view class="form-item">
					<text class="form-label">每周频次</text>
					<view class="week-tags">
						<view
							v-for="day in weekDays"
							:key="day.value"
							class="week-tag"
							:class="{ active: isDaySelected(day.value) }"
							@click="toggleDay(day.value)"
						>
							<text class="week-tag-text">{{ day.label }}</text>
						</view>
					</view>
				</view>

				<!-- 上课时间 -->
				<view class="form-item">
					<text class="form-label">上课时间</text>
					<view class="time-row">
						<!-- 开始时间 -->
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
								<uni-icons type="bottom" size="12" color="#aaa"></uni-icons>
							</view>
						</picker>
						<text class="time-separator">至</text>
						<!-- 结束时间 -->
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
								<uni-icons type="bottom" size="12" color="#aaa"></uni-icons>
							</view>
						</picker>
					</view>
				</view>

				<!-- 授课方式 -->
				<view class="form-item">
					<text class="form-label">授课方式</text>
					<view class="method-tags">
						<view
							v-for="item in dict.type.sys_methods"
							:key="item.value"
							class="method-tag"
							:class="{ active: form.methods === item.value }"
							@click="toggleMethod(item.value)"
						>
							<text class="method-tag-text">{{ item.label }}</text>
						</view>
					</view>
				</view>

				<!-- 学生情况描述 -->
				<view class="form-item">
					<text class="form-label">学生情况描述</text>
					<textarea
						class="form-textarea"
						v-model="form.description"
						placeholder="请描述学生目前的学习情况、薄弱环节以及对老师的特殊要求..."
						maxlength="300"
						:show-confirm-bar="false"
					></textarea>
					<text class="word-count">{{ (form.description || '').length }}/300</text>
				</view>

				<!-- 教员要求 -->
				<view class="form-item">
					<text class="form-label">教员要求</text>
					<textarea
						class="form-textarea"
						v-model="form.requirements"
						placeholder="请填写对教员的要求，如学历、性别、经验等..."
						maxlength="300"
						:show-confirm-bar="false"
					></textarea>
					<text class="word-count">{{ (form.requirements || '').length }}/300</text>
				</view>

				<!-- 提示 -->
				<view class="tips-row">
					<uni-icons type="info-filled" size="14" color="#999"></uni-icons>
					<text class="tips-text">发布需求后，平台会通过审核。审核通过后需教师通过教务院申请。</text>
				</view>
			</view>

			<!-- 提交按钮 -->
			<view class="submit-wrap">
				<view class="submit-btn" :class="{ disabled: submitting }" @click="handleSubmit">
					<text class="submit-text">{{ submitting ? '提交中...' : '立即发布' }}</text>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
import { addParents } from '@/api/wxmini/tutoring'
import { useUserStore } from '@/store'
import AreaPicker from '@/components/AreaPicker/AreaPicker.vue'
import AddressSearch from '@/components/AddressSearch/AddressSearch.vue'
export default {
	components: { AreaPicker, AddressSearch },
	dicts: ['sys_class', 'sys_subject', 'sys_methods'],
	data() {
		return {
			submitting: false,
			userPhone: '',
			weekDays: [
				{ label: '周一', value: '1' },
				{ label: '周二', value: '2' },
				{ label: '周三', value: '3' },
				{ label: '周四', value: '4' },
				{ label: '周五', value: '5' },
				{ label: '周六', value: '6' },
				{ label: '周日', value: '7' }
			],
			// timeRange[0] = hours 0~23, timeRange[1] = minutes ['00','30']
			timeRange: [
				Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + '时'),
				['00分', '30分']
			],
			startTimeIndex: [8, 0],  // 默认 08:00
			endTimeIndex: [10, 0],   // 默认 10:00
			form: {
				name: '',
				phone: '',
				grade: '',
				subject: '',
				region: { province: '', city: '', district: '', code: '' },
				detail: '',      // 输入的地点名称
				location: '',    // 腾讯地图返回的完整地址
				geo: '',         // 经纬度字符串 "lng,lat"
				region_district: '', // 腾讯地图返回的区县名
				dayOfWeek: '',   // 逗号分隔，如 "1,2,3"
				startTime: '',   // 如 "08:00"
				endTime: '',     // 如 "10:00"
				methods: '',
				description: '',
				requirements: ''
			},
		}
	},
	computed: {
		gradeOptions() {
			return this.dict.type.sys_class || []
		},
		subjectOptions() {
			return this.dict.type.sys_subject || []
		},
		gradeIndex() {
			return this.gradeOptions.findIndex(o => o.value === this.form.grade)
		},
		subjectIndex() {
			return this.subjectOptions.findIndex(o => o.value === this.form.subject)
		},
		userPhone() {
			return useUserStore().phone
		},
	},
	onLoad() {
		this.form.phone = useUserStore().phone
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		callService() {
			uni.makePhoneCall({ phoneNumber: '17327736231' })
		},
		getLabel(options, value) {
			const item = (options || []).find(o => o.value === value)
			return item ? item.label : value
		},
		onGradeChange(e) {
			this.form.grade = (this.gradeOptions[e.detail.value] && this.gradeOptions[e.detail.value].value) || ''
		},
		onSubjectChange(e) {
			this.form.subject = (this.subjectOptions[e.detail.value] && this.subjectOptions[e.detail.value].value) || ''
		},
		toggleMethod(value) {
			this.form.methods = this.form.methods === value ? '' : value
		},
		// 星期多选
		isDaySelected(val) {
			if (!this.form.dayOfWeek) return false
			return this.form.dayOfWeek.split(',').includes(val)
		},
		toggleDay(val) {
			let days = this.form.dayOfWeek ? this.form.dayOfWeek.split(',') : []
			const idx = days.indexOf(val)
			if (idx >= 0) {
				days.splice(idx, 1)
			} else {
				days.push(val)
				days.sort((a, b) => Number(a) - Number(b))
			}
			this.form.dayOfWeek = days.join(',')
		},
		// 时间选择器工具
		indexToTime(hIdx, mIdx) {
			const h = String(hIdx).padStart(2, '0')
			const m = mIdx === 0 ? '00' : '30'
			return `${h}:${m}`
		},
		onStartTimeChange(e) {
			const [hIdx, mIdx] = e.detail.value
			this.startTimeIndex = [hIdx, mIdx]
			this.form.startTime = this.indexToTime(hIdx, mIdx)
		},
		onStartColumnChange(e) {
			const col = e.detail.column
			const val = e.detail.value
			const cur = [...this.startTimeIndex]
			cur[col] = val
			this.startTimeIndex = cur
		},
		onEndTimeChange(e) {
			const [hIdx, mIdx] = e.detail.value
			this.endTimeIndex = [hIdx, mIdx]
			this.form.endTime = this.indexToTime(hIdx, mIdx)
		},
		onEndColumnChange(e) {
			const col = e.detail.column
			const val = e.detail.value
			const cur = [...this.endTimeIndex]
			cur[col] = val
			this.endTimeIndex = cur
		},
		onRegionChange(val) {
			this.form.region = val
		},
		validate() {
			if (!this.form.name.trim()) {
				uni.showToast({ title: '请填写需求描述', icon: 'none' })
				return false
			}
			if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
				uni.showToast({ title: '请填写正确的手机号', icon: 'none' })
				return false
			}
			if (!this.form.grade) {
				uni.showToast({ title: '请选择年级', icon: 'none' })
				return false
			}
			if (!this.form.subject) {
				uni.showToast({ title: '请选择科目', icon: 'none' })
				return false
			}
			if (!this.form.region.district) {
				uni.showToast({ title: '请选择授课地址（省/市/区）', icon: 'none' })
				return false
			}
			if (!this.form.detail.trim()) {
				uni.showToast({ title: '请填写详细地址', icon: 'none' })
				return false
			}
			if (!this.form.dayOfWeek) {
				uni.showToast({ title: '请选择每周上课频次', icon: 'none' })
				return false
			}
			if (!this.form.startTime) {
				uni.showToast({ title: '请选择开始时间', icon: 'none' })
				return false
			}
			if (!this.form.endTime) {
				uni.showToast({ title: '请选择结束时间', icon: 'none' })
				return false
			}
			if (!this.form.methods) {
				uni.showToast({ title: '请选择授课方式', icon: 'none' })
				return false
			}
			if (!this.form.description.trim()) {
				uni.showToast({ title: '请填写学生情况描述', icon: 'none' })
				return false
			}
			return true
		},
		async handleSubmit() {
			if (!this.validate()) return
			if (this.submitting) return
			this.submitting = true
			try {
				const res = await addParents({
					name: this.form.name,
					phone: this.form.phone,
					grade: this.form.grade,
					subject: this.form.subject,
					location: this.form.location,
					address: this.form.location,
					geo: this.form.geo,
					region: this.form.region_district,
					dayOfWeek: this.form.dayOfWeek,
					startTime: this.form.startTime,
					endTime: this.form.endTime,
					methods: this.form.methods,
					brief: this.form.description,
					requirements: this.form.requirements
				})
				uni.showToast({ title: '发布成功，等待审核', icon: 'success' })
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/tutoring/parent/detail?id=' + res.data
					})
				}, 1000)
			} catch (e) {
				uni.showToast({ title: '发布失败，请重试', icon: 'none' })
				this.submitting = false
			} finally {
				this.submitting = false
			}
		}
	}
}
</script>

<style lang="scss">
@import '@/static/scss/select-tag.scss';

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

.method-phone {
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
	margin-bottom: 14px;
}

.phone-btn {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	background: #3B82F6;
	border-radius: 10px;
	padding: 12px 0;
}

.phone-btn-text {
	color: #fff;
	font-size: 15px;
	font-weight: 600;
	margin-left: 8px;
}

/* OR 分割 */
.divider-or {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin: 4px 0 12px;
}

.divider-line {
	flex: 1;
	height: 1px;
	background: #e2e8f0;
}

.divider-or-text {
	color: #94a3b8;
	font-size: 12px;
	margin: 0 12px;
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

.location-icon {
	margin-left: 8px;
}

/* 星期多选 */
.week-tags {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 8px;
}

.week-tag {
	padding: 7px 12px;
	border-radius: 20px;
	border: 1.5px solid #e2e8f0;
	background: #f8fafc;
}

.week-tag.active {
	border-color: #3B82F6;
	background: #EFF6FF;
}

.week-tag-text {
	font-size: 13px;
	color: #64748b;
}

.week-tag.active .week-tag-text {
	color: #3B82F6;
	font-weight: 600;
}

/* 时间选择行 */
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

/* 授课方式多选标签 */
.method-tags {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 8px;
}

.method-tag {
	padding: 7px 14px;
	border-radius: 20px;
	border: 1.5px solid #e2e8f0;
	background: #f8fafc;
}

.method-tag.active {
	border-color: #3B82F6;
	background: #EFF6FF;
}

.method-tag-text {
	font-size: 13px;
	color: #64748b;
}

.method-tag.active .method-tag-text {
	color: #3B82F6;
	font-weight: 600;
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

/* 提示 */
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
