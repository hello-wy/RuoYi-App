<template>
  <view class="edit-page">
    <view class="edit-card">
      <view class="edit-title">{{ form.id ? '编辑萌娃' : '新增萌娃' }}</view>
      <uni-forms ref="formRef" :model="form" :rules="rules" label-position="top">
        <uni-forms-item label="真实姓名" name="realName">
          <uni-easyinput v-model="form.realName" placeholder="请输入真实姓名" />
        </uni-forms-item>
        <uni-forms-item label="小名" name="nickName">
          <uni-easyinput v-model="form.nickName" placeholder="请输入小名" />
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
          <uni-data-checkbox v-model="form.gender" :localdata="genderOptions" />
        </uni-forms-item>
        <uni-forms-item label="就读学校" name="schoolName">
          <uni-easyinput v-model="form.schoolName" placeholder="请输入就读学校" />
        </uni-forms-item>
        <uni-forms-item label="就读年级" name="grade">
          <uni-easyinput v-model="form.grade" placeholder="请输入就读年级" />
        </uni-forms-item>
        <uni-forms-item label="特殊说明" name="specialNote">
          <uni-easyinput type="textarea" v-model="form.specialNote" placeholder="请输入特殊说明" :inputBorder="false" />
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
import { addBaby, getBaby, updateBaby } from '@/api/wxmini/baby'

const { proxy } = getCurrentInstance()
const formRef = ref(null)
const submitting = ref(false)
const form = ref({
  id: '',
  realName: '',
  nickName: '',
  birthDate: '',
  gender: '',
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

function onBirthDateChange(e) {
  form.value.birthDate = e.detail.value
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

function handleSubmit() {
  formRef.value.validate().then(async () => {
    if (submitting.value) return
    submitting.value = true
    try {
      if (form.value.id) {
        await updateBaby(buildPayload())
      } else {
        await addBaby(buildPayload())
      }
      proxy.$modal.msgSuccess('保存成功')
      setTimeout(() => {
        uni.navigateBack()
      }, 300)
    } finally {
      submitting.value = false
    }
  })
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
.edit-page { min-height: 100vh; padding: 24rpx 24rpx 180rpx; background: linear-gradient(180deg, #f7f1ff 0%, #f5f7ff 36%, #f5f7ff 100%); }
.edit-card { padding: 28rpx 24rpx; border-radius: 28rpx; background: #ffffff; box-shadow: 0 18rpx 40rpx rgba(112, 87, 193, 0.08); }
.edit-title { margin-bottom: 24rpx; font-size: 34rpx; font-weight: 700; color: #241f3f; }
.picker-full-box { height: 84rpx; background: #faf9ff; border: 1px solid #ebe7f7; border-radius: 20rpx; padding: 0 24rpx; display: flex; align-items: center; justify-content: space-between; }
.picker-text { font-size: 30rpx; color: #241f3f; }
.picker-text.placeholder { color: #a0aec0; }
:deep(.uni-forms-item) { margin-bottom: 18rpx; }
:deep(.uni-forms-item__label) { font-size: 28rpx; color: #6f6a86; }
:deep(.uni-easyinput__content) { border-radius: 20rpx; border-color: #ebe7f7 !important; background: #faf9ff !important; }
:deep(.uni-easyinput__content-input) { min-height: 84rpx; font-size: 30rpx; }
:deep(.uni-easyinput__content-textarea) { min-height: 180rpx; }
.submit-bar { position: fixed; left: 0; right: 0; bottom: 0; padding: 20rpx 24rpx 36rpx; background: linear-gradient(180deg, rgba(245, 247, 255, 0) 0%, #f5f7ff 28%, #f5f7ff 100%); }
.submit-btn { height: 88rpx; line-height: 88rpx; border: none; border-radius: 999rpx; font-size: 30rpx; font-weight: 600; color: #ffffff; background: linear-gradient(135deg, #7c6cff 0%, #5b4fd8 100%); box-shadow: 0 16rpx 30rpx rgba(91, 79, 216, 0.22); }
.submit-btn[disabled] { opacity: 0.7; }
</style>
