<template>
  <view class="config-page">
    <view class="card">
      <view class="title">两级分销返现配置</view>
      <text class="hint">比例使用小数填写，例如 0.1 表示 10%；两级合计不能超过 1。</text>
      <input v-model="form.level1Ratio" class="input" type="digit" placeholder="直接下属（一级）返现比例" />
      <input v-model="form.level2Ratio" class="input" type="digit" placeholder="间接下属（二级）返现比例" />
      <button class="save-btn" :loading="saving" @click="save">保存配置</button>
    </view>
  </view>
</template>

<script setup>
import { getCurrentInstance, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { requireAdminAccess } from '../access'
import { getDistributionCommissionConfig, updateDistributionCommissionConfig } from '../_api/system/courseDistributionCommission'

const { proxy } = getCurrentInstance()
const saving = ref(false)
const form = reactive({ level1Ratio: '', level2Ratio: '' })

async function load() {
  try {
    const config = await getDistributionCommissionConfig()
    form.level1Ratio = config.level1Ratio ?? ''
    form.level2Ratio = config.level2Ratio ?? ''
  } catch (error) {
    proxy.$modal.showToast(error?.msg || '加载配置失败')
  }
}

async function save() {
  const level1Ratio = Number(form.level1Ratio)
  const level2Ratio = Number(form.level2Ratio)
  if (!Number.isFinite(level1Ratio) || !Number.isFinite(level2Ratio) || level1Ratio < 0 || level2Ratio < 0 || level1Ratio + level2Ratio > 1) {
    return proxy.$modal.showToast('请填写 0 到 1 的比例，合计不能超过 1')
  }
  saving.value = true
  try {
    await updateDistributionCommissionConfig({ level1Ratio, level2Ratio })
    proxy.$modal.showToast('配置已保存')
  } catch (error) {
    proxy.$modal.showToast(error?.msg || '保存失败')
  } finally {
    saving.value = false
  }
}

onLoad(() => {
  if (requireAdminAccess(proxy)) load()
})
</script>

<style lang="scss" scoped>
.config-page { min-height: 100vh; padding: 20rpx; box-sizing: border-box; background: #f1f5f9; }
.card { padding: 28rpx; background: #fff; border-radius: 16rpx; }
.title { margin-bottom: 16rpx; font-size: 32rpx; font-weight: 600; color: #0f172a; }
.hint { display: block; margin-bottom: 24rpx; font-size: 24rpx; line-height: 1.6; color: #64748b; }
.input { min-height: 76rpx; margin-bottom: 18rpx; padding: 0 18rpx; box-sizing: border-box; border: 1rpx solid #e2e8f0; border-radius: 10rpx; background: #f8fafc; font-size: 27rpx; }
.save-btn { margin: 12rpx 0 0; color: #fff; background: #0f766e; }
</style>
