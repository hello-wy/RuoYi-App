<template>
  <view class="referral-admin-page">
    <!-- 头部搜索筛选区 -->
    <view class="filter-card">
      <view class="search-row">
        <view class="search-box">
          <uni-icons type="search" size="16" color="#94a3b8" />
          <input
            v-model="queryParams.userName"
            class="search-input"
            confirm-type="search"
            placeholder="搜索被邀请人姓名/昵称"
            placeholder-class="search-placeholder"
            @confirm="handleSearch"
          />
        </view>
      </view>
      
      <view class="filter-row">
        <input
          v-model="queryParams.phone"
          class="filter-input"
          placeholder="被邀请人手机"
          @confirm="handleSearch"
        />
        <input
          v-model="queryParams.inviteCode"
          class="filter-input"
          placeholder="使用的邀请码"
          @confirm="handleSearch"
        />
      </view>
      
      <view class="btn-row">
        <button class="reset-btn" size="mini" @click="handleReset">重置</button>
        <button class="search-btn" size="mini" type="primary" @click="handleSearch">搜索</button>
      </view>
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

        <view v-else-if="list.length === 0" class="state-box">
          <text class="state-text">暂无相关邀请记录</text>
        </view>

        <view v-else class="relation-list">
          <view v-for="(item, index) in list" :key="index" class="relation-card">
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
            </view>
          </view>

          <uni-load-more :status="loadMoreStatus" />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { listAllReferrals } from '@/api/wxmini/referral'

const list = ref([])
const total = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const finished = ref(false)

const queryParams = ref({
  userName: '',
  phone: '',
  inviteCode: '',
  inviterUserName: '',
  inviterPhone: ''
})

const loadMoreStatus = computed(() => {
  if (loading.value && list.value.length > 0) return 'loading'
  return finished.value ? 'noMore' : 'more'
})

onLoad(() => {
  loadList(true)
})

function loadList(isRefresh = false) {
  if (loading.value) return
  
  if (isRefresh) {
    pageNum.value = 1
    finished.value = false
    list.value = []
  }

  loading.value = true
  if (isRefresh) refreshing.value = true

  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    userName: queryParams.value.userName || undefined,
    phone: queryParams.value.phone || undefined,
    inviteCode: queryParams.value.inviteCode || undefined
  }

  listAllReferrals(params).then(res => {
    // 配合 RuoYi 列表返回格式
    const rows = res.rows || []
    list.value = list.value.concat(rows)
    total.value = res.total || 0
    
    if (rows.length < pageSize.value) {
      finished.value = true
    } else {
      pageNum.value++
    }
  }).finally(() => {
    loading.value = false
    refreshing.value = false
  })
}

function handleSearch() {
  loadList(true)
}

function handleReset() {
  queryParams.value = {
    userName: '',
    phone: '',
    inviteCode: '',
    inviterUserName: '',
    inviterPhone: ''
  }
  loadList(true)
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

.filter-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.filter-input {
  flex: 1;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8rpx;
  padding: 12rpx 20rpx;
  font-size: 28rpx;
  color: #1e293b;
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
  justify-content: flex-end;
}

.bind-time {
  font-size: 22rpx;
  color: #94a3b8;
}
</style>
