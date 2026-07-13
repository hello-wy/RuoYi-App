<template>
  <scroll-view class="mine-container" scroll-y>
    <view class="header-section">
      <view class="header-top">
        <view class="user-left">
          <view class="user-detail">
            <view v-if="!hasLogin" @click="handleToLogin" class="login-tip">点击登录</view>
            <view v-else class="user-name-row">
              <text class="user-name">{{ mineDisplayName }}</text>
              <view class="verify-shield-btn" @click.stop="handleVerifyClick">
                <uni-icons type="auth-filled" size="18" :color="verifyShieldColor" />
                <text class="shield-mark">{{ isProfileVerified ? '✓' : '?' }}</text>
              </view>
              <view v-if="showRegularContent" class="user-identity-tag" :class="`tag-${userType}`" @click="handleSwitchIdentity">
                <text class="tag-text">{{ userIdentityLabel }}</text>
                <uni-icons type="redo" size="12" color="#ffffff" />
              </view>
            </view>
          </view>
        </view>
        <view v-if="showRegularContent" class="header-right" @click="handleToProfile">
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

      <view v-if="showRegularContent" class="stats-row">
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
      <view v-if="showRegularContent" class="card">
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
      <view v-if="hasLogin" class="logout-section">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </view>
  <view v-if="showAgentEntry" class="agent-float-btn" @click="handleOpenMerchantAgent">
      <uni-icons type="staff-filled" size="18" color="#ffffff" />
      <text class="agent-float-text">代理</text>
    </view>
  </scroll-view>

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

  <view v-if="showAgentPopup" class="dialog-overlay" @touchmove.stop.prevent>
    <view class="dialog-mask" :class="{ 'dialog-mask--active': agentPopupVisible }" @click="closeAgentPopup"></view>
    <view class="agent-dialog-sheet" :class="{ 'agent-dialog-sheet--active': agentPopupVisible }">
      <view class="agent-card">
        <view class="agent-header">
          <view class="agent-header-left">
            <text class="agent-title">{{ agentPopup.title }}</text>
            <text class="agent-subtitle">您的专属教育顾问</text>
          </view>
          <image
            v-if="agentPopup.imageUrl"
            class="agent-illustration"
            :src="agentPopup.imageUrl"
            mode="aspectFit"
          />
          <view v-else class="agent-illustration-placeholder">
            <uni-icons type="staff-filled" size="64" color="#d4f5ed" />
          </view>
          <view class="agent-close" @click="closeAgentPopup">
            <uni-icons type="closeempty" size="16" color="#ffffff" />
          </view>
        </view>

        <scroll-view v-if="agentPopup.content" scroll-y class="agent-body">
          <text class="agent-content">{{ agentPopup.content }}</text>
        </scroll-view>

        <view v-if="agentPopup.contact || agentPopup.phone" class="agent-contact-section">
          <view v-if="agentPopup.contact" class="agent-contact-row">
            <text class="agent-contact-label">联系人：</text>
            <text class="agent-contact-value">{{ agentPopup.contact }}</text>
          </view>
          <view v-if="agentPopup.contact && agentPopup.phone" class="agent-contact-divider"></view>
          <view v-if="agentPopup.phone" class="agent-contact-row">
            <text class="agent-contact-label">联系电话：</text>
            <text class="agent-contact-value" @click="callAgentPhone">{{ agentPopup.phone }}</text>
          </view>
        </view>

        <view class="agent-call-btn" @click="callAgentPhone">
          <text class="agent-call-btn-text">立即呼叫</text>
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
  <RealVerify
    ref="realVerifyRef"
    v-model:verified="verifyForm.verified"
    v-model:realName="verifyForm.realName"
    v-model:idCard="verifyForm.idCard"
    type="icon"
  />

  <!-- 微信昵称快速设置弹窗 -->
  <view v-if="showNicknamePopup" class="dialog-overlay" @touchmove.stop.prevent>
    <view class="dialog-mask" :class="{ 'dialog-mask--active': nicknamePopupVisible }" @click="closeNicknamePopup"></view>
    <view class="dialog-sheet" :class="{ 'dialog-sheet--active': nicknamePopupVisible }">
      <view class="dialog-card">
        <view class="dialog-header">
          <text class="dialog-title">设置微信昵称</text>
          <view class="dialog-close" @click="closeNicknamePopup">
            <uni-icons type="closeempty" size="18" color="#64748B" />
          </view>
        </view>
        <view class="nickname-form">
          <text class="nickname-tips">
            您的昵称目前为默认或为空，请点击下方输入框选择微信昵称或手动输入。
          </text>
          <view class="input-wrap">
            <input
              type="nickname"
              class="nickname-input"
              :value="tempNickname"
              placeholder="点击选择微信昵称或手动输入"
              @blur="handleNicknameBlur"
              @input="handleNicknameInput"
            />
          </view>
        </view>
        <view class="dialog-btn-row is-single">
          <view class="dialog-btn dialog-btn-primary" :class="{ 'is-disabled': !tempNickname || tempNickname === '微信用户' }" @click="saveNickname()">
            <text class="dialog-btn-primary-text">确认保存</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, ref, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'
import RealVerify from '@/components/RealVerify/RealVerify.vue'
import { useUserStore } from '@/store'
import { hasUserType, normalizeUserType, USER_TYPES } from '@/utils/userType'
import { isAdminUser } from '@/utils/admin'
import { getTotalEnrollments } from '@/api/wxmini/growup'
import { getWxUserProfileDetail, updateWxUserProfile } from '@/api/wxmini/profile'
import { getParttimeGroupQrcode, getMerchantAgentConfig } from '@/api/wxmini/config'
import { isRealnameAuthed, resolveUserDisplayName } from '@/utils/userDisplay'
import { buildMinePageModel } from './index.helpers'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const { phone, roles, token, userType } = storeToRefs(userStore)
const isAdmin = computed(() => isAdminUser(token.value, roles.value))
const jifen = ref(0)
const enrollmentList = ref(0)
const shouldAutoOpenLogin = ref(false)
const profileDetail = ref(null)
const realVerifyRef = ref(null)
const verifyForm = ref({
  verified: false,
  realName: '',
  idCard: ''
})
const groupPopupLoading = ref(false)
const showAgentPopup = ref(false)
const agentPopupVisible = ref(false)
const agentPopupLoading = ref(false)
const agentPopup = ref(createPopupState({
  title: '正在加载',
  content: '请稍候...'
}))
const showParttimeGroupPopup = ref(false)
const parttimeGroupPopupVisible = ref(false)
const parttimeGroupPopup = ref(createPopupState({
  title: '兼职群二维码',
  content: '加载中...'
}))

const hasLogin = computed(() => Boolean(token.value))
const normalizedUserType = computed(() => normalizeUserType(userType.value))
const hasSelectedUserType = computed(() => hasUserType(normalizedUserType.value))

const showWalletEntry = computed(() => hasLogin.value)
const showParttimeGroupEntry = computed(() => normalizedUserType.value === USER_TYPES.AUNT)
const showMerchantPayrollEntry = computed(() => normalizedUserType.value === USER_TYPES.MERCHANT)
const isProfileVerified = computed(() => isRealnameAuthed(profileDetail.value?.isRealnameAuth))
const mineDisplayName = computed(() => resolveUserDisplayName(profileDetail.value || {
  phone: phone.value
}))
const verifyShieldColor = computed(() => isProfileVerified.value ? '#22C55E' : '#D1D5DB')

const userIdentityLabel = computed(() => {
  const labels = { [USER_TYPES.PARENT]: '家长', [USER_TYPES.STUDENT]: '学生', [USER_TYPES.MERCHANT]: '商家', [USER_TYPES.AUNT]: '兼职' }
  return labels[normalizedUserType.value] || '未设置'
})

const studyItems = computed(() => {
  return [
    { key: 'course', label: '已报课程', icon: 'calendar-filled', iconColor: '#0F9D8F', cardClass: 'study-course', onClick: handleToCourse },
    { key: 'order', label: '我的订单', icon: 'list', iconColor: '#16A34A', cardClass: 'study-order', onClick: handleToOrderCenter },
    { key: 'notes', label: '课程笔记', icon: 'compose', iconColor: '#0EA5A4', cardClass: 'study-note', onClick: handleToCourseNotes }
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

const scheduleMenuItem = { key: 'schedule', label: '安排', icon: 'calendar-filled', iconColor: '#2563EB', iconClass: 'menu-icon-primary', description: '查看近期工作安排', onClick: handleToSchedule }
const settingMenuItem = { key: 'setting', label: '设置', icon: 'gear-filled', iconColor: '#0F766E', iconClass: 'menu-icon-muted', onClick: handleToSetting }

const baseMenuItems = [
  { key: 'wallet', label: '我的钱包', icon: 'wallet-filled', iconColor: '#0F9D8F', iconClass: 'menu-icon-primary', description: '收入提现与工资流水', visible: () => showWalletEntry.value, onClick: handleToWallet },
  { key: 'merchantPayroll', label: '兼职日结查询', icon: 'list', iconColor: '#2563EB', iconClass: 'menu-icon-primary', description: '报名人员与工资结算', visible: () => showMerchantPayrollEntry.value, onClick: handleToMerchantPayroll },
  scheduleMenuItem,
  { key: 'group', label: '兼职群二维码', icon: 'chatboxes-filled', iconColor: '#7C3AED', iconClass: 'menu-icon-soft', description: '扫码加入兼职通知群', visible: () => showParttimeGroupEntry.value, onClick: handleOpenParttimeGroup },
  { key: 'baby', label: '萌娃管理', icon: 'person-filled', iconColor: '#7C3AED', iconClass: 'menu-icon-primary', onClick: handleToBaby },
  { key: 'coursePackage', label: '课时包', icon: 'calendar-filled', iconColor: '#2563EB', iconClass: 'menu-icon-primary', description: '选择陪伴官与课时订单', onClick: handleToCoursePackage },
  { key: 'referral', label: '我的邀请码', icon: 'flag-filled', iconColor: '#F59E0B', iconClass: 'menu-icon-primary', description: '邀请好友注册赢福利', onClick: handleToReferral },
  { key: 'feedback', label: '课程建议及评价', icon: 'heart-filled', iconColor: '#0F9D8F', iconClass: 'menu-icon-primary', onClick: handleBuilding },
  { key: 'salon', label: '我的沙龙活动', icon: 'staff-filled', iconColor: '#14B8A6', iconClass: 'menu-icon-soft', onClick: handleBuilding },
  { key: 'service', label: '客服电话', icon: 'headphones', iconColor: '#059669', iconClass: 'menu-icon-light', description: '周一至周日 09:00-24:00', onClick: handleBuilding },
  { key: 'admin', label: '管理后台', icon: 'staff-filled', iconColor: '#047857', iconClass: 'menu-icon-primary', visible: () => isAdmin.value, onClick: handleToAdmin },
  settingMenuItem
]

const minePageModel = computed(() => buildMinePageModel({
  isAdmin: isAdmin.value,
  hasLogin: hasLogin.value,
  normalizedUserType: normalizedUserType.value,
  menuItems: baseMenuItems
}))
const showRegularContent = computed(() => minePageModel.value.showRegularContent)
const showPrimaryCard = computed(() => minePageModel.value.showPrimaryCard)
const showAgentEntry = computed(() => minePageModel.value.showAgentEntry)
const menuItems = computed(() => {
  return minePageModel.value.menuItems
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
  getTotalEnrollments().then(res => {
    enrollmentList.value = res.data
  })
}

async function loadProfileDetail() {
  if (!hasLogin.value) return
  const res = await getWxUserProfileDetail()
  profileDetail.value = res.data || {}
  verifyForm.value.verified = isProfileVerified.value
  verifyForm.value.realName = profileDetail.value.realName || ''
  userStore.updateWxProfileState(res.data || {})
  checkAndPromptNickname()
}

async function ensureUserTypeReady() {
  if (!hasLogin.value) return
  await loadProfileDetail()
  if (!hasSelectedUserType.value) {
    proxy.$tab.navigateTo('/pages/guide/index')
  }
}

function initRegularMineData() {
  if (!hasLogin.value || isAdmin.value) {
    // 管理员账号登录不走普通用户流程（profile/昵称/身份类型等）
    return
  }
  loadEnrollment()
  ensureUserTypeReady()
}

function handleLoginSuccess() {
  shouldAutoOpenLogin.value = false
  hasPromptedNickname.value = false
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

function handleVerifyClick() {
  if (isProfileVerified.value) return
  realVerifyRef.value?.openPopup()
}

function handleToCourseNotes() {
  withLogin(() => {
    uni.navigateTo({ url: '/pages/mine/note/index' })
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

function handleToCoursePackage() {
  withLogin(() => {
    proxy.$tab.navigateTo('/pages/mine/course-package/index')
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

function handleToMerchantPayroll() {
  withLogin(() => {
    proxy.$tab.navigateTo('/pages/jobs/signup-users')
  })
}

function handleToSetting() {
  withLogin(() => {
    proxy.$tab.navigateTo('/pages/mine/setting/index')
  })
}

function handleToReferral() {
  withLogin(() => {
    proxy.$tab.navigateTo('/pages/mine/referral/index')
  })
}

function handleLogout() {
  proxy.$modal.confirm('确定注销并退出系统吗？').then(() => {
    userStore.logOut().then(() => {}).finally(() => {
      proxy.$tab.reLaunch('/pages/index')
    })
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

function openAgentPopup() {
  showAgentPopup.value = true
  setTimeout(() => {
    agentPopupVisible.value = true
  }, 20)
}

function closeAgentPopup() {
  agentPopupVisible.value = false
  setTimeout(() => {
    showAgentPopup.value = false
  }, 220)
}

function callAgentPhone() {
  if (!agentPopup.value.phone) return
  uni.makePhoneCall({ phoneNumber: agentPopup.value.phone })
}

function handleOpenMerchantAgent() {
  withLogin(async () => {
    if (agentPopupLoading.value) return
    agentPopupLoading.value = true
    agentPopup.value = createPopupState({
      title: '正在加载',
      content: '请稍候...'
    })
    openAgentPopup()
    try {
      const res = await getMerchantAgentConfig()
      const data = res?.data || {}
      agentPopup.value = {
        title: data.title || '学优职傢',
        content: data.content || data.description || data.tips || '',
        contact: data.contact || '',
        phone: data.phone || '',
        imageUrl: data.imageUrl || data.illustrationUrl || ''
      }
    } catch (e) {
      agentPopup.value = createPopupState({
        title: '加载失败',
        content: e?.msg || '代理信息暂时不可用，请稍后再试。'
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

watch(() => verifyForm.value.verified, value => {
  if (value) loadProfileDetail()
})

const showNicknamePopup = ref(false)
const nicknamePopupVisible = ref(false)
const tempNickname = ref('')
const hasPromptedNickname = ref(false)

function openNicknamePopup() {
  tempNickname.value = ''
  showNicknamePopup.value = true
  setTimeout(() => {
    nicknamePopupVisible.value = true
  }, 20)
}

function closeNicknamePopup() {
  nicknamePopupVisible.value = false
  setTimeout(() => {
    showNicknamePopup.value = false
  }, 220)
}

function handleNicknameBlur(e) {
  const name = (e.detail.value || '').trim()
  tempNickname.value = name
}

function handleNicknameInput(e) {
  const name = (e.detail.value || '').trim()
  tempNickname.value = name
}

async function saveNickname(nameVal) {
  const finalNickname = nameVal || tempNickname.value
  if (!finalNickname || finalNickname === '微信用户') {
    proxy.$modal.msgError('昵称不能为空或“微信用户”')
    return
  }
  try {
    proxy.$modal.loading('正在保存...')
    await updateWxUserProfile({
      userName: finalNickname,
      nickName: finalNickname
    })
    proxy.$modal.closeLoading()
    proxy.$modal.msgSuccess('设置昵称成功')
    closeNicknamePopup()
    loadProfileDetail()
  } catch (error) {
    proxy.$modal.closeLoading()
    proxy.$modal.msgError(error?.msg || error?.message || '保存失败，请稍后重试')
  }
}

function checkAndPromptNickname() {
  if (hasPromptedNickname.value) return
  const userName = profileDetail.value?.userName || ''
  if (!userName || userName === '微信用户') {
    hasPromptedNickname.value = true
    openNicknamePopup()
  }
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
