<template>
  <view class="manual-bind-card">
    <view class="manual-bind-head">
      <text class="toolbar-title">手动绑定邀请关系</text>
      <text class="toolbar-subtitle">按手机号确认双方用户</text>
    </view>
    <view class="bind-user-row">
      <text class="bind-user-label">邀请人手机号</text>
      <input v-model="inviterPhone" class="bind-phone-input" type="number" maxlength="11" placeholder="请输入手机号" @input="inviterUser = null" />
      <button class="action-btn" size="mini" type="primary" @click="searchUser('inviter')">搜索</button>
    </view>
    <view v-if="inviterUser" class="user-result">{{ formatUserName(inviterUser) }}（{{ inviterUser.phone }}）</view>
    <view class="bind-user-row">
      <text class="bind-user-label">被邀请人手机号</text>
      <input v-model="inviteePhone" class="bind-phone-input" type="number" maxlength="11" placeholder="请输入手机号" @input="inviteeUser = null" />
      <button class="action-btn" size="mini" type="primary" @click="searchUser('invitee')">搜索</button>
    </view>
    <view v-if="inviteeUser" class="user-result">{{ formatUserName(inviteeUser) }}（{{ inviteeUser.phone }}）</view>
    <button class="bind-submit-btn" size="mini" type="primary" :disabled="!canBind" @click="handleBind">确认绑定</button>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { bindReferralByPhone, searchReferralUser } from '@/api/wxmini/referral'

const emit = defineEmits(['success'])
const inviterPhone = ref('')
const inviteePhone = ref('')
const inviterUser = ref(null)
const inviteeUser = ref(null)
const binding = ref(false)
const PHONE_PATTERN = /^1\d{10}$/

const canBind = computed(() => !binding.value
  && inviterUser.value?.phone === inviterPhone.value.trim()
  && inviteeUser.value?.phone === inviteePhone.value.trim()
  && inviterUser.value.userId !== inviteeUser.value.userId)

async function searchUser(role) {
  const phone = role === 'inviter' ? inviterPhone.value.trim() : inviteePhone.value.trim()
  if (!PHONE_PATTERN.test(phone)) return showError('请输入正确的11位手机号')
  try {
    const { data } = await searchReferralUser(phone)
    if (role === 'inviter') inviterUser.value = data
    else inviteeUser.value = data
  } catch (error) {
    showError(error?.msg || '用户搜索失败')
  }
}

function formatUserName(user) {
  return user.realName || user.userName || '未命名用户'
}

function handleBind() {
  if (!canBind.value) return showError('请先搜索并确认双方用户')
  uni.showModal({
    title: '确认绑定',
    content: `确认将${formatUserName(inviteeUser.value)}绑定为${formatUserName(inviterUser.value)}的邀请用户吗？`,
    success: ({ confirm }) => confirm && submitBind()
  })
}

async function submitBind() {
  if (binding.value) return
  binding.value = true
  try {
    await bindReferralByPhone({ inviterPhone: inviterPhone.value.trim(), inviteePhone: inviteePhone.value.trim() })
    uni.showToast({ title: '绑定成功', icon: 'success' })
    inviterPhone.value = ''
    inviteePhone.value = ''
    inviterUser.value = null
    inviteeUser.value = null
    emit('success')
  } catch (error) {
    showError(error?.msg || '绑定失败')
  } finally {
    binding.value = false
  }
}

function showError(title) {
  uni.showToast({ title, icon: 'none' })
}
</script>

<style lang="scss" scoped>
.manual-bind-card { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, .02); }
.manual-bind-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20rpx; }
.toolbar-title { font-size: 30rpx; font-weight: 700; color: #1e293b; }
.toolbar-subtitle { font-size: 22rpx; color: #94a3b8; }
.bind-user-row { display: flex; align-items: center; gap: 12rpx; margin-top: 16rpx; }
.bind-user-label { width: 150rpx; flex-shrink: 0; font-size: 24rpx; color: #475569; }
.bind-phone-input { flex: 1; min-width: 0; height: 60rpx; padding: 0 16rpx; box-sizing: border-box; border: 1px solid #e2e8f0; border-radius: 8rpx; font-size: 24rpx; }
.action-btn, .bind-submit-btn { margin: 0; background: #0f9d8f !important; color: #fff !important; font-size: 22rpx; }
.bind-submit-btn { display: block; width: 220rpx; margin: 24rpx auto 0; }
.user-result { margin: 10rpx 0 0 162rpx; font-size: 22rpx; color: #0f766e; }
</style>
