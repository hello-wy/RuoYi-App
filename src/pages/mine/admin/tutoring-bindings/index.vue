<template>
  <view class="binding-page">
    <view class="summary-wrap">
      <view class="summary-circle">
        <text class="summary-value">{{ total }}</text>
      </view>
      <text class="summary-label">{{ activeStatusLabel }}家教订单</text>
    </view>

    <view class="manage-card">
      <view class="manage-head">
        <view class="manage-title-wrap">
          <text class="toolbar-title">已发布家教订单</text>
          <text class="toolbar-subtitle">{{ activeStatusLabel }}共 {{ total }} 条</text>
        </view>
      </view>

      <view class="status-tabs">
        <view
          v-for="item in statusOptions"
          :key="String(item.value)"
          class="status-tab"
          :class="{ active: activeBound === item.value }"
          @click="changeStatus(item.value)"
        >
          {{ item.label }}
        </view>
      </view>

      <scroll-view
        class="binding-scroll"
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
          <text class="state-text">暂无{{ activeStatusLabel }}家教订单</text>
        </view>

        <view v-else class="binding-list">
          <view
            v-for="item in list"
            :key="item.id"
            class="binding-card"
            @click="openDetail(item)"
          >
            <text class="binding-title">{{ item.name || '未命名家教订单' }}</text>
            <view class="binding-row">
              <text class="row-label">家长姓名</text>
              <text class="row-value">{{ formatParentName(item) }}</text>
            </view>
            <view class="binding-row">
              <text class="row-label">绑定学员</text>
              <text class="row-value">{{ formatBoundTutorName(item) }}</text>
            </view>
            <view class="binding-row">
              <text class="row-label">家长手机号</text>
              <text class="row-value">{{ formatParentPhone(item) }}</text>
            </view>
            <view class="binding-row">
              <text class="row-label">学生手机号</text>
              <text class="row-value">{{ formatBoundStudentPhone(item) }}</text>
            </view>
          </view>

          <uni-load-more :status="loadMoreStatus" @clickLoadMore="loadMore" />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { listParents } from '@/pages/mine/admin/_api/system/parents'
import { requireAdminAccess } from '../access'
import {
  formatBoundTutorName,
  formatBoundStudentPhone
} from '../tutoring-bindings.helpers'

const PAGE_SIZE = 10
const ACTIVE_PARENT_STATUS = 0
const UNBOUND_STATUS = false

export default {
  data() {
    return {
      list: [],
      total: 0,
      pageNum: 1,
      pageSize: PAGE_SIZE,
      loading: false,
      finished: false,
      refreshing: false,
      loadError: false,
      activeBound: UNBOUND_STATUS,
      statusOptions: [
        { label: '未绑定', value: false },
        { label: '已绑定', value: true }
      ]
    }
  },
  computed: {
    loadMoreStatus() {
      if (this.loading && this.list.length > 0) {
        return 'loading'
      }
      return this.finished ? 'noMore' : 'more'
    },
    activeStatusLabel() {
      return this.activeBound ? '已绑定' : '未绑定'
    }
  },
  onLoad() {
    if (!requireAdminAccess(this)) {
      return
    }
    this.loadList(true)
  },
  onPullDownRefresh() {
    this.onRefresh()
  },
  methods: {
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
        const res = await listParents({
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          status: ACTIVE_PARENT_STATUS,
          bound: this.activeBound
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
    changeStatus(value) {
      if (this.activeBound === value) {
        return
      }
      this.activeBound = value
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
    openDetail(item) {
      if (!item?.id) {
        return
      }
      uni.navigateTo({
        url: `/pages/tutoring/parent/detail?id=${item.id}&scene=admin`
      })
    },
    formatParentName(item) {
      return item.parentName || item.name || '-'
    },
    formatBoundTutorName(item) {
      return formatBoundTutorName(item)
    },
    formatParentPhone(item) {
      return item.parentPhone || item.phone || '-'
    },
    formatBoundStudentPhone(item) {
      return formatBoundStudentPhone(item)
    }
  }
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
