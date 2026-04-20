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
        <view v-for="item in tutorList" :key="item.id" class="review-card">
          <view class="card-main">
            <view class="card-info">
              <text class="tutor-name">{{ formatTutorName(item) }}</text>
              <text class="info-line">学校：{{ item.school || '未填写' }}</text>
              <text class="info-line">专业：{{ item.major || '未填写' }}</text>
              <view class="method-row">
                <text class="info-label">授课方式：</text>
                <dict-tag
                  v-if="hasTeachingMethod(item)"
                  :options="dict.type.sys_methods"
                  :value="item.methods"
                />
                <text v-else class="method-empty">未填写</text>
              </view>
              <text class="certificate-text">证书说明：{{ item.certificate || '未填写' }}</text>
            </view>

            <view class="cert-box">
              <image
                v-if="getCertificateImages(item).length > 0"
                class="cert-thumb"
                :src="getCertificateImages(item)[0]"
                mode="aspectFill"
                @click="previewCertificate(item)"
              />
              <view v-else class="cert-empty">暂无图片</view>
            </view>
          </view>

          <view class="card-actions">
            <button
              class="review-btn reject-btn"
              :disabled="reviewingId === item.id"
              @click="submitReview(item.id, 2)"
            >
              拒绝
            </button>
            <button
              class="review-btn pass-btn"
              :disabled="reviewingId === item.id"
              @click="submitReview(item.id, 1)"
            >
              通过
            </button>
          </view>
        </view>

        <uni-load-more :status="loadMoreStatus" @clickLoadMore="loadMore" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import config from '@/config'
import { buildPendingTutorReviewQuery, listTutors, reviewTutors } from '@/api/system/tutors'
import { isHttp } from '@/utils/validate'
import { requireAdminAccess } from './access'

const PAGE_SIZE = 10
const REVIEW_STATUS_PASS = 1
const REVIEW_STATUS_REJECT = 2

export default {
  dicts: ['sys_methods'],
  data() {
    return {
      tutorList: [],
      pageNum: 1,
      total: 0,
      loading: false,
      loadError: false,
      reviewingId: ''
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
  onPullDownRefresh() {
    this.loadTutorList(true)
  },
  methods: {
    async loadTutorList(reset = false) {
      if (this.loading) {
        return
      }
      if (reset) {
        this.resetListState()
      }
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
      return buildPendingTutorReviewQuery({
        pageNum: this.pageNum,
        pageSize: PAGE_SIZE
      })
    },
    loadMore() {
      if (this.loading || this.tutorList.length >= this.total) {
        return
      }
      this.loadTutorList(false)
    },
    getCertificateImages(item) {
      return String((item && item.certificates) || '')
        .split(',')
        .map(url => this.resolveImageUrl(url.trim()))
        .filter(Boolean)
    },
    resolveImageUrl(url) {
      if (!url) {
        return ''
      }
      return isHttp(url) ? url : config.baseUrl + url
    },
    formatTutorName(item) {
      return (item && item.realName) || (item && item.nickname) || '未填写姓名'
    },
    hasTeachingMethod(item) {
      return item && item.methods !== null && item.methods !== undefined && item.methods !== ''
    },
    previewCertificate(item) {
      const urls = this.getCertificateImages(item)
      if (urls.length === 0) {
        return
      }
      uni.previewImage({
        urls,
        current: urls[0]
      })
    },
    async submitReview(id, status) {
      this.reviewingId = id
      try {
        await reviewTutors({ id, isCertified: status })
        this.tutorList = this.tutorList.filter(item => item.id !== id)
        this.total = Math.max(this.total - 1, 0)
        this.$modal.showToast(status === REVIEW_STATUS_PASS ? '已通过' : '已拒绝')
      } catch (error) {
        console.error('审核教员失败', error)
      } finally {
        this.reviewingId = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped src="./tutor-review.scss"></style>
