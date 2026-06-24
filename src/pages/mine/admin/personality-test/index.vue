<template>
  <view class="personality-page">
    <view class="summary-card">
      <view>
        <text class="summary-title">性格测试管理</text>
        <text class="summary-subtitle">查看问卷填写人数与答题明细</text>
      </view>
      <view class="summary-count">
        <text class="count-value">{{ completedCount }}</text>
        <text class="count-label">已填写人数</text>
      </view>
    </view>

    <view class="filter-card">
      <view class="filter-title">填写记录</view>
      <view class="status-tabs">
        <view
          v-for="item in statusOptions"
          :key="item.value"
          class="status-tab"
          :class="{ active: status === item.value }"
          @click="switchStatus(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <scroll-view
      class="record-scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view v-if="loading && list.length === 0" class="state-box">
        <uni-load-more status="loading" />
      </view>

      <view v-else-if="loadError && list.length === 0" class="state-box">
        <text class="state-text">加载失败，请重试</text>
        <button class="retry-btn" size="mini" @click="loadList(true)">重试</button>
      </view>

      <view v-else-if="list.length === 0" class="state-box">
        <text class="state-text">暂无填写记录</text>
      </view>

      <view v-else class="record-list">
        <view
          v-for="item in list"
          :key="item.attemptId"
          class="record-card"
          @click="goDetail(item.attemptId)"
        >
          <view class="record-top">
            <view>
              <text class="user-name">{{ getDisplayName(item) }}</text>
              <text class="user-meta">用户ID：{{ item.userInfoId || '--' }}</text>
            </view>
            <text class="status-tag" :class="getStatusClass(item.status)">{{ item.statusLabel || getStatusLabel(item.status) }}</text>
          </view>

          <view class="info-list">
            <view class="info-row">
              <text class="info-label">已答题数</text>
              <text class="info-value">{{ item.answeredCount || 0 }}/180</text>
            </view>
            <view class="info-row">
              <text class="info-label">开始时间</text>
              <text class="info-value">{{ item.startedAt || '--' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">完成时间</text>
              <text class="info-value">{{ item.completedAt || '--' }}</text>
            </view>
          </view>
        </view>

        <uni-load-more :status="loadMoreStatus" @clickLoadMore="loadMore" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getPersonalityAttemptCount, listPersonalityAttempts } from '@/api/wxmini/personalityTest'
import { requireAdminAccess } from '../access'
import { resolveCompletedCount } from './index.helpers'

const PAGE_SIZE = 10

export default {
  data() {
    return {
      completedCount: 0,
      list: [],
      total: 0,
      pageNum: 1,
      loading: false,
      refreshing: false,
      finished: false,
      loadError: false,
      status: undefined,
      statusOptions: [
        { label: '全部', value: undefined },
        { label: '进行中', value: 0 },
        { label: '已完成', value: 1 }
      ]
    }
  },
  computed: {
    loadMoreStatus() {
      if (this.loading && this.list.length > 0) {
        return 'loading'
      }
      return this.finished ? 'noMore' : 'more'
    }
  },
  onLoad() {
    if (!requireAdminAccess(this)) {
      return
    }
    this.loadCount()
    this.loadList(true)
  },
  onShow() {
    if (!requireAdminAccess(this)) {
      return
    }
  },
  onPullDownRefresh() {
    this.onRefresh()
  },
  methods: {
    async loadCount() {
      try {
        const res = await getPersonalityAttemptCount()
        this.completedCount = resolveCompletedCount(res)
      } catch (error) {
        console.error('加载性格测试填写人数失败', error)
      }
    },
    async loadList(reset = false) {
      if (this.loading) {
        return
      }
      if (reset) {
        this.pageNum = 1
        this.list = []
        this.total = 0
        this.finished = false
        this.loadError = false
      }
      this.loading = true
      try {
        const params = {
          pageNum: this.pageNum,
          pageSize: PAGE_SIZE
        }
        if (this.status !== undefined) {
          params.status = this.status
        }
        const res = await listPersonalityAttempts(params)
        const rows = Array.isArray(res.rows) ? res.rows : []
        this.list = reset ? rows : this.list.concat(rows)
        this.total = Number(res.total || 0)
        this.finished = this.list.length >= this.total || rows.length === 0
        this.pageNum += 1
        this.loadError = false
      } catch (error) {
        this.loadError = true
        console.error('加载性格测试填写记录失败', error)
      } finally {
        this.loading = false
        this.refreshing = false
        uni.stopPullDownRefresh()
      }
    },
    switchStatus(status) {
      if (this.status === status) {
        return
      }
      this.status = status
      this.loadList(true)
    },
    onRefresh() {
      this.refreshing = true
      this.loadCount()
      this.loadList(true)
    },
    loadMore() {
      if (this.loading || this.finished) {
        return
      }
      this.loadList(false)
    },
    goDetail(attemptId) {
      if (!attemptId) {
        return
      }
      uni.navigateTo({ url: '/pages/mine/admin/personality-test/detail?attemptId=' + attemptId })
    },
    getDisplayName(item) {
      return item.realName || item.userName || item.userId || '未命名用户'
    },
    getStatusLabel(status) {
      if (Number(status) === 0) return '进行中'
      if (Number(status) === 1) return '已完成'
      if (Number(status) === 2) return '已取消'
      return '未知'
    },
    getStatusClass(status) {
      if (Number(status) === 1) return 'completed'
      if (Number(status) === 0) return 'progress'
      return 'muted'
    }
  }
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
