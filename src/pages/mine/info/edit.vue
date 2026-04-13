<template>
  <view class="edit-page">
    <view class="edit-card">
      <view class="edit-title">编辑资料</view>
      <uni-forms ref="formRef" :model="form" :rules="rules" label-position="top">
        <uni-forms-item label="姓名" name="realName">
          <uni-easyinput v-model="form.realName" placeholder="请输入姓名" />
        </uni-forms-item>
        <uni-forms-item label="昵称" name="nickName">
          <uni-easyinput v-model="form.nickName" placeholder="请输入昵称" />
        </uni-forms-item>
        <uni-forms-item label="性别" name="gender">
          <uni-data-checkbox v-model="form.gender" :localdata="genderOptions" />
        </uni-forms-item>
        <uni-forms-item label="手机号码" name="phone">
          <uni-easyinput v-model="form.phone" placeholder="请输入手机号码" disabled/>
        </uni-forms-item>
        <uni-forms-item label="公司名称" name="companyName">
          <uni-easyinput v-model="form.companyName" placeholder="请输入公司名称" />
        </uni-forms-item>
        <uni-forms-item label="公司地址" name="companyAddress">
          <uni-easyinput v-model="form.companyAddress" placeholder="请输入公司地址" />
        </uni-forms-item>
        <uni-forms-item label="公司职务" name="companyPosition">
          <uni-easyinput v-model="form.companyPosition" placeholder="请输入公司职务" />
        </uni-forms-item>
        <uni-forms-item label="所属行业" name="industry">
          <uni-easyinput v-model="form.industry" placeholder="请输入所属行业" />
        </uni-forms-item>
        <uni-forms-item label="工作年限" name="workYears">
          <uni-easyinput v-model="form.workYears" placeholder="如：5年" />
        </uni-forms-item>
        <uni-forms-item label="个人简介" name="personalIntro">
          <uni-easyinput type="textarea" v-model="form.personalIntro" placeholder="请输入个人简介" :inputBorder="false" />
        </uni-forms-item>
      </uni-forms>
    </view>

    <view class="submit-bar">
      <button class="submit-btn" @click="handleSubmit">保存资料</button>
    </view>
  </view>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { useUserStore } from '@/store'
import { getWxUserProfileDetail, updateWxUserProfile } from '@/api/wxmini/profile'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const formRef = ref(null)
const form = ref({
  userName: '',
  phone: '',
  realName: '',
  nickName: '',
  gender: '',
  companyName: '',
  companyAddress: '',
  companyPosition: '',
  industry: '',
  workYears: '',
  personalIntro: ''
})

const genderOptions = [
  { text: '男', value: 0 },
  { text: '女', value: 1 },
  { text: '未知', value: 2 }
]

const rules = {
  phone: {
    rules: [
      {
        pattern: /^$|^1[3-9]\d{9}$/,
        errorMessage: '请输入正确的手机号码'
      }
    ]
  },
  realName: {
    rules: [
      {
        maxLength: 64,
        errorMessage: '姓名长度不能超过64个字符'
      }
    ]
  },
  nickName: {
    rules: [
      {
        maxLength: 64,
        errorMessage: '昵称长度不能超过64个字符'
      }
    ]
  }
}

function loadProfile() {
  getWxUserProfileDetail().then(res => {
    const data = res.data || {}
    form.value = {
      userName: data.userName || '',
      phone: data.phone || '',
      realName: data.realName || '',
      nickName: data.nickName || '',
      gender: data.gender !== null && data.gender !== undefined ? data.gender : '',
      companyName: data.companyName || '',
      companyAddress: data.companyAddress || '',
      companyPosition: data.companyPosition || '',
      industry: data.industry || '',
      workYears: data.workYears || '',
      personalIntro: data.personalIntro || ''
    }
  })
}

function resolveDisplayName() {
  return form.value.realName || form.value.nickName || form.value.userName || ''
}

function handleSubmit() {
  formRef.value.validate().then(() => {
    updateWxUserProfile(form.value).then(() => {
      userStore.SET_NAME(resolveDisplayName())
      userStore.SET_PHONE(form.value.phone || '')
      proxy.$modal.msgSuccess('保存成功')
      setTimeout(() => {
        uni.navigateBack()
      }, 300)
    })
  })
}

onLoad(() => {
  loadProfile()
})

onReady(() => {
  if (formRef.value) {
    formRef.value.setRules(rules)
  }
})
</script>

<style lang="scss" scoped>
page {
  background: #f5f7ff;
}

.edit-page {
  min-height: 100vh;
  padding: 24rpx 24rpx 180rpx;
  background: linear-gradient(180deg, #f7f1ff 0%, #f5f7ff 36%, #f5f7ff 100%);
}

.edit-card {
  padding: 28rpx 24rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 18rpx 40rpx rgba(112, 87, 193, 0.08);
}

.edit-title {
  margin-bottom: 24rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #241f3f;
}

:deep(.uni-forms-item) {
  margin-bottom: 18rpx;
}

:deep(.uni-forms-item__label) {
  font-size: 28rpx;
  color: #6f6a86;
}

:deep(.uni-easyinput__content) {
  border-radius: 20rpx;
  border-color: #ebe7f7 !important;
  background: #faf9ff !important;
}

:deep(.uni-easyinput__content-input) {
  min-height: 84rpx;
  font-size: 30rpx;
}

:deep(.uni-easyinput__content-textarea) {
  min-height: 180rpx;
}

.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx 36rpx;
  background: linear-gradient(180deg, rgba(245, 247, 255, 0) 0%, #f5f7ff 28%, #f5f7ff 100%);
}

.submit-btn {
  height: 88rpx;
  line-height: 88rpx;
  border: none;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #7c6cff 0%, #5b4fd8 100%);
  box-shadow: 0 16rpx 30rpx rgba(91, 79, 216, 0.22);
}
</style>
