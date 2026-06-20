<template>
  <scroll-view class="license-page" scroll-y>
    <view class="header">
      <text class="title">商家身份申请</text>
      <text class="subtitle">上传营业执照后提交审核，审核通过后可切换为商家身份。</text>
    </view>

    <view class="panel">
      <text class="section-title">营业执照</text>
      <ImageUploader
        v-model="previewUrl"
        :uploading="uploading"
        trigger-text="上传营业执照"
        @upload="handleUpload"
        @remove="handleRemove"
      />
      <button class="submit-btn" :loading="submitting" :disabled="uploading || submitting" @click="handleSubmit">
        提交审核
      </button>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref } from 'vue'
import config from '@/config'
import ImageUploader from '@/components/ImageUploader/ImageUploader.vue'
import { submitMerchantApplication, uploadMerchantLicense } from '@/api/wxmini/merchantApplication'
import {
  buildUploadedCertificateUrl,
  buildUploadedPreviewUrl,
} from '@/utils/imageUpload'

const uploading = ref(false)
const submitting = ref(false)
const licenseUrl = ref('')
const previewUrl = ref('')

function handleRemove() {
  licenseUrl.value = ''
  previewUrl.value = ''
}

async function handleUpload(file) {
  uploading.value = true
  try {
    const result = await uploadMerchantLicense(file.tempFilePath || file.path)
    const uploadedUrl = buildUploadedCertificateUrl(result)
    if (!uploadedUrl) {
      throw new Error('上传成功，但服务端没有返回图片地址')
    }
    licenseUrl.value = uploadedUrl
    previewUrl.value = buildUploadedPreviewUrl(config.baseUrl, result)
    uni.showToast({ title: '上传成功', icon: 'success' })
  } catch (error) {
    uni.showModal({
      title: '上传失败',
      content: error?.message || error || '上传失败，请重试',
      showCancel: false,
    })
  } finally {
    uploading.value = false
  }
}

async function handleSubmit() {
  if (!licenseUrl.value) {
    uni.showToast({ title: '请先上传营业执照', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await submitMerchantApplication({ businessLicenseUrl: licenseUrl.value })
    uni.showModal({
      title: '提交成功',
      content: '商家身份申请已提交，请等待后台审核。',
      showCancel: false,
      success: () => uni.navigateBack(),
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.license-page {
  min-height: 100vh;
  box-sizing: border-box;
  background: #f5f7fb;
  padding: 40rpx 28rpx;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 28rpx;
}

.title {
  color: #172033;
  font-size: 42rpx;
  font-weight: 700;
}

.subtitle {
  color: #667085;
  font-size: 26rpx;
  line-height: 1.6;
}

.panel {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx;
  box-shadow: 0 16rpx 40rpx rgba(18, 32, 56, 0.08);
}

.section-title {
  display: block;
  color: #172033;
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.submit-btn {
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 12rpx;
  margin-top: 32rpx;
  background: #19a974;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
}

.submit-btn[disabled] {
  opacity: 0.6;
}
</style>
