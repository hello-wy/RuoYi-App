<template>
  <scroll-view class="admin-container" scroll-y @scrolltolower="loadMore">
    <view v-if="!hasAdminAccess" class="bind-card">
      <view class="bind-title">管理员登录</view>
      <view class="bind-desc">请输入后台管理端账号密码登录管理后台。</view>
      <view class="bind-form">
        <input class="bind-input" :value="bindForm.username" placeholder="请输入管理员账号" @input="updateBindField('username', $event.detail.value)" />
        <input class="bind-input" :value="bindForm.password" password placeholder="请输入管理员密码" @input="updateBindField('password', $event.detail.value)" />
        <button class="bind-btn" :disabled="binding" @click="handleBindAdmin">登录并进入</button>
      </view>
    </view>

    <template v-else>
      <view class="admin-header">
        <view>
          <view class="admin-title">用户管理</view>
          <view class="admin-subtitle">共 {{ total }} 位小程序用户</view>
        </view>
      </view>

      <view class="tabs">
        <view v-for="tab in tabs" :key="tab.value" class="tab" :class="{ active: userType === tab.value }" @click="selectType(tab.value)">{{ tab.label }}</view>
      </view>
      <view class="search-row">
        <view class="search-box">
          <uni-icons type="search" size="17" color="#94a3b8" />
          <input v-model="keyword" class="search-input" confirm-type="search" placeholder="搜索昵称、姓名或手机号" @confirm="search" />
        </view>
        <view class="search-btn" @click="search">搜索</view>
      </view>

      <view v-if="loading && users.length === 0" class="state"><uni-load-more status="loading" /></view>
      <view v-else-if="users.length === 0" class="state">暂无用户数据</view>
      <view v-else class="user-list">
        <view v-for="item in users" :key="item.id" class="user-card" @click="goDetail(item.id)">
          <image v-if="item.avatar" class="avatar" :src="item.avatar" mode="aspectFill" />
          <view v-else class="avatar fallback">{{ item.displayName.slice(0, 1) }}</view>
          <view class="user-info">
            <view class="name-row"><text class="user-name">{{ item.displayName }}</text><text class="type-tag">{{ typeText(item.userType) }}</text></view>
            <text class="user-meta">{{ item.realName || '未填写实名' }}</text>
            <text class="user-meta">{{ item.phone || '未填写手机号' }}</text>
          </view>
          <uni-icons type="right" size="17" color="#cbd5e1" />
        </view>
        <uni-load-more :status="loadStatus" @clickLoadMore="loadMore" />
      </view>
    </template>
  </scroll-view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad, onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { adminLogin, getAdminInfo } from '@/pages/mine/admin/_api/system/auth'
import { listMiniUsers } from '@/pages/mine/admin/_api/system/miniUser'
import { setAdminRoles, setAdminToken } from '@/utils/auth'
import { isAdminUser } from '../access'

const PAGE_SIZE = 10
const { proxy } = getCurrentInstance()
const hasAdminAccess = ref(isAdminUser())
const binding = ref(false)
const bindForm = ref({ username: '', password: '' })
const tabs = [{ label: '家长', value: 0 }, { label: '学生', value: 1 }, { label: '商家', value: 2 }]
const userType = ref(0)
const keyword = ref('')
const users = ref([])
const total = ref(0)
const pageNum = ref(1)
const loading = ref(false)
const finished = ref(false)
const loadStatus = computed(() => loading.value ? 'loading' : finished.value ? 'noMore' : 'more')

function typeText(value) {
  return { 0: '家长', 1: '学生', 2: '商家' }[value] || '用户'
}
function updateBindField(field, value) { bindForm.value = { ...bindForm.value, [field]: value } }
async function handleBindAdmin() {
  if (!bindForm.value.username || !bindForm.value.password) return proxy.$modal.msgError('请输入管理员账号和密码')
  binding.value = true
  proxy.$modal.loading('正在登录...')
  try {
    const loginRes = await adminLogin(bindForm.value.username, bindForm.value.password)
    if (!loginRes.token) throw new Error('登录失败，未获取到 token')
    setAdminToken(loginRes.token)
    const infoRes = await getAdminInfo()
    setAdminRoles(infoRes.roles || [])
    hasAdminAccess.value = isAdminUser()
    if (!hasAdminAccess.value) throw new Error('登录成功，但未获取到管理员权限')
    bindForm.value = { username: '', password: '' }
    await loadList(true)
    proxy.$modal.showToast('登录成功')
  } catch (error) {
    setAdminToken(''); setAdminRoles([])
    proxy.$modal.msgError(error?.msg || error?.message || '登录失败')
  } finally { binding.value = false; proxy.$modal.closeLoading() }
}
async function loadList(reset = false) {
  if (loading.value || (!reset && finished.value)) return
  if (reset) { pageNum.value = 1; users.value = []; finished.value = false }
  loading.value = true
  try {
    const res = await listMiniUsers({ pageNum: pageNum.value, pageSize: PAGE_SIZE, keyword: keyword.value.trim() || undefined, userType: userType.value })
    users.value = reset ? res.rows : users.value.concat(res.rows)
    total.value = res.total
    finished.value = users.value.length >= total.value || res.rows.length === 0
    pageNum.value += 1
  } catch (error) { if (reset) users.value = [] } finally { loading.value = false; uni.stopPullDownRefresh() }
}
function selectType(value) { if (userType.value !== value) { userType.value = value; loadList(true) } }
function search() { loadList(true) }
function loadMore() { loadList() }
function goDetail(id) { if (id !== undefined && id !== null) proxy.$tab.navigateTo(`/pages/mine/admin/mini-user/detail?id=${id}`) }
function refreshAccess() { hasAdminAccess.value = isAdminUser(); if (hasAdminAccess.value && users.value.length === 0) loadList(true) }
onLoad(refreshAccess)
onShow(refreshAccess)
onPullDownRefresh(() => hasAdminAccess.value ? loadList(true) : uni.stopPullDownRefresh())
</script>

<style lang="scss" scoped src="./index.scss"></style>
