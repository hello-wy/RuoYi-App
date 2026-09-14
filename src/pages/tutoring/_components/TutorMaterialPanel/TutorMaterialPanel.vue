<template>
  <view class="material-panel">
    <view class="material-section">
      <view class="material-heading">
        <text class="material-title">身份证</text>
        <text class="material-hint">正反面各一张</text>
      </view>
      <view class="material-grid material-grid--two">
        <view class="material-grid-item">
          <TutorMaterialSlot
            label="身份证正面"
            :material="firstMaterial(types.ID_CARD_FRONT)"
            :editable="editable"
            :uploading="isUploading(types.ID_CARD_FRONT)"
            @choose="chooseMaterial(types.ID_CARD_FRONT)"
            @preview="previewMaterial"
            @remove="removeMaterial"
          />
        </view>
        <view class="material-grid-item">
          <TutorMaterialSlot
            label="身份证反面"
            :material="firstMaterial(types.ID_CARD_BACK)"
            :editable="editable"
            :uploading="isUploading(types.ID_CARD_BACK)"
            @choose="chooseMaterial(types.ID_CARD_BACK)"
            @preview="previewMaterial"
            @remove="removeMaterial"
          />
        </view>
      </view>
    </view>

    <view class="material-section">
      <view class="material-heading">
        <text class="material-title">学生证</text>
        <text class="material-hint">上传个人信息页</text>
      </view>
      <view class="material-grid material-grid--two">
        <view class="material-grid-item">
          <TutorMaterialSlot
            label="学生证"
            :material="firstMaterial(types.STUDENT_CARD)"
            :editable="editable"
            :uploading="isUploading(types.STUDENT_CARD)"
            @choose="chooseMaterial(types.STUDENT_CARD)"
            @preview="previewMaterial"
            @remove="removeMaterial"
          />
        </view>
      </view>
    </view>

    <view class="material-section material-section--last">
      <view class="material-heading">
        <text class="material-title">证书</text>
        <text class="material-hint">支持上传多张</text>
      </view>
      <view class="material-grid material-grid--two">
        <view
          v-for="material in certificateMaterials"
          :key="material.id"
          class="material-grid-item"
        >
          <TutorMaterialSlot
            label="证书"
            :material="material"
            :editable="editable"
            :uploading="false"
            :replaceable="false"
            @preview="previewMaterial"
            @remove="removeMaterial"
          />
        </view>
        <view v-if="editable" class="material-grid-item">
          <TutorMaterialSlot
            label="添加证书"
            :editable="true"
            :uploading="isUploading(types.CERTIFICATE)"
            :replaceable="false"
            @choose="chooseMaterial(types.CERTIFICATE)"
          />
        </view>
      </view>
      <text v-if="!editable && certificateMaterials.length === 0" class="material-empty">未上传证书材料</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import TutorMaterialSlot from './TutorMaterialSlot.vue'
import {
  chooseWechatAlbumImage,
  getImageValidationError,
  isChooseImageCanceled,
  isChooseImagePermissionDenied,
  requestWechatImagePrivacyAuthorization,
} from '@/pages/tutoring/_utils/imageUpload'
import { TUTOR_MATERIAL_TYPES } from '@/pages/tutoring/tutor/material.constants'
import {
  buildTutorMaterialPreviewOptions,
  getTutorMaterialsByType,
} from '@/pages/tutoring/tutor/material.helpers'

const props = defineProps({
  materials: { type: Array, default: () => [] },
  editable: { type: Boolean, default: false },
  uploadingTypes: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['upload', 'remove'])
const types = TUTOR_MATERIAL_TYPES
const certificateMaterials = computed(() => getTutorMaterialsByType(props.materials, types.CERTIFICATE))

function firstMaterial(type) {
  return getTutorMaterialsByType(props.materials, type)[0] || null
}

function isUploading(type) {
  return Boolean(props.uploadingTypes[type])
}

async function chooseMaterial(type) {
  if (!props.editable || isUploading(type)) return
  try {
    await requestWechatImagePrivacyAuthorization(typeof wx !== 'undefined' ? wx : undefined)
    const file = await chooseWechatAlbumImage(typeof uni !== 'undefined' ? uni : undefined)
    const error = getImageValidationError(file)
    if (error) {
      uni.showToast({ title: error, icon: 'none' })
      return
    }
    emit('upload', file, type)
  } catch (error) {
    handleChooseError(error)
  }
}

function handleChooseError(error) {
  if (isChooseImageCanceled(error?.errMsg || error?.message || '')) return
  if (isChooseImagePermissionDenied(error)) {
    uni.showToast({ title: '请允许访问相册后重试', icon: 'none' })
    return
  }
  uni.showToast({ title: '选择图片失败，请重试', icon: 'none' })
}

function previewMaterial(material) {
  const previewOptions = buildTutorMaterialPreviewOptions(props.materials, material)
  uni.previewImage(previewOptions)
}

function removeMaterial(material) {
  emit('remove', material)
}
</script>

<style lang="scss" scoped>
.material-panel {
  padding: 4px 0;
}

.material-section {
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid #E2E8F0;
}

.material-section--last {
  padding-bottom: 0;
  margin-bottom: 0;
  border-bottom: 0;
}

.material-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.material-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
}

.material-hint,
.material-empty {
  font-size: 12px;
  color: #94A3B8;
}

.material-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.material-grid--two > .material-grid-item {
  width: calc(50% - 6px);
}
</style>
