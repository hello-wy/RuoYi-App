<template>
  <view class="edit-page">
    <view class="page-header">
      <text class="page-eyebrow">BABY PROFILE</text>
      <view class="page-title">{{ form.id ? '编辑萌娃' : '新增萌娃' }}</view>
      <view class="page-desc">完善萌娃档案信息，方便后续关联家教需求与成长服务。</view>
    </view>

    <view class="edit-card">
      <view class="section-head">
        <view class="section-title">基础信息</view>
        <view class="section-desc">请填写真实、常用的萌娃资料。</view>
      </view>

      <uni-forms ref="formRef" :model="form" :rules="rules" label-position="top">
        <uni-forms-item label="真实姓名" name="realName">
          <view class="field-box">
            <input v-model="form.realName" class="field-input" placeholder="请输入真实姓名" placeholder-class="field-placeholder" />
          </view>
        </uni-forms-item>
        <uni-forms-item label="小名" name="nickName">
          <view class="field-box">
            <input v-model="form.nickName" class="field-input" placeholder="请输入小名" placeholder-class="field-placeholder" />
          </view>
        </uni-forms-item>
        <uni-forms-item label="出生日期" name="birthDate">
          <picker mode="date" :value="form.birthDate" @change="onBirthDateChange">
            <view class="picker-full-box">
              <text class="picker-text" :class="{ placeholder: !form.birthDate }">{{ form.birthDate || '请选择出生日期' }}</text>
              <uni-icons type="calendar" size="14" color="#a0aec0"></uni-icons>
            </view>
          </picker>
        </uni-forms-item>
        <uni-forms-item label="性别" name="gender">
          <view class="gender-group">
            <view
              v-for="option in genderOptions"
              :key="option.value"
              class="gender-option"
              :class="{ active: Number(form.gender) === option.value }"
              @click="onGenderChange(option.value)"
            >
              {{ option.text }}
            </view>
          </view>
        </uni-forms-item>
        <uni-forms-item label="就读学校" name="schoolName">
          <view class="field-box">
            <input v-model="form.schoolName" class="field-input" placeholder="请输入就读学校" placeholder-class="field-placeholder" />
          </view>
        </uni-forms-item>
        <uni-forms-item label="就读年级" name="grade">
          <view class="field-box">
            <input v-model="form.grade" class="field-input" placeholder="请输入就读年级" placeholder-class="field-placeholder" />
          </view>
        </uni-forms-item>
        <uni-forms-item label="特殊说明" name="specialNote">
          <view class="field-box field-box--textarea">
            <textarea v-model="form.specialNote" class="field-textarea" placeholder="请输入特殊说明" placeholder-class="field-placeholder" />
          </view>
        </uni-forms-item>
      </uni-forms>
    </view>

    <view class="submit-bar">
      <button class="submit-btn" :disabled="submitting" @click="handleSubmit">{{ submitting ? '保存中...' : '保存萌娃' }}</button>
    </view>
  </view>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { addBaby, getBaby, updateBaby } from '@/pages/mine/baby/_api/wxmini/baby'

const { proxy } = getCurrentInstance()
const formRef = ref(null)
const submitting = ref(false)
const form = ref({
  id: '',
  realName: '',
  nickName: '',
  birthDate: '',
  gender: 0,
  schoolName: '',
  grade: '',
  specialNote: ''
})

const genderOptions = [
  { text: '男', value: 0 },
  { text: '女', value: 1 },
  { text: '未知', value: 2 }
]

const rules = {
  realName: { rules: [{ required: true, errorMessage: '请输入真实姓名' }] },
  birthDate: { rules: [{ required: true, errorMessage: '请选择出生日期' }] },
  gender: { rules: [{ required: true, errorMessage: '请选择性别' }] },
  schoolName: { rules: [{ required: true, errorMessage: '请输入就读学校' }] },
  grade: { rules: [{ required: true, errorMessage: '请输入就读年级' }] }
}

function clearFieldValidate(field) {
  if (formRef.value?.clearValidate) {
    formRef.value.clearValidate([field])
  }
}

function onBirthDateChange(e) {
  form.value.birthDate = e.detail.value
  clearFieldValidate('birthDate')
}

function onGenderChange(value) {
  form.value.gender = value
  clearFieldValidate('gender')
}

function loadDetail(id) {
  getBaby(id).then(res => {
    const data = res.data || {}
    form.value = {
      id: data.id || '',
      realName: data.realName || '',
      nickName: data.nickName || '',
      birthDate: data.birthDate || '',
      gender: data.gender !== null && data.gender !== undefined ? Number(data.gender) : '',
      schoolName: data.schoolName || '',
      grade: data.grade || '',
      specialNote: data.specialNote || ''
    }
  })
}

function buildPayload() {
  return {
    ...(form.value.id ? { id: form.value.id } : {}),
    realName: (form.value.realName || '').trim(),
    nickName: (form.value.nickName || '').trim(),
    birthDate: form.value.birthDate,
    gender: form.value.gender,
    schoolName: (form.value.schoolName || '').trim(),
    grade: (form.value.grade || '').trim(),
    specialNote: (form.value.specialNote || '').trim()
  }
}

function validatePayload(payload) {
  if (!payload.realName) {
    return '请输入真实姓名'
  }
  if (!payload.birthDate) {
    return '请选择出生日期'
  }
  if (payload.gender === '' || payload.gender === null || payload.gender === undefined) {
    return '请选择性别'
  }
  if (!payload.schoolName) {
    return '请输入就读学校'
  }
  if (!payload.grade) {
    return '请输入就读年级'
  }
  return ''
}

async function handleSubmit() {
  if (submitting.value) return

  const payload = buildPayload()
  const errorMessage = validatePayload(payload)
  if (errorMessage) {
    uni.showToast({ title: errorMessage, icon: 'none' })
    return
  }

  submitting.value = true
  try {
    if (form.value.id) {
      await updateBaby(payload)
    } else {
      await addBaby(payload)
    }
    proxy.$modal.msgSuccess('保存成功')
    setTimeout(() => {
      uni.navigateBack()
    }, 300)
  } finally {
    submitting.value = false
  }
}

onLoad((options) => {
  if (options?.id) {
    loadDetail(options.id)
  }
})

onReady(() => {
  if (formRef.value) {
    formRef.value.setRules(rules)
  }
})
</script>

<style lang="scss" scoped>
page { background: #f5f7ff; }
.edit-page { min-height: 100vh; padding: 28rpx 24rpx 196rpx; background: linear-gradient(180deg, #f7f1ff 0%, #f5f7ff 36%, #f5f7ff 100%); }
.page-header {
  margin-bottom: 24rpx;
  padding: 28rpx 26rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, rgba(124, 108, 255, 0.14) 0%, rgba(91, 79, 216, 0.08) 100%);
}
.page-eyebrow {
  display: inline-block;
  margin-bottom: 10rpx;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: #7c6cff;
}
.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #241f3f;
}
.page-desc {
  margin-top: 12rpx;
  font-size: 25rpx;
  line-height: 1.7;
  color: #6f6a86;
}
.edit-card { padding: 34rpx 26rpx; border-radius: 28rpx; background: #ffffff; box-shadow: 0 18rpx 40rpx rgba(112, 87, 193, 0.08); }
.section-head {
  margin-bottom: 28rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #241f3f;
}
.section-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #8b87a3;
}
.picker-full-box { margin-top: 20rpx; min-height: 92rpx; background: #faf9ff; border: 1px solid #ebe7f7; border-radius: 20rpx; padding: 0 24rpx; display: flex; align-items: center; justify-content: space-between; }
.picker-text { font-size: 30rpx; color: #241f3f; }
.picker-text.placeholder { color: #a0aec0; }
.field-box {
  min-height: 92rpx;
  padding: 0 24rpx;
  border: 1px solid #ebe7f7;
  border-radius: 20rpx;
  background: #faf9ff;
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}
.field-box--textarea {
  min-height: 212rpx;
  align-items: flex-start;
  padding-top: 24rpx;
  padding-bottom: 24rpx;
}
.field-input,
.field-textarea {
  width: 100%;
  font-size: 30rpx;
  color: #241f3f;
  background: transparent;
}
.field-input {
  height: 92rpx;
  line-height: 92rpx;
}
.field-textarea {
  min-height: 160rpx;
  line-height: 1.7;
}
.field-placeholder {
  color: #a0aec0;
}
.gender-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.gender-option {
  min-width: 132rpx;
  height: 76rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  border: 1px solid #d9d8ea;
  background: #faf9ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #5f5a75;
  margin-top: 20rpx;
}
.gender-option.active {
  border-color: #5b4fd8;
  background: rgba(91, 79, 216, 0.08);
  color: #5b4fd8;
  font-weight: 600;
}
:deep(.uni-forms-item) { margin-bottom: 30rpx; }
:deep(.uni-forms-item:last-child) { margin-bottom: 0; }
:deep(.uni-forms-item__label) { margin-bottom: 12rpx; font-size: 28rpx; color: #6f6a86; }
:deep(.uni-forms-item__error) { margin-top: 12rpx; }
.submit-bar { position: fixed; left: 0; right: 0; bottom: 0; padding: 20rpx 24rpx 36rpx; background: linear-gradient(180deg, rgba(245, 247, 255, 0) 0%, #f5f7ff 28%, #f5f7ff 100%); }
.submit-btn { height: 88rpx; line-height: 88rpx; border: none; border-radius: 999rpx; font-size: 30rpx; font-weight: 600; color: #ffffff; background: linear-gradient(135deg, #7c6cff 0%, #5b4fd8 100%); box-shadow: 0 16rpx 30rpx rgba(91, 79, 216, 0.22); }
.submit-btn[disabled] { opacity: 0.7; }
</style>
