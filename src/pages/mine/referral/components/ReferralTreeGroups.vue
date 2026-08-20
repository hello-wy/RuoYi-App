<template>
  <view v-if="groups.length" class="tree-groups">
    <view v-for="group in groups" :key="group.level1Invitee.userId" class="tree-group">
      <view class="level-one-card">
        <image class="avatar" :src="group.level1Invitee.avatarUrl || DEFAULT_AVATAR" mode="aspectFill" />
        <view class="user-info">
          <text class="level-label">一级邀请用户</text>
          <text class="user-name">{{ displayName(group.level1Invitee) }}</text>
          <text class="user-phone">{{ formatPhone(group.level1Invitee.phone) }}</text>
          <text class="inviter-info">一级邀请人：{{ formatInviter(group.level1Invitee) }}</text>
        </view>
        <text class="invite-time">{{ formatDate(group.level1Invitee.createTime) }}</text>
      </view>

      <view v-if="group.level2Invitees.length" class="level-two-section">
        <view class="level-two-title">
          <text>{{ displayName(group.level1Invitee) }} 邀请的好友</text>
          <text class="level-two-count">{{ group.level2Invitees.length }} 人</text>
        </view>
        <view v-for="child in group.level2Invitees" :key="child.id || child.userId" class="level-two-item">
          <image class="avatar child-avatar" :src="child.avatarUrl || DEFAULT_AVATAR" mode="aspectFill" />
          <view class="user-info">
            <text class="user-name">{{ displayName(child) }}</text>
            <text class="user-phone">{{ formatPhone(child.phone) }}</text>
          </view>
          <text class="invite-time">{{ formatDate(child.createTime) }}</text>
        </view>
      </view>
    </view>

    <view v-if="hasMoreGroups" class="more-area">
      <button class="more-button" :disabled="loading" @tap="emitLoadMore">
        <text v-if="loading">加载中...</text>
        <text v-else>查看更多邀请人（{{ groups.length }}/{{ total }}）</text>
      </button>
    </view>
  </view>

  <view v-else-if="!loading" class="empty-box">
    <uni-icons type="info" size="48" color="#CBD5E1" />
    <text class="empty-text">暂无邀请记录，快去邀请好友吧！</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const DEFAULT_AVATAR = '/static/images/avatar.png'

const props = defineProps({
  groups: { type: Array, required: true },
  total: { type: Number, required: true },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['load-more'])
const hasMoreGroups = computed(() => props.groups.length < props.total)

function emitLoadMore() {
  if (!props.loading && hasMoreGroups.value) emit('load-more')
}

function displayName(user) {
  return user.userName || user.realName || '微信用户'
}

function formatPhone(phone) {
  if (!phone) return '未绑定手机号'
  return phone.length === 11 ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : phone
}

function formatInviter(referral) {
  return `${referral.inviterUserName || '微信用户'}（${formatPhone(referral.inviterPhone)}）`
}

function formatDate(time) {
  return time ? time.split(' ')[0] : ''
}
</script>

<style lang="scss" scoped>
.tree-groups { display: flex; flex-direction: column; gap: 24rpx; }
.tree-group { overflow: hidden; border: 1px solid #e2e8f0; border-radius: 16rpx; }
.level-one-card, .level-two-item { display: flex; align-items: center; }
.level-one-card { padding: 24rpx; background: #f0fdfa; }
.avatar { width: 76rpx; height: 76rpx; flex: none; border-radius: 50%; background: #e2e8f0; margin-right: 18rpx; }
.user-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.level-label { margin-bottom: 6rpx; color: #0f9d8f; font-size: 20rpx; font-weight: 700; }
.user-name { overflow: hidden; color: #1e293b; font-size: 28rpx; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.user-phone, .inviter-info, .invite-time { color: #94a3b8; font-size: 22rpx; }
.user-phone { margin-top: 6rpx; }
.inviter-info { margin-top: 6rpx; }
.invite-time { flex: none; margin-left: 12rpx; }
.level-two-section { padding: 20rpx 24rpx 4rpx; }
.level-two-title { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12rpx; color: #475569; font-size: 24rpx; font-weight: 600; }
.level-two-count { color: #0f9d8f; font-size: 22rpx; font-weight: 500; }
.level-two-item { padding: 18rpx 0; border-top: 1px solid #f1f5f9; }
.child-avatar { width: 64rpx; height: 64rpx; margin-right: 16rpx; }
.more-area { padding-top: 8rpx; }
.more-button { width: 100%; border: 1px solid #99f6e4; border-radius: 40rpx; background: #f0fdfa; color: #0f9d8f; font-size: 26rpx; }
.more-button::after { border: none; }
.more-button[disabled] { opacity: 0.65; }
.empty-box { display: flex; flex-direction: column; align-items: center; padding: 80rpx 0; }
.empty-text { margin-top: 20rpx; color: #94a3b8; font-size: 26rpx; }
</style>
