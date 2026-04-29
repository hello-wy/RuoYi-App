<template>
  <view class="page">
    <view v-if="loading && list.length === 0" class="loading-wrap">
      <uni-load-more status="loading"></uni-load-more>
    </view>

    <view v-else-if="error && list.length === 0" class="error-wrap">
      <text>加载失败，请重试</text>
      <view class="retry-btn" @click="loadData">
        <text class="retry-text">重试</text>
      </view>
    </view>

    <scroll-view v-else scroll-y class="list-scroll">
      <view v-if="!list.length" class="empty-wrap">
        <text class="empty-title">还没有发布需求</text>
        <text class="empty-desc">点击下方按钮，发布你的第一条需求</text>
      </view>
      <uni-swipe-action>
        <uni-swipe-action-item
          v-for="item in list"
          :key="item.id"
          :right-options="swipeOptions"
          @click="handleSwipeClick(item, $event)"
        >
          <view class="card" @click="goDetail(item.id)">
            <view class="card-top">
              <text class="card-title">{{ item.name || '未命名需求' }}</text>
              <text class="status-tag" :class="`status-${item.status}`">{{ getStatusLabel(item.status) }}</text>
            </view>
            <view class="meta-row">
              <dict-tag :options="dict.type.sys_methods" :value="item.methods" />
              <text class="meta-text">{{ item.region || '未填写区域' }}</text>
            </view>
            <view class="meta-row">
              <text class="meta-text">{{ formatClassTime(item) }}</text>
              <text class="meta-text">{{ formatDate(item.createDate) }}</text>
            </view>
          </view>
        </uni-swipe-action-item>
      </uni-swipe-action>
      <view class="bottom-space"></view>
    </scroll-view>

    <view class="fab" @click="handleCreate">
      <uni-icons type="plusempty" size="18" color="#fff"></uni-icons>
      <text class="fab-text">新增需求</text>
    </view>
  </view>
</template>

<script>
import { deleteMyParentDemand, getMyParentDemandDetail } from '@/api/wxmini/tutoring'
import { getParentServiceDateText, getParentServiceTimeText } from '@/pages/tutoring/parent/detail.helpers'

export default {
  dicts: ['sys_methods'],
  data() {
    return {
      list: [],
      loading: false,
      error: false,
      swipeOptions: [{ text: '删除', style: { backgroundColor: '#EF4444', color: '#fff' } }],
      shouldRefresh: false
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await getMyParentDemandDetail()
        const list = Array.isArray(res.data) ? res.data : []
        this.list = list.sort((a, b) => new Date(b.createDate || 0).getTime() - new Date(a.createDate || 0).getTime())
        this.error = false
      } catch (e) {
        this.error = true
      } finally {
        this.loading = false
      }
    },
    handleCreate() {
      uni.navigateTo({ url: '/pages/tutoring/parent/apply?fromMine=1' })
    },
    goDetail(id) {
      uni.navigateTo({ url: `/pages/tutoring/parent/detail?id=${id}&scene=mine` })
    },
    handleSwipeClick(item, event) {
      if (event?.content?.text !== '删除') return
      uni.showModal({
        title: '提示',
        content: '确认删除这条需求吗？',
        success: async ({ confirm }) => {
          if (!confirm) return
          try {
            await deleteMyParentDemand(item.id)
            this.list = this.list.filter(current => String(current.id) !== String(item.id))
            uni.showToast({ title: '删除成功', icon: 'success' })
          } catch (e) {
            uni.showToast({ title: '删除失败，请重试', icon: 'none' })
          }
        }
      })
    },
    getStatusLabel(status) {
      const map = { 0: '招募中', 1: '已完成', 2: '已取消' }
      return map[status] || '未知状态'
    },
    formatClassTime(item) {
      const dateText = getParentServiceDateText(item)
      const timeText = getParentServiceTimeText(item)
      return `${dateText} ${timeText}`.trim()
    },
    formatDate(value) {
      if (!value) return '未记录发布时间'
      const date = new Date(value)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f7fb;
}

.list-scroll {
  height: 100vh;
}

.loading-wrap,
.error-wrap,
.empty-wrap {
  padding: 160rpx 48rpx 0;
  text-align: center;
  color: #64748b;
}

.retry-btn {
  margin: 24rpx auto 0;
  width: 200rpx;
  height: 72rpx;
  border-radius: 36rpx;
  background: #0f766e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.retry-text,
.empty-title,
.empty-desc {
  color: #fff;
}

.empty-title {
  display: block;
  color: #1e293b;
  font-size: 34rpx;
  font-weight: 600;
}

.empty-desc {
  display: block;
  margin-top: 16rpx;
  color: #64748b;
  font-size: 26rpx;
}

.card {
  margin: 20rpx 24rpx 0;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 24rpx rgba(15, 23, 42, 0.05);
}

.card-top,
.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.card-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.status-tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.status-0 {
  background: #ecfdf5;
  color: #059669;
}

.status-1 {
  background: #eff6ff;
  color: #2563eb;
}

.status-2 {
  background: #fef2f2;
  color: #dc2626;
}

.meta-row {
  margin-top: 18rpx;
}

.meta-text {
  color: #64748b;
  font-size: 24rpx;
}

.bottom-space {
  height: 180rpx;
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: calc(48rpx + env(safe-area-inset-bottom));
  height: 88rpx;
  padding: 0 28rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
  display: flex;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 12rpx 30rpx rgba(15, 118, 110, 0.28);
}

.fab-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}
</style>
