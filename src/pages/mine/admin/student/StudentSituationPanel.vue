<template>
  <view class="situation-card">
    <text class="situation-title">学员情况</text>
    <textarea v-model="draft" class="situation-textarea" maxlength="1000" placeholder="请输入学员学习情况、沟通记录、注意事项等" placeholder-class="situation-placeholder" :disabled="saving" auto-height />
    <view class="situation-footer">
      <text class="situation-count">{{ draft.length }}/1000</text>
      <button class="save-btn" :loading="saving" :disabled="saving" @click="saveSituation">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { updateStudentSituation } from '@/pages/mine/admin/_api/system/student'

defineOptions({ name: 'StudentSituationPanel' })

const props = defineProps({ studentId: { type: [Number, String], required: true }, situation: { type: String, default: '' } })
const emit = defineEmits(['saved'])
const draft = ref(props.situation)
const saving = ref(false)

watch(() => props.situation, (value) => { draft.value = value || '' })

async function saveSituation() {
  if (saving.value) return
  const studentSituation = draft.value.trim()
  saving.value = true
  try {
    const res = await updateStudentSituation(props.studentId, { studentSituation })
    const savedSituation = res.data?.studentSituation ?? studentSituation
    draft.value = savedSituation
    emit('saved', savedSituation)
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.msg || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.situation-card { margin-top: 20rpx; padding: 34rpx 30rpx; border-radius: 28rpx; background: #fff; box-shadow: 0 12rpx 36rpx rgba(15, 23, 42, .06); }
.situation-title { display: block; font-size: 34rpx; font-weight: 700; color: #201c34; }
.situation-textarea { width: 100%; min-height: 220rpx; margin-top: 24rpx; box-sizing: border-box; padding: 24rpx; border-radius: 20rpx; background: #f8fafc; font-size: 30rpx; line-height: 1.6; color: #201c34; }
.situation-placeholder { color: #b2aec4; }
.situation-footer { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; margin-top: 22rpx; }
.situation-count { font-size: 24rpx; color: #94a3b8; }
.save-btn { min-width: 168rpx; height: 72rpx; margin: 0; border-radius: 999rpx; background: linear-gradient(135deg, #7c6cff 0%, #5b4fd8 100%); font-size: 28rpx; font-weight: 600; line-height: 72rpx; color: #fff; }
.save-btn[disabled] { opacity: .7; }
</style>
