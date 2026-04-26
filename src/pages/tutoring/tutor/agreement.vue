<template>
  <view class="page">
    <view class="page-body">
      <view class="hero-card">
        <text class="hero-title">{{ title }}</text>
        <text class="hero-updated">{{ updatedAt }}</text>
      </view>

      <view v-for="section in sections" :key="section.heading" class="section-card">
        <text class="section-heading">{{ section.heading }}</text>
        <text
          v-for="paragraph in section.paragraphs"
          :key="`${section.heading}-${paragraph}`"
          class="section-paragraph"
        >
          {{ paragraph }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
import {
  tutorAgreementSections,
  tutorAgreementTitle,
  tutorAgreementUpdatedAt,
} from './agreement.content'

export default {
  data() {
    return {
      title: tutorAgreementTitle,
      updatedAt: tutorAgreementUpdatedAt,
      sections: tutorAgreementSections,
    }
  },
}
</script>

<style lang="scss">
page {
  background: #f4f6fb;
}

.page {
  min-height: 100vh;
  background: #f4f6fb;
}

.page-body {
  padding: 16px;
}

.hero-card,
.section-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.hero-card {
  margin-bottom: 14px;
}

.hero-title {
  display: block;
  font-size: 36rpx;
  line-height: 52rpx;
  font-weight: 600;
  color: #111827;
}

.hero-updated {
  display: block;
  margin-top: 10px;
  font-size: 24rpx;
  line-height: 36rpx;
  color: #6b7280;
}

.section-card + .section-card {
  margin-top: 14px;
}

.section-heading {
  display: block;
  margin-bottom: 12px;
  font-size: 30rpx;
  line-height: 44rpx;
  font-weight: 600;
  color: #111827;
}

.section-paragraph {
  display: block;
  font-size: 28rpx;
  line-height: 44rpx;
  color: #374151;
}

.section-paragraph + .section-paragraph {
  margin-top: 10px;
}
</style>
