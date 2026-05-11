<template>
  <scroll-view class="whitelist-page" scroll-y>
    <view class="whitelist-header">
      <view class="header-title">兼职白名单</view>
      <view class="header-subtitle">录入通过审核后可报名所有兼职的用户</view>
    </view>

    <view class="form-card">
      <view class="toolbar-row">
        <button class="list-btn" plain @click="openListPage">查看白名单</button>
      </view>
      <view class="form-item">
        <text class="label">真实姓名</text>
        <input v-model="form.realName" class="input" placeholder="请输入真实姓名" />
      </view>
      <view class="form-item">
        <text class="label">身份证号</text>
        <input v-model="form.idCard" class="input" placeholder="请输入18位身份证号" maxlength="18" />
      </view>
      <view class="form-item">
        <text class="label">价格</text>
        <input v-model="form.price" class="input" type="digit" placeholder="请输入展示价格" />
      </view>
      <view class="form-item">
        <text class="label">备注</text>
        <textarea v-model="form.remark" class="textarea" placeholder="选填" maxlength="100" />
      </view>
      <button class="submit-btn" :loading="submitting" @click="handleSubmit">新增白名单</button>
    </view>
  </scroll-view>
</template>

<script setup>
import { reactive, ref, getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { addParttimeWhitelist } from '@/api/system/parttimeWhitelist'
import { requireAdminAccess } from '../access'
import { buildParttimeWhitelistPayload, validateParttimeWhitelistForm } from '../parttime-whitelist.helpers'

const { proxy } = getCurrentInstance()
const submitting = ref(false)
const form = reactive({
  realName: '',
  idCard: '',
  price: '',
  remark: '',
})

onLoad(() => {
  requireAdminAccess(proxy)
})

function resetForm() {
  form.realName = ''
  form.idCard = ''
  form.price = ''
  form.remark = ''
}

function openListPage() {
  proxy.$tab.navigateTo('/pages/mine/admin/parttime-whitelist/list')
}

async function handleSubmit() {
  const validation = validateParttimeWhitelistForm(form)
  if (!validation.valid) {
    proxy.$modal.showToast(validation.message)
    return
  }
  submitting.value = true
  try {
    await addParttimeWhitelist(buildParttimeWhitelistPayload(form))
    proxy.$modal.showToast('新增成功')
    resetForm()
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
