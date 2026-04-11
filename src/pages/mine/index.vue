<template>
  <scroll-view class="mine-container" scroll-y>
    <view class="header-section">
      <view class="header-top">
        <view class="user-left">
          <!-- <view v-if="!avatar" class="avatar-wrap">
            <uni-icons type="person" size="30" color="#FFFFFF" />
          </view>
          <image v-if="avatar" @click="handleToAvatar" :src="avatar" class="avatar-img" mode="aspectFill" /> -->
          <view class="user-detail">
            <view v-if="!name" @click="handleToLogin" class="login-tip">点击登录</view>
            <view v-if="name" class="user-name">{{ name }}</view>
          </view>
        </view>
        <view class="header-right" @click="handleToProfile">
          <text class="homepage-text">个人主页</text>
          <uni-icons type="right" size="14" color="#ECFEF6" />
        </view>
      </view>

      <view v-if="!isAdmin" class="stats-row">
        <view class="stat-item" @click="handleToEnrollment">
          <text class="stat-num">{{ enrollmentList }}</text>
          <view class="stat-btn">我的学箱</view>
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
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'
import { useUserStore } from '@/store'
import { getToken } from '@/utils/auth'
import { getTotalEnrollments } from '@/api/wxmini/growup'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const { name, avatar, roles } = storeToRefs(userStore)
const jifen = ref(0)
const enrollmentList = ref(0)
const loginPopupRef = ref(null)
const shouldAutoOpenLogin = ref(false)

const isAdmin = computed(() => {
  const currentRoles = Array.isArray(roles.value) ? roles.value : []
  return Boolean(getToken()) && currentRoles.includes('admin')
})

const studyItems = [
  {
    key: 'course',
    label: '已报课程',
    icon: 'calendar-filled',
    iconColor: '#0F9D8F',
    cardClass: 'study-course',
    onClick: handleToCourse
  },
  {
    key: 'order',
    label: '我的订单',
    icon: 'list',
    iconColor: '#16A34A',
    cardClass: 'study-order',
    onClick: handleBuilding
  },
  {
    key: 'notes',
    label: '课程笔记',
    icon: 'compose',
    iconColor: '#0EA5A4',
    cardClass: 'study-note',
    onClick: handleBuilding
  }
]

const baseMenuItems = [
  {
    key: 'feedback',
    label: '课程建议及评价',
    icon: 'heart-filled',
    iconColor: '#0F9D8F',
    iconClass: 'menu-icon-primary',
    onClick: handleBuilding
  },
  {
    key: 'salon',
    label: '我的沙龙活动',
    icon: 'staff-filled',
    iconColor: '#14B8A6',
    iconClass: 'menu-icon-soft',
    onClick: handleBuilding
  },
  {
    key: 'service',
    label: '客服电话',
    icon: 'headphones',
    iconColor: '#059669',
    iconClass: 'menu-icon-light',
    description: '周一至周日 09:00-24:00',
    onClick: handleBuilding
  },
  {
    key: 'setting',
    label: '设置',
    icon: 'gear-filled',
    iconColor: '#0F766E',
    iconClass: 'menu-icon-muted',
    onClick: handleToSetting
  }
]

const menuItems = computed(() => {
  if (!isAdmin.value) {
    return baseMenuItems
  }
  return [
    {
      key: 'admin',
      label: '管理后台',
      icon: 'staff-filled',
      iconColor: '#047857',
      iconClass: 'menu-icon-primary',
      onClick: handleToAdmin
    },
    ...baseMenuItems
  ]
})

function handleToLogin() {
  loginPopupRef.value?.open()
}

function handleToAvatar() {
  proxy.$tab.navigateTo('/pages/mine/avatar/index')
}

function handleToCourse() {
  uni.navigateTo({ url: '/pages/mine/course/list' })
}

function loadEnrollment() {
  getTotalEnrollments().then(res => {
    enrollmentList.value = res.data
  })
}

function handleLoginSuccess() {
  shouldAutoOpenLogin.value = false
  loadEnrollment()
}

onLoad(() => {
  if (!getToken()) {
    shouldAutoOpenLogin.value = true
    return
  }
  loadEnrollment()
})

function handleToEnrollment() {
  proxy.$tab.navigateTo('/pages/mine/enrollment/index')
}

function handleToProfile() {
  proxy.$tab.navigateTo('/pages/mine/info/index')
}

function handleBuilding() {
  proxy.$modal.showToast('功能正在建设中~')
}

function handleToSetting() {
  proxy.$tab.navigateTo('/pages/mine/setting/index')
}

function handleToAdmin() {
  proxy.$tab.navigateTo('/pages/mine/admin/index')
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
