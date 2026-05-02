<template>
  <scroll-view class="mine-container" scroll-y>
    <view class="header-section">
      <view class="header-top">
        <view class="user-left">
          <view class="user-detail">
            <view v-if="!name" @click="handleToLogin" class="login-tip">点击登录</view>
            <view v-else class="user-name-row">
              <text class="user-name">{{ name }}</text>
              <view v-if="shouldEnableRegularContent" class="user-identity-tag" :class="`tag-${userType}`" @click="handleSwitchIdentity">
                <text class="tag-text">{{ userIdentityLabel }}</text>
                <uni-icons type="redo" size="12" color="#ffffff" />
              </view>
            </view>
          </view>
        </view>
        <view v-if="shouldEnableRegularContent" class="header-right" @click="handleToProfile">
          <text class="homepage-text">个人主页</text>
          <uni-icons type="right" size="14" color="#ECFEF6" />
        </view>
      </view>

      <view v-if="showPrimaryCard" class="primary-cta-card" @click="handlePrimaryAction">
        <view>
          <view class="primary-cta-title">{{ primaryActionTitle }}</view>
          <view class="primary-cta-desc">{{ primaryActionDesc }}</view>
        </view>
        <view class="primary-cta-btn">立即前往</view>
      </view>

      <view v-if="shouldEnableRegularContent" class="stats-row">
        <view class="stat-item" @click="handleToEnrollment">
          <text class="stat-num">{{ enrollmentList }}</text>
          <view class="stat-btn">我的学籍</view>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @click="handleBuilding">
          <text class="stat-num">{{ jifen }}</text>
          <view class="stat-btn">我的积分</view>
        </view>
      </view>
    </view>

    <view class="content-section">
      <view v-if="shouldEnableRegularContent" class="card">
        <view class="card-title">学习中心</view>
        <view class="study-grid">
          <view
            v-for="studyItem in studyItems"
            :key="studyItem.key"
            class="study-item"
            :class="studyItem.cardClass"
            @click="studyItem.onClick"
          >
            <view class="study-icon-wrap">
              <uni-icons :type="studyItem.icon" size="28" :color="studyItem.iconColor" />
            </view>
            <text class="study-label">{{ studyItem.label }}</text>
          </view>
        </view>
      </view>

      <view class="menu-card">
        <template v-for="(menuItem, index) in menuItems" :key="menuItem.key">
          <view class="menu-item" @click="menuItem.onClick">
            <view class="menu-left">
              <view class="menu-icon-wrap" :class="menuItem.iconClass">
                <uni-icons :type="menuItem.icon" size="22" :color="menuItem.iconColor" />
              </view>
              <text class="menu-text">{{ menuItem.label }}</text>
            </view>
            <view v-if="menuItem.description" class="menu-right-info">
              <text class="menu-desc">{{ menuItem.description }}</text>
              <uni-icons type="right" size="14" color="#94B8AD" />
            </view>
            <uni-icons v-else type="right" size="14" color="#94B8AD" />
          </view>
          <view v-if="index < menuItems.length - 1" class="menu-divider"></view>
        </template>
      </view>
    </view>
  <view v-if="showMerchantAgentEntry" class="agent-float-btn" @click="handleOpenMerchantAgent">
      <uni-icons type="staff-filled" size="18" color="#ffffff" />
      <text class="agent-float-text">{{ agentPopupLoading ? '加载中...' : '成为代理' }}</text>
    </view>
  </scroll-view>

  <view v-if="showMerchantAgentPopup" class="dialog-overlay" @touchmove.stop.prevent>
    <view class="dialog-mask" :class="{ 'dialog-mask--active': merchantAgentPopupVisible }" @click="closeMerchantAgentPopup"></view>
    <view class="dialog-sheet" :class="{ 'dialog-sheet--active': merchantAgentPopupVisible }">
      <view class="dialog-card">
        <view class="dialog-header">
          <text class="dialog-title">{{ merchantAgentPopup.title }}</text>
          <view class="dialog-close" @click="closeMerchantAgentPopup">
            <uni-icons type="closeempty" size="18" color="#64748B" />
          </view>
        </view>
        <text class="dialog-content">{{ merchantAgentPopup.content }}</text>
        <image
          v-if="merchantAgentPopup.imageUrl"
          class="dialog-qrcode"
          :src="merchantAgentPopup.imageUrl"
          mode="aspectFit"
          @click="previewPopupImage(merchantAgentPopup.imageUrl)"
        />
        <text v-if="merchantAgentPopup.tips" class="dialog-tips">{{ merchantAgentPopup.tips }}</text>
        <view v-if="merchantAgentPopup.contact" class="dialog-contact-row">
          <text class="dialog-contact-label">联系方式</text>
          <text class="dialog-contact-value">{{ merchantAgentPopup.contact }}</text>
        </view>
        <view class="dialog-btn-row" :class="{ 'is-single': !merchantAgentPopup.contact }">
          <view
            v-if="merchantAgentPopup.contact"
            class="dialog-btn dialog-btn-secondary"
            @click="copyText(merchantAgentPopup.contact, '联系方式已复制')"
          >
            <text class="dialog-btn-secondary-text">复制联系方式</text>
          </view>
          <view class="dialog-btn dialog-btn-primary" @click="closeMerchantAgentPopup">
            <text class="dialog-btn-primary-text">{{ merchantAgentPopup.buttonText }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>

  <view v-if="showParttimeGroupPopup" class="dialog-overlay" @touchmove.stop.prevent>
    <view class="dialog-mask" :class="{ 'dialog-mask--active': parttimeGroupPopupVisible }" @click="closeParttimeGroupPopup"></view>
    <view class="dialog-sheet" :class="{ 'dialog-sheet--active': parttimeGroupPopupVisible }">
      <view class="dialog-card">
        <view class="dialog-header">
          <text class="dialog-title">{{ parttimeGroupPopup.title }}</text>
          <view class="dialog-close" @click="closeParttimeGroupPopup">
            <uni-icons type="closeempty" size="18" color="#64748B" />
          </view>
        </view>
        <text class="dialog-content">{{ parttimeGroupPopup.content }}</text>
        <image
          v-if="parttimeGroupPopup.imageUrl"
          class="dialog-qrcode"
          :src="parttimeGroupPopup.imageUrl"
          mode="aspectFit"
          @click="previewPopupImage(parttimeGroupPopup.imageUrl)"
        />
        <text v-if="parttimeGroupPopup.tips" class="dialog-tips">{{ parttimeGroupPopup.tips }}</text>
        <view v-if="parttimeGroupPopup.contact" class="dialog-contact-row">
          <text class="dialog-contact-label">群备注</text>
          <text class="dialog-contact-value">{{ parttimeGroupPopup.contact }}</text>
        </view>
        <view class="dialog-btn-row" :class="{ 'is-single': !parttimeGroupPopup.contact }">
          <view
            v-if="parttimeGroupPopup.contact"
            class="dialog-btn dialog-btn-secondary"
            @click="copyText(parttimeGroupPopup.contact, '群备注已复制')"
          >
            <text class="dialog-btn-secondary-text">复制群备注</text>
          </view>
          <view class="dialog-btn dialog-btn-primary" @click="closeParttimeGroupPopup">
            <text class="dialog-btn-primary-text">{{ parttimeGroupPopup.buttonText }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>

  <login-popup
    :auto-open="shouldAutoOpenLogin"
    account-success-url=""
    wechat-success-url=""
    realtime-phone-success-url=""
    @close="handleLoginPopupClose"
    @success="handleLoginSuccess"
  />
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'
import { useUserStore } from '@/store'
import { hasUserType, normalizeUserType, USER_TYPES } from '@/utils/userType'
import { getTotalEnrollments } from '@/api/wxmini/growup'
import { getWxUserProfileDetail } from '@/api/wxmini/profile'
import { getMerchantAgentConfig, getParttimeGroupQrcode } from '@/api/wxmini/config'
import { isAdminUser, shouldEnableRegularMineFeatures } from '@/utils/admin'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const { name, roles, token, userType } = storeToRefs(userStore)
const jifen = ref(0)
const enrollmentList = ref(0)
const shouldAutoOpenLogin = ref(false)
const profileDetail = ref(null)
const agentPopupLoading = ref(false)
const groupPopupLoading = ref(false)
const showMerchantAgentPopup = ref(false)
const merchantAgentPopupVisible = ref(false)
const showParttimeGroupPopup = ref(false)
const parttimeGroupPopupVisible = ref(false)
const merchantAgentPopup = ref(createPopupState({
  title: '成为代理',
  content: '加载中...'
}))
const parttimeGroupPopup = ref(createPopupState({
  title: '兼职群二维码',
  content: '加载中...'
}))

const hasLogin = computed(() => Boolean(token.value))
const normalizedUserType = computed(() => normalizeUserType(userType.value))
const hasSelectedUserType = computed(() => hasUserType(normalizedUserType.value))

const isAdmin = computed(() => isAdminUser(token.value, roles.value))
const shouldEnableRegularContent = computed(() => shouldEnableRegularMineFeatures(token.value, roles.value))
const showWalletEntry = computed(() => shouldEnableRegularContent.value && hasLogin.value)
const showScheduleEntry = computed(() => normalizedUserType.value === USER_TYPES.AUNT && shouldEnableRegularContent.value)
const showParttimeGroupEntry = computed(() => normalizedUserType.value === USER_TYPES.AUNT && shouldEnableRegularContent.value)
const showMerchantAgentEntry = computed(() => normalizedUserType.value === USER_TYPES.MERCHANT && shouldEnableRegularContent.value)

const userIdentityLabel = computed(() => {
  const labels = { [USER_TYPES.PARENT]: '家长', [USER_TYPES.STUDENT]: '学生', [USER_TYPES.MERCHANT]: '商家', [USER_TYPES.AUNT]: '兼职' }
  return labels[normalizedUserType.value] || '未设置'
})

const showPrimaryCard = computed(() => hasLogin.value && shouldEnableRegularContent.value)
const studyItems = computed(() => {
  if (!shouldEnableRegularContent.value) {
    return []
  }
  return [
    { key: 'course', label: '已报课程', icon: 'calendar-filled', iconColor: '#0F9D8F', cardClass: 'study-course', onClick: handleToCourse },
    { key: 'order', label: '我的订单', icon: 'list', iconColor: '#16A34A', cardClass: 'study-order', onClick: handleToOrderCenter },
    { key: 'notes', label: '课程笔记', icon: 'compose', iconColor: '#0EA5A4', cardClass: 'study-note', onClick: handleBuilding }
  ]
})
const primaryActionPath = computed(() => {
  if (normalizedUserType.value === USER_TYPES.STUDENT) return '/pages/tutoring/tutor/index'
  if (normalizedUserType.value === USER_TYPES.PARENT) return '/pages/tutoring/parent/apply'
  if (normalizedUserType.value === USER_TYPES.MERCHANT) return '/pages/jobs/apply'
  if (normalizedUserType.value === USER_TYPES.AUNT) return '/pages/mine/info/index'
  return profileDetail.value?.primaryAction || '/pages/guide/index'
})
const primaryActionTitle = computed(() => {
  if (normalizedUserType.value === USER_TYPES.PARENT) return '发布需求'
  if (normalizedUserType.value === USER_TYPES.STUDENT) return '做家教'
  if (normalizedUserType.value === USER_TYPES.MERCHANT) return '发布招聘'
  if (normalizedUserType.value === USER_TYPES.AUNT) return '完善资料'
  return '选择身份'
})
const primaryActionDesc = computed(() => {
  if (normalizedUserType.value === USER_TYPES.PARENT) return '快速发布请家教需求，匹配优质教员'
  if (normalizedUserType.value === USER_TYPES.STUDENT) return '完善资料并申请做家教'
  if (normalizedUserType.value === USER_TYPES.MERCHANT) return '发布招聘信息，快速招募人才'
  if (normalizedUserType.value === USER_TYPES.AUNT) return '完善基础信息，方便后续展示与使用平台服务'
  return '先选择身份，为您推荐更适合的内容和服务'
})

const baseMenuItems = [
  { key: 'wallet', label: '我的钱包', icon: 'wallet-filled', iconColor: '#0F9D8F', iconClass: 'menu-icon-primary', description: '收入提现与工资流水', visible: showWalletEntry, onClick: handleToWallet },
  { key: 'schedule', label: '兼职安排', icon: 'calendar-filled', iconColor: '#2563EB', iconClass: 'menu-icon-primary', description: '查看近期工作安排', visible: showScheduleEntry, onClick: handleToSchedule },
  { key: 'group', label: '兼职群二维码', icon: 'chatboxes-filled', iconColor: '#7C3AED', iconClass: 'menu-icon-soft', description: '扫码加入兼职通知群', visible: showParttimeGroupEntry, onClick: handleOpenParttimeGroup },
  { key: 'baby', label: '萌娃管理', icon: 'person-filled', iconColor: '#7C3AED', iconClass: 'menu-icon-primary', onClick: handleToBaby },
  { key: 'feedback', label: '课程建议及评价', icon: 'heart-filled', iconColor: '#0F9D8F', iconClass: 'menu-icon-primary', onClick: handleBuilding },
  { key: 'salon', label: '我的沙龙活动', icon: 'staff-filled', iconColor: '#14B8A6', iconClass: 'menu-icon-soft', onClick: handleBuilding },
  { key: 'service', label: '客服电话', icon: 'headphones', iconColor: '#059669', iconClass: 'menu-icon-light', description: '周一至周日 09:00-24:00', onClick: handleBuilding },
  { key: 'setting', label: '设置', icon: 'gear-filled', iconColor: '#0F766E', iconClass: 'menu-icon-muted', onClick: handleToSetting }
]

const menuItems = computed(() => {
  if (isAdmin.value) {
    return [
      { key: 'admin', label: '管理后台', icon: 'staff-filled', iconColor: '#047857', iconClass: 'menu-icon-primary', onClick: handleToAdmin },
      { key: 'setting', label: '设置', icon: 'gear-filled', iconColor: '#0F766E', iconClass: 'menu-icon-muted', onClick: handleToSetting }
    ]
  }

  return baseMenuItems.filter(item => {
    if (item.key === 'baby') return normalizedUserType.value === USER_TYPES.PARENT
    if (Object.prototype.hasOwnProperty.call(item, 'visible')) return item.visible.value
    return true
  })
})

function createPopupState(overrides = {}) {
  return {
    title: '温馨提示',
    content: '',
    tips: '',
    imageUrl: '',
    contact: '',
    buttonText: '我知道了',
    ...overrides
  }
}

function withLogin(action) {
  if (!hasLogin.value) {
    shouldAutoOpenLogin.value = true
    return
  }
  if (typeof action === 'function') action()
}

function handleToLogin() {
  shouldAutoOpenLogin.value = true
}

function handleLoginPopupClose() {
  shouldAutoOpenLogin.value = false
}

function handleToCourse() {
  withLogin(() => {
    uni.navigateTo({ url: '/pages/mine/course/list' })
  })
}

function loadEnrollment() {
  if (!shouldEnableRegularContent.value) {
    return
  }
  getTotalEnrollments().then(res => {
    enrollmentList.value = res.data
  })
}

async function loadProfileDetail() {
  if (!hasLogin.value || !shouldEnableRegularContent.value) return
  const res = await getWxUserProfileDetail()
  profileDetail.value = res.data || {}
  userStore.updateWxProfileState(res.data || {})
}

async function ensureUserTypeReady() {
  if (!hasLogin.value || !shouldEnableRegularContent.value) return
  await loadProfileDetail()
  if (!hasSelectedUserType.value) {
    proxy.$tab.navigateTo('/pages/guide/index')
  }
}

function initRegularMineData() {
  if (!hasLogin.value || !shouldEnableRegularContent.value) {
    return
  }
  loadEnrollment()
  ensureUserTypeReady()
}

function handleLoginSuccess() {
  shouldAutoOpenLogin.value = false
  initRegularMineData()
}

function handleToEnrollment() {
  withLogin(() => {
    proxy.$tab.navigateTo('/pages/mine/enrollment/index')
  })
}

function handleToProfile() {
  withLogin(() => {
    proxy.$tab.navigateTo('/pages/mine/info/index')
  })
}

function handleSwitchIdentity() {
  withLogin(() => {
    proxy.$tab.navigateTo('/pages/guide/index')
  })
}

function handleToOrderCenter() {
  withLogin(() => {
    proxy.$tab.navigateTo('/pages/mine/order-center/index')
  })
}

function handleToBaby() {
  withLogin(() => {
    proxy.$tab.navigateTo('/pages/mine/baby/index')
  })
}

function handleBuilding() {
  withLogin(() => {
    proxy.$modal.showToast('功能正在建设中~')
  })
}

function handleToWallet() {
  withLogin(() => {
    proxy.$tab.navigateTo('/pages/mine/wallet/index')
  })
}

function handleToSchedule() {
  withLogin(() => {
    proxy.$tab.navigateTo('/pages/jobs/schedules')
  })
}

function handleToSetting() {
  withLogin(() => {
    proxy.$tab.navigateTo('/pages/mine/setting/index')
  })
}

function handleToAdmin() {
  withLogin(() => {
    proxy.$tab.navigateTo('/pages/mine/admin/index')
  })
}

function handlePrimaryAction() {
  withLogin(() => {
    const target = primaryActionPath.value
    proxy.$tab.navigateTo(target)
  })
}

function previewPopupImage(imageUrl) {
  if (!imageUrl) return
  uni.previewImage({ urls: [imageUrl], current: imageUrl })
}

function copyText(value, successTitle = '复制成功') {
  if (!value) return
  uni.setClipboardData({
    data: String(value),
    success: () => {
      uni.showToast({ title: successTitle, icon: 'none' })
    }
  })
}

function normalizePopupResponse(data = {}, fallbackTitle = '温馨提示') {
  return createPopupState({
    title: data.title || fallbackTitle,
    content: data.content || data.description || data.tips || '请按照提示完成后续操作。',
    tips: data.tips || data.subTitle || data.remark || '',
    imageUrl: data.qrcodeUrl || data.qrCodeUrl || data.imageUrl || data.url || '',
    contact: data.contact || data.wechat || data.wechatNo || data.groupRemark || data.note || '',
    buttonText: data.buttonText || '我知道了'
  })
}

function openMerchantAgentPopup() {
  showMerchantAgentPopup.value = true
  setTimeout(() => {
    merchantAgentPopupVisible.value = true
  }, 20)
}

function closeMerchantAgentPopup() {
  merchantAgentPopupVisible.value = false
  setTimeout(() => {
    showMerchantAgentPopup.value = false
  }, 220)
}

function openParttimeGroupPopup() {
  showParttimeGroupPopup.value = true
  setTimeout(() => {
    parttimeGroupPopupVisible.value = true
  }, 20)
}

function closeParttimeGroupPopup() {
  parttimeGroupPopupVisible.value = false
  setTimeout(() => {
    showParttimeGroupPopup.value = false
  }, 220)
}

async function handleOpenMerchantAgent() {
  withLogin(async () => {
    if (agentPopupLoading.value) return
    agentPopupLoading.value = true
    merchantAgentPopup.value = createPopupState({
      title: '成为代理',
      content: '正在加载代理配置，请稍候...'
    })
    openMerchantAgentPopup()
    try {
      const res = await getMerchantAgentConfig()
      merchantAgentPopup.value = normalizePopupResponse(res?.data || {}, '成为代理')
    } catch (e) {
      merchantAgentPopup.value = createPopupState({
        title: '成为代理',
        content: e?.msg || '代理配置暂未开放，请稍后重试。'
      })
    } finally {
      agentPopupLoading.value = false
    }
  })
}

async function handleOpenParttimeGroup() {
  withLogin(async () => {
    if (groupPopupLoading.value) return
    groupPopupLoading.value = true
    parttimeGroupPopup.value = createPopupState({
      title: '兼职群二维码',
      content: '正在加载群二维码，请稍候...'
    })
    openParttimeGroupPopup()
    try {
      const res = await getParttimeGroupQrcode()
      parttimeGroupPopup.value = normalizePopupResponse(res?.data || {}, '兼职群二维码')
    } catch (e) {
      parttimeGroupPopup.value = createPopupState({
        title: '兼职群二维码',
        content: e?.msg || '群二维码暂时不可用，请稍后再试。'
      })
    } finally {
      groupPopupLoading.value = false
    }
  })
}

onLoad(() => {
  if (!hasLogin.value) {
    return
  }
  initRegularMineData()
})

onShow(() => {
  if (hasLogin.value) {
    initRegularMineData()
  }
})
</script>

<style lang="scss" scoped src="./index.scss"></style>
