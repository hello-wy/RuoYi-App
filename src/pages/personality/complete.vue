<template>
  <view class="complete-page">
    <scroll-view class="complete-content" scroll-y>
      <!-- White card containing the tables and titles -->
      <view class="white-card">
        <view class="title-wrap">
          <text class="page-title">天人合一性格测试表</text>
        </view>

        <!-- First Table: Dimensions Count Table -->
        <view class="table-container">
          <view class="table-row header-row">
            <view class="table-cell label-cell"></view>
            <view v-for="d in 9" :key="d" class="table-cell num-cell">{{ d }}</view>
          </view>
          
          <block v-if="tables.hasRows">
            <view v-for="row in tables.countRows" :key="row.label" class="table-row">
              <view class="table-cell label-cell">{{ row.label }}</view>
              <view v-for="(val, idx) in row.values" :key="idx" class="table-cell val-cell">{{ val }}</view>
            </view>
          </block>
          <block v-else>
            <!-- Fallback mock / empty rows to match screenshot structure -->
            <view v-for="label in ['是', '不确定', '否', '是/不确定']" :key="label" class="table-row">
              <view class="table-cell label-cell">{{ label }}</view>
              <view v-for="d in 9" :key="d" class="table-cell val-cell">0</view>
            </view>
          </block>
        </view>

        <!-- Subtitle: Options sorted from high to low -->
        <view class="subtitle-wrap">
          <text class="page-subtitle">选项从高到低排序</text>
        </view>

        <!-- Second Table: Dimensions Rank Table -->
        <view class="table-container">
          <!-- Empty header row matching the screenshot -->
          <view class="table-row header-row empty-header-row">
            <view class="table-cell label-cell"></view>
            <view v-for="d in 9" :key="d" class="table-cell num-cell"></view>
          </view>
          
          <block v-if="tables.hasRows">
            <view v-for="row in tables.rankRows" :key="row.label" class="table-row">
              <view class="table-cell label-cell">{{ row.label }}</view>
              <view v-for="(val, idx) in row.values" :key="idx" class="table-cell val-cell">{{ val }}</view>
            </view>
          </block>
          <block v-else>
            <!-- Fallback mock / empty rows to match screenshot structure -->
            <view v-for="label in ['是', '否', '是/不确定']" :key="label" class="table-row">
              <view class="table-cell label-cell">{{ label }}</view>
              <view v-for="d in 9" :key="d" class="table-cell val-cell">-</view>
            </view>
          </block>
        </view>

        <!-- Scissors instructions -->
        <view class="instruction-wrap">
          <view class="scissors-text">
            <text class="scissors-icon">✂️</text>
            <text>请截图保存</text>
          </view>
          <view class="action-text">
            <text>添加客服微信，回复我要解读</text>
          </view>
        </view>
      </view>

      <!-- Starry Sky section containing text and actions -->
      <view class="starry-section">
        <view class="starry-content">
          <view class="congrats-text">
            <text>恭喜您完成解密自我性格的第一步!，性格一直默默决定着我们人生的每一个选择，选择不同，人生结果也会不同。所以要想掌控自己的命运，唯有通透性格、完善性格!</text>
          </view>
          <view class="guide-text">
            <text>请截图并识别二维码，或搜索小程序“学优职傢”，叵复：“我要解读”。即可根据您的需求完成性格解析和咨询。</text>
          </view>
        </view>

        <!-- Navigation buttons at the bottom so they don't block the main screenshot area -->
        <view class="bottom-buttons">
          <button class="share-btn" open-type="share">分享测试</button>
          <button class="home-btn" @click="goHome">返回主页</button>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getPersonalityResult } from '@/api/wxmini/personalityTest'
import { buildPersonalityResultTables } from './complete.helpers'

export default {
  data() {
    return {
      attemptId: '',
      result: {}
    }
  },
  computed: {
    tables() {
      return buildPersonalityResultTables(this.result)
    }
  },
  onLoad(options) {
    this.attemptId = options.attemptId || ''
    this.loadResult()
  },
  onShareAppMessage() {
    return {
      title: '天人合一·性格测试',
      path: '/pages/personality/start'
    }
  },
  onShareTimeline() {
    return {
      title: '天人合一·性格测试'
    }
  },
  methods: {
    async loadResult() {
      if (!this.attemptId) return
      try {
        const res = await getPersonalityResult(this.attemptId)
        this.result = res || {}
      } catch (e) {
        uni.showToast({ title: e?.msg || e?.message || '结果加载失败', icon: 'none' })
        this.result = {}
      }
    },
    goHome() {
      uni.switchTab({ url: '/pages/index' })
    }
  }
}
</script>

<style lang="scss">
page {
  background-color: #050b18;
}

.complete-page {
  position: relative;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
  background-color: #050b18;
}

.complete-content {
  width: 100%;
  height: 100%;
}

.white-card {
  background-color: #ffffff;
  border-bottom-left-radius: 60rpx;
  border-bottom-right-radius: 60rpx;
  padding: 30rpx 30rpx 24rpx;
  box-sizing: border-box;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
}

.title-wrap {
  text-align: center;
  padding: 10rpx 0 15rpx;
}

.page-title {
  font-size: 38rpx;
  color: #707070;
  font-weight: 400;
  letter-spacing: 2rpx;
}

.table-container {
  width: 100%;
  border-left: 2rpx solid #e2e8f0;
  border-top: 2rpx solid #e2e8f0;
  box-sizing: border-box;
  margin-bottom: 8rpx;
  background-color: #ffffff;
}

.table-row {
  display: flex;
  width: 100%;
}

.table-cell {
  flex: 1;
  height: 52rpx;
  line-height: 52rpx;
  text-align: center;
  border-right: 2rpx solid #e2e8f0;
  border-bottom: 2rpx solid #e2e8f0;
  font-size: 24rpx;
  color: #333333;
  box-sizing: border-box;
}

.label-cell {
  flex: 0 0 140rpx;
  width: 140rpx;
  font-size: 24rpx;
  color: #333333;
  font-weight: bold;
}

.num-cell {
  color: #555555;
}

.subtitle-wrap {
  text-align: center;
  padding: 20rpx 0 10rpx;
}

.page-subtitle {
  font-size: 32rpx;
  color: #888888;
  font-weight: 400;
  letter-spacing: 1rpx;
}

.instruction-wrap {
  text-align: center;
  margin-top: 30rpx;
}

.scissors-text {
  color: #ff4d4f;
  font-size: 26rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
}

.scissors-icon {
  margin-right: 8rpx;
  font-size: 28rpx;
}

.action-text {
  color: #1890ff;
  font-size: 28rpx;
  font-weight: bold;
}

.starry-section {
  padding: 40rpx 44rpx 60rpx;
  box-sizing: border-box;
  background-color: #050b18;
  /* Deep space gradient + starry dust pattern */
  background-image: 
    radial-gradient(circle at 15% 20%, rgba(24, 144, 255, 0.25), transparent 45%),
    radial-gradient(circle at 85% 60%, rgba(147, 51, 234, 0.2), transparent 45%),
    radial-gradient(1.5px 1.5px at 30px 40px, #ffffff, transparent),
    radial-gradient(2px 2px at 120px 180px, #ffffff, transparent),
    radial-gradient(1.5px 1.5px at 250px 100px, #ffffff, transparent),
    radial-gradient(2.5px 2.5px at 80px 290px, #ffffff, transparent),
    radial-gradient(1.5px 1.5px at 210px 340px, #ffffff, transparent),
    radial-gradient(2px 2px at 330px 220px, #ffffff, transparent),
    radial-gradient(1.5px 1.5px at 160px 450px, #ffffff, transparent),
    radial-gradient(2.5px 2.5px at 290px 480px, #ffffff, transparent);
  background-repeat: no-repeat;
  background-size: cover;
}

.congrats-text,
.guide-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.8;
  text-align: justify;
  margin-bottom: 24rpx;
  letter-spacing: 1rpx;
}

.bottom-buttons {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.share-btn {
  background-color: #1890ff;
  color: #ffffff;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.home-btn {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  font-weight: bold;
}

.share-btn::after,
.home-btn::after {
  border: none;
}
</style>
