<template>
  <view class="enrollment-page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-wrap">
      <uni-load-more status="loading" />
    </view>

    <!-- 空状态 -->
    <view v-else-if="list.length === 0" class="empty-wrap">
      <view class="iconfont icon-calendar empty-icon"></view>
      <text class="empty-text">暂无学籍记录</text>
    </view>

    <!-- 列表 -->
    <scroll-view v-else scroll-y class="list-scroll">
      <view
        v-for="(item, index) in list"
        :key="index"
        class="enrollment-card"
      >
        <!-- 课程名称 -->
        <view class="card-title">{{ item.lectureName }}</view>

        <!-- 包含内容 -->
        <view v-if="item.courseNames" class="card-sub">
          <text class="sub-label">包含内容：</text>
          <text class="sub-value">{{ item.courseNames }}</text>
        </view>

        <!-- 底部统计 -->
        <view class="card-footer">
          <text class="footer-total">共{{ item.total }}个学籍</text>
          <text class="footer-remain">剩余{{ item.remain }}个学籍</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-safe"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMyEnrollment } from '@/api/system/enrollment'

const loading = ref(true)
const list = ref([])

onLoad(() => {
  getMyEnrollment().then(res => {
    list.value = res.data || res.rows || res || []
  }).catch(() => {
    list.value = []
  }).finally(() => {
    loading.value = false
  })
})
</script>

<style lang="scss" scoped>
page {
  background-color: #f0f2f5;
}

.enrollment-page {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;

  .empty-icon {
    font-size: 100rpx;
    color: #c0c4cc;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #9ca3af;
  }
}

.list-scroll {
  height: 100vh;
}

.enrollment-card {
  background: #fff;
  border-radius: 16rpx;
  margin: 24rpx 24rpx 0;
  padding: 32rpx 30rpx 26rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .card-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 16rpx;
    line-height: 1.4;
  }

  .card-sub {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20rpx;

    .sub-label {
      font-size: 24rpx;
      color: #9ca3af;
      flex-shrink: 0;
    }

    .sub-value {
      font-size: 24rpx;
      color: #9ca3af;
      flex: 1;
      line-height: 1.5;
    }
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1rpx solid #f3f4f6;
    padding-top: 20rpx;

    .footer-total {
      font-size: 24rpx;
      color: #6b7280;
    }

    .footer-remain {
      font-size: 24rpx;
      color: #3b82f6;
      font-weight: 500;
    }
  }
}

.bottom-safe {
  height: 40rpx;
}
</style>
