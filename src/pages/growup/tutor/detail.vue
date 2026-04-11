<template>
  <view class="page">
    <!-- 悬浮返回按钮 -->
    <view class="float-back" :style="{ top: (statusBarHeight + 10) + 'px' }" @click="goBack">
      <uni-icons type="left" size="20" color="#fff"></uni-icons>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-wrap">
      <uni-load-more status="loading"></uni-load-more>
    </view>

    <!-- 加载失败 -->
    <view v-else-if="error" class="error-wrap">
      <uni-icons type="close-circle" size="48" color="#e2e8f0"></uni-icons>
      <text class="error-text">加载失败，请重试</text>
      <view class="retry-btn" @click="loadDetail">
        <text class="retry-text">重新加载</text>
      </view>
    </view>

    <block v-else-if="detail">
      <!-- 顶部 Hero 区 -->
      <view class="hero">
        <view class="hero-decor c1"></view>
        <view class="hero-decor c2"></view>
        <view class="avatar-wrap">
          <image
            class="avatar"
            :src="detail.avatar || '/static/images/tabbar/mine.png'"
            mode="aspectFill"
          ></image>
        </view>
        <text class="hero-name">{{ detail.name }}</text>
        <text v-if="detail.title" class="hero-title">{{ detail.title }}</text>
        <text v-if="detail.org || detail.intro" class="hero-org">{{ detail.org || detail.intro }}</text>

        <!-- 标签行 -->
        <view v-if="tagList.length" class="tag-row">
          <view v-for="(tag, i) in tagList" :key="i" class="tag-item">
            <text class="tag-text">{{ tag }}</text>
          </view>
        </view>
      </view>

      <!-- 内容滚动区 -->
      <scroll-view scroll-y class="content-scroll">

        <!-- 详细介绍 -->
        <view v-if="detail.detail || detail.description" class="section-card">
          <view class="section-header">
            <view class="section-bar"></view>
            <text class="section-title">详细介绍</text>
          </view>

          <!-- 解析出的富文本块：图片 + 文字段落 -->
          <view class="rich-blocks">
            <view v-for="(block, i) in richBlocks" :key="i" class="rich-block-item">
              <image
                v-if="block.type === 'image'"
                class="rich-image"
                :src="block.src"
                mode="widthFix"
              ></image>
              <text v-else class="rich-text">{{ block.content }}</text>
            </view>
          </view>
        </view>

        <!-- 底部占位 -->
        <view style="height: 40px;"></view>
      </scroll-view>
    </block>
  </view>
</template>

<script>
import { getProfile } from '@/api/system/profile'

export default {
  data() {
    return {
      statusBarHeight: 0,
      id: '',
      loading: true,
      error: false,
      detail: null
    }
  },
  computed: {
    // 将 tags 字段（逗号分隔字符串或数组）转为数组
    tagList() {
      const tags = this.detail && this.detail.tags
      if (!tags) return []
      if (Array.isArray(tags)) return tags
      return tags.split(/[,，]/).map(t => t.trim()).filter(Boolean)
    },
    // 将 detail/description 中的 <image>url</image> 标签解析为图片+文字块
    richBlocks() {
      let raw = (this.detail && (this.detail.detail || this.detail.description)) || ''
      if (!raw) return []

      // 还原后端可能 HTML 实体编码的标签：&lt;image&gt; → <image>
      raw = raw
        .replace(/&lt;image&gt;/gi, '<image>')
        .replace(/&lt;\/image&gt;/gi, '</image>')
        .replace(/&lt;img&gt;/gi, '<image>')
        .replace(/&lt;\/img&gt;/gi, '</image>')
        .replace(/&amp;/g, '&')

      const blocks = []
      // 大小写不敏感，兼容 <Image> / <IMAGE> 等写法
      const regex = /<image>([\s\S]*?)<\/image>/gi
      let lastIndex = 0
      let match

      while ((match = regex.exec(raw)) !== null) {
        // 标签前的文字
        const before = raw.slice(lastIndex, match.index).trim()
        if (before) blocks.push({ type: 'text', content: before })
        // 图片：去除首尾空白及可能混入的换行
        const src = match[1].replace(/\s+/g, '').trim()
        if (src) blocks.push({ type: 'image', src })
        lastIndex = regex.lastIndex
      }

      // 末尾剩余文字
      const after = raw.slice(lastIndex).trim()
      if (after) blocks.push({ type: 'text', content: after })

      // 若完全没有匹配到标签，整体作为纯文字输出
      if (blocks.length === 0) blocks.push({ type: 'text', content: raw })

      return blocks
    }
  },
  onLoad(options) {
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight || 0
    this.id = options.id || ''
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      if (!this.id) {
        this.error = true
        this.loading = false
        return
      }
      this.loading = true
      this.error = false
      try {
        const res = await getProfile(this.id)
        this.detail = res.data || res
      } catch (e) {
        this.error = true
      } finally {
        this.loading = false
      }
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss">
page {
  background: #f4f6fb;
}

.page {
  min-height: 100vh;
  background: #f4f6fb;
  display: flex;
  flex-direction: column;
}

/* ===== 返回按钮 ===== */
.float-back {
  position: fixed;
  left: 16px;
  z-index: 100;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== 加载 / 错误 ===== */
.loading-wrap,
.error-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.error-text {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 12px;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 24px;
  background: #3B82F6;
  border-radius: 20px;
}

.retry-text {
  font-size: 14px;
  color: #fff;
}

/* ===== Hero 区 ===== */
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(150deg, #1e3a8a 0%, #3B82F6 60%, #60A5FA 100%);
  padding: 0 24px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-decor {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
}

.hero-decor.c1 {
  width: 220px;
  height: 220px;
  top: -80px;
  right: -60px;
}

.hero-decor.c2 {
  width: 140px;
  height: 140px;
  bottom: -40px;
  left: -30px;
}

.avatar-wrap {
  margin-top: 80px;
  margin-bottom: 16px;
  z-index: 1;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.6);
  background: #e2e8f0;
  display: block;
}

.hero-name {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  z-index: 1;
  margin-bottom: 6px;
}

.hero-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  z-index: 1;
  margin-bottom: 4px;
}

.hero-org {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  z-index: 1;
  margin-bottom: 16px;
}

.tag-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  z-index: 1;
}

.tag-item {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 4px 14px;
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.tag-text {
  font-size: 12px;
  color: #fff;
}

/* ===== 滚动区 ===== */
.content-scroll {
  flex: 1;
  padding: 16px 16px 0;
  box-sizing: border-box;
}

/* ===== 内容卡片 ===== */
.section-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 18px;
  margin-bottom: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
}

.section-bar {
  width: 4px;
  height: 18px;
  border-radius: 2px;
  background: #3B82F6;
  margin-right: 10px;
  flex-shrink: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

/* ===== 富文本块 ===== */
.rich-blocks {
  display: flex;
  flex-direction: column;
}

.rich-block-item {
  margin-bottom: 12px;
}

.rich-block-item:last-child {
  margin-bottom: 0;
}

.rich-image {
  width: 100%;
  border-radius: 10px;
  display: block;
}

.rich-text {
  font-size: 14px;
  line-height: 1.8;
  color: #475569;
  white-space: pre-wrap;
}
</style>
