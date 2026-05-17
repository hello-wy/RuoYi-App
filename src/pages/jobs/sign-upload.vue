<template>
  <scroll-view class="sign-upload-page" scroll-y>
    <view class="hero-card">
      <text class="hero-title">上传签到图</text>
      <text class="hero-desc">请上传兼职现场签到图片，提交后等待商家审核</text>
    </view>

    <view class="info-card">
      <view class="info-row">
        <text class="info-label">岗位</text>
        <text class="info-value">{{ pageTitle || '兼职岗位' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">日期</text>
        <text class="info-value">{{ workDate || '-' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">状态</text>
        <text class="info-value" :class="status.type">{{ status.label }}</text>
      </view>
      <view v-if="rejectReason" class="reject-box">
        <text class="reject-label">驳回原因</text>
        <text class="reject-text">{{ rejectReason }}</text>
      </view>
    </view>

    <view class="upload-card">
      <view class="section-head">
        <text class="section-title">签到图片</text>
        <text class="section-subtitle">支持 JPG、JPEG、PNG，大小不超过 3MB</text>
      </view>

      <view v-if="previewUrl" class="preview-wrap">
        <image class="preview-image" :src="previewUrl" mode="aspectFill" @click="previewImage" />
      </view>
      <view v-else class="empty-wrap">
        <uni-icons type="image" size="36" color="#94a3b8" />
        <text class="empty-text">尚未选择签到图片</text>
      </view>

      <view class="action-row">
        <button class="secondary-btn" @click="chooseImage" :disabled="submitting">重新选择</button>
        <button class="primary-btn" @click="submitImage" :loading="submitting" :disabled="submitting || !localFilePath">提交审核</button>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMyJobSchedules, submitJobAttendanceImage, uploadJobAttendanceImage } from '@/api/wxmini/jobs'
import {
  appendPreviewCacheBuster,
  buildUploadedCertificateUrl,
  buildUploadedPreviewUrl,
  chooseWechatAlbumImage,
  getImageValidationError,
  isChooseImageCanceled,
  isChooseImagePermissionDenied,
  requestWechatImagePrivacyAuthorization
} from '@/pages/tutoring/tutor/apply.helpers'
import { buildAttendanceAuditStatus, getAttendanceRejectReason } from './schedules.helpers'
import config from '@/config'

const { proxy } = getCurrentInstance()

const orderNo = ref('')
const jobId = ref('')
const pageTitle = ref('')
const workDate = ref('')
const scheduleItem = ref({})
const localFilePath = ref('')
const previewUrl = ref('')
const submitting = ref(false)

const status = computed(() => buildAttendanceAuditStatus(scheduleItem.value || {}))
const rejectReason = computed(() => getAttendanceRejectReason(scheduleItem.value || {}))

onLoad(async (options = {}) => {
  orderNo.value = String(options.orderNo || '')
  jobId.value = String(options.jobId || '')
  pageTitle.value = decodeURIComponent(options.title || '')
  workDate.value = String(options.workDate || '')
  await loadSchedule()
})

async function loadSchedule() {
  if (!jobId.value) return
  try {
    const res = await getMyJobSchedules()
    const list = Array.isArray(res?.data) ? res.data : []
    const matched = list.find(item => String(item.jobId) === String(jobId.value)) || {}
    scheduleItem.value = matched
    if (!pageTitle.value) {
      pageTitle.value = matched.title || ''
    }
    if (!workDate.value) {
      workDate.value = matched.workDate || ''
    }
    if (matched.signImageUrl) {
      previewUrl.value = appendPreviewCacheBuster(buildUploadedPreviewUrl(config.baseUrl, { fileName: matched.signImageUrl }))
    }
  } catch (error) {
    uni.showToast({ title: '加载签到信息失败', icon: 'none' })
  }
}

async function chooseImage() {
  try {
    await requestWechatImagePrivacyAuthorization()
    const file = await chooseWechatAlbumImage()
    const error = getImageValidationError(file)
    if (error) {
      proxy.$modal.showToast(error)
      return
    }
    localFilePath.value = file.tempFilePath || file.path || ''
    previewUrl.value = localFilePath.value
  } catch (error) {
    if (isChooseImageCanceled(error?.errMsg || error?.message || error)) {
      return
    }
    if (isChooseImagePermissionDenied(error)) {
      proxy.$modal.showToast('请在微信设置中开启相册权限')
      return
    }
    proxy.$modal.showToast('选择图片失败')
  }
}

function previewImage() {
  if (!previewUrl.value) return
  uni.previewImage({ current: previewUrl.value, urls: [previewUrl.value] })
}

async function submitImage() {
  if (!orderNo.value) {
    proxy.$modal.showToast('订单不能为空')
    return
  }
  if (!localFilePath.value) {
    proxy.$modal.showToast('请先选择签到图片')
    return
  }
  submitting.value = true
  try {
    const uploadRes = await uploadJobAttendanceImage(localFilePath.value)
    const signImageUrl = buildUploadedCertificateUrl(uploadRes)
    if (!signImageUrl) {
      throw new Error('上传结果无效')
    }
    await submitJobAttendanceImage(orderNo.value, signImageUrl)
    proxy.$modal.showToast('提交成功')
    localFilePath.value = ''
    await loadSchedule()
    setTimeout(() => {
      uni.navigateBack({ delta: 1 })
    }, 600)
  } catch (error) {
    proxy.$modal.showToast(error?.message || error || '提交失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
page {
  background: #f5f7fb;
}

.sign-upload-page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.hero-card,
.info-card,
.upload-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05);
  margin-bottom: 24rpx;
}

.hero-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #0f172a;
}

.hero-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #64748b;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 18rpx;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 26rpx;
  color: #64748b;
}

.info-value {
  flex: 1;
  text-align: right;
  font-size: 26rpx;
  color: #0f172a;
}

.info-value.empty {
  color: #94a3b8;
}

.info-value.pending {
  color: #d97706;
}

.info-value.approved {
  color: #16a34a;
}

.info-value.rejected {
  color: #dc2626;
}

.reject-box {
  margin-top: 20rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #fef2f2;
}

.reject-label {
  display: block;
  font-size: 24rpx;
  color: #dc2626;
  font-weight: 600;
}

.reject-text {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #7f1d1d;
}

.section-head {
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.section-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #64748b;
}

.preview-wrap,
.empty-wrap {
  width: 100%;
  height: 420rpx;
  border-radius: 20rpx;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.empty-wrap {
  flex-direction: column;
}

.empty-text {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #94a3b8;
}

.action-row {
  display: flex;
  gap: 20rpx;
  margin-top: 28rpx;
}

.secondary-btn,
.primary-btn {
  flex: 1;
  border-radius: 15rpx;
  font-size: 28rpx;
}

.secondary-btn {
  color: #0f766e;
  background: #ecfdf5;
}

.primary-btn {
  color: #fff;
  background: #0f172a;
}
</style>
