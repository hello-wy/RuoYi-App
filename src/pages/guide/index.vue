<template>
  <view class="guide-page">
    <view class="orb orb-a"></view>
    <view class="orb orb-b"></view>
    <view class="grid-noise"></view>

    <view class="hero-card" :class="currentRole.theme">
      <view class="badge-row">
        <text class="badge-dot"></text>
        <text class="badge-text">学优职傢</text>
      </view>

      <view class="illustration-wrap">
        <view class="halo halo-one"></view>
        <view class="halo halo-two"></view>
        <view class="floor-shadow"></view>

        <view class="character">
          <view class="head">
            <view class="hair hair-left"></view>
            <view class="hair hair-right"></view>
            <view class="face">
              <view class="eye eye-left"></view>
              <view class="eye eye-right"></view>
              <view class="smile"></view>
            </view>
          </view>
          <view class="neck"></view>
          <view class="body">
            <view class="collar"></view>
            <view class="arm arm-left"></view>
            <view class="arm arm-right"></view>
            <view class="book">
              <view class="book-line"></view>
              <view class="book-line short"></view>
            </view>
          </view>
        </view>

        <view class="float-card card-left">
          <uni-icons :type="currentRole.leftIcon" size="20" color="#24324a"></uni-icons>
          <text>{{ currentRole.leftText }}</text>
        </view>
        <view class="float-card card-right">
          <uni-icons :type="currentRole.rightIcon" size="20" color="#24324a"></uni-icons>
          <text>{{ currentRole.rightText }}</text>
        </view>
        <view class="pencil"></view>
        <view class="spark spark-a"></view>
        <view class="spark spark-b"></view>
      </view>

      <view class="copy-box">
        <text class="title">家教兼职与成长服务平台</text>
        <text class="subtitle">从遇见到预见</text>
        <text class="role-note">当前身份 · {{ currentRole.name }}</text>
      </view>
    </view>

    <view class="role-dock">
      <button
        v-for="(role, index) in roles"
        :key="role.value"
        class="role-btn"
        :class="[
          { active: selectedRole === role.value, 'role-btn-last': shouldCenterRoleButton(index) },
          role.theme
        ]"
        :disabled="submitting || loadingRoles"
        @click="selectRole(role.value)"
      >
        <uni-icons :type="role.icon" size="20" :color="selectedRole === role.value ? '#ffffff' : role.color"></uni-icons>
        <text>{{ role.name }}</text>
      </button>
    </view>

    <button class="continue-btn" :class="currentRole.theme" :disabled="submitting || loadingRoles" @click="handleContinue">
      <text>{{ submitting ? '处理中' : '继续' }}</text>
      <uni-icons type="right" size="18" color="#ffffff"></uni-icons>
    </button>
  </view>
</template>

<script setup>
import { computed, ref, getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store'
import { getWxUserProfileDetail, switchWxUserType } from '@/api/wxmini/profile'
import { resolveGuideRoleState } from './guide-user-type.helpers'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const submitting = ref(false)
const loadingRoles = ref(false)

const allRoles = [
  {
    value: 0,
    name: '家长',
    theme: 'parent-theme',
    icon: 'staff',
    color: '#2f7df6',
    leftIcon: 'home',
    leftText: '精准找老师',
    rightIcon: 'calendar',
    rightText: '成长规划'
  },
  {
    value: 1,
    name: '学生',
    theme: 'student-theme',
    icon: 'contact',
    color: '#f28b2e',
    leftIcon: 'compose',
    leftText: '家教兼职',
    rightIcon: 'star',
    rightText: '能力提升'
  },
  {
    value: 2,
    name: '商家',
    theme: 'merchant-theme',
    icon: 'shop',
    color: '#19a974',
    leftIcon: 'shop',
    leftText: '发布岗位',
    rightIcon: 'paperplane',
    rightText: '链接人才'
  },
  {
    value: 3,
    name: '兼职',
    theme: 'aunt-theme',
    icon: 'person',
    color: '#a855f7',
    leftIcon: 'person',
    leftText: '完善资料',
    rightIcon: 'heart',
    rightText: '提供服务'
  }
]

const roles = ref(allRoles)
const selectedRole = ref(resolveGuideRoleState(allRoles, userStore.userType).selectedRole)

const currentRole = computed(() => roles.value.find(item => item.value === selectedRole.value) || roles.value[0] || allRoles[0])

onLoad(() => {
  loadSwitchableRoles()
})

function applyGuideRoleState(profile = {}) {
  const state = resolveGuideRoleState(allRoles, userStore.userType, profile)
  roles.value = state.roles
  selectedRole.value = state.selectedRole
}

async function loadSwitchableRoles() {
  loadingRoles.value = true
  try {
    const res = await getWxUserProfileDetail()
    const profile = res?.data || {}
    userStore.updateWxProfileState(profile)
    applyGuideRoleState(profile)
  } catch (error) {
    applyGuideRoleState()
  } finally {
    loadingRoles.value = false
  }
}

function resolveTarget(userType) {
  if (userType === 0) return '/pages/tutoring/parent/apply'
  if (userType === 1) return '/pages/tutoring/tutor/apply'
  if (userType === 2) return '/pages/jobs/list'
  return '/pages/jobs/list'
}

function selectRole(role) {
  selectedRole.value = role
}

function shouldCenterRoleButton(index) {
  return roles.value.length % 3 === 1 && index === roles.value.length - 1
}

async function handleContinue() {
  if (submitting.value || loadingRoles.value) return

  submitting.value = true
  try {
    await switchWxUserType({ userType: selectedRole.value })
    userStore.updateWxProfileState({ userType: selectedRole.value })
    proxy.$tab.redirectTo(resolveTarget(selectedRole.value))
  } catch (error) {
    proxy.$modal.msgError(error?.msg || '身份设置失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
page {
  background: #f8efe1;
}

.guide-page {
  position: relative;
  min-height: 100vh;
  padding: 56rpx 34rpx 36rpx;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #f6ead9;
}

.orb {
  position: absolute;
  border-radius: 999rpx;
  filter: blur(2rpx);
  opacity: 0.9;
}

.orb-a {
  width: 260rpx;
  height: 260rpx;
  left: -110rpx;
  top: 210rpx;
  background: rgba(255, 183, 77, 0.36);
}

.orb-b {
  width: 340rpx;
  height: 340rpx;
  right: -160rpx;
  bottom: 220rpx;
  background: rgba(76, 174, 255, 0.2);
}

.grid-noise {
  position: absolute;
  inset: 0;
  opacity: 0.28;
  background-image:
    linear-gradient(rgba(34, 48, 74, 0.06) 1rpx, transparent 1rpx),
    linear-gradient(90deg, rgba(34, 48, 74, 0.06) 1rpx, transparent 1rpx);
  background-size: 54rpx 54rpx;
}

.hero-card {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  min-height: 540rpx;
  padding: 28rpx 30rpx 30rpx;
  border-radius: 52rpx;
  overflow: hidden;
  box-sizing: border-box;
  border: 3rpx solid rgba(36, 50, 74, 0.12);
  box-shadow: 0 34rpx 90rpx rgba(85, 69, 45, 0.16), inset 0 0 0 2rpx rgba(255, 255, 255, 0.55);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.88), rgba(255, 245, 225, 0.72));
}

.hero-card::before {
  content: '';
  position: absolute;
  width: 480rpx;
  height: 480rpx;
  right: -180rpx;
  top: -120rpx;
  border-radius: 999rpx;
  background: var(--theme-soft);
}

.parent-theme {
  --theme-main: #2f7df6;
  --theme-soft: rgba(47, 125, 246, 0.18);
  --theme-warm: #ffd271;
}

.student-theme {
  --theme-main: #f28b2e;
  --theme-soft: rgba(242, 139, 46, 0.22);
  --theme-warm: #8bd6ff;
}

.merchant-theme {
  --theme-main: #19a974;
  --theme-soft: rgba(25, 169, 116, 0.2);
  --theme-warm: #ffc36b;
}

.aunt-theme {
  --theme-main: #a855f7;
  --theme-soft: rgba(168, 85, 247, 0.18);
  --theme-warm: #f9a8d4;
}

.badge-row {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.badge-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: var(--theme-main);
  box-shadow: 0 0 0 12rpx var(--theme-soft);
}

.badge-text {
  font-size: 28rpx;
  letter-spacing: 3rpx;
  color: rgba(36, 50, 74, 0.7);
  font-weight: 800;
}

.illustration-wrap {
  position: relative;
  height: 430rpx;
  margin-top: 8rpx;
  transform: scale(0.86);
  transform-origin: top center;
}

.halo {
  position: absolute;
  left: 50%;
  border-radius: 999rpx;
  transform: translateX(-50%);
}

.halo-one {
  width: 420rpx;
  height: 420rpx;
  top: 38rpx;
  background: linear-gradient(145deg, var(--theme-soft), rgba(255, 255, 255, 0.12));
}

.halo-two {
  width: 300rpx;
  height: 300rpx;
  top: 98rpx;
  border: 3rpx dashed rgba(36, 50, 74, 0.14);
  animation: rotateHalo 18s linear infinite;
}

.floor-shadow {
  position: absolute;
  left: 50%;
  bottom: 34rpx;
  width: 360rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(37, 45, 68, 0.16);
  transform: translateX(-50%);
  filter: blur(2rpx);
}

.character {
  position: absolute;
  left: 50%;
  bottom: 70rpx;
  width: 260rpx;
  height: 380rpx;
  transform: translateX(-50%);
  animation: floatPerson 3.8s ease-in-out infinite;
}

.head {
  position: absolute;
  left: 65rpx;
  top: 0;
  width: 130rpx;
  height: 136rpx;
}

.hair-left,
.hair-right {
  position: absolute;
  background: #24324a;
  z-index: 2;
}

.hair-left {
  left: 0;
  top: 10rpx;
  width: 78rpx;
  height: 92rpx;
  border-radius: 58rpx 34rpx 40rpx 36rpx;
  transform: rotate(-14deg);
}

.hair-right {
  right: 0;
  top: 6rpx;
  width: 84rpx;
  height: 96rpx;
  border-radius: 42rpx 62rpx 38rpx 50rpx;
  transform: rotate(13deg);
}

.face {
  position: absolute;
  left: 15rpx;
  top: 32rpx;
  z-index: 3;
  width: 100rpx;
  height: 98rpx;
  border-radius: 42rpx 42rpx 48rpx 48rpx;
  background: #ffd8b8;
  box-shadow: inset -8rpx -8rpx 0 rgba(225, 122, 88, 0.12);
}

.eye {
  position: absolute;
  top: 40rpx;
  width: 9rpx;
  height: 13rpx;
  border-radius: 50%;
  background: #24324a;
}

.eye-left { left: 30rpx; }
.eye-right { right: 30rpx; }

.smile {
  position: absolute;
  left: 39rpx;
  top: 64rpx;
  width: 24rpx;
  height: 12rpx;
  border-bottom: 4rpx solid #d56d60;
  border-radius: 0 0 24rpx 24rpx;
}

.neck {
  position: absolute;
  left: 112rpx;
  top: 120rpx;
  width: 36rpx;
  height: 42rpx;
  background: #ffc7a2;
  border-radius: 0 0 16rpx 16rpx;
}

.body {
  position: absolute;
  left: 46rpx;
  top: 150rpx;
  width: 168rpx;
  height: 210rpx;
  border-radius: 54rpx 54rpx 36rpx 36rpx;
  background: linear-gradient(150deg, var(--theme-main), #24324a);
  box-shadow: 0 22rpx 44rpx rgba(36, 50, 74, 0.24);
}

.collar {
  position: absolute;
  left: 52rpx;
  top: 0;
  width: 64rpx;
  height: 42rpx;
  border-radius: 0 0 34rpx 34rpx;
  background: #fff7ea;
}

.arm {
  position: absolute;
  top: 48rpx;
  width: 38rpx;
  height: 142rpx;
  border-radius: 22rpx;
  background: #ffc7a2;
}

.arm-left {
  left: -14rpx;
  transform: rotate(22deg);
}

.arm-right {
  right: -14rpx;
  transform: rotate(-22deg);
}

.book {
  position: absolute;
  left: 35rpx;
  bottom: 40rpx;
  width: 98rpx;
  height: 72rpx;
  border-radius: 12rpx;
  transform: rotate(-5deg);
  background: #fff7ea;
  box-shadow: -8rpx 8rpx 0 var(--theme-warm);
}

.book-line {
  width: 58rpx;
  height: 5rpx;
  margin: 22rpx 0 0 20rpx;
  border-radius: 8rpx;
  background: rgba(36, 50, 74, 0.28);
}

.book-line.short {
  width: 38rpx;
  margin-top: 12rpx;
}

.float-card {
  position: absolute;
  z-index: 5;
  min-width: 158rpx;
  height: 62rpx;
  padding: 0 18rpx;
  border-radius: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 2rpx solid rgba(36, 50, 74, 0.1);
  box-shadow: 0 18rpx 42rpx rgba(36, 50, 74, 0.12);
  backdrop-filter: blur(12rpx);
}

.float-card text {
  font-size: 23rpx;
  font-weight: 700;
  color: #24324a;
  white-space: nowrap;
}

.card-left {
  left: 8rpx;
  top: 180rpx;
  transform: rotate(-6deg);
}

.card-right {
  right: 2rpx;
  top: 104rpx;
  transform: rotate(7deg);
}

.pencil {
  position: absolute;
  right: 94rpx;
  bottom: 96rpx;
  width: 24rpx;
  height: 132rpx;
  border-radius: 14rpx;
  background: linear-gradient(to bottom, #24324a 0 14%, var(--theme-warm) 14% 78%, #f6a56f 78% 100%);
  transform: rotate(28deg);
  box-shadow: 0 12rpx 26rpx rgba(36, 50, 74, 0.2);
}

.spark {
  position: absolute;
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: var(--theme-main);
}

.spark-a {
  left: 138rpx;
  top: 78rpx;
  box-shadow: 52rpx 34rpx 0 var(--theme-warm);
}

.spark-b {
  right: 112rpx;
  bottom: 176rpx;
  background: var(--theme-warm);
  box-shadow: 44rpx -28rpx 0 var(--theme-main);
}

.copy-box {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 4rpx 8rpx 0;
}

.title {
  display: block;
  font-size: 46rpx;
  line-height: 1.22;
  font-weight: 900;
  color: #1f2b3f;
  letter-spacing: 1rpx;
}

.subtitle {
  display: block;
  margin-top: 18rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: rgba(31, 43, 63, 0.62);
  letter-spacing: 8rpx;
}

.role-note {
  display: inline-flex;
  margin-top: 28rpx;
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--theme-main);
  background: var(--theme-soft);
}

.role-dock {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16rpx;
  margin-top: 22rpx;
  margin-bottom: 24rpx;
  padding: 18rpx;
  border-radius: 36rpx;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 24rpx 60rpx rgba(76, 62, 43, 0.14);
  backdrop-filter: blur(18rpx);
}

.role-btn {
  grid-column: span 2;
  height: 92rpx;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 28rpx;
  font-weight: 800;
  color: #24324a;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: inset 0 0 0 2rpx rgba(36, 50, 74, 0.08);
}

.role-btn::after {
  border: none;
}

.role-btn-last {
  grid-column: 3 / span 2;
}

.role-btn.active {
  color: #ffffff;
  background: var(--theme-main);
  box-shadow: 0 18rpx 34rpx var(--theme-soft);
}

.role-btn[disabled] {
  opacity: 0.72;
}

.continue-btn {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  width: 100%;
  height: 96rpx;
  margin: 0;
  border: none;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  font-size: 32rpx;
  font-weight: 900;
  color: #ffffff;
  background: var(--theme-main);
  box-shadow: 0 22rpx 46rpx var(--theme-soft);
}

.continue-btn::after {
  border: none;
}

.continue-btn[disabled] {
  opacity: 0.72;
}

@keyframes floatPerson {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-16rpx); }
}

@keyframes rotateHalo {
  from { transform: translateX(-50%) rotate(0deg); }
  to { transform: translateX(-50%) rotate(360deg); }
}
</style>
