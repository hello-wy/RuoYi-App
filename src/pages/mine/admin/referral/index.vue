<template>
  <view class="referral-admin-page">
    <!-- 头部搜索筛选区 -->
    <view class="filter-card">
      <view class="search-row">
        <view class="search-box">
          <uni-icons type="search" size="16" color="#94a3b8" />
          <input
            v-model="keyword"
            class="search-input"
            confirm-type="search"
            placeholder="搜索被邀请人姓名/昵称/手机号"
            placeholder-class="search-placeholder"
            @confirm="handleSearch"
          />
        </view>
      </view>
      
      <view class="btn-row">
        <button class="reset-btn" size="mini" @click="handleReset">重置</button>
        <button class="search-btn" size="mini" type="primary" @click="handleSearch">搜索</button>
      </view>
    </view>

    <view class="manual-bind-card">
      <view class="manual-bind-head">
        <text class="toolbar-title">手动绑定邀请关系</text>
        <text class="toolbar-subtitle">按手机号确认双方用户</text>
      </view>
      <view class="bind-user-row">
        <text class="bind-user-label">邀请人手机号</text>
        <input v-model="inviterPhone" class="bind-phone-input" type="number" maxlength="11" placeholder="请输入手机号" @input="inviterUser = null" />
        <button class="search-btn" size="mini" type="primary" @click="searchUser('inviter')">搜索</button>
      </view>
      <view v-if="inviterUser" class="user-result">
        {{ formatUserName(inviterUser) }}（{{ inviterUser.phone }}）
      </view>
      <view class="bind-user-row">
        <text class="bind-user-label">被邀请人手机号</text>
        <input v-model="inviteePhone" class="bind-phone-input" type="number" maxlength="11" placeholder="请输入手机号" @input="inviteeUser = null" />
        <button class="search-btn" size="mini" type="primary" @click="searchUser('invitee')">搜索</button>
      </view>
      <view v-if="inviteeUser" class="user-result">
        {{ formatUserName(inviteeUser) }}（{{ inviteeUser.phone }}）
      </view>
      <button class="bind-submit-btn" size="mini" type="primary" :disabled="!canBind" @click="handleBind">确认绑定</button>
    </view>

    <!-- 列表展示区 -->
    <view class="list-card">
      <view class="list-head">
        <text class="toolbar-title">邀请关系列表</text>
        <text class="toolbar-subtitle">共 {{ total }} 条记录</text>
      </view>

      <scroll-view
        class="list-scroll"
        scroll-y
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
        @scrolltolower="loadMore"
      >
        <view v-if="loading && list.length === 0" class="state-box">
          <uni-load-more status="loading" />
        </view>

        <view v-else-if="loadError" class="state-box">
          <text class="state-text">邀请记录加载失败</text>
          <button class="search-btn" size="mini" type="primary" @click="loadList(true)">重试</button>
        </view>

        <view v-else-if="list.length === 0" class="state-box">
          <text class="state-text">暂无相关邀请记录</text>
        </view>

        <view v-else class="relation-list">
          <view v-for="item in list" :key="item.id" class="relation-card">
            <!-- 关系详情 -->
            <view class="relation-main">
              <!-- 被邀请人 -->
              <view class="user-block">
                <text class="user-role-label">被邀请人</text>
                <text class="user-name">{{ item.userName || '微信用户' }}</text>
                <text class="user-phone">{{ item.phone || '无手机号' }}</text>
              </view>
              
              <!-- 关系连接线/箭头 -->
              <view class="connector">
                <text class="connector-arrow">←</text>
                <text class="connector-code">{{ item.inviteCode }}</text>
              </view>

              <!-- 邀请人 -->
              <view class="user-block">
                <text class="user-role-label">邀请人</text>
                <text class="user-name">{{ item.inviterUserName || '微信用户' }}</text>
                <text class="user-phone">{{ item.inviterPhone || '无手机号' }}</text>
              </view>
            </view>
            
            <view class="relation-footer">
              <text class="bind-time">绑定时间：{{ item.createTime }}</text>
              <text class="reward-status" :class="isPendingReward(item) ? 'pending' : 'rewarded'">{{ isPendingReward(item) ? '待审核' : `已发放 ¥${item.rewardAmount}` }}</text>
            </view>
            <view v-if="isPendingReward(item)" class="relation-actions">
              <button class="reward-btn" size="mini" @click="handleReward(item)">审核发奖</button>
              <button class="remove-btn" size="mini" @click="handleRemove(item)">删除绑定</button>
            </view>
            <text v-if="item.rewardTime" class="reward-time">发放时间：{{ item.rewardTime }}</text>
          </view>

          <uni-load-more :status="loadMoreStatus" />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { bindReferralByPhone, listAllReferrals, removeReferral, rewardReferral, searchReferralUser } from '@/api/wxmini/referral'
import { requireAdminAccess } from '../access'

const { proxy } = getCurrentInstance()
const list = ref([])
const total = ref(0)
const loading = ref(false)
const loadError = ref(false)
const refreshing = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const finished = ref(false)

const keyword = ref('')
const inviterPhone = ref('')
const inviteePhone = ref('')
const inviterUser = ref(null)
const inviteeUser = ref(null)
const binding = ref(false)

const canBind = computed(() => {
  return !binding.value && inviterUser.value && inviteeUser.value
    && inviterUser.value.phone === inviterPhone.value.trim()
    && inviteeUser.value.phone === inviteePhone.value.trim()
    && inviterUser.value.userId !== inviteeUser.value.userId
})

const loadMoreStatus = computed(() => {
  if (loading.value && list.value.length > 0) return 'loading'
  return finished.value ? 'noMore' : 'more'
})

onLoad(() => {
  if (requireAdminAccess(proxy)) {
    loadList(true)
  }
})

function loadList(isRefresh = false) {
  if (loading.value) return
  
  if (!requireAdminAccess(proxy)) return

  if (isRefresh) {
    pageNum.value = 1
    finished.value = false
    list.value = []
    loadError.value = false
  }

  loading.value = true
  if (isRefresh) refreshing.value = true

  const searchKeyword = keyword.value.trim()
  const isPhone = /^\d+$/.test(searchKeyword)
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    userName: isPhone ? undefined : searchKeyword || undefined,
    phone: isPhone ? searchKeyword : undefined
  }

  listAllReferrals(params).then(res => {
    // 配合 RuoYi 列表返回格式
    const rows = res.rows || []
    list.value = list.value.concat(rows)
    total.value = res.total || 0
    loadError.value = false

    if (rows.length < pageSize.value) {
      finished.value = true
    } else {
      pageNum.value++
    }
  }).catch(() => {
    loadError.value = list.value.length === 0
  }).finally(() => {
    loading.value = false
    refreshing.value = false
  })
}

async function searchUser(role) {
  const phone = role === 'inviter' ? inviterPhone.value.trim() : inviteePhone.value.trim()
  if (!/^1\d{10}$/.test(phone)) {
    uni.showToast({ title: '请输入正确的11位手机号', icon: 'none' })
    return
  }
  try {
    const res = await searchReferralUser(phone)
    if (role === 'inviter') {
      inviterUser.value = res.data
    } else {
      inviteeUser.value = res.data
    }
  } catch (error) {
    uni.showToast({ title: error?.msg || '用户搜索失败', icon: 'none' })
  }
}

function formatUserName(user) {
  return user.realName || user.userName || '未命名用户'
}

function isPendingReward(item) {
  return !item.rewardStatus || item.rewardStatus === 'PENDING'
}

function handleBind() {
  if (!canBind.value) {
    uni.showToast({ title: '请先搜索并确认双方用户', icon: 'none' })
    return
  }
  uni.showModal({
    title: '确认绑定',
    content: `确认将${formatUserName(inviteeUser.value)}绑定为${formatUserName(inviterUser.value)}的邀请用户吗？`,
    success: async ({ confirm }) => {
      if (!confirm || binding.value) return
      binding.value = true
      try {
        await bindReferralByPhone({
          inviterPhone: inviterPhone.value.trim(),
          inviteePhone: inviteePhone.value.trim()
        })
        uni.showToast({ title: '绑定成功', icon: 'success' })
        inviterPhone.value = ''
        inviteePhone.value = ''
        inviterUser.value = null
        inviteeUser.value = null
        loadList(true)
      } catch (error) {
        uni.showToast({ title: error?.msg || '绑定失败', icon: 'none' })
      } finally {
        binding.value = false
      }
    }
  })
}

function handleSearch() {
  loadList(true)
}

function handleReset() {
  keyword.value = ''
  loadList(true)
}

function handleReward(item) {
  uni.showModal({
    title: '确认发奖',
    content: `确认向${item.inviterUserName || '邀请人'}发放邀请新人奖金吗？`,
    success: async ({ confirm }) => {
      if (!confirm) return
      try {
        await rewardReferral(item.id)
        uni.showToast({ title: '奖金已发放', icon: 'success' })
        loadList(true)
      } catch (error) {
        uni.showToast({ title: error?.msg || '发放失败', icon: 'none' })
      }
    }
  })
}

function handleRemove(item) {
  if (item?.id == null) {
    uni.showToast({ title: '邀请关系编号缺失，请刷新后重试', icon: 'none' })
    return
  }
  uni.showModal({
    title: '确认删除绑定',
    content: '确认删除该邀请绑定关系吗？删除后被邀请人可重新绑定。',
    success: async ({ confirm }) => {
      if (!confirm) return
      try {
        await removeReferral(item.id)
        uni.showToast({ title: '绑定关系已删除', icon: 'success' })
        loadList(true)
      } catch (error) {
        uni.showToast({ title: error?.msg || '删除失败', icon: 'none' })
      }
    }
  })
}

function onRefresh() {
  loadList(true)
}

function loadMore() {
  if (!finished.value && !loading.value) {
    loadList(false)
  }
}
</script>

<style lang="scss" scoped>
.referral-admin-page {
  min-height: 100vh;
  background-color: #f1f5f9;
  padding: 20rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.filter-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
}

.search-row {
  margin-bottom: 20rpx;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8rpx;
  padding: 12rpx 20rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  margin-left: 12rpx;
  color: #1e293b;
}

.search-placeholder {
  color: #94a3b8;
}

.btn-row {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.reset-btn {
  background-color: #f1f5f9;
  color: #475569;
  border: none;
  font-weight: 500;
  &:active {
    opacity: 0.8;
  }
}

.search-btn {
  background-color: #0f9d8f !important;
  color: #ffffff !important;
  font-weight: 500;
}

.manual-bind-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
}

.manual-bind-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20rpx;
}

.bind-user-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
}

.bind-user-label {
  width: 150rpx;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #475569;
}

.bind-phone-input {
  flex: 1;
  min-width: 0;
  height: 60rpx;
  padding: 0 16rpx;
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.user-result {
  margin: 12rpx 0 0 162rpx;
  font-size: 24rpx;
  color: #0f766e;
}

.bind-submit-btn {
  display: block;
  width: 100%;
  margin-top: 24rpx;
  background-color: #0f9d8f !important;
  color: #ffffff !important;
}

.list-card {
  flex: 1;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.list-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 20rpx;
}

.toolbar-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1e293b;
}

.toolbar-subtitle {
  font-size: 24rpx;
  color: #64748b;
}

.list-scroll {
  flex: 1;
  height: 0; // 必须设置以撑满 flex container 并使 scroll 触发
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.state-text {
  font-size: 26rpx;
  color: #94a3b8;
  margin-bottom: 20rpx;
}

.relation-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.relation-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.user-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border: 1px solid #f1f5f9;
  padding: 16rpx;
  border-radius: 8rpx;
}

.user-role-label {
  font-size: 20rpx;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8rpx;
  display: block;
}

.user-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4rpx;
}

.user-phone {
  font-size: 22rpx;
  color: #64748b;
}

.connector {
  width: 140rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.connector-arrow {
  font-size: 32rpx;
  color: #f59e0b;
  font-weight: bold;
}

.connector-code {
  font-size: 20rpx;
  color: #f59e0b;
  background-color: #fef3c7;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  margin-top: 4rpx;
}

.relation-footer {
  border-top: 1px dashed #e2e8f0;
  padding-top: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12rpx;
}

.reward-status { font-size: 22rpx; }
.reward-status.pending { color: #d97706; }
.reward-status.rewarded { color: #16a34a; }
.relation-actions { display: flex; justify-content: flex-end; gap: 12rpx; margin-top: 16rpx; }
.reward-btn { margin: 0; color: #fff; background: #0f9d8f; font-size: 22rpx; }
.remove-btn { margin: 0; color: #fff; background: #dc2626; font-size: 22rpx; }
.reward-time { display: block; margin-top: 10rpx; font-size: 22rpx; color: #94a3b8; }
.bind-time { font-size: 22rpx; color: #94a3b8; }
</style>
