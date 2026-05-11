<template>
  <view class="whitelist-list-page">
    <view class="search-card">
      <view class="search-title">白名单查询</view>
      <view class="search-row">
        <input
          v-model="realName"
          class="search-input"
          confirm-type="search"
          placeholder="按姓名搜索"
          @confirm="handleSearch"
        />
      </view>
      <view class="search-row">
        <input
          v-model="idCard"
          class="search-input"
          confirm-type="search"
          placeholder="按身份证搜索"
          @confirm="handleSearch"
        />
      </view>
      <view class="search-actions">
        <button class="action-btn secondary" :disabled="loading" @click="handleReset">重置</button>
        <button class="action-btn primary" :loading="loading" @click="handleSearch">搜索</button>
      </view>
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

      <view v-else-if="loadError && list.length === 0" class="state-box">
        <text class="state-text">加载失败，请重试</text>
        <button class="retry-btn" size="mini" @click="loadList(true)">重试</button>
      </view>

      <view v-else-if="list.length === 0" class="state-box">
        <text class="state-text">暂无白名单数据</text>
      </view>

      <view v-else class="card-list">
        <view v-for="item in list" :key="item.id" class="whitelist-card">
          <view class="card-head">
            <view>
              <text class="card-name">{{ item.realName || '未填写姓名' }}</text>
              <text class="card-idcard">{{ item.idCard || '未填写身份证' }}</text>
            </view>
            <button class="delete-btn" size="mini" @click="handleDelete(item)">删除</button>
          </view>
          <view class="card-meta">价格：{{ item.price ?? '-' }}</view>
          <view class="card-meta">备注：{{ item.remark || '无' }}</view>
        </view>

        <uni-load-more :status="loadMoreStatus" @clickLoadMore="loadMore" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { deleteParttimeWhitelist, listParttimeWhitelist } from '@/api/system/parttimeWhitelist'
import { requireAdminAccess } from '../access'
import { buildParttimeWhitelistListQuery, createParttimeWhitelistListState } from '../parttime-whitelist.list.helpers'

export default {
  data() {
    return createParttimeWhitelistListState()
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
    this.loadList(true)
  },
  onPullDownRefresh() {
    this.onRefresh()
  },
  methods: {
    async loadList(reset = false) {
      if (this.loading) {
        if (reset) {
          this.refreshing = false
          uni.stopPullDownRefresh()
        }
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
        const res = await listParttimeWhitelist(buildParttimeWhitelistListQuery(this))
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
    handleReset() {
      this.realName = ''
      this.idCard = ''
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
    handleDelete(item) {
      uni.showModal({
        title: '确认删除',
        content: `确认删除${item.realName || '该记录'}吗？`,
        success: async ({ confirm }) => {
          if (!confirm) {
            return
          }
          await deleteParttimeWhitelist(item.id)
          this.$modal.showToast('删除成功')
          this.loadList(true)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped src="./list.scss"></style>
