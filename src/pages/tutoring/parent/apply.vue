<template>
	<view class="page">
		<view class="page-body">
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

			<view class="divider-or">
				<view class="divider-line"></view>
				<text class="divider-or-text">或</text>
				<view class="divider-line"></view>
			</view>

			<view class="form-section-card">
				<view class="section-header">
					<view class="method-badge">
						<text class="method-num">2</text>
					</view>
					<text class="section-title">服务地址</text>
				</view>

				<view class="form-item no-margin">
					<text class="form-label">服务地址 <text class="form-label-required">*</text></text>
					<view class="selector-box selector-box-address" @click="openAddressSheet">
						<view class="selector-main selector-main-address">
							<text class="selector-text selector-text-ellipsis" :class="{ placeholder: !form.addressLabel }">
								{{ form.addressLabel || '请选择服务地址' }}
							</text>
							<text v-if="form.addressMeta" class="selector-meta">{{ form.addressMeta }}</text>
						</view>
						<uni-icons type="right" size="14" color="#94a3b8"></uni-icons>
					</view>
				</view>
			</view>

			<view class="form-section-card">
				<view class="section-header">
					<view class="section-icon blue">
						<uni-icons type="person" size="16" color="#2563EB"></uni-icons>
					</view>
					<text class="section-title">基础信息</text>
				</view>

				<view class="form-item">
					<text class="form-label">简单描述你的需求（这个将作为标题） <text class="form-label-required">*</text></text>
					<input
						class="form-input"
						v-model="form.name"
						placeholder="如：小学生数学辅导，每周三次，线上授课等..."
						maxlength="30"
					/>
				</view>

				<view class="form-item">
					<text class="form-label">服务萌娃 <text class="form-label-required">*</text></text>
					<view class="baby-picker">
						<view class="selector-box" @click="handleBabyPickerToggle">
							<view class="selector-main">
								<text class="selector-text" :class="{ placeholder: !form.babyName }">
									{{ form.babyName || '点击选择萌娃' }}
								</text>
								<text v-if="form.babyMeta" class="selector-meta">{{ form.babyMeta }}</text>
							</view>
							<uni-icons :type="babyPickerVisible ? 'top' : 'bottom'" size="12" color="#aaa"></uni-icons>
						</view>
						<view v-if="babyPickerVisible" class="baby-picker-panel">
							<view v-if="babyLoading" class="baby-picker-state">萌娃列表加载中...</view>
							<template v-else-if="showBabyEmptyState">
								<view class="baby-picker-state">暂无萌娃，请先前往萌娃管理添加</view>
								<view class="baby-picker-action" @click="handleToBabyManager">去添加萌娃</view>
							</template>
							<view v-else class="baby-option-list">
								<view
									v-for="item in babyList"
									:key="item.id"
									class="baby-option"
									:class="{ active: String(form.babyId) === String(item.id) }"
									@click="selectBaby(item)"
								>
									<view class="baby-option-main">
										<text class="baby-option-name">{{ item.displayName }}</text>
										<text v-if="item.meta" class="baby-option-meta">{{ item.meta }}</text>
									</view>
									<uni-icons v-if="String(form.babyId) === String(item.id)" type="checkmarkempty" size="18" color="#3B82F6"></uni-icons>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="form-item">
					<text class="form-label">年级 <text class="form-label-required">*</text></text>
					<picker mode="selector" :range="gradeOptions" range-key="label" :value="gradeIndex" @change="onGradeChange">
						<view class="selector-box">
							<text class="selector-text" :class="{ placeholder: !form.grade }">
								{{ form.grade ? getLabel(gradeOptions, form.grade) : '请选择年级' }}
							</text>
							<uni-icons type="bottom" size="12" color="#aaa"></uni-icons>
						</view>
					</picker>
				</view>

				<view class="form-item">
					<text class="form-label">学科 <text class="form-label-required">*</text></text>
					<picker mode="selector" :range="subjectOptions" range-key="label" :value="subjectIndex" @change="onSubjectChange">
						<view class="selector-box">
							<text class="selector-text" :class="{ placeholder: !form.subject }">
								{{ form.subject ? getLabel(subjectOptions, form.subject) : '请选择学科' }}
							</text>
							<uni-icons type="bottom" size="12" color="#aaa"></uni-icons>
						</view>
					</picker>
				</view>

				<!-- <view class="form-item">
					<text class="form-label">学生情况描述 <text class="form-label-required">*</text></text>
					<textarea
						class="form-textarea"
						v-model="form.description"
						placeholder="请描述孩子当前情况、需要陪伴的重点、希望改善的问题等..."
						maxlength="300"
						:show-confirm-bar="false"
					></textarea>
					<text class="word-count">{{ (form.description || '').length }}/300</text>
				</view> -->

				<view class="form-item no-margin">
					<text class="form-label">细节描述</text>
					<textarea
						class="form-textarea"
						v-model="form.requirements"
						placeholder="如：希望老师擅长沟通、有耐心，能帮助孩子养成学习习惯等..."
						maxlength="300"
						:show-confirm-bar="false"
					></textarea>
					<text class="word-count">{{ (form.requirements || '').length }}/300</text>
				</view>
			</view>

			<view class="form-section-card">
				<view class="section-header">
					<view class="section-icon orange">
						<uni-icons type="calendar" size="16" color="#F59E0B"></uni-icons>
					</view>
					<text class="section-title">服务安排</text>
				</view>

				<view class="form-item">
					<view class="form-label-row">
						<text class="form-label">服务时段 <text class="form-label-required">*</text></text>
						<text class="form-link" @click="addTimeSlot">添加时段</text>
					</view>
					<view class="time-slot-list">
						<view v-for="(slot, index) in form.timeSlots" :key="index" class="time-slot-card">
							<view class="time-slot-head">
								<text class="time-slot-title">时段 {{ index + 1 }}</text>
								<text v-if="form.timeSlots.length > 1" class="time-slot-remove" @click="removeTimeSlot(index)">删除</text>
							</view>
							<view class="time-slot-field time-slot-date-field">
								<text class="time-slot-label">服务日期</text>
								<view class="selector-box" @click="openServiceDateCalendar(index)">
									<text class="selector-text" :class="{ placeholder: !slot.serviceDates.length }">
										{{ slot.serviceDates.length ? `已选 ${slot.serviceDates.length} 天` : '点击选择服务日期' }}
									</text>
									<uni-icons type="calendar" size="14" color="#94a3b8"></uni-icons>
								</view>
								<view v-if="slot.serviceDates.length" class="chip-list">
									<view v-for="date in slot.serviceDates" :key="date" class="chip-item">
										<text class="chip-text">{{ date }}</text>
										<uni-icons type="closeempty" size="12" color="#64748b" @click.stop="removeServiceDate(index, date)"></uni-icons>
									</view>
								</view>
							</view>
							<view class="time-slot-grid">
								<view class="time-slot-field">
									<text class="time-slot-label">开始时间</text>
									<picker mode="time" :value="slot.startTime" @change="onTimeSlotStartChange(index, $event)">
										<view class="picker-box picker-box-full">
											<text class="picker-text" :class="{ placeholder: !slot.startTime }">{{ slot.startTime || '请选择开始时间' }}</text>
											<uni-icons type="bottom" size="12" color="#aaa"></uni-icons>
										</view>
									</picker>
								</view>
								<view class="time-slot-field time-slot-duration-field">
									<text class="time-slot-label">时长（小时）</text>
									<input
										class="form-input duration-input"
										:value="slot.durationHours"
										type="digit"
										placeholder="默认 2"
										@input="onTimeSlotDurationChange(index, $event)"
									/>
								</view>
							</view>
							<view class="time-slot-result">
								<text class="time-slot-result-label">结束时间</text>
								<text class="time-slot-result-value" :class="{ placeholder: !slot.endTime }">{{ slot.endTime || '请先选择开始时间和时长' }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="form-item no-margin">
					<text class="form-label">授课方式 <text class="form-label-required">*</text></text>
					<view class="tag-list">
						<view
							v-for="item in dict.type.sys_methods"
							:key="item.value"
							class="tag-item"
							:class="{ active: String(form.methods) === String(item.value) }"
							@click="toggleMethod(item.value)"
						>
							<text class="tag-text">{{ item.label }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="form-section-card">
				<view class="section-header">
					<view class="section-icon green">
						<uni-icons type="flag-filled" size="16" color="#10B981"></uni-icons>
					</view>
					<text class="section-title">服务需求项目</text>
				</view>

				<view class="form-item no-margin">
					<text class="form-label">服务需求项目 <text class="form-label-required">*</text></text>
					<view class="tag-list">
						<view
							v-for="item in demandItemOptions"
							:key="item.value"
							class="tag-item"
							:class="{ active: isDemandItemSelected(item.value) }"
							@click="toggleDemandItem(item.value)"
						>
							<text class="tag-text">{{ item.label }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="form-section-card">
				<view class="section-header">
					<view class="section-icon green">
						<uni-icons type="heart-filled" size="16" color="#55B938"></uni-icons>
					</view>
					<text class="section-title">陪伴官要求</text>
				</view>

				<view class="form-item">
					<text class="form-label">性别要求 <text class="form-label-required">*</text></text>
					<view class="companion-gender-list">
						<view
							v-for="item in companionGenderOptions"
							:key="item.value"
							class="companion-gender-item"
							:class="{ active: String(form.genderRequirement) === String(item.value) }"
							@click="selectCompanionGender(item.value)"
						>
							<text class="companion-gender-text">{{ item.label }}</text>
						</view>
					</view>
				</view>

				<view class="form-item no-margin">
					<text class="form-label">时薪预算（元/小时） <text class="form-label-required">*</text></text>
					<input
						class="form-input companion-budget-input"
						v-model="form.hourlyBudget"
						type="digit"
						placeholder="请输入时薪预算"
						maxlength="6"
					/>
				</view>
				<view class="tips-text">· 本平台陪伴官时薪在￥60/h~￥150/h之间，根据陪伴官的个人经验以及学校专业而决定。</view>
				<view class="tips-text">· 陪伴官将会根据您的预算进行主动报价，您可根据需求选择合适的陪伴官</view>
			</view>

			<view class="tips-row">
				<uni-icons type="info-filled" size="14" color="#999"></uni-icons>
				<text class="tips-text">发布需求后，平台会先审核信息，审核通过后再推荐合适教员。</text>
			</view>

			<view class="submit-wrap">
				<view class="submit-btn" :class="{ disabled: submitting || loadingDetail }" @click="handleSubmit">
					<text class="submit-text">{{ submitButtonText }}</text>
				</view>
			</view>
		</view>

		<UniCalendar ref="serviceCalendar" :insert="false" :range="true" @confirm="onServiceDateConfirm" />

		<LoginPopup :auto-open="shouldAutoOpenLogin" @close="handleLoginPopupClose" />
		<UserTypeGuardModal
			:visible="showUserTypeGuard"
			:title="userTypeGuardCopy.title"
			:content="userTypeGuardCopy.content"
			@cancel="handleUserTypeGuardCancel"
			@close="handleUserTypeGuardClose"
			@confirm="openUserTypeGuide"
		/>

		<view v-if="addressSheetVisible" class="sheet-overlay" @touchmove.stop.prevent>
			<view class="sheet-mask" @click="closeAddressSheet"></view>
			<view class="sheet-panel">
				<view class="sheet-handle"></view>
				<view class="sheet-header">
					<text class="sheet-title">选择服务地址</text>
					<uni-icons type="closeempty" size="20" color="#64748b" @click="closeAddressSheet"></uni-icons>
				</view>
				<view class="sheet-action-row">
					<view class="sheet-primary-btn" @click="handleCreateAddress">新增地址</view>
				</view>
				<scroll-view scroll-y class="sheet-scroll">
					<view v-if="addressLoading" class="sheet-empty">地址列表加载中...</view>
					<view v-else-if="!addressList.length" class="sheet-empty">暂无服务地址，请先新增</view>
					<view v-else class="address-option-list">
						<view
							v-for="item in addressList"
							:key="item.id"
							class="address-option"
							:class="{ active: String(form.addressId) === String(item.id) }"
							@click="selectAddress(item)"
						>
							<view class="address-option-main">
								<view class="address-option-top">
									<text class="address-option-title">{{ formatAddressText(item) }}</text>
									<text v-if="item.isDefault" class="default-badge">默认地址</text>
								</view>
								<text v-if="item.contactName" class="address-option-meta">{{ item.contactName }}</text>
							</view>
							<view class="address-option-actions" @click.stop>
								<text class="address-action" @click="handleSetDefaultAddress(item)">设默认</text>
								<text class="address-action" @click="handleEditAddress(item)">编辑</text>
								<text class="address-action danger" @click="handleDeleteAddress(item)">删除</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>

	</view>
</template>

<script>
import {
	addParents,
	deleteServiceAddress,
	getMyParentDemandDetail,
	getParents,
	listServiceAddresses,
	setDefaultServiceAddress,
	updateMyParentDemand
} from '@/api/wxmini/tutoring'
import { listBaby } from '@/pages/tutoring/_api/wxmini/baby'
import { useUserStore } from '@/store'
import { USER_TYPES } from '@/utils/userType'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'
import UserTypeGuardModal from '@/components/UserTypeGuardModal/UserTypeGuardModal.vue'
import UniCalendar from '@/uni_modules/uni-calendar/components/uni-calendar/uni-calendar.vue'
import {
	buildParentApplyDefaultForm,
	buildParentApplyForm,
	buildParentApplyPayload,
	buildParentApplySuccessUrl,
	canUseBabyPicker,
	formatAddressLabel,
	formatAddressMeta,
	normalizeBabyList,
	resolveParentApplyEntryAction,
	shouldShowBabyEmptyState,
	validateParentApplyForm
} from './apply.helpers'
import { buildUserTypeGuardCopy, shouldBlockUserTypeEntry } from '../role-guard.helpers'

function createDefaultForm() {
	return buildParentApplyDefaultForm()
}

export default {
	components: { LoginPopup, UserTypeGuardModal, UniCalendar },
	dicts: ['sys_methods', 'sys_class', 'sys_subject', 'sys_tutoring_demand_items'],
	data() {
		return {
			submitting: false,
			loadingDetail: false,
			shouldAutoOpenLogin: false,
			showUserTypeGuard: false,
			checkingExistingDemand: false,
			userTypeGuardCopy: buildUserTypeGuardCopy('parent'),
			babyLoading: false,
			babyPickerVisible: false,
			babyList: [],
			addressLoading: false,
			addressSheetVisible: false,
			addressList: [],
			activeTimeSlotIndex: -1,
			demandId: '',
			fromMine: false,
			form: createDefaultForm()
		}
	},
	computed: {
		userType() {
			return useUserStore().userType
		},
		gradeOptions() {
			return this.dict.type.sys_class || []
		},
		subjectOptions() {
			return this.dict.type.sys_subject || []
		},
		companionGenderOptions() {
			return [
				{ label: '不限', value: '0' },
				{ label: '男', value: '1' },
				{ label: '女', value: '2' }
			]
		},
		demandItemOptions() {
			return this.dict.type.sys_tutoring_demand_items || []
		},
		gradeIndex() {
			const idx = this.gradeOptions.findIndex(item => String(item.value) === String(this.form.grade))
			return idx < 0 ? 0 : idx
		},
		subjectIndex() {
			const idx = this.subjectOptions.findIndex(item => String(item.value) === String(this.form.subject))
			return idx < 0 ? 0 : idx
		},
		showBabyEmptyState() {
			return shouldShowBabyEmptyState(this.babyPickerVisible, this.babyList)
		},
		isEditMode() {
			return Boolean(this.demandId)
		},
		submitButtonText() {
			if (this.submitting) return this.isEditMode ? '保存中...' : '提交中...'
			return this.isEditMode ? '保存需求' : '立即发布'
		}
	},
	onLoad(options) {
		this.demandId = options?.id || ''
		this.fromMine = String(options?.fromMine || '') === '1'
		this.form.phone = useUserStore().phone || ''
		this.checkUserType()
		this.loadBabyList()
		this.loadAddressList()
		if (this.isEditMode) {
			uni.setNavigationBarTitle({ title: '编辑需求' })
			this.loadDetail()
		}
	},
	onShow() {
		this.checkUserType()
		this.loadBabyList()
		this.loadAddressList()
	},
	methods: {
		checkUserType() {
			const userStore = useUserStore()
			const entryAction = resolveParentApplyEntryAction({
				token: userStore.token,
				userType: userStore.userType,
				isEditMode: this.isEditMode,
				checkingExistingDemand: this.checkingExistingDemand
			})
			if (entryAction.type === 'login') {
				this.showUserTypeGuard = false
				this.shouldAutoOpenLogin = true
				return
			}
			this.shouldAutoOpenLogin = false
			this.showUserTypeGuard = entryAction.type === 'userTypeGuard'
			if (this.showUserTypeGuard || entryAction.type !== 'checkExistingDemand') {
				return
			}
			this.checkExistingDemand()
		},
		async checkExistingDemand() {
			if (this.isEditMode || this.checkingExistingDemand) {
				return
			}
			const userStore = useUserStore()
			if (!userStore.token) {
				return
			}
			this.checkingExistingDemand = true
			try {
				const res = await getMyParentDemandDetail()
				const detail = res?.data || null
				const demandId = detail?.id
				if (!demandId) {
					return
				}
				uni.redirectTo({ url: `/pages/tutoring/parent/detail?id=${demandId}&scene=mine` })
			} catch (e) {
			} finally {
				this.checkingExistingDemand = false
			}
		},
		handleUserTypeGuardCancel() {
			this.showUserTypeGuard = false
		},
		handleUserTypeGuardClose() {
			this.showUserTypeGuard = false
		},
		openUserTypeGuide() {
			this.showUserTypeGuard = false
			uni.navigateTo({ url: '/pages/guide/index' })
		},
		callService() {
			uni.makePhoneCall({ phoneNumber: '17327736231' })
		},
		getLabel(options, value) {
			const item = (options || []).find(option => String(option.value) === String(value))
			return item ? item.label : value
		},
		onGradeChange(e) {
			this.form.grade = (this.gradeOptions[e.detail.value] && this.gradeOptions[e.detail.value].value) || ''
		},
		onSubjectChange(e) {
			this.form.subject = (this.subjectOptions[e.detail.value] && this.subjectOptions[e.detail.value].value) || ''
		},
		selectCompanionGender(value) {
			this.form.genderRequirement = String(value)
		},
		toggleMethod(value) {
			this.form.methods = String(this.form.methods) === String(value) ? '' : value
		},
		isDemandItemSelected(value) {
			return this.form.demandItems.some(item => String(item) === String(value))
		},
		toggleDemandItem(value) {
			const exists = this.isDemandItemSelected(value)
			if (exists) {
				this.form.demandItems = this.form.demandItems.filter(item => String(item) !== String(value))
				return
			}
			this.form.demandItems = [...this.form.demandItems, String(value)]
		},
		openServiceDateCalendar(index) {
			if (!this.$refs.serviceCalendar || typeof this.$refs.serviceCalendar.open !== 'function') {
				uni.showToast({ title: '日历组件加载中，请稍后重试', icon: 'none' })
				return
			}
			this.activeTimeSlotIndex = index
			this.$refs.serviceCalendar.open()
		},
		onServiceDateConfirm(e) {
			const index = this.activeTimeSlotIndex
			if (index < 0 || !Array.isArray(this.form.timeSlots) || !this.form.timeSlots[index]) return
			const rangeDates = Array.isArray(e?.range?.data) ? e.range.data : []
			const singleDate = e?.fulldate || e?.date || ''
			const nextDates = [...new Set([...(rangeDates.length ? rangeDates : [singleDate])].filter(Boolean))].sort()
			if (!nextDates.length) return
			this.form.timeSlots = this.form.timeSlots.map((item, currentIndex) => {
				if (currentIndex !== index) return item
				return {
					...item,
					serviceDates: nextDates
				}
			})
			this.activeTimeSlotIndex = -1
		},
		removeServiceDate(index, date) {
			this.form.timeSlots = this.form.timeSlots.map((item, currentIndex) => {
				if (currentIndex !== index) return item
				return {
					...item,
					serviceDates: (Array.isArray(item.serviceDates) ? item.serviceDates : []).filter(currentDate => currentDate !== date)
				}
			})
		},
		addHoursToTime(time, hours = 2) {
			const match = String(time || '').match(/^(\d{2}):(\d{2})$/)
			if (!match) return ''
			const numericHours = Number(hours)
			if (!numericHours || numericHours <= 0) return ''
			const totalMinutes = Number(match[1]) * 60 + Number(match[2]) + numericHours * 60
			const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
			const hour = String(Math.floor(normalized / 60)).padStart(2, '0')
			const minute = String(normalized % 60).padStart(2, '0')
			return `${hour}:${minute}`
		},
		addTimeSlot() {
			this.form.timeSlots = [...this.form.timeSlots, { serviceDates: [], startTime: '08:00', endTime: '10:00', durationHours: '2' }]
		},
		removeTimeSlot(index) {
			if (this.form.timeSlots.length <= 1) return
			this.form.timeSlots = this.form.timeSlots.filter((_, currentIndex) => currentIndex !== index)
		},
		onTimeSlotStartChange(index, e) {
			const startTime = e.detail.value
			this.form.timeSlots = this.form.timeSlots.map((item, currentIndex) => {
				if (currentIndex !== index) return item
				const durationHours = item.durationHours || '2'
				return {
					...item,
					startTime,
					endTime: this.addHoursToTime(startTime, durationHours)
				}
			})
		},
		onTimeSlotDurationChange(index, e) {
			const rawValue = String(e?.detail?.value || '')
			const durationHours = rawValue.replace(/[^\d.]/g, '')
			this.form.timeSlots = this.form.timeSlots.map((item, currentIndex) => {
				if (currentIndex !== index) return item
				return {
					...item,
					durationHours,
					endTime: item.startTime && durationHours ? this.addHoursToTime(item.startTime, durationHours) : ''
				}
			})
		},
		applyBabyDefaults(baby, force = false) {
			if (!baby) return
			if (force || !this.form.grade) {
				this.form.grade = baby.grade || ''
			}
		},
		syncSelectedBabyInfo() {
			if (!this.form.babyId) return
			const selected = this.babyList.find(item => String(item.id) === String(this.form.babyId))
			if (!selected) return
			this.form.babyName = selected.displayName
			this.form.babyMeta = selected.meta || ''
			this.applyBabyDefaults(selected)
		},
		syncSelectedAddressInfo() {
			if (!this.form.addressId) return
			const selected = this.addressList.find(item => String(item.id) === String(this.form.addressId))
			if (!selected) return
			this.form.addressLabel = formatAddressLabel(selected)
			this.form.addressMeta = formatAddressMeta(selected)
		},
		chooseDefaultAddressIfNeeded() {
			if (this.form.addressId || !this.addressList.length) return
			const selected = this.addressList.find(item => Number(item.isDefault) === 1) || this.addressList[0]
			if (!selected) return
			this.selectAddress(selected, false)
		},
		async loadBabyList() {
			if (!canUseBabyPicker(this.userType)) {
				this.babyList = []
				this.babyPickerVisible = false
				this.form.babyId = ''
				this.form.babyName = ''
				this.form.babyMeta = ''
				return
			}
			this.babyLoading = true
			try {
				const res = await listBaby()
				this.babyList = normalizeBabyList(res?.data)
				this.syncSelectedBabyInfo()
			} catch (e) {
				this.babyList = []
			} finally {
				this.babyLoading = false
			}
		},
		async loadAddressList() {
			this.addressLoading = true
			try {
				const res = await listServiceAddresses()
				this.addressList = Array.isArray(res?.data) ? res.data : []
				this.syncSelectedAddressInfo()
				if (!this.isEditMode) {
					this.chooseDefaultAddressIfNeeded()
				}
			} catch (e) {
				this.addressList = []
			} finally {
				this.addressLoading = false
			}
		},
		async loadDetail() {
			if (!this.demandId) return
			this.loadingDetail = true
			try {
				const res = await getParents(this.demandId)
				this.form = buildParentApplyForm(res.data || {}, this.babyList, this.addressList)
				this.form.phone = this.form.phone || useUserStore().phone || ''
				this.syncSelectedBabyInfo()
				this.syncSelectedAddressInfo()
			} catch (e) {
				uni.showToast({ title: '加载需求失败，请重试', icon: 'none' })
				setTimeout(() => {
					uni.navigateBack({ delta: 1 })
				}, 1200)
			} finally {
				this.loadingDetail = false
			}
		},
		handleBabyPickerToggle() {
			if (!canUseBabyPicker(this.userType)) {
				uni.showToast({ title: '请先切换为家长身份', icon: 'none' })
				return
			}
			this.babyPickerVisible = !this.babyPickerVisible
			if (this.babyPickerVisible && !this.babyList.length && !this.babyLoading) {
				this.loadBabyList()
			}
		},
		selectBaby(item) {
			this.form.babyId = item.id
			this.form.babyName = item.displayName
			this.form.babyMeta = item.meta || ''
			this.applyBabyDefaults(item, true)
			this.babyPickerVisible = false
		},
		handleToBabyManager() {
			this.babyPickerVisible = false
			uni.navigateTo({ url: '/pages/mine/baby/index' })
		},
		openAddressSheet() {
			const userStore = useUserStore()
			if (!userStore.token) {
				this.shouldAutoOpenLogin = true
				return
			}
			this.addressSheetVisible = true
		},
		closeAddressSheet() {
			this.addressSheetVisible = false
		},
		formatAddressText(item) {
			return formatAddressLabel(item)
		},
		selectAddress(item, close = true) {
			this.form.addressId = item.id
			this.form.addressLabel = formatAddressLabel(item)
			this.form.addressMeta = formatAddressMeta(item)
			if (close) {
				this.closeAddressSheet()
			}
		},
		handleCreateAddress() {
			this.closeAddressSheet()
			uni.navigateTo({ url: '/pages/tutoring/address/edit' })
		},
		handleEditAddress(item) {
			this.closeAddressSheet()
			uni.navigateTo({ url: `/pages/tutoring/address/edit?id=${item.id}` })
		},
		async handleSetDefaultAddress(item) {
			if (Number(item.isDefault) === 1) {
				uni.showToast({ title: '该地址已是默认地址', icon: 'none' })
				return
			}
			try {
				await setDefaultServiceAddress(item.id)
				uni.showToast({ title: '默认地址已更新', icon: 'success' })
				await this.loadAddressList()
			} catch (e) {
				uni.showToast({ title: '设置默认失败，请重试', icon: 'none' })
			}
		},
		handleDeleteAddress(item) {
			uni.showModal({
				title: '删除确认',
				content: '确定删除这个服务地址吗？',
				success: async ({ confirm }) => {
					if (!confirm) return
					try {
						await deleteServiceAddress(item.id)
						uni.showToast({ title: '删除成功', icon: 'success' })
						if (String(this.form.addressId) === String(item.id)) {
							this.form.addressId = ''
							this.form.addressLabel = ''
							this.form.addressMeta = ''
						}
						await this.loadAddressList()
						this.chooseDefaultAddressIfNeeded()
					} catch (e) {
						uni.showToast({ title: e?.msg || '删除失败，请重试', icon: 'none' })
					}
				}
			})
		},
		validate() {
			this.form.phone = this.form.phone || useUserStore().phone || ''
			const errorMessage = validateParentApplyForm(this.form, this.userType)
			if (errorMessage) {
				uni.showToast({ title: errorMessage, icon: 'none' })
				return false
			}
			return true
		},
		handleLoginPopupClose() {
			this.shouldAutoOpenLogin = false
		},
		handleSubmitSuccess(targetId) {
			const successTitle = this.isEditMode ? '保存成功' : '发布成功'
			uni.showToast({ title: successTitle, icon: 'success' })
			setTimeout(() => {
				if (this.isEditMode) {
					uni.redirectTo({ url: `/pages/tutoring/parent/detail?id=${this.demandId}&scene=mine` })
					return
				}
				uni.redirectTo({ url: buildParentApplySuccessUrl(targetId) })
			}, 800)
		},
		async handleSubmit() {
			const userStore = useUserStore()
			if (!userStore.token) {
				this.shouldAutoOpenLogin = true
				return
			}
			if (!this.validate() || this.submitting) return
			this.submitting = true
			try {
				const payload = buildParentApplyPayload(this.form)
				if (this.isEditMode) {
					await updateMyParentDemand(this.demandId, payload)
					this.handleSubmitSuccess(this.demandId)
					return
				}
				const demandRes = await addParents(payload)
				const demandId = demandRes?.data
				this.handleSubmitSuccess(demandId)
			} catch (e) {
				const message = e?.errMsg || e?.msg || ''
				uni.showToast({ title: this.isEditMode ? '保存失败，请重试' : (message || '发布失败，请重试'), icon: 'none' })
			} finally {
				this.submitting = false
			}
		}
	}
}
</script>

<style lang="scss">
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

.method-card,
.form-section-card {
	background: #fff;
	border-radius: 16px;
	padding: 20px 16px;
	margin-bottom: 12px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.method-phone {
	background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
}

.method-header,
.section-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 12px;
}

.method-badge,
.section-icon {
	width: 26px;
	height: 26px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 10px;
	flex-shrink: 0;
}

.method-badge {
	background: #3B82F6;
}

.section-icon.blue {
	background: #dbeafe;
}

.section-icon.orange {
	background: #fef3c7;
}

.section-icon.green {
	background: #dcfce7;
}

.method-num {
	color: #fff;
	font-size: 14px;
	font-weight: 700;
}

.method-title,
.section-title {
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

.form-item {
	margin-bottom: 16px;
}

.form-item.no-margin {
	margin-bottom: 0;
}

.form-label-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 6px;
}

.form-label {
	display: block;
	font-size: 13px;
	color: #64748b;
	margin-bottom: 6px;
}

.form-label-required {
	color: #ef4444;
}

.form-link {
	font-size: 12px;
	color: #3B82F6;
}

.form-input,
.form-textarea {
	width: 100%;
	background: #f8fafc;
	border: 1.5px solid #e2e8f0;
	border-radius: 10px;
	font-size: 14px;
	color: #1e293b;
	box-sizing: border-box;
}

.form-input {
	height: 44px;
	padding: 0 14px;
}

.form-textarea {
	min-height: 110px;
	padding: 12px 14px;
	line-height: 1.6;
}

.selector-box,
.picker-box {
	width: 100%;
	min-height: 44px;
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

.selector-box-address {
	padding-top: 10px;
	padding-bottom: 10px;
}

.picker-box-full {
	width: 100%;
}

.selector-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.selector-main-address {
	padding-right: 12px;
}

.selector-text,
.picker-text {
	font-size: 14px;
	color: #1e293b;
}

.selector-text-ellipsis {
	display: block;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.selector-text.placeholder,
.picker-text.placeholder,
.time-slot-result-value.placeholder {
	color: #a0aec0;
}

.selector-meta {
	margin-top: 2px;
	font-size: 12px;
	color: #94a3b8;
}

.baby-picker {
	position: relative;
}

.baby-picker-panel {
	margin-top: 8px;
	background: #fff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.baby-picker-state {
	padding: 16px;
	font-size: 13px;
	color: #94a3b8;
	text-align: center;
}

.baby-picker-action {
	margin: 0 16px 16px;
	height: 40px;
	line-height: 40px;
	text-align: center;
	border-radius: 10px;
	background: #EFF6FF;
	color: #3B82F6;
	font-size: 14px;
	font-weight: 600;
}

.baby-option-list {
	padding: 8px;
}

.baby-option {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 12px;
	border-radius: 10px;
}

.baby-option.active {
	background: #EFF6FF;
}

.baby-option-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.baby-option-name {
	font-size: 14px;
	color: #1e293b;
}

.baby-option-meta {
	margin-top: 4px;
	font-size: 12px;
	color: #94a3b8;
}

.chip-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 10px;
}

.chip-item {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 7px 10px;
	border-radius: 999px;
	background: #EFF6FF;
	color: #2563eb;
}

.chip-text {
	font-size: 12px;
}

.time-slot-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.time-slot-card {
	padding: 12px;
	border-radius: 12px;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
}

.time-slot-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.time-slot-title {
	font-size: 13px;
	font-weight: 600;
	color: #1e293b;
}

.time-slot-remove {
	font-size: 12px;
	color: #ef4444;
}

.time-slot-grid {
	display: flex;
	gap: 10px;
	margin-top: 10px;
}

.time-slot-field {
	flex: 1;
}

.time-slot-duration-field {
	max-width: 120px;
}

.time-slot-label {
	display: block;
	margin-bottom: 6px;
	font-size: 12px;
	color: #94a3b8;
}

.duration-input {
	text-align: center;
}

.time-slot-result {
	margin-top: 10px;
	padding: 10px 12px;
	border-radius: 10px;
	background: #fff;
	border: 1px dashed #dbeafe;
}

.time-slot-result-label {
	display: block;
	font-size: 12px;
	color: #94a3b8;
	margin-bottom: 4px;
}

.time-slot-result-value {
	font-size: 14px;
	color: #1e293b;
}

.tag-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.tag-item {
	padding: 8px 14px;
	border-radius: 15rpx;
	border: 1.5px solid #e2e8f0;
	background: #f8fafc;
}

.tag-item.active {
	border-color: #3B82F6;
	background: #EFF6FF;
}

.tag-text {
	font-size: 13px;
	color: #64748b;
}

.tag-item.active .tag-text {
	color: #2563eb;
	font-weight: 600;
}

.word-count {
	display: block;
	margin-top: 6px;
	font-size: 12px;
	color: #94a3b8;
	text-align: right;
}

.companion-gender-list {
	display: flex;
	gap: 10px;
}

.companion-gender-item {
	flex: 1;
	height: 60rpx;
	border-radius: 15rpx;
	border: 1.5px solid #e5e7eb;
	background: #f5f5f5;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.companion-gender-item.active {
	background: #55b938;
	border-color: #55b938;
	box-shadow: 0 8px 18px rgba(85, 185, 56, 0.18);
}

.companion-gender-text {
	font-size: 13px;
	font-weight: 500;
	color: #333333;
}

.companion-gender-item.active .companion-gender-text {
	color: #ffffff;
	font-weight: 600;
}

.companion-budget-input {
	border-radius: 15rpx;
	background: #f5f5f5;
	border-color: #f5f5f5;
}

.tips-text {
	font-size: 12px;
	line-height: 1.5;
	color: #94a3b8;
}

.submit-wrap {
	padding: 4px 0 20px;
}

.submit-btn {
	height: 48px;
	border-radius: 999px;
	background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 10px 24px rgba(37, 99, 235, 0.22);
}

.submit-btn.disabled {
	opacity: 0.6;
}

.submit-text {
	font-size: 15px;
	font-weight: 600;
	color: #fff;
}

.sheet-overlay {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 1000;
}

.sheet-mask {
	position: absolute;
	inset: 0;
	background: rgba(15, 23, 42, 0.42);
}

.sheet-panel {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	background: #fff;
	border-radius: 20px 20px 0 0;
	padding: 12px 16px 24px;
	max-height: 78vh;
}

.sheet-handle {
	width: 42px;
	height: 4px;
	border-radius: 999px;
	background: #cbd5e1;
	margin: 0 auto 12px;
}

.sheet-header,
.sheet-action-row,
.address-option-top,
.address-option-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.sheet-title {
	font-size: 16px;
	font-weight: 600;
	color: #1e293b;
}

.sheet-primary-btn {
	padding: 8px 14px;
	border-radius: 999px;
	background: #EFF6FF;
	color: #2563eb;
	font-size: 13px;
	font-weight: 600;
	margin: 12px 0;
}

.sheet-scroll {
	max-height: calc(78vh - 100px);
}

.sheet-empty {
	padding: 24px 0;
	text-align: center;
	font-size: 13px;
	color: #94a3b8;
}

.address-option-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.address-option {
	padding: 14px;
	border-radius: 14px;
	border: 1px solid #e2e8f0;
	background: #fff;
}

.address-option.active {
	border-color: #60a5fa;
	background: #f8fbff;
}

.address-option-main {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.address-option-title {
	flex: 1;
	font-size: 14px;
	font-weight: 600;
	color: #1e293b;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	padding-right: 8px;
}

.address-option-meta {
	font-size: 12px;
	line-height: 1.5;
	color: #64748b;
}

.default-badge {
	padding: 2px 8px;
	border-radius: 999px;
	background: #EFF6FF;
	color: #2563eb;
	font-size: 11px;
	flex-shrink: 0;
}

.address-option-actions {
	justify-content: flex-start;
	gap: 14px;
	margin-top: 10px;
}

.address-action {
	font-size: 12px;
	color: #2563eb;
}

.address-action.danger {
	color: #ef4444;
}
</style>
