<template>
  <view class="lecture-list-page">
    <view class="search-card">
      <input v-model="name" class="search-input" confirm-type="search" placeholder="按课程名称搜索" @confirm="handleSearch" />
      <view class="search-actions">
        <button class="action-btn secondary" :disabled="loading" @click="handleReset">重置</button>
        <button class="action-btn primary" :loading="loading" @click="handleSearch">搜索</button>
        <button class="action-btn add" @click="openEdit()">新增课程</button>
      </view>
    </view>

    <scroll-view class="list-scroll" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh" @scrolltolower="loadMore">
      <view v-if="loading && list.length === 0" class="state-box"><uni-load-more status="loading" /></view>
      <view v-else-if="loadError && list.length === 0" class="state-box"><text class="state-text">加载失败，请重试</text><button class="retry-btn" size="mini" @click="loadList(true)">重试</button></view>
      <view v-else-if="list.length === 0" class="state-box"><text class="state-text">暂无课程数据</text></view>
      <view v-else class="card-list">
        <view v-for="item in list" :key="item.id" class="lecture-card">
          <image v-if="!coverFailed[item.id]" class="cover" :src="getCover(item)" mode="aspectFill" @error="coverFailed[item.id] = true" />
          <view v-else class="cover cover-fallback">课程</view>
          <view class="card-main">
            <view class="card-head"><text class="card-name">{{ item.name || '未命名课程' }}</text><text class="enrollment">{{ item.requiresEnrollment === false ? '无需学籍' : '需要学籍' }}</text></view>
            <text class="card-meta">{{ item.time || '-' }} 至 {{ item.endDate || '-' }}</text>
            <text class="card-meta">地点：{{ item.location || '未填写' }}</text>
            <text class="card-meta">讲师：{{ item.speakerNames || '未填写' }}</text>
            <text class="card-meta">课程价 ¥{{ item.coursePrice ?? '-' }} · 报名费 ¥{{ item.registrationFee ?? '-' }} · 已报名 {{ item.enrolledCount ?? 0 }}</text>
            <view class="card-actions"><button class="edit-btn" size="mini" @click="openEdit(item.id)">编辑</button><button class="delete-btn" size="mini" @click="handleDelete(item)">删除</button></view>
          </view>
        </view>
        <uni-load-more :status="loadMoreStatus" @clickLoadMore="loadMore" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import config from '@/config'
import { delLectures, listLectures } from '@/api/system/lectures'
import { getLectureImageSrc } from '@/utils/lecture-cover'
import { requireAdminAccess } from '../access'
import { buildLectureListQuery, createLectureListState } from './helpers'

export default {
  data() {
    return { ...createLectureListState(), coverFailed: {} }
  },
  computed: {
    loadMoreStatus() {
      if (this.loading && this.list.length > 0) return 'loading'
      return this.finished ? 'noMore' : 'more'
    }
  },
  onLoad() {
    if (requireAdminAccess(this)) this.loadList(true)
  },
  onShow() {
    if (requireAdminAccess(this) && this.list.length > 0) this.loadList(true)
  },
  onPullDownRefresh() {
    this.onRefresh()
  },
  methods: {
    getCover(item) {
      return getLectureImageSrc({ baseUrl: config.baseUrl, lecture: item, fileName: 'cover.webp' })
    },
    async loadList(reset = false) {
      if (this.loading) return
      if (reset) Object.assign(this, { pageNum: 1, list: [], total: 0, finished: false, loadError: false, coverFailed: {} })
      this.loading = true
      try {
        const res = await listLectures(buildLectureListQuery(this))
        const rows = Array.isArray(res.rows) ? res.rows : []
        this.list = reset ? rows : this.list.concat(rows)
        this.total = Number(res.total || 0)
        this.finished = this.list.length >= this.total || rows.length === 0
        this.pageNum += 1
      } catch (error) {
        this.loadError = true
      } finally {
        this.loading = false
        this.refreshing = false
        uni.stopPullDownRefresh()
      }
    },
    handleSearch() { this.loadList(true) },
    handleReset() { this.name = ''; this.loadList(true) },
    onRefresh() { this.refreshing = true; this.loadList(true) },
    loadMore() { if (!this.loading && !this.finished) this.loadList() },
    openEdit(id) { this.$tab.navigateTo(`/pages/mine/admin/lectures/edit${id ? `?id=${id}` : ''}`) },
    handleDelete(item) {
      uni.showModal({ title: '确认删除', content: `确认删除“${item.name || '该课程'}”吗？`, success: async ({ confirm }) => {
        if (!confirm) return
        await delLectures(item.id)
        this.$modal.showToast('删除成功')
        this.loadList(true)
      } })
    }
  }
}
</script>

<style lang="scss" scoped>
page { background: #f5f7ff; }
.lecture-list-page { min-height: 100vh; padding: 24rpx; box-sizing: border-box; background: #f5f7ff; }
.search-card, .lecture-card { border-radius: 24rpx; background: #fff; box-shadow: 0 12rpx 30rpx rgba(43, 53, 106, .08); }
.search-card { padding: 24rpx; }.search-title { font-size: 32rpx; font-weight: 700; color: #241f3f; margin-bottom: 16rpx; }
.search-input { height: 78rpx; margin-top: 14rpx; padding: 0 22rpx; border: 1px solid #e7e5f2; border-radius: 16rpx; background: #faf9ff; font-size: 28rpx; }
.search-actions, .card-actions { display: flex; gap: 16rpx; margin-top: 20rpx; }.action-btn, .edit-btn, .delete-btn { margin: 0; font-size: 25rpx; }.action-btn { flex: 1; }.primary, .edit-btn { color: #fff; background: #5b4fd8; }.secondary { background: #eeeefa; color: #514b68; }.add { color: #fff; background: #0d9488; }
.list-scroll { height: calc(100vh - 248rpx); margin-top: 22rpx; }.state-box { padding: 100rpx 0; text-align: center; }.state-text, .card-meta { display: block; color: #77728a; font-size: 25rpx; line-height: 1.8; }.retry-btn { margin-top: 18rpx; }
.card-list { padding-bottom: 24rpx; }.lecture-card { display: flex; gap: 20rpx; padding: 20rpx; margin-bottom: 18rpx; }.cover { flex: 0 0 156rpx; width: 156rpx; height: 156rpx; border-radius: 16rpx; }.cover-fallback { display: flex; align-items: center; justify-content: center; color: #fff; background: linear-gradient(135deg, #7c6cff, #0d9488); font-size: 28rpx; }.card-main { min-width: 0; flex: 1; }.card-head { display: flex; align-items: center; justify-content: space-between; gap: 10rpx; }.card-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 30rpx; font-weight: 700; color: #241f3f; }.enrollment { flex: 0 0 auto; color: #0d9488; font-size: 21rpx; }.card-actions { justify-content: flex-end; }.delete-btn { color: #d9485f; background: #fff0f2; }
</style>
