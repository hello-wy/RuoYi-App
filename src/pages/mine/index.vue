<template>
  <scroll-view class="mine-container" scroll-y>
    <view class="header-section">
      <view class="header-top">
        <view class="user-left">
          <view class="user-detail">
            <view v-if="!name" @click="handleToLogin" class="login-tip">点击登录</view>
            <view v-else class="user-name-row">
              <text class="user-name">{{ name }}</text>
              <view class="user-identity-tag" :class="`tag-${userType}`">
                <text class="tag-text">{{ userIdentityLabel }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="header-right" @click="handleToProfile">
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

      <view v-if="!isAdmin" class="stats-row">
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
      <view class="card">
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
  </scroll-view>

  <login-popup
    ref="loginPopupRef"
    :auto-open="shouldAutoOpenLogin"
    account-success-url=""
    wechat-success-url=""
    realtime-phone-success-url=""
    @success="handleLoginSuccess"
  />
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'
import { useUserStore } from '@/store'
import { getToken } from '@/utils/auth'
import { getTotalEnrollments } from '@/api/wxmini/growup'
import { getWxUserProfileDetail } from '@/api/wxmini/profile'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const { name, roles, userType } = storeToRefs(userStore)
const jifen = ref(0)
const enrollmentList = ref(0)
const loginPopupRef = ref(null)
const profileDetail = ref(null)

const isAdmin = computed(() => {
  const currentRoles = Array.isArray(roles.value) ? roles.value : []
  return Boolean(getToken()) && currentRoles.includes('admin')
})

const userIdentityLabel = computed(() => {
  const labels = { 0: '家长', 1: '学生', 2: '商家' }
  return labels[userType.value] || '未设置'
})

const showPrimaryCard = computed(() => Boolean(getToken()) && !isAdmin.value)
const primaryActionPath = computed(() => profileDetail.value?.primaryAction || '/pages/guide/index')
const primaryActionTitle = computed(() => {
  if (userType.value === 0) return '发布需求'
  if (userType.value === 1) return '做家教'
  if (userType.value === 2) return '发布招聘'
  return '选择身份'
})
const primaryActionDesc = computed(() => {
  if (userType.value === 0) return '快速发布请家教需求，匹配优质教员'
  if (userType.value === 1) return '完善资料并申请做家教'
  if (userType.value === 2) return '发布招聘信息，快速招募人才'
  return '先选择身份，为您推荐更适合的内容和服务'
})

const studyItems = [
  { key: 'course', label: '已报课程', icon: 'calendar-filled', iconColor: '#0F9D8F', cardClass: 'study-course', onClick: handleToCourse },
  { key: 'order', label: '我的订单', icon: 'list', iconColor: '#16A34A', cardClass: 'study-order', onClick: handleBuilding },
  { key: 'notes', label: '课程笔记', icon: 'compose', iconColor: '#0EA5A4', cardClass: 'study-note', onClick: handleBuilding }
]

const baseMenuItems = [
  { key: 'feedback', label: '课程建议及评价', icon: 'heart-filled', iconColor: '#0F9D8F', iconClass: 'menu-icon-primary', onClick: handleBuilding },
  { key: 'salon', label: '我的沙龙活动', icon: 'staff-filled', iconColor: '#14B8A6', iconClass: 'menu-icon-soft', onClick: handleBuilding },
  { key: 'service', label: '客服电话', icon: 'headphones', iconColor: '#059669', iconClass: 'menu-icon-light', description: '周一至周日 09:00-24:00', onClick: handleBuilding },
  { key: 'setting', label: '设置', icon: 'gear-filled', iconColor: '#0F766E', iconClass: 'menu-icon-muted', onClick: handleToSetting }
]

const menuItems = computed(() => {
  if (!isAdmin.value) return baseMenuItems
  return [{ key: 'admin', label: '管理后台', icon: 'staff-filled', iconColor: '#047857', iconClass: 'menu-icon-primary', onClick: handleToAdmin }, ...baseMenuItems]
})

function withLogin(action) {
  if (!getToken()) {
    loginPopupRef.value?.open()
    return
  }
  if (typeof action === 'function') action()
}

function handleToLogin() {
  loginPopupRef.value?.open()
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
  if (!getToken()) return
  const res = await getWxUserProfileDetail()
  profileDetail.value = res.data
  userStore.updateWxProfileState(res.data)
}

async function ensureUserTypeReady() {
  if (!getToken() || isAdmin.value) return
  await loadProfileDetail()
  if (!userType.value) {
    proxy.$tab.navigateTo('/pages/guide/index')
  }
}

function handleLoginSuccess() {
  loadEnrollment()
  ensureUserTypeReady()
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

function handleBuilding() {
  withLogin(() => {
    proxy.$modal.showToast('功能正在建设中~')
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

onLoad(() => {
  if (!getToken()) {
    return
  }
  loadEnrollment()
  ensureUserTypeReady()
})

onShow(() => {
  if (getToken()) {
    loadEnrollment()
    ensureUserTypeReady()
  }
})
</script>

<style lang="scss" scoped src="./index.scss"></style>
