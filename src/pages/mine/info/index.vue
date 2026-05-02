<template>
  <scroll-view class="profile-page" scroll-y>
    <view class="profile-hero">
      <view class="hero-top">
        <view class="hero-main">
          <text class="hero-name">{{ profile.displayName || '' }}</text>
          <view class="hero-badge" v-if="showVerifiedBadge()">
            <uni-icons type="checkmarkempty" size="14" color="#4f46e5" />
            <text class="hero-badge-text">实名认证用户</text>
          </view>
        </view>
        <view class="edit-btn" @click="handleEdit">
          <uni-icons type="compose" size="16" color="#5b4fd8" />
          <text class="edit-btn-text">编辑资料</text>
        </view>
      </view>
    </view>

    <view class="profile-card">
      <view v-for="item in fieldList" :key="item.key" class="info-row" :class="{ 'is-multiline': item.multiline }">
        <text class="info-label">{{ item.label }}</text>
        <text class="info-value" :class="{ 'intro-text': item.multiline }">{{ formatValue(item.value) }}</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getWxUserProfileDetail } from '@/api/wxmini/profile'

const profile = ref({})

const fieldList = computed(() => {
  const baseFields = [
    { key: 'realName', label: '姓名', value: profile.value.realName },
    { key: 'nickName', label: '昵称', value: profile.value.nickName },
    { key: 'gender', label: '性别', value: genderText(profile.value.gender) },
    { key: 'phone', label: '手机号码', value: profile.value.phone },
    { key: 'userType', label: '用户类型', value: userTypeText(profile.value.userType) }
  ]

  if (profile.value.userType === 3) {
    return [
      ...baseFields,
      { key: 'age', label: '年龄', value: profile.value.age },
      { key: 'personalIntro', label: '个人简介', value: profile.value.personalIntro, multiline: true },
      { key: 'availableTime', label: '空余时间', value: profile.value.availableTime, multiline: true },
      { key: 'workExperience', label: '工作经历', value: profile.value.workExperience, multiline: true }
    ]
  }

  if (profile.value.userType !== 2) {
    return baseFields
  }

  return [
    ...baseFields,
    { key: 'companyName', label: '公司名称', value: profile.value.companyName },
    { key: 'companyAddress', label: '公司地址', value: profile.value.companyAddress },
    { key: 'companyPosition', label: '公司职务', value: profile.value.companyPosition },
    { key: 'industry', label: '所属行业', value: profile.value.industry },
    { key: 'workYears', label: '工作年限', value: profile.value.workYears },
    { key: 'personalIntro', label: '个人简介', value: profile.value.personalIntro, multiline: true }
  ]
})

function loadProfile() {
  getWxUserProfileDetail().then(res => {
    profile.value = res.data || {}
  })
}

function handleEdit() {
  uni.navigateTo({ url: '/pages/mine/info/edit' })
}

function formatValue(value) {
  return value === null || value === undefined || value === '' ? '未填写' : value
}

function showVerifiedBadge() {
  return Number(profile.value.isRealnameAuth) === 1 || profile.value.isRealnameAuth === true
}

function genderText(value) {
  if (value === 0 || value === '0') return '男'
  if (value === 1 || value === '1') return '女'
  if (value === 2 || value === '2') return '未知'
  return ''
}

function userTypeText(value) {
  if (value === 0) return '家长'
  if (value === 1) return '学生'
  if (value === 2) return '商家'
  if (value === 3) return '兼职'
  return '家长 / 学生'
}

onShow(() => {
  loadProfile()
})
</script>

<style lang="scss" scoped>
page {
  background: #f5f7ff;
}

.profile-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f4ff 0%, #f5f7ff 30%, #f5f7ff 100%);
}

.profile-hero {
  padding: 36rpx 30rpx 92rpx;
  background: linear-gradient(135deg, #efeaff 0%, #f6dfff 52%, #f7d5f2 100%);
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.hero-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8rpx;
}

.hero-name {
  font-size: 48rpx;
  font-weight: 700;
  color: #1f1b3a;
  line-height: 1.4;
}

.hero-badge {
  margin-top: 16rpx;
  display: inline-flex;
  align-items: center;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
}

.hero-badge-text {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: #7c74ae;
}

.edit-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 18rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12rpx 24rpx rgba(123, 97, 255, 0.12);
}

.edit-btn-text {
  margin-left: 10rpx;
  font-size: 28rpx;
  color: #5b4fd8;
  font-weight: 600;
}

.profile-card {
  margin: -44rpx 24rpx 32rpx;
  padding: 22rpx 28rpx;
  border-radius: 30rpx;
  background: #ffffff;
  box-shadow: 0 18rpx 40rpx rgba(112, 87, 193, 0.08);
}

.info-row {
  display: flex;
  align-items: flex-start;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f0edf9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  width: 168rpx;
  flex-shrink: 0;
  font-size: 30rpx;
  color: #9a97a8;
  line-height: 1.6;
}

.info-value {
  flex: 1;
  font-size: 32rpx;
  color: #201c34;
  line-height: 1.6;
  word-break: break-all;
}

.intro-text {
  white-space: pre-wrap;
}
</style>
