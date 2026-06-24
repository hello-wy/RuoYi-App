<template>
  <view class="page">
    <view class="hero-card">
      <view class="hero-top">
        <view>
          <text class="hero-title">{{ isOrderDetailMode ? '家教课时包详情' : '家教课时订单' }}</text>
          <text class="hero-desc">{{ isOrderDetailMode ? '查看已生成的家教课时包订单信息。' : '确认发布的家教订单信息，选择陪伴官后支付。' }}</text>
        </view>
      </view>
      <view class="hero-stats">
        <view class="hero-stat">
          <text class="hero-stat-num">{{ currentOrder.lessonCount || 0 }}</text>
          <text class="hero-stat-label">课时数</text>
        </view>
        <view class="hero-stat">
          <text class="hero-stat-num">¥{{ formatAmount(currentOrder.amount) }}</text>
          <text class="hero-stat-label">订单金额</text>
        </view>
        <view class="hero-stat">
          <text class="hero-stat-num">{{ orderStatusText }}</text>
          <text class="hero-stat-label">状态</text>
        </view>
      </view>
    </view>

    <view v-if="isOrderDetailMode" class="section-card">
      <view class="section-header">
        <view class="section-icon soft">
          <uni-icons type="wallet" size="16" color="#0F766E" />
        </view>
        <text class="section-title">课时包信息</text>
      </view>
      <view class="info-row">
        <text class="info-label">订单编号</text>
        <text class="info-value">{{ currentOrder.orderNo || '-' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">家教需求</text>
        <text class="info-value">{{ currentOrder.parentName || '-' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">陪伴官</text>
        <text class="info-value">{{ currentOrder.tutorName || '-' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">课时单价</text>
        <text class="info-value">¥{{ formatAmount(currentOrder.hourlyPrice) }}/小时</text>
      </view>
      <view class="info-row">
        <text class="info-label">服务时段</text>
        <text class="info-value">{{ orderServiceTimesText }}</text>
      </view>
    </view>

    <view v-else class="section-card">
      <view class="section-header">
        <view class="section-icon">
          <uni-icons type="list" size="16" color="#14B8A6" />
        </view>
        <text class="section-title">家教订单信息</text>
      </view>

      <view class="form-item">
        <text class="form-label">服务萌娃</text>
        <view class="baby-picker">
          <view class="selector-box" @click="handleBabyPickerToggle">
            <view class="selector-main">
              <text class="selector-text" :class="{ placeholder: !orderForm.babyName }">
                {{ orderForm.babyName || '点击选择萌娃' }}
              </text>
              <text v-if="orderForm.babyMeta" class="selector-meta">{{ orderForm.babyMeta }}</text>
            </view>
            <uni-icons :type="babyPickerVisible ? 'top' : 'bottom'" size="12" color="#6b8f88" />
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
                :class="{ active: String(orderForm.babyId) === String(item.id) }"
                @click="selectBaby(item)"
              >
                <view class="baby-option-main">
                  <text class="baby-option-name">{{ item.displayName }}</text>
                  <text v-if="item.meta" class="baby-option-meta">{{ item.meta }}</text>
                </view>
                <uni-icons v-if="String(orderForm.babyId) === String(item.id)" type="checkmarkempty" size="18" color="#14B8A6" />
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">服务地址</text>
        <view class="selector-box selector-box-address" @click="openAddressSheet">
          <view class="selector-main selector-main-address">
            <text class="selector-text selector-text-ellipsis" :class="{ placeholder: !orderForm.addressLabel }">
              {{ orderForm.addressLabel || '请选择服务地址' }}
            </text>
            <text v-if="orderForm.addressMeta" class="selector-meta">{{ orderForm.addressMeta }}</text>
          </view>
          <uni-icons type="right" size="14" color="#6b8f88" />
        </view>
      </view>

      <view class="form-item no-margin">
        <view class="form-label-row">
          <text class="form-label">服务时段</text>
          <view class="time-actions">
            <text class="form-link" @click="resetTimeSlot">重新输入</text>
            <text class="form-link" @click="addTimeSlot">添加时段</text>
          </view>
        </view>
        <view class="time-slot-list">
          <view v-for="(slot, index) in orderForm.timeSlots" :key="index" class="time-slot-card">
            <view class="time-slot-head">
              <text class="time-slot-title">时段 {{ index + 1 }}</text>
              <text v-if="orderForm.timeSlots.length > 1" class="time-slot-remove" @click="removeTimeSlot(index)">删除</text>
            </view>
            <view class="time-slot-field time-slot-date-field">
              <text class="time-slot-label">服务日期</text>
              <view class="selector-box" @click="openServiceDateCalendar(index)">
                <text class="selector-text" :class="{ placeholder: !slot.serviceDates.length }">
                  {{ slot.serviceDates.length ? `已选 ${slot.serviceDates.length} 天` : '点击选择服务日期' }}
                </text>
                <uni-icons type="calendar" size="14" color="#6b8f88" />
              </view>
              <view v-if="slot.serviceDates.length" class="chip-list">
                <view v-for="date in slot.serviceDates" :key="date" class="chip-item">
                  <text class="chip-text">{{ date }}</text>
                  <uni-icons type="closeempty" size="12" color="#6b8f88" @click.stop="removeServiceDate(index, date)" />
                </view>
              </view>
            </view>
            <view class="time-slot-grid">
              <view class="time-slot-field">
                <text class="time-slot-label">开始时间</text>
                <picker mode="time" :value="slot.startTime" @change="onTimeSlotStartChange(index, $event)">
                  <view class="picker-box picker-box-full">
                    <text class="picker-text" :class="{ placeholder: !slot.startTime }">{{ slot.startTime || '请选择开始时间' }}</text>
                    <uni-icons type="bottom" size="12" color="#6b8f88" />
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
    </view>

    <view v-if="!isOrderDetailMode" class="section-card">
      <view class="section-header">
        <view class="section-icon soft">
          <uni-icons type="staff-filled" size="16" color="#0F766E" />
        </view>
        <text class="section-title">选择陪伴官</text>
      </view>

      <view class="selector-box" @click="openTutorSheet">
        <view class="selector-main">
          <text class="selector-text" :class="{ placeholder: !selectedTutor.realName }">
            {{ selectedTutor.realName || '请选择陪伴官' }}
          </text>
          <text v-if="selectedTutorMeta" class="selector-meta">{{ selectedTutorMeta }}</text>
        </view>
        <uni-icons type="right" size="14" color="#6b8f88" />
      </view>

      <view class="action-btn" :class="{ disabled: submitting || !selectedTutor.bindingId }" @click="handleCreateOrder">
        <text class="action-text">{{ submitText }}</text>
      </view>
    </view>

    <view v-if="loading" class="loading-mask">
      <text class="loading-text">加载中...</text>
    </view>

    <UniCalendar v-if="!isOrderDetailMode" ref="serviceCalendar" :insert="false" :range="true" @confirm="onServiceDateConfirm" />

    <view v-if="!isOrderDetailMode && addressSheetVisible" class="sheet-overlay" @touchmove.stop.prevent>
      <view class="sheet-mask" @click="closeAddressSheet"></view>
      <view class="sheet-panel">
        <view class="sheet-handle"></view>
        <view class="sheet-header">
          <text class="sheet-title">选择服务地址</text>
          <uni-icons type="closeempty" size="20" color="#6b8f88" @click="closeAddressSheet" />
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
              :class="{ active: String(orderForm.addressId) === String(item.id) }"
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
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <view v-if="!isOrderDetailMode && tutorSheetVisible" class="sheet-overlay" @touchmove.stop.prevent>
      <view class="sheet-mask" @click="closeTutorSheet"></view>
      <view class="sheet-panel">
        <view class="sheet-handle"></view>
        <view class="sheet-header">
          <text class="sheet-title">选择陪伴官</text>
          <uni-icons type="closeempty" size="20" color="#6b8f88" @click="closeTutorSheet" />
        </view>
        <scroll-view scroll-y class="sheet-scroll">
          <view v-if="tutorLoading" class="sheet-empty">陪伴官列表加载中...</view>
          <view v-else-if="!tutorList.length" class="sheet-empty">暂无绑定陪伴官，请先等待平台匹配</view>
          <view v-else class="tutor-list">
            <view
              v-for="item in tutorList"
              :key="item.bindingId || item.id || item.tutorId"
              class="tutor-option"
              :class="{ active: String(selectedTutor.bindingId) === String(item.bindingId || item.id) }"
              @click="selectTutor(item)"
            >
              <view class="tutor-main">
                <view class="tutor-title-row">
                  <text class="tutor-name">{{ item.realName || '未命名陪伴官' }}</text>
                  <text v-if="item.recommended" class="recommend-badge">推荐</text>
                </view>
                <text class="tutor-meta">{{ buildTutorMetaText(item) || '资料待完善' }}</text>
              </view>
              <uni-icons
                v-if="String(selectedTutor.bindingId) === String(item.bindingId || item.id)"
                type="checkmarkempty"
                size="18"
                color="#14B8A6"
              />
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  createTutoringOrder,
  getBindableTutors,
  getMyParentDemandDetail,
  getMyTutoringOrders,
  getTutoringOrderDetail,
  listServiceAddresses,
  setDefaultServiceAddress
} from '@/api/wxmini/tutoring'
import { listBaby } from '@/pages/mine/course-package/_api/wxmini/baby'
import UniCalendar from '@/uni_modules/uni-calendar/components/uni-calendar/uni-calendar.vue'
import {
  buildParentApplyForm,
  formatAddressLabel,
  formatAddressMeta,
  normalizeBabyList,
  shouldShowBabyEmptyState
} from '@/pages/mine/course-package/_utils/parentApply'
import {
  buildPaidTutoringPackageOrderCenterUrl,
  buildCreatedOrderPreview,
  buildServiceTimes,
  getSubmitText,
  isCoursePackageDetailMode
} from './coursePackage.helpers'

const SUCCESS_NAVIGATION_DELAY_MS = 800

function createEmptyOrder() {
  return {
    id: '',
    orderNo: '',
    tutorName: '',
    lessonCount: 0,
    hourlyPrice: 0,
    amount: 0,
    status: '',
    statusLabel: ''
  }
}

function createEmptyTutor() {
  return {
    id: '',
    bindingId: '',
    tutorId: '',
    realName: '',
    school: '',
    currentGrade: '',
    quotePrice: ''
  }
}

function createDefaultTimeSlot() {
  return {
    serviceDates: [],
    startTime: '08:00',
    endTime: '10:00',
    durationHours: '2'
  }
}

function normalizeTimeText(value, fallback = '') {
  const text = trimText(value)
  return /^\d{2}:\d{2}$/.test(text) ? text : fallback
}

function normalizeTimeSlots(timeSlots = []) {
  const list = Array.isArray(timeSlots) ? timeSlots : []
  const normalized = list.map(item => {
    const startTime = normalizeTimeText(item?.startTime, '08:00')
    const durationHours = trimText(item?.durationHours) || '2'
    const endTime = normalizeTimeText(item?.endTime, addHoursToTime(startTime, durationHours))
    return {
      serviceDates: Array.isArray(item?.serviceDates) ? item.serviceDates.filter(Boolean).sort() : [],
      startTime,
      endTime,
      durationHours
    }
  })
  return normalized.length ? normalized : [createDefaultTimeSlot()]
}

function createDefaultOrderForm() {
  return {
    demandId: '',
    babyId: '',
    babyName: '',
    babyMeta: '',
    addressId: '',
    addressLabel: '',
    addressMeta: '',
    timeSlots: [createDefaultTimeSlot()]
  }
}

function formatAmount(value) {
  const num = Number(value || 0)
  return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}

function trimText(value) {
  return String(value || '').trim()
}

function addHoursToTime(time, hours = 2) {
  const match = trimText(time).match(/^(\d{2}):(\d{2})$/)
  if (!match) return ''
  const numericHours = Number(hours)
  if (!numericHours || numericHours <= 0) return ''
  const totalMinutes = Number(match[1]) * 60 + Number(match[2]) + numericHours * 60
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const hour = String(Math.floor(normalized / 60)).padStart(2, '0')
  const minute = String(normalized % 60).padStart(2, '0')
  return `${hour}:${minute}`
}

function buildTutorMetaText(item = {}) {
  const parts = []
  const school = trimText(item.school)
  const currentGrade = trimText(item.currentGrade)
  const price = trimText(item.quotePrice)
  if (school) parts.push(school)
  if (currentGrade) parts.push(currentGrade)
  if (price) parts.push(`¥${formatAmount(price)}/小时`)
  return parts.join(' · ')
}

function formatOrderServiceTimes(value) {
  const text = trimText(value)
  if (!text) return '-'
  try {
    const list = JSON.parse(text)
    if (!Array.isArray(list) || !list.length) return text
    return list
      .map(item => `${trimText(item.serviceDate)} ${trimText(item.startTime)}-${trimText(item.endTime)}`)
      .filter(item => item.trim() !== '-')
      .join('、') || text
  } catch (e) {
    return text
  }
}

export default {
  components: { UniCalendar },
  data() {
    return {
      loading: false,
      tutorLoading: false,
      babyLoading: false,
      addressLoading: false,
      submitting: false,
      tutorSheetVisible: false,
      babyPickerVisible: false,
      addressSheetVisible: false,
      activeTimeSlotIndex: -1,
      orderList: [],
      selectedOrderNo: '',
      currentOrder: createEmptyOrder(),
      tutorList: [],
      babyList: [],
      addressList: [],
      selectedTutor: createEmptyTutor(),
      orderForm: createDefaultOrderForm()
    }
  },
  computed: {
    orderStatusText() {
      if (this.currentOrder.statusLabel) return this.currentOrder.statusLabel
      const status = String(this.currentOrder.status ?? '')
      if (status === '0') return '待支付'
      if (status === '1') return '已支付'
      if (status === '2') return '已取消'
      return this.currentOrder.orderNo ? '处理中' : '待创建'
    },
    isOrderDetailMode() {
      return isCoursePackageDetailMode({ orderNo: this.selectedOrderNo })
    },
    orderServiceTimesText() {
      return formatOrderServiceTimes(this.currentOrder.serviceTimesSnapshot)
    },
    selectedTutorMeta() {
      return buildTutorMetaText(this.selectedTutor)
    },
    submitText() {
      return getSubmitText({
        submitting: this.submitting,
        hasOrderNo: Boolean(this.currentOrder.orderNo),
        readonly: this.isOrderDetailMode
      })
    },
    showBabyEmptyState() {
      return shouldShowBabyEmptyState(this.babyPickerVisible, this.babyList)
    }
  },
  onLoad(options = {}) {
    this.selectedOrderNo = options.orderNo || ''
    this.loadPageData()
  },
  onShow() {
    this.loadPageData()
  },
  methods: {
    formatAmount,
    buildTutorMetaText,
    async loadPageData() {
      this.loading = true
      try {
        if (this.isOrderDetailMode) {
          await this.loadSelectedOrderDetail()
          return
        }
        await Promise.all([
          this.loadOrders(),
          this.loadBabyList(),
          this.loadAddressList()
        ])
        await Promise.all([
          this.loadParentDemand(),
          this.loadTutorList()
        ])
      } finally {
        this.loading = false
      }
    },
    async loadOrders() {
      const res = await getMyTutoringOrders()
      const list = Array.isArray(res?.data) ? res.data : []
      this.orderList = list
      this.currentOrder = await this.resolveCurrentOrder(list)
    },
    async loadSelectedOrderDetail() {
      const detailRes = await getTutoringOrderDetail(this.selectedOrderNo)
      this.currentOrder = detailRes?.data?.orderNo ? detailRes.data : createEmptyOrder()
    },
    async resolveCurrentOrder(list) {
      if (!this.selectedOrderNo) return list[0] || createEmptyOrder()
      const matched = list.find(item => item.orderNo === this.selectedOrderNo)
      if (matched) return matched
      const res = await getTutoringOrderDetail(this.selectedOrderNo, { showError: false })
      return res?.data?.orderNo ? res.data : createEmptyOrder()
    },
    async loadParentDemand() {
      try {
        const res = await getMyParentDemandDetail()
        const detail = res?.data || null
        if (!detail?.id) return
        const form = buildParentApplyForm(detail, this.babyList, this.addressList)
        this.orderForm = {
          ...this.orderForm,
          demandId: detail.id,
          babyId: form.babyId || this.orderForm.babyId,
          babyName: form.babyName || detail.babyName || this.orderForm.babyName,
          babyMeta: form.babyMeta || this.orderForm.babyMeta,
          addressId: form.addressId || this.orderForm.addressId,
          addressLabel: form.addressLabel || this.orderForm.addressLabel,
          addressMeta: form.addressMeta || this.orderForm.addressMeta,
          timeSlots: normalizeTimeSlots(form.timeSlots)
        }
      } catch (e) {}
    },
    async loadBabyList() {
      this.babyLoading = true
      try {
        const res = await listBaby()
        this.babyList = normalizeBabyList(res?.data)
        if (!this.orderForm.babyId && this.babyList.length) {
          this.selectBaby(this.babyList[0], false)
        } else {
          this.syncSelectedBabyInfo()
        }
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
        if (!this.orderForm.addressId && this.addressList.length) {
          const selected = this.addressList.find(item => Number(item.isDefault) === 1) || this.addressList[0]
          this.selectAddress(selected, false)
        } else {
          this.syncSelectedAddressInfo()
        }
      } catch (e) {
        this.addressList = []
      } finally {
        this.addressLoading = false
      }
    },
    async loadTutorList() {
      this.tutorLoading = true
      try {
        const res = await getBindableTutors()
        this.tutorList = Array.isArray(res?.data) ? res.data : []
        if (!this.selectedTutor.bindingId && this.tutorList.length) {
          const selected = this.tutorList.find(item => item.selected || item.recommended) || this.tutorList[0]
          this.selectTutor(selected, false)
        }
      } catch (e) {
        this.tutorList = []
      } finally {
        this.tutorLoading = false
      }
    },
    syncSelectedBabyInfo() {
      if (!this.orderForm.babyId) return
      const selected = this.babyList.find(item => String(item.id) === String(this.orderForm.babyId))
      if (!selected) return
      this.selectBaby(selected, false)
    },
    syncSelectedAddressInfo() {
      if (!this.orderForm.addressId) return
      const selected = this.addressList.find(item => String(item.id) === String(this.orderForm.addressId))
      if (!selected) return
      this.selectAddress(selected, false)
    },
    handleBabyPickerToggle() {
      if (this.isOrderDetailMode) return
      this.addressSheetVisible = false
      this.tutorSheetVisible = false
      this.babyPickerVisible = !this.babyPickerVisible
      if (this.babyPickerVisible && !this.babyList.length && !this.babyLoading) {
        this.loadBabyList()
      }
    },
    selectBaby(item, close = true) {
      this.orderForm = {
        ...this.orderForm,
        babyId: item.id || '',
        babyName: item.displayName || '',
        babyMeta: item.meta || ''
      }
      if (close) this.babyPickerVisible = false
    },
    handleToBabyManager() {
      this.babyPickerVisible = false
      uni.navigateTo({ url: '/pages/mine/baby/index' })
    },
    openAddressSheet() {
      if (this.isOrderDetailMode) return
      this.babyPickerVisible = false
      this.tutorSheetVisible = false
      this.addressSheetVisible = true
      if (!this.addressList.length && !this.addressLoading) {
        this.loadAddressList()
      }
    },
    closeAddressSheet() {
      this.addressSheetVisible = false
    },
    formatAddressText(item) {
      return formatAddressLabel(item)
    },
    selectAddress(item, close = true) {
      this.orderForm = {
        ...this.orderForm,
        addressId: item.id || '',
        addressLabel: formatAddressLabel(item) || '默认服务地址',
        addressMeta: formatAddressMeta(item)
      }
      if (close) this.closeAddressSheet()
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
    resetTimeSlot() {
      if (this.isOrderDetailMode) return
      this.orderForm = {
        ...this.orderForm,
        timeSlots: [createDefaultTimeSlot()]
      }
    },
    openServiceDateCalendar(index) {
      if (this.isOrderDetailMode) return
      if (!this.$refs.serviceCalendar || typeof this.$refs.serviceCalendar.open !== 'function') {
        uni.showToast({ title: '日历组件加载中，请稍后重试', icon: 'none' })
        return
      }
      this.activeTimeSlotIndex = index
      this.$refs.serviceCalendar.open()
    },
    onServiceDateConfirm(e) {
      const index = this.activeTimeSlotIndex
      if (index < 0 || !Array.isArray(this.orderForm.timeSlots) || !this.orderForm.timeSlots[index]) return
      const rangeDates = Array.isArray(e?.range?.data) ? e.range.data : []
      const singleDate = e?.fulldate || e?.date || ''
      const nextDates = [...new Set([...(rangeDates.length ? rangeDates : [singleDate])].filter(Boolean))].sort()
      if (!nextDates.length) return
      this.orderForm = {
        ...this.orderForm,
        timeSlots: this.orderForm.timeSlots.map((item, currentIndex) => currentIndex === index ? { ...item, serviceDates: nextDates } : item)
      }
      this.activeTimeSlotIndex = -1
    },
    removeServiceDate(index, date) {
      this.orderForm = {
        ...this.orderForm,
        timeSlots: this.orderForm.timeSlots.map((item, currentIndex) => {
          if (currentIndex !== index) return item
          return {
            ...item,
            serviceDates: (Array.isArray(item.serviceDates) ? item.serviceDates : []).filter(currentDate => currentDate !== date)
          }
        })
      }
    },
    addTimeSlot() {
      if (this.isOrderDetailMode) return
      this.orderForm = {
        ...this.orderForm,
        timeSlots: [...this.orderForm.timeSlots, createDefaultTimeSlot()]
      }
    },
    removeTimeSlot(index) {
      if (this.isOrderDetailMode) return
      if (this.orderForm.timeSlots.length <= 1) return
      this.orderForm = {
        ...this.orderForm,
        timeSlots: this.orderForm.timeSlots.filter((_, currentIndex) => currentIndex !== index)
      }
    },
    onTimeSlotStartChange(index, e) {
      const startTime = e.detail.value
      this.orderForm = {
        ...this.orderForm,
        timeSlots: this.orderForm.timeSlots.map((item, currentIndex) => {
          if (currentIndex !== index) return item
          const durationHours = item.durationHours || '2'
          return {
            ...item,
            startTime,
            endTime: addHoursToTime(startTime, durationHours)
          }
        })
      }
    },
    onTimeSlotDurationChange(index, e) {
      const durationHours = trimText(e?.detail?.value).replace(/[^\d.]/g, '')
      this.orderForm = {
        ...this.orderForm,
        timeSlots: this.orderForm.timeSlots.map((item, currentIndex) => {
          if (currentIndex !== index) return item
          return {
            ...item,
            durationHours,
            endTime: item.startTime && durationHours ? addHoursToTime(item.startTime, durationHours) : ''
          }
        })
      }
    },
    openTutorSheet() {
      if (this.isOrderDetailMode) return
      this.babyPickerVisible = false
      this.addressSheetVisible = false
      this.tutorSheetVisible = true
      if (!this.tutorList.length && !this.tutorLoading) {
        this.loadTutorList()
      }
    },
    closeTutorSheet() {
      this.tutorSheetVisible = false
    },
    selectTutor(item, close = true) {
      this.selectedTutor = {
        ...item,
        id: item.id || item.bindingId || '',
        bindingId: item.bindingId || item.id || '',
        tutorId: item.tutorId || '',
        realName: item.realName || '',
        school: item.school || '',
        currentGrade: item.currentGrade || '',
        quotePrice: item.quotePrice || ''
      }
      if (close) this.closeTutorSheet()
    },
    buildOrderPayload() {
      return {
        bindingId: Number(this.selectedTutor.bindingId),
        serviceTimes: JSON.stringify(buildServiceTimes(this.orderForm.timeSlots))
      }
    },
    async handleCreateOrder() {
      if (this.isOrderDetailMode) return
      if (this.submitting) return
      if (!this.selectedTutor.bindingId) {
        uni.showToast({ title: '请先选择陪伴官', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        const orderRes = await createTutoringOrder(this.buildOrderPayload(), { showError: false })
        const orderData = orderRes?.data || {}
        this.currentOrder = buildCreatedOrderPreview(this.currentOrder, orderData)
        const payParam = orderData.payParam || {}
        await uni.requestPayment({
          provider: 'wxpay',
          appId: payParam.appId || payParam.appid,
          timeStamp: payParam.timeStamp,
          nonceStr: payParam.nonceStr,
          package: payParam.packageValue || payParam.package,
          signType: payParam.signType || 'RSA',
          paySign: payParam.paySign
        })
        await this.refreshOrderDetail(orderData)
        const paidOrderCenterUrl = buildPaidTutoringPackageOrderCenterUrl(orderData.orderNo)
        uni.showToast({ title: '下单成功', icon: 'success' })
        setTimeout(() => {
          uni.redirectTo({ url: paidOrderCenterUrl })
        }, SUCCESS_NAVIGATION_DELAY_MS)
      } catch (e) {
        const message = e?.errMsg || e?.msg || ''
        if (/cancel/i.test(message)) {
          uni.showToast({ title: '支付已取消，可稍后继续', icon: 'none' })
          return
        }
        uni.showToast({ title: message || '下单失败，请重试', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    async refreshOrderDetail(orderData = {}) {
      if (!orderData.orderNo) {
        await this.loadOrders()
        return
      }
      try {
        const detailRes = await getTutoringOrderDetail(orderData.orderNo, { showError: false })
        this.currentOrder = detailRes?.data?.orderNo ? detailRes.data : orderData
      } catch (e) {
        this.currentOrder = orderData
      }
    }
  }
}
</script>

<style lang="scss">
page {
  background: #f3fbf8;
}

.page {
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  background: #f3fbf8;
}

.hero-card,
.section-card {
  background: #ffffff;
  border-radius: 15rpx;
  padding: 18px 16px;
  margin-bottom: 14px;
  box-shadow: 0 8px 24px rgba(20, 184, 166, 0.08);
}

.hero-card {
  color: #ffffff;
  background: linear-gradient(135deg, #0ea5a4 0%, #14b8a6 58%, #22c55e 100%);
}

.hero-top,
.hero-stats,
.section-header,
.info-row,
.form-label-row,
.selector-box,
.picker-box,
.address-option-top,
.address-option-actions,
.tutor-option,
.tutor-title-row,
.sheet-action-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.hero-top,
.info-row,
.form-label-row,
.selector-box,
.picker-box,
.address-option-top,
.tutor-option,
.sheet-action-row {
  justify-content: space-between;
}

.hero-title {
  display: block;
  font-size: 24px;
  font-weight: 700;
}

.hero-desc {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.84);
}

.recommend-badge,
.default-badge,
.sheet-primary-btn {
  border-radius: 15rpx;
}

.hero-stats {
  margin-top: 22px;
  justify-content: space-between;
}

.hero-stat {
  flex: 1;
}

.hero-stat-num,
.hero-stat-label {
  display: block;
  text-align: center;
}

.hero-stat-num {
  font-size: 17px;
  font-weight: 700;
}

.hero-stat-label {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.section-header {
  margin-bottom: 14px;
}

.section-icon {
  width: 28px;
  height: 28px;
  border-radius: 15rpx;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecfdf5;
}

.section-icon.soft {
  background: #dff4ee;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
}

.form-item {
  margin-bottom: 16px;
}

.form-item.no-margin {
  margin-bottom: 0;
}

.form-label,
.info-label {
  font-size: 13px;
  color: #6b8f88;
}

.form-label {
  display: block;
  margin-bottom: 6px;
}

.info-row {
  padding: 12px 0;
  border-bottom: 1px solid #dff4ee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-value {
  max-width: 220px;
  font-size: 14px;
  color: #0f3d3a;
  text-align: right;
}

.form-link,
.address-action {
  font-size: 12px;
  color: #0f766e;
}

.selector-box {
  min-height: 52px;
  padding: 0 14px;
  border: 1px solid #dff4ee;
  border-radius: 15rpx;
  background: #f8fffc;
  box-sizing: border-box;
}

.selector-main,
.address-option-main,
.tutor-main {
  flex: 1;
  min-width: 0;
}

.selector-text,
.selector-meta,
.tutor-meta {
  display: block;
}

.selector-text {
  font-size: 15px;
  color: #0f3d3a;
}

.selector-text.placeholder {
  color: #9bb8b1;
}

.selector-meta,
.address-option-meta,
.tutor-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #6b8f88;
}

.sheet-empty {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: #9bb8b1;
}

.selector-box-address {
  padding-top: 10px;
  padding-bottom: 10px;
}

.selector-main-address {
  padding-right: 12px;
}

.selector-text-ellipsis {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.baby-picker {
  position: relative;
}

.baby-picker-panel {
  margin-top: 8px;
  background: #ffffff;
  border: 1px solid #dff4ee;
  border-radius: 15rpx;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(20, 184, 166, 0.08);
}

.baby-picker-state {
  padding: 16px;
  font-size: 13px;
  color: #9bb8b1;
  text-align: center;
}

.baby-picker-action {
  margin: 0 16px 16px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 15rpx;
  background: #ecfdf5;
  color: #0f766e;
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
  border-radius: 15rpx;
}

.baby-option.active,
.address-option.active {
  background: #ecfdf5;
}

.baby-option-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.baby-option-name {
  font-size: 14px;
  color: #0f3d3a;
}

.baby-option-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #6b8f88;
}

.time-actions {
  display: flex;
  gap: 12px;
}

.form-input,
.picker-box {
  width: 100%;
  min-height: 44px;
  background: #ffffff;
  border: 1px solid #dff4ee;
  border-radius: 15rpx;
  padding: 0 12px;
  font-size: 14px;
  color: #0f3d3a;
  box-sizing: border-box;
}

.form-input {
  height: 44px;
}

.picker-box {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.picker-box-full {
  width: 100%;
}

.picker-text {
  font-size: 14px;
  color: #0f3d3a;
}

.picker-text.placeholder,
.time-slot-result-value.placeholder {
  color: #9bb8b1;
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
  border-radius: 15rpx;
  background: #ecfdf5;
  color: #0f766e;
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
  border-radius: 15rpx;
  background: #f8fffc;
  border: 1px solid #dff4ee;
}

.time-slot-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time-slot-title {
  font-size: 13px;
  font-weight: 600;
  color: #0f3d3a;
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

.time-slot-date-field {
  margin-top: 10px;
}

.time-slot-duration-field {
  max-width: 120px;
}

.time-slot-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6b8f88;
}

.duration-input {
  text-align: center;
}

.time-slot-result {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 15rpx;
  background: #ffffff;
  border: 1px dashed #9ee9dc;
}

.time-slot-result-label {
  display: block;
  font-size: 12px;
  color: #6b8f88;
  margin-bottom: 4px;
}

.time-slot-result-value {
  font-size: 14px;
  color: #0f3d3a;
}

.action-btn {
  height: 48px;
  margin-top: 16px;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
  box-shadow: 0 10px 24px rgba(20, 184, 166, 0.2);
}

.action-btn.disabled {
  opacity: 0.55;
}

.action-text {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.loading-mask,
.sheet-overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.loading-mask {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 255, 252, 0.72);
}

.loading-text {
  padding: 10px 16px;
  border-radius: 15rpx;
  font-size: 14px;
  color: #0f3d3a;
  background: #ffffff;
}

.sheet-overlay {
  z-index: 1000;
}

.sheet-mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
}

.sheet-panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 72vh;
  padding: 10px 16px 24px;
  border-radius: 15rpx 15rpx 0 0;
  background: #ffffff;
}

.sheet-handle {
  width: 42px;
  height: 4px;
  margin: 0 auto 14px;
  border-radius: 15rpx;
  background: #b8d8d1;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sheet-title {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
}

.sheet-primary-btn {
  padding: 8px 14px;
  margin-bottom: 12px;
  background: #ecfdf5;
  color: #0f766e;
  font-size: 13px;
  font-weight: 600;
}

.sheet-scroll {
  max-height: 54vh;
}

.address-option-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.address-option {
  padding: 14px;
  border: 1px solid #dff4ee;
  border-radius: 15rpx;
  background: #ffffff;
}

.address-option-title {
  flex: 1;
  padding-right: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0f3d3a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.default-badge {
  padding: 2px 8px;
  background: #ecfdf5;
  color: #0f766e;
  font-size: 11px;
  flex-shrink: 0;
}

.address-option-actions {
  justify-content: flex-start;
  gap: 14px;
  margin-top: 10px;
}

.tutor-option {
  min-height: 66px;
  padding: 12px 0;
  border-bottom: 1px solid #dff4ee;
}

.tutor-option.active .tutor-name {
  color: #0f766e;
}

.tutor-name {
  font-size: 16px;
  font-weight: 700;
  color: #0f3d3a;
}

.recommend-badge {
  margin-left: 8px;
  padding: 2px 7px;
  font-size: 11px;
  color: #0f766e;
  background: #ecfdf5;
}
</style>
