<template>
  <scroll-view class="detail-page" scroll-y>
    <view v-if="loading" class="state"><uni-load-more status="loading" /></view>
    <template v-else>
      <view class="profile-card">
        <image v-if="detail.avatar" class="avatar" :src="detail.avatar" mode="aspectFill" />
        <view v-else class="avatar fallback">{{ detail.displayName?.slice(0, 1) || '用' }}</view>
        <text class="name">{{ detail.displayName }}</text>
        <text class="type">{{ typeText(detail.userType) }}</text>
      </view>
      <view class="info-card">
        <view v-for="item in fields" :key="item.label" class="info-row">
          <text class="label">{{ item.label }}</text><text class="value">{{ format(item.value) }}</text>
        </view>
      </view>
    </template>
  </scroll-view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMiniUser } from '@/pages/mine/admin/_api/system/miniUser'
import { requireAdminAccess } from '../access'

const { proxy } = getCurrentInstance()
const detail = ref({})
const loading = ref(true)
const fields = computed(() => [
  { label: '用户 ID', value: detail.value.id },
  { label: '昵称', value: detail.value.nickName || detail.value.nickname },
  { label: '真实姓名', value: detail.value.realName },
  { label: '手机号', value: detail.value.phone },
  { label: '性别', value: genderText(detail.value.sex ?? detail.value.gender) },
  { label: '用户身份', value: typeText(detail.value.userType) },
  { label: '是否学员', value: detail.value.isStudent ? '是' : '否' },
  { label: '注册时间', value: detail.value.createTime },
  { label: '最近登录', value: detail.value.loginDate || detail.value.updateTime }
])
function format(value) { return value === undefined || value === null || value === '' ? '--' : value }
function genderText(value) { return ({ 0: '男', 1: '女', 2: '未知', male: '男', female: '女' })[value] || value }
function typeText(value) { return ({ 0: '家长', 1: '学生', 2: '商家' })[value] || '用户' }
onLoad(async (options) => {
  if (!requireAdminAccess(proxy)) return
  if (!options?.id) { uni.showToast({ title: '用户参数缺失', icon: 'none' }); return }
  try { detail.value = await getMiniUser(options.id) }
  catch (error) { uni.showToast({ title: error?.msg || '用户详情加载失败', icon: 'none' }) }
  finally { loading.value = false }
})
</script>

<style lang="scss" scoped>
page { background:#f3fbf8; }
.detail-page { min-height:100vh; padding:28rpx; box-sizing:border-box; }
.state { padding:120rpx 0; }
.profile-card, .info-card { border:1rpx solid #c8efe4; border-radius:28rpx; background:#fff; }
.profile-card { display:flex; flex-direction:column; align-items:center; padding:44rpx 24rpx; }
.avatar { width:128rpx; height:128rpx; border-radius:50%; }
.avatar.fallback { display:flex; align-items:center; justify-content:center; background:#dff7f0; color:#0f766e; font-size:48rpx; font-weight:700; }
.name { margin-top:20rpx; color:#0f172a; font-size:36rpx; font-weight:700; }
.type { margin-top:10rpx; color:#0f766e; font-size:24rpx; }
.info-card { margin-top:24rpx; padding:8rpx 28rpx; }
.info-row { display:flex; justify-content:space-between; gap:30rpx; padding:26rpx 0; border-bottom:1rpx solid #eef2f1; }
.info-row:last-child { border-bottom:0; }
.label { color:#64748b; font-size:26rpx; }
.value { flex:1; color:#0f172a; font-size:26rpx; text-align:right; word-break:break-all; }
</style>
