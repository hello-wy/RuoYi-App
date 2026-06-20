<template>
  <view class="image-uploader">
    <view v-if="previewUrl" class="cert-upload-preview" @click="handlePreview">
      <image :src="previewUrl" class="cert-upload-image" mode="aspectFill"></image>
      <view class="cert-upload-actions">
        <view class="cert-upload-action" @click.stop="handleChoose">
          <text class="cert-upload-action-text">重新上传</text>
        </view>
        <view v-if="removable" class="cert-upload-action danger" @click.stop="handleRemove">
          <text class="cert-upload-action-text danger">删除</text>
        </view>
        <view v-if="uploading" class="upload-status">
          <text class="upload-status-text">上传中<text class="dots">...</text></text>
        </view>
      </view>
    </view>
    <view v-else class="cert-upload-trigger" @click="handleChoose">
      <uni-icons type="plusempty" size="24" color="#94A3B8"></uni-icons>
      <text class="cert-upload-trigger-text">{{ uploading ? '上传中...' : triggerText }}</text>
      <text class="cert-upload-trigger-hint">仅支持 JPG、JPEG、PNG，大小不超过 3MB</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import {
  appendPreviewCacheBuster,
  chooseWechatAlbumImage,
  getImageValidationError,
  isChooseImageCanceled,
  isChooseImagePermissionDenied,
  requestWechatImagePrivacyAuthorization
} from '@/pages/jobs/_utils/imageUpload'

const props = defineProps({
  /** 当前图片 URL（完整路径） */
  modelValue: {
    type: String,
    default: ''
  },
  /** 上传中状态 */
  uploading: {
    type: Boolean,
    default: false
  },
  /** 触发区文案 */
  triggerText: {
    type: String,
    default: '上传图片'
  },
  /** 是否显示删除按钮 */
  removable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'upload', 'remove'])

const previewUrl = computed(() => appendPreviewCacheBuster(props.modelValue))

async function handleChoose() {
  if (props.uploading) return
  try {
    await requestWechatImagePrivacyAuthorization(typeof wx !== 'undefined' ? wx : undefined)
    const file = await chooseWechatAlbumImage(typeof uni !== 'undefined' ? uni : undefined)
    const error = getImageValidationError(file)
    if (error) {
      uni.showToast({ title: error, icon: 'none' })
      return
    }
    emit('upload', file)
  } catch (error) {
    if (isChooseImageCanceled(error?.errMsg || error?.message || '')) {
      return
    }
    if (isChooseImagePermissionDenied(error)) {
      uni.showToast({ title: '请允许访问相册后重试', icon: 'none' })
      return
    }
    uni.showToast({ title: '选择图片失败，请重试', icon: 'none' })
  }
}

function handlePreview() {
  if (!previewUrl.value) return
  uni.previewImage({
    urls: [previewUrl.value],
    current: previewUrl.value
  })
}

function handleRemove() {
  emit('update:modelValue', '')
  emit('remove')
}
</script>

<style lang="scss" scoped>
.cert-upload-trigger,
.cert-upload-preview {
  width: 100%;
  background: #F8FAFC;
  border: 1px dashed #CBD5E1;
  border-radius: 12px;
  padding: 16px;
  box-sizing: border-box;
}

.cert-upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cert-upload-trigger-text {
  font-size: 14px;
  color: #334155;
}

.cert-upload-trigger-hint {
  font-size: 12px;
  color: #94A3B8;
}

.cert-upload-image {
  width: 100%;
  height: 180px;
  border-radius: 10px;
  background: #E2E8F0;
}

.cert-upload-actions {
  margin-top: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.upload-status {
  display: inline-flex;
  align-items: center;
}

.upload-status-text {
  font-size: 12px;
  color: #3B82F6;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.dots {
  display: inline-block;
  letter-spacing: 2px;
  animation: dots-animation 1.4s infinite;
}

@keyframes dots-animation {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

.cert-upload-action {
  padding: 8px 14px;
  border-radius: 999px;
  background: #DBEAFE;
}

.cert-upload-action.danger {
  background: #FEE2E2;
}

.cert-upload-action-text {
  font-size: 12px;
  color: #1D4ED8;
}

.cert-upload-action-text.danger {
  color: #DC2626;
}
</style>
