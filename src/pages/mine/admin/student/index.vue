<template>
  <view class="student-page">
    <view class="summary-wrap">
      <view class="summary-circle">
        <text class="summary-value">{{ total }}</text>
      </view>
      <text class="summary-label">总学员数</text>
    </view>

    <view class="manage-card">
      <view class="manage-head">
        <view class="manage-title-wrap">
          <text class="toolbar-title">学员管理</text>
          <text class="toolbar-subtitle">共 {{ total }} 位学员</text>
        </view>
        <view class="search-box">
          <uni-icons type="search" size="16" color="#94a3b8" />
          <input
            v-model="realName"
            class="search-input"
            confirm-type="search"
            placeholder="搜索学员姓名"
            placeholder-class="search-placeholder"
            @confirm="handleSearch"
          />
        </view>
      </view>

      <scroll-view
        class="student-scroll"
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
          <text class="state-text">{{ realName ? '未搜索到相关学员' : '暂无学员数据' }}</text>
        </view>

        <view v-else class="student-list">
          <view
            v-for="item in list"
            :key="item.id"
            class="student-card"
            @click="goDetail(item.id)"
          >
            <view>
              <text class="student-name">{{ item.displayName || '未命名用户' }}</text>
              <text class="student-meta">实名：{{ item.realName || '未填写' }}</text>
            </view>
            <view class="card-right">
              <text class="type-tag">{{ item.userTypeLabel || getUserTypeText(item.userType) }}</text>
              <uni-icons type="right" size="16" color="#cbd5e1" />
            </view>
          </view>

          <uni-load-more :status="loadMoreStatus" @clickLoadMore="loadMore" />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { listStudents } from '@/pages/mine/admin/_api/system/student'
import { requireAdminAccess } from '../access'
import { createInitialListState, getUserTypeText } from './helpers'

const PAGE_SIZE = 10

export default {
  data() {
    return {
      ...createInitialListState(),
      refreshing: false
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
    this.pageSize = PAGE_SIZE
    this.loadList(true)
  },
  onPullDownRefresh() {
    this.onRefresh()
  },
  methods: {
    getUserTypeText,
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
        const res = await listStudents({
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          realName: this.realName || undefined
        })
        const rows = Array.isArray(res.rows) ? res.rows : []
        this.list = reset ? rows : this.list.concat(rows)
        this.total = Number(res.total || 0)
        const hasMore = this.list.length < this.total && rows.length > 0
        this.finished = !hasMore
        this.pageNum += 1
        this.loadError = false
      } catch (error) {
        this.loadError = true
      } finally {
        this.loading = false
        this.refreshing = false
        uni.stopPullDownRefresh()
      }
    },
    handleSearch() {
      this.loadList(true)
    },
    onRefresh() {
      this.refreshing = true
      this.loadList(true)
    },
    loadMore() {
      if (this.loading || this.finished) {
        return
      }
      this.loadList(false)
    },
    goDetail(id) {
      uni.navigateTo({ url: '/pages/mine/admin/student/detail?id=' + id })
    }
  }
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
