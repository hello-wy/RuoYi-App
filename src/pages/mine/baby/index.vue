<template>
  <view class="baby-page">
    <view class="header-card">
      <view>
        <view class="header-title">萌娃管理</view>
        <view class="header-desc">维护孩子档案，后续可用于家教需求关联。</view>
      </view>
      <view class="header-btn" @click="handleAdd">新增萌娃</view>
    </view>

    <view v-if="!loading && !list.length" class="empty-card">
      <uni-icons type="info-filled" size="28" color="#94a3b8" />
      <text class="empty-text">暂无萌娃，请先添加</text>
    </view>

    <view v-for="item in list" :key="item.id" class="baby-card">
      <view class="baby-head">
        <view>
          <view class="baby-name-row">
            <text class="baby-name">{{ item.realName }}</text>
            <text v-if="item.nickName" class="baby-nick">（{{ item.nickName }}）</text>
          </view>
          <view class="baby-meta">{{ formatGender(item.gender) }} · {{ item.birthDate || '--' }}</view>
        </view>
        <view class="action-row">
          <text class="action-text" @click="handleEdit(item.id)">编辑</text>
          <text class="action-divider">|</text>
          <text class="action-text danger" @click="handleDelete(item)">删除</text>
        </view>
      </view>

      <view class="info-row">
        <text class="info-label">学校</text>
        <text class="info-value">{{ item.schoolName || '--' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">年级</text>
        <text class="info-value">{{ item.grade || '--' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">特殊说明</text>
        <text class="info-value multiline">{{ item.specialNote || '暂无' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { deleteBaby, listBaby } from '@/pages/mine/baby/_api/wxmini/baby'

const loading = ref(false)
const list = ref([])

function loadList() {
  loading.value = true
  listBaby().then(res => {
    list.value = Array.isArray(res.data) ? res.data : []
  }).finally(() => {
    loading.value = false
  })
}

function formatGender(gender) {
  if (Number(gender) === 0) return '男'
  if (Number(gender) === 1) return '女'
  return '未知'
}

function handleAdd() {
  uni.navigateTo({ url: '/pages/mine/baby/edit' })
}

function handleEdit(id) {
  uni.navigateTo({ url: '/pages/mine/baby/edit?id=' + id })
}

function handleDelete(item) {
  uni.showModal({
    title: '删除确认',
    content: `确定删除${item.realName}的档案吗？`,
    success: async (res) => {
      if (!res.confirm) return
      try {
        await deleteBaby(item.id)
        uni.showToast({ title: '删除成功', icon: 'success' })
        loadList()
      } catch (e) {
        uni.showToast({ title: e?.msg || '删除失败', icon: 'none' })
      }
    }
  })
}

onShow(() => {
  loadList()
})
</script>

<style lang="scss" scoped>
page { background: #f4f6fb; }
.baby-page { min-height: 100vh; padding: 24rpx; background: #f4f6fb; }
.header-card, .baby-card, .empty-card { background: #fff; border-radius: 24rpx; box-shadow: 0 12rpx 36rpx rgba(15, 23, 42, 0.06); }
.header-card { padding: 28rpx 24rpx; margin-bottom: 20rpx; display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
.header-title { font-size: 34rpx; font-weight: 700; color: #1f2937; }
.header-desc { margin-top: 8rpx; font-size: 24rpx; color: #6b7280; line-height: 1.6; }
.header-btn { padding: 0 24rpx; height: 68rpx; line-height: 68rpx; border-radius: 999rpx; background: linear-gradient(135deg, #7c6cff 0%, #5b4fd8 100%); color: #fff; font-size: 26rpx; white-space: nowrap; }
.empty-card { padding: 80rpx 24rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.empty-text { margin-top: 20rpx; font-size: 28rpx; color: #94a3b8; }
.baby-card { padding: 24rpx; margin-bottom: 20rpx; }
.baby-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16rpx; margin-bottom: 20rpx; }
.baby-name-row { display: flex; align-items: center; flex-wrap: wrap; }
.baby-name { font-size: 32rpx; font-weight: 700; color: #111827; }
.baby-nick { font-size: 26rpx; color: #6b7280; }
.baby-meta { margin-top: 8rpx; font-size: 24rpx; color: #64748b; }
.action-row { display: flex; align-items: center; font-size: 24rpx; }
.action-text { color: #4f46e5; }
.action-text.danger { color: #ef4444; }
.action-divider { margin: 0 12rpx; color: #cbd5e1; }
.info-row { display: flex; align-items: flex-start; padding: 10rpx 0; }
.info-label { width: 110rpx; flex-shrink: 0; font-size: 25rpx; color: #94a3b8; }
.info-value { flex: 1; font-size: 26rpx; color: #334155; }
.info-value.multiline { line-height: 1.7; }
</style>
