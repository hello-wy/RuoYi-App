<template>
  <view class="material-slot">
    <view
      class="material-thumb"
      :class="{ 'material-thumb--empty': !material }"
      @click="handleThumbClick"
    >
      <image v-if="material" class="material-image" :src="materialImageUrl" mode="aspectFit" />
      <template v-else>
        <uni-icons v-if="editable && !uploading" type="plusempty" size="24" color="#64748B" />
        <text class="material-empty-label">{{ emptyText }}</text>
      </template>
    </view>
    <view class="material-slot-footer">
      <text class="material-slot-label">{{ label }}</text>
      <view v-if="editable && material" class="material-actions">
        <text v-if="replaceable" class="material-action" @click.stop="$emit('choose')">更换</text>
        <text class="material-action material-action--danger" @click.stop="$emit('remove', material)">删除</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { buildTutorMaterialImageUrl } from '@/pages/tutoring/tutor/material.helpers'
const props = defineProps({
  label: { type: String, required: true },
  material: { type: Object, default: null },
  editable: { type: Boolean, default: false },
  uploading: { type: Boolean, default: false },
  replaceable: { type: Boolean, default: true },
})

const emit = defineEmits(['choose', 'preview', 'remove'])

const materialImageUrl = computed(() => buildTutorMaterialImageUrl(props.material))

const emptyText = computed(() => {
  if (props.uploading) return '上传中'
  return props.editable ? props.label : '未上传'
})

function handleThumbClick() {
  if (props.uploading) return
  if (props.material) {
    emit('preview', props.material)
    return
  }
  if (props.editable) emit('choose')
}
</script>

<style lang="scss" scoped>
.material-thumb {
  position: relative;
  width: 100%;
  height: 104px;
  overflow: hidden;
  border-radius: 10px;
  background: #E2E8F0;
}

.material-thumb--empty {
  box-sizing: border-box;
  border: 1px dashed #CBD5E1;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.material-image {
  width: 100%;
  height: 100%;
}

.material-empty-label,
.material-slot-label,
.material-action {
  font-size: 12px;
  color: #64748B;
}

.material-slot-footer {
  min-height: 28px;
  padding-top: 7px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.material-actions {
  display: flex;
  gap: 8px;
}

.material-action {
  color: #2563EB;
}

.material-action--danger {
  color: #DC2626;
}
</style>
