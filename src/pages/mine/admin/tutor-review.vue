<template>
  <view class="review-page">
    <view class="review-header">
      <view class="header-title">教员审核</view>
      <view class="header-count">待审核 {{ total }} 人</view>
    </view>

    <scroll-view class="review-scroll" scroll-y @scrolltolower="loadMore">
      <view v-if="loading && tutorList.length === 0" class="state-box">
        <uni-load-more status="loading" />
      </view>

      <view v-else-if="loadError && tutorList.length === 0" class="state-box">
        <text class="state-text">加载失败，请重试</text>
        <button class="retry-btn" size="mini" @click="loadTutorList(true)">重试</button>
      </view>

      <view v-else-if="tutorList.length === 0" class="state-box">
        <text class="state-text">暂无待审核教员</text>
      </view>

      <view v-else class="card-list">
        <view
          v-for="item in tutorList"
          :key="item.id"
          class="review-card"
          @click="openTutorDetail(item)"
        >
          <view class="card-head">
            <text class="tutor-name">{{ formatTutorName(item) }}</text>
            <uni-icons type="right" size="16" color="#94A3B8" />
          </view>

          <view class="summary-list">
            <view
              v-for="row in getSummaryRows(item)"
              :key="row.label"
              class="summary-row"
            >
              <text class="summary-label">{{ row.label }}</text>
              <text class="summary-value">{{ row.value }}</text>
            </view>
          </view>
        </view>

        <uni-load-more :status="loadMoreStatus" @clickLoadMore="loadMore" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { buildPendingTutorReviewQuery, listTutors } from '@/api/system/tutors'
import { requireAdminAccess } from './access'
import {
  buildTutorReviewDetailUrl,
  buildTutorReviewSummaryRows
} from './tutor-review.helpers'

const PAGE_SIZE = 10

export default {
  dicts: ['sys_methods'],
  data() {
    return {
      tutorList: [],
      pageNum: 1,
      total: 0,
      loading: false,
      loadError: false,
      shouldRefreshOnShow: false
    }
  },
  computed: {
    loadMoreStatus() {
      if (this.loading && this.tutorList.length > 0) {
        return 'loading'
      }
      return this.tutorList.length < this.total ? 'more' : 'noMore'
    }
  },
  onLoad() {
    if (!requireAdminAccess(this)) {
      return
    }
    this.loadTutorList(true)
  },
  onShow() {
    if (!requireAdminAccess(this)) {
      return
    }
    if (!this.shouldRefreshOnShow) {
      return
    }
    this.shouldRefreshOnShow = false
    this.loadTutorList(true)
  },
  onPullDownRefresh() {
    this.loadTutorList(true)
  },
  methods: {
    async loadTutorList(reset = false) {
      if (this.loading) return
      if (reset) this.resetListState()
      this.loading = true
      try {
        const res = await listTutors(this.buildQueryParams())
        const rows = Array.isArray(res.rows) ? res.rows : []
        this.tutorList = reset ? rows : this.tutorList.concat(rows)
        this.total = Number(res.total || 0)
        this.pageNum += 1
        this.loadError = false
      } catch (error) {
        this.loadError = true
        console.error('加载待审核教员失败', error)
      } finally {
        this.loading = false
        uni.stopPullDownRefresh()
      }
    },
    resetListState() {
      this.tutorList = []
      this.pageNum = 1
      this.total = 0
      this.loadError = false
    },
    buildQueryParams() {
      return buildPendingTutorReviewQuery({ pageNum: this.pageNum, pageSize: PAGE_SIZE })
    },
    loadMore() {
      if (this.loading || this.tutorList.length >= this.total) return
      this.loadTutorList(false)
    },
    formatTutorName(item) {
      return (item && item.realName) || '未填写姓名'
    },
    getSummaryRows(item) {
      return buildTutorReviewSummaryRows(item, this.dict.type.sys_methods || [])
    },
    openTutorDetail(item) {
      this.shouldRefreshOnShow = true
      uni.navigateTo({
        url: buildTutorReviewDetailUrl(item)
      })
    }
  }
}
</script>

<style lang="scss" scoped src="./tutor-review.scss"></style>
