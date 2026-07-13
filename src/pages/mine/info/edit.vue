<template>
  <view class="edit-page">
    <view class="edit-card">
      <view class="edit-title">编辑资料</view>

      <view class="form-item">
        <text class="form-label">姓名</text>
        <input
          v-model="form.realName"
          class="field-input"
          :class="{ 'is-disabled': isRealnameVerified }"
          :disabled="isRealnameVerified"
          placeholder="请输入姓名"
        />
        <view v-if="!isRealnameVerified" class="verify-link-row">
          <text class="verify-link" @click="handleVerifyClick">去实名</text>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input v-model="form.nickName" class="field-input" placeholder="请输入昵称" />
      </view>
      <view class="form-item">
        <text class="form-label">性别</text>
        <view class="gender-group">
          <view
            v-for="option in genderOptions"
            :key="option.value"
            class="gender-option"
            :class="{ active: Number(form.gender) === option.value }"
            @click="form.gender = option.value"
          >
            {{ option.text }}
          </view>
        </view>
      </view>
      <view v-if="isAunt" class="form-item">
        <text class="form-label">年龄</text>
        <input v-model="form.age" class="field-input" placeholder="请输入年龄" type="number" />
      </view>
      <view class="form-item">
        <text class="form-label">生日</text>
        <view class="birthday-field">
          <picker mode="date" :value="form.birthday" @change="handleBirthdayChange">
            <view class="picker-value" :class="{ 'is-placeholder': !form.birthday }">
              {{ form.birthday || '请选择生日' }}
            </view>
          </picker>
          <text v-if="form.birthday" class="clear-birthday" @click="clearBirthday">清空</text>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">手机号码</text>
        <input v-model="form.phone" class="field-input is-disabled" disabled placeholder="请输入手机号码" />
      </view>
      <view class="form-item">
        <text class="form-label">用户类型</text>
        <input :value="userTypeText" class="field-input is-disabled" disabled />
      </view>

      <template v-if="isMerchant">
        <view class="form-item">
          <text class="form-label">公司名称</text>
          <input v-model="form.companyName" class="field-input" placeholder="请输入公司名称" />
        </view>
        <view class="form-item">
          <text class="form-label">公司地址</text>
          <input v-model="form.companyAddress" class="field-input" placeholder="请输入公司地址" />
        </view>
        <view class="form-item">
          <text class="form-label">公司职务</text>
          <input v-model="form.companyPosition" class="field-input" placeholder="请输入公司职务" />
        </view>
        <view class="form-item">
          <text class="form-label">所属行业</text>
          <input v-model="form.industry" class="field-input" placeholder="请输入所属行业" />
        </view>
        <view class="form-item">
          <text class="form-label">工作年限</text>
          <input v-model="form.workYears" class="field-input" placeholder="如：5年" />
        </view>
      </template>

      <view v-if="isMerchant || isAunt" class="form-item">
        <text class="form-label">个人简介</text>
        <textarea v-model="form.personalIntro" class="field-textarea" :placeholder="introPlaceholder"></textarea>
      </view>
      <template v-if="isAunt">
        <view class="form-item">
          <text class="form-label">空余时间</text>
          <textarea v-model="form.availableTime" class="field-textarea" placeholder="如：周一到周五晚间，周末全天"></textarea>
        </view>
        <view class="form-item">
          <text class="form-label">工作经历</text>
          <textarea v-model="form.workExperience" class="field-textarea" placeholder="请填写过往兼职或实习经历"></textarea>
        </view>
      </template>
    </view>

    <view class="submit-bar">
      <button class="submit-btn" :disabled="submitting" @click="handleSubmit">{{ submitting ? '保存中...' : '保存资料' }}</button>
    </view>
    <RealVerify
      ref="realVerifyRef"
      v-model:verified="verifyForm.verified"
      v-model:realName="verifyForm.realName"
      v-model:idCard="verifyForm.idCard"
      type="icon"
    />
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store'
import { getWxUserProfileDetail, updateWxUserProfile } from '@/api/wxmini/profile'
import RealVerify from '@/components/RealVerify/RealVerify.vue'
import { isRealnameAuthed, resolveUserDisplayName } from '@/utils/userDisplay'
import {
  buildInfoSubmitPayload,
  createInfoForm,
  getInfoUserTypeText,
  isAuntInfoForm,
  isMerchantInfoForm,
  normalizeInfoForm,
  validateInfoForm
} from './index.helpers'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const form = ref(createInfoForm())
const submitting = ref(false)
const realVerifyRef = ref(null)
const verifyForm = ref({
  verified: false,
  realName: '',
  idCard: ''
})

const isMerchant = computed(() => isMerchantInfoForm(form.value))
const isAunt = computed(() => isAuntInfoForm(form.value))
const userTypeText = computed(() => getInfoUserTypeText(form.value.userType))
const isRealnameVerified = computed(() => isRealnameAuthed(form.value.isRealnameAuth))
const introPlaceholder = computed(() => {
  return isAunt.value ? '请介绍你的兼职经验和优势' : '请输入个人简介'
})

const genderOptions = [
  { text: '男', value: 0 },
  { text: '女', value: 1 },
  { text: '未知', value: 2 }
]

async function loadProfile() {
  const res = await getWxUserProfileDetail()
  form.value = normalizeInfoForm(res.data || {})
  verifyForm.value.verified = isRealnameAuthed(form.value.isRealnameAuth)
  verifyForm.value.realName = form.value.realName || ''
}

async function handleSubmit() {
  if (submitting.value) return
  const errorMessage = validateInfoForm(form.value)
  if (errorMessage) {
    uni.showToast({ title: errorMessage, icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await updateWxUserProfile(buildInfoSubmitPayload(form.value, {
      omitRealName: isRealnameVerified.value
    }))
    userStore.SET_NAME(resolveUserDisplayName({
      realName: isRealnameVerified.value ? form.value.realName : '',
      phone: form.value.phone
    }))
    userStore.SET_PHONE(form.value.phone || '')
    proxy.$modal.msgSuccess('保存成功')
    setTimeout(() => uni.navigateBack(), 300)
  } finally {
    submitting.value = false
  }
}


function handleBirthdayChange(event) {
  form.value.birthday = event.detail.value
}

function clearBirthday() {
  form.value.birthday = ''
}

function handleVerifyClick() {
  realVerifyRef.value?.openPopup()
}

onLoad(() => {
  loadProfile()
})

watch(() => verifyForm.value.verified, value => {
  if (value) loadProfile()
})
</script>

<style lang="scss" scoped src="./edit.scss"></style>
