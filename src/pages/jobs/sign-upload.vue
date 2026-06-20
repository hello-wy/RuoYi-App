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

      <ImageUploader
        v-model="imageUrl"
        :uploading="uploading"
        trigger-text="上传签到图片"
        @upload="handleUpload"
      />

      <view class="action-row">
        <button class="primary-btn" @click="submitImage" :loading="submitting" :disabled="submitting || !imageUrl">提交审核</button>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMyJobSchedules, submitJobAttendanceImage, uploadJobAttendanceImage } from '@/pages/jobs/_api/wxmini/jobs'
import {
  buildUploadedCertificateUrl,
  buildUploadedPreviewUrl,
} from '@/pages/jobs/_utils/imageUpload'
import { buildAttendanceAuditStatus, getAttendanceRejectReason } from './schedules.helpers'
import ImageUploader from '@/pages/jobs/_components/ImageUploader/ImageUploader.vue'
import config from '@/config'

const { proxy } = getCurrentInstance()

const orderNo = ref('')
const jobId = ref('')
const pageTitle = ref('')
const workDate = ref('')
const scheduleItem = ref({})
const imageUrl = ref('')
const uploading = ref(false)
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
      const fullUrl = buildUploadedPreviewUrl(config.baseUrl, { fileName: matched.signImageUrl })
      imageUrl.value = fullUrl
    }
  } catch (error) {
    uni.showToast({ title: '加载签到信息失败', icon: 'none' })
  }
}

async function handleUpload(file) {
  uploading.value = true
  try {
    const uploadRes = await uploadJobAttendanceImage(file.tempFilePath || file.path)
    const signImageUrl = buildUploadedCertificateUrl(uploadRes)
    if (!signImageUrl) {
      throw new Error('上传成功，但服务端没有返回图片地址，请稍后重试')
    }
    imageUrl.value = signImageUrl.startsWith('https') ? signImageUrl : config.baseUrl + signImageUrl
    uni.showToast({ title: '上传成功', icon: 'success' })
  } catch (error) {
    uni.showModal({
      title: '上传失败',
      content: error?.message || error || '上传失败，请重试',
      showCancel: false
    })
  } finally {
    uploading.value = false
  }
}

async function submitImage() {
  if (!orderNo.value) {
    proxy.$modal.showToast('订单不能为空')
    return
  }
  if (!imageUrl.value) {
    proxy.$modal.showToast('请先上传签到图片')
    return
  }
  submitting.value = true
  try {
    const signImageUrl = imageUrl.value.replace(config.baseUrl, '')
    await submitJobAttendanceImage(orderNo.value, signImageUrl)
    proxy.$modal.showToast('提交成功')
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

.action-row {
  display: flex;
  gap: 20rpx;
  margin-top: 28rpx;
}

.primary-btn {
  flex: 1;
  border-radius: 15rpx;
  font-size: 28rpx;
  color: #fff;
  background: #0f172a;
}
</style>
