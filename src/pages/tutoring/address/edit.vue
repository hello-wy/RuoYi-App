<template>
  <view class="edit-page">
    <view class="page-header">
      <text class="page-eyebrow">SERVICE ADDRESS</text>
      <view class="page-title">{{ form.id ? '编辑服务地址' : '新增服务地址' }}</view>
      <view class="page-desc">填写常用服务地址，发布请家教时可直接选择，并支持默认地址。</view>
    </view>

    <view class="edit-card">
      <view class="section-head">
        <view class="section-title">地址信息</view>
        <view class="section-desc">建议填写常用联系信息，便于后续快速下单。</view>
      </view>

      <view class="form-item">
        <text class="form-label">联系人</text>
        <input v-model="form.contactName" class="field-input" placeholder="请输入联系人姓名" />
      </view>

      <view class="form-item">
        <text class="form-label">联系电话</text>
        <input v-model="form.contactPhone" class="field-input" type="number" maxlength="11" placeholder="请输入联系电话" />
      </view>

      <AddressSearch
        v-model="form.locationInput"
        v-model:location="form.location"
        v-model:geo="form.geo"
        placeholder="搜索小区 / 街道 / 标志性建筑"
      />

      <view class="form-item">
        <text class="form-label">详细地址</text>
        <input v-model="form.addressDetail" class="field-input" placeholder="如：万达广场 3 栋" />
      </view>

      <view class="form-item">
        <text class="form-label">门牌号</text>
        <input v-model="form.doorplate" class="field-input" placeholder="如：2 单元 1201" />
      </view>

      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea v-model="form.remark" class="field-textarea" maxlength="200" placeholder="可填写补充说明，如停车不便、需要提前联系等..."></textarea>
      </view>

      <view class="default-row" @click="toggleDefault">
        <view>
          <text class="default-title">设为默认地址</text>
          <text class="default-desc">下次发布需求时优先带出</text>
        </view>
        <switch :checked="Number(form.isDefault) === 1" color="#5b4fd8" @change="onDefaultChange" />
      </view>
    </view>

    <view class="submit-bar">
      <button class="submit-btn" :disabled="submitting" @click="handleSubmit">{{ submitting ? '保存中...' : '保存地址' }}</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AddressSearch from '@/components/AddressSearch/AddressSearch.vue'
import { addServiceAddress, listServiceAddresses, updateServiceAddress } from '@/api/wxmini/tutoring'

const form = ref({
  id: '',
  contactName: '',
  contactPhone: '',
  locationInput: '',
  location: '',
  geo: '',
  addressDetail: '',
  doorplate: '',
  remark: '',
  isDefault: 0
})
const submitting = ref(false)

function onDefaultChange(e) {
  form.value.isDefault = e.detail.value ? 1 : 0
}

function toggleDefault() {
  form.value.isDefault = Number(form.value.isDefault) === 1 ? 0 : 1
}

async function loadDetail(id) {
  const res = await listServiceAddresses()
  const list = Array.isArray(res?.data) ? res.data : []
  const current = list.find(item => String(item.id) === String(id))
  if (!current) {
    uni.showToast({ title: '地址不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1000)
    return
  }
  form.value = {
    id: current.id,
    contactName: current.contactName || '',
    contactPhone: current.contactPhone || '',
    locationInput: current.location || '',
    location: current.location || '',
    geo: current.geo || '',
    addressDetail: current.addressDetail || '',
    doorplate: current.doorplate || '',
    remark: current.remark || '',
    isDefault: Number(current.isDefault || 0)
  }
}

function buildPayload() {
  return {
    contactName: String(form.value.contactName || '').trim(),
    contactPhone: String(form.value.contactPhone || '').trim(),
    region: '',
    location: String(form.value.location || '').trim(),
    geo: String(form.value.geo || '').trim(),
    addressDetail: String(form.value.addressDetail || '').trim(),
    doorplate: String(form.value.doorplate || '').trim(),
    remark: String(form.value.remark || '').trim(),
    isDefault: Number(form.value.isDefault) === 1 ? 1 : 0
  }
}

function validatePayload(payload) {
  if (!payload.contactName) return '请填写联系人'
  if (!/^1[3-9]\d{9}$/.test(payload.contactPhone)) return '请填写正确的联系电话'
  if (!payload.location) return '请选择详细地址'
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
      await updateServiceAddress(form.value.id, payload)
    } else {
      await addServiceAddress(payload)
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 500)
  } finally {
    submitting.value = false
  }
}

onLoad((options) => {
  if (options?.id) {
    loadDetail(options.id)
  }
})
</script>

<style lang="scss" scoped>
page { background: #f5f7ff; }
.edit-page { min-height: 100vh; padding: 28rpx 24rpx 196rpx; background: linear-gradient(180deg, #f7f1ff 0%, #f5f7ff 36%, #f5f7ff 100%); }
.page-header { margin-bottom: 24rpx; padding: 28rpx 26rpx; border-radius: 28rpx; background: linear-gradient(135deg, rgba(124, 108, 255, 0.14) 0%, rgba(91, 79, 216, 0.08) 100%); }
.page-eyebrow { display: inline-block; margin-bottom: 10rpx; font-size: 20rpx; font-weight: 700; letter-spacing: 2rpx; color: #7c6cff; }
.page-title { font-size: 40rpx; font-weight: 700; color: #241f3f; }
.page-desc { margin-top: 12rpx; font-size: 25rpx; line-height: 1.7; color: #6f6a86; }
.edit-card { padding: 34rpx 26rpx; border-radius: 28rpx; background: #ffffff; box-shadow: 0 18rpx 40rpx rgba(112, 87, 193, 0.08); }
.section-head { margin-bottom: 28rpx; }
.section-title { font-size: 32rpx; font-weight: 700; color: #241f3f; }
.section-desc { margin-top: 8rpx; font-size: 24rpx; line-height: 1.6; color: #8b87a3; }
.form-item { margin-bottom: 24rpx; }
.form-label { display: block; margin-bottom: 12rpx; font-size: 28rpx; color: #6f6a86; }
.field-input,
.field-textarea { width: 100%; border: 1px solid #ebe7f7; border-radius: 20rpx; background: #faf9ff; font-size: 30rpx; color: #241f3f; box-sizing: border-box; }
.field-input { height: 92rpx; padding: 0 24rpx; }
.field-textarea { min-height: 180rpx; padding: 24rpx; line-height: 1.7; }
.default-row { display: flex; align-items: center; justify-content: space-between; padding: 24rpx; border-radius: 20rpx; background: #faf9ff; border: 1px solid #ebe7f7; }
.default-title { display: block; font-size: 30rpx; color: #241f3f; font-weight: 600; }
.default-desc { display: block; margin-top: 8rpx; font-size: 24rpx; color: #8b87a3; }
.submit-bar { position: fixed; left: 0; right: 0; bottom: 0; padding: 20rpx 24rpx 36rpx; background: linear-gradient(180deg, rgba(245, 247, 255, 0) 0%, #f5f7ff 28%, #f5f7ff 100%); }
.submit-btn { height: 88rpx; line-height: 88rpx; border: none; border-radius: 999rpx; font-size: 30rpx; font-weight: 600; color: #ffffff; background: linear-gradient(135deg, #7c6cff 0%, #5b4fd8 100%); box-shadow: 0 16rpx 30rpx rgba(91, 79, 216, 0.22); }
.submit-btn[disabled] { opacity: 0.7; }
</style>
