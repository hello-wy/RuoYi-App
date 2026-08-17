<template>
  <scroll-view class="referral-admin-page" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="refreshTree">
    <view class="selection-card">
      <view class="card-head"><text class="card-title">查看一、二级邀请</text><text class="card-subtitle">先选择小程序用户</text></view>
      <view class="selection-row">
        <input v-model="selectionPhone" class="phone-input" type="number" maxlength="11" placeholder="输入小程序用户手机号" />
        <button class="action-btn" size="mini" type="primary" :loading="loading" @click="selectUser">查询</button>
      </view>
      <text class="selection-tip">查询后展示该用户直接邀请的一级用户，以及一级用户直接邀请的二级用户。</text>
    </view>

    <ReferralManualBind @success="refreshTree" />

    <view v-if="!selectedUser" class="selection-state"><uni-icons type="person" size="38" color="#94a3b8" /><text>请选择一位小程序用户后查看邀请关系</text></view>
    <template v-else>
      <view class="selected-user-card"><text class="selected-label">当前查看</text><text class="selected-name">{{ displayName(selectedUser) }}</text><text class="selected-phone">{{ selectedUser.phone || '未填写手机号' }}</text></view>
      <ReferralRelationList :selected-user="selectedUser" :level1-invitees="level1Invitees" :level2-invitees="level2Invitees" @reward="handleReward" @remove="handleRemove" />
    </template>
  </scroll-view>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getReferralTree, removeReferral, rewardReferral, searchReferralUser } from '@/api/wxmini/referral'
import ReferralManualBind from './components/ReferralManualBind.vue'
import ReferralRelationList from './components/ReferralRelationList.vue'
import { requireAdminAccess } from '../access'

const PHONE_PATTERN = /^1\d{10}$/
const { proxy } = getCurrentInstance()
const selectionPhone = ref('')
const selectedUser = ref(null)
const level1Invitees = ref([])
const level2Invitees = ref([])
const loading = ref(false)
const refreshing = ref(false)

onLoad(() => requireAdminAccess(proxy))

async function selectUser() {
  const phone = selectionPhone.value.trim()
  if (!PHONE_PATTERN.test(phone)) return showError('请输入正确的11位手机号')
  if (!requireAdminAccess(proxy) || loading.value) return
  loading.value = true
  try {
    const { data } = await searchReferralUser(phone)
    await loadTree(data.userId)
  } catch (error) {
    showError(error?.msg || '用户查询失败')
  } finally {
    loading.value = false
  }
}

async function loadTree(userId) {
  const { data } = await getReferralTree(userId)
  selectedUser.value = data.selectedUser
  level1Invitees.value = data.level1Invitees || []
  level2Invitees.value = data.level2Invitees || []
}

async function refreshTree() {
  if (!selectedUser.value || loading.value) return uni.stopPullDownRefresh()
  refreshing.value = true
  try {
    await loadTree(selectedUser.value.userId)
  } catch (error) {
    showError(error?.msg || '邀请关系加载失败')
  } finally {
    refreshing.value = false
    uni.stopPullDownRefresh()
  }
}

function handleReward(item) {
  uni.showModal({ title: '确认发奖', content: `确认向${item.inviterUserName || '邀请人'}发放邀请新人奖金吗？`, success: ({ confirm }) => confirm && submitReward(item.id) })
}

async function submitReward(id) {
  try {
    await rewardReferral(id)
    uni.showToast({ title: '奖金已发放', icon: 'success' })
    await refreshTree()
  } catch (error) {
    showError(error?.msg || '发放失败')
  }
}

function handleRemove(item) {
  uni.showModal({ title: '确认删除绑定', content: '确认删除该邀请绑定关系吗？删除后被邀请人可重新绑定。', success: ({ confirm }) => confirm && submitRemove(item.id) })
}

async function submitRemove(id) {
  try {
    await removeReferral(id)
    uni.showToast({ title: '绑定关系已删除', icon: 'success' })
    await refreshTree()
  } catch (error) {
    showError(error?.msg || '删除失败')
  }
}

function displayName(user) { return user.realName || user.userName || '未命名用户' }
function showError(title) { uni.showToast({ title, icon: 'none' }) }
</script>

<style lang="scss" scoped>
.referral-admin-page { height: 100vh; box-sizing: border-box; padding: 20rpx; background: #f1f5f9; }
.selection-card, .selected-user-card { margin-bottom: 20rpx; padding: 24rpx; border-radius: 16rpx; background: #fff; box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, .02); }
.card-head, .selection-row { display: flex; align-items: center; }.card-head { justify-content: space-between; margin-bottom: 20rpx; }.card-title { font-size: 30rpx; font-weight: 700; color: #1e293b; }.card-subtitle, .selection-tip { font-size: 22rpx; color: #94a3b8; }.selection-row { gap: 16rpx; }.phone-input { flex: 1; height: 68rpx; padding: 0 20rpx; border: 1px solid #e2e8f0; border-radius: 8rpx; background: #f8fafc; font-size: 26rpx; }.action-btn { margin: 0; background: #0f9d8f !important; color: #fff !important; font-size: 22rpx; }.selection-tip { display: block; margin-top: 16rpx; line-height: 1.5; }.selection-state { min-height: 260rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20rpx; color: #94a3b8; font-size: 26rpx; }.selected-user-card { display: flex; align-items: baseline; gap: 16rpx; }.selected-label { font-size: 22rpx; color: #64748b; }.selected-name { font-size: 30rpx; font-weight: 700; color: #1e293b; }.selected-phone { font-size: 22rpx; color: #94a3b8; }
</style>
