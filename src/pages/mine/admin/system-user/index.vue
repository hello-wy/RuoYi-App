<template>
  <scroll-view class="system-user-page" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="handleRefresh">
    <view class="hero-card">
      <view>
        <text class="hero-title">管理员用户管理</text>
        <text class="hero-desc">手机号登录，创建时手动设置密码</text>
      </view>
      <view class="hero-count">
        <text class="hero-count-num">{{ total }}</text>
        <text class="hero-count-label">用户</text>
      </view>
    </view>

    <view class="search-card">
      <view class="search-row">
        <input v-model="query.keyword" class="search-input" placeholder="搜索手机号/登录名" confirm-type="search" @confirm="handleSearch" />
        <view class="search-btn" @click="handleSearch">
          <text class="search-btn-text">搜索</text>
        </view>
      </view>
      <view class="level-filter">
        <view
          class="level-chip"
          :class="{ active: query.adminLevel === '' }"
          @click="selectLevel('')"
        >全部</view>
        <view
          v-for="item in adminLevels"
          :key="item.value"
          class="level-chip"
          :class="{ active: query.adminLevel === item.value }"
          @click="selectLevel(item.value)"
        >{{ item.label }}</view>
      </view>
    </view>

    <view class="create-card" @click="openCreateForm">
      <view>
        <text class="create-title">新增管理员用户</text>
        <text class="create-desc">登录名称将自动使用手机号</text>
      </view>
      <uni-icons type="plusempty" size="24" color="#0f766e" />
    </view>

    <view class="list-card">
      <view class="section-head">
        <text class="section-title">系统用户</text>
        <text class="section-subtitle">第 {{ query.pageNum }} 页</text>
      </view>

      <view v-if="loading" class="state-wrap">
        <uni-load-more status="loading" />
      </view>
      <view v-else-if="users.length === 0" class="state-wrap empty-wrap">
        <uni-icons type="person" size="40" color="#cbd5e1" />
        <text class="empty-text">暂无系统用户</text>
      </view>
      <view v-else class="user-list">
        <view v-for="item in users" :key="item.userId" class="user-item">
          <view class="user-main">
            <view class="user-top">
              <text class="user-name">{{ item.nickName || item.userName || '未命名用户' }}</text>
              <text class="status-tag" :class="item.status === '0' ? 'enabled' : 'disabled'">{{ item.status === '0' ? '启用' : '停用' }}</text>
            </view>
            <text class="user-phone">{{ item.phonenumber || item.userName || '未填写手机号' }}</text>
            <view class="meta-row">
              <text class="level-tag">{{ getAdminLevelLabel(item.adminLevel) }}</text>
              <text class="dept-text">{{ item.dept?.deptName || '未分配部门' }}</text>
            </view>
          </view>
          <view class="action-row">
            <view class="ghost-btn" @click="openEditForm(item)">修改</view>
            <view class="ghost-btn" @click="toggleStatus(item)">{{ item.status === '0' ? '停用' : '启用' }}</view>
            <view class="danger-btn" @click="confirmDelete(item)">删除</view>
          </view>
        </view>
      </view>

      <view v-if="users.length > 0" class="pager-row">
        <button class="pager-btn" :disabled="query.pageNum <= 1" @click="changePage(-1)">上一页</button>
        <button class="pager-btn" :disabled="!hasNextPage" @click="changePage(1)">下一页</button>
      </view>
    </view>
  </scroll-view>

  <view v-if="formVisible" class="dialog-overlay" @touchmove.stop.prevent>
    <view class="dialog-mask" @click="closeForm"></view>
    <view class="dialog-sheet">
      <view class="dialog-card">
        <view class="dialog-header">
          <text class="dialog-title">{{ form.userId ? '修改管理员用户' : '新增管理员用户' }}</text>
          <view class="dialog-close" @click="closeForm">
            <uni-icons type="closeempty" size="18" color="#64748b" />
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">手机号</text>
          <input v-model="form.phonenumber" class="form-input" type="number" maxlength="11" placeholder="请输入手机号" />
        </view>
        <view class="form-item">
          <text class="form-label">用户昵称</text>
          <input v-model="form.nickName" class="form-input" placeholder="请输入用户昵称" />
        </view>
        <view v-if="!form.userId" class="form-item">
          <text class="form-label">登录密码</text>
          <input v-model="form.rawPassword" class="form-input" password placeholder="请输入登录密码" />
        </view>
        <view class="form-item">
          <text class="form-label">管理员层级</text>
          <picker :range="adminLevels" range-key="label" :value="selectedLevelIndex" @change="handleLevelChange">
            <view class="picker-input">{{ selectedLevelLabel }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">状态</text>
          <picker :range="statusOptions" range-key="label" :value="selectedStatusIndex" @change="handleStatusChange">
            <view class="picker-input">{{ selectedStatusLabel }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">备注</text>
          <textarea v-model="form.remark" class="form-textarea" placeholder="请输入备注" />
        </view>

        <view class="dialog-btn-row">
          <button class="dialog-btn dialog-btn-secondary" @click="closeForm">取消</button>
          <button class="dialog-btn dialog-btn-primary" :disabled="saving" @click="submitForm">{{ saving ? '保存中...' : '保存' }}</button>
        </view>
      </view>
    </view>
  </view>

  <view v-if="credentialVisible" class="dialog-overlay" @touchmove.stop.prevent>
    <view class="dialog-mask"></view>
    <view class="dialog-sheet">
      <view class="dialog-card">
        <view class="dialog-header">
          <text class="dialog-title">创建成功</text>
        </view>
        <text class="credential-tip">请复制后发送给用户，关闭后将无法再次查看登录密码。</text>
        <view class="credential-box">
          <text>{{ credentialText }}</text>
        </view>
        <view class="dialog-btn-row">
          <button class="dialog-btn dialog-btn-primary" @click="copyCredential">复制账号密码</button>
          <button class="dialog-btn dialog-btn-secondary" @click="credentialVisible = false">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { requireAdminAccess } from '@/pages/mine/admin/access'
import {
  buildEmptySystemUserForm,
  buildSystemUserPayload,
  validateSystemUserForm
} from '@/pages/mine/admin/system-user/helpers'
import {
  ADMIN_LEVEL_OPTIONS,
  addSystemUser,
  buildCredentialText,
  changeSystemUserStatus,
  deleteSystemUser,
  getAdminLevelLabel,
  listSystemUsers,
  updateSystemUser
} from '@/pages/mine/admin/_api/system/user'

const { proxy } = getCurrentInstance()
const loading = ref(false)
const refreshing = ref(false)
const saving = ref(false)
const users = ref([])
const total = ref(0)
const formVisible = ref(false)
const credentialVisible = ref(false)
const credentialText = ref('')
const adminLevels = ADMIN_LEVEL_OPTIONS
const statusOptions = [
  { label: '启用', value: '0' },
  { label: '停用', value: '1' }
]
const query = ref({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  adminLevel: ''
})
const form = ref(buildEmptyForm())

const hasNextPage = computed(() => query.value.pageNum * query.value.pageSize < total.value)
const selectedLevelIndex = computed(() => Math.max(0, adminLevels.findIndex(item => item.value === form.value.adminLevel)))
const selectedLevelLabel = computed(() => getAdminLevelLabel(form.value.adminLevel))
const selectedStatusIndex = computed(() => Math.max(0, statusOptions.findIndex(item => item.value === form.value.status)))
const selectedStatusLabel = computed(() => statusOptions[selectedStatusIndex.value]?.label || '启用')

function buildEmptyForm() {
  return buildEmptySystemUserForm()
}

function buildListQuery() {
  const keyword = query.value.keyword.trim()
  return {
    pageNum: query.value.pageNum,
    pageSize: query.value.pageSize,
    userName: keyword || undefined,
    phonenumber: keyword || undefined,
    adminLevel: query.value.adminLevel || undefined
  }
}

async function loadUsers() {
  if (!requireAdminAccess(proxy)) return
  loading.value = true
  try {
    const res = await listSystemUsers(buildListQuery())
    users.value = Array.isArray(res?.rows) ? res.rows : []
    total.value = Number(res?.total || 0)
  } catch (error) {
    users.value = []
    proxy.$modal.msgError(error?.msg || '加载系统用户失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function handleRefresh() {
  refreshing.value = true
  query.value.pageNum = 1
  loadUsers()
}

function handleSearch() {
  query.value.pageNum = 1
  loadUsers()
}

function selectLevel(value) {
  query.value.adminLevel = value
  handleSearch()
}

function changePage(delta) {
  const next = query.value.pageNum + delta
  if (next < 1) return
  query.value.pageNum = next
  loadUsers()
}

function openCreateForm() {
  form.value = buildEmptyForm()
  formVisible.value = true
}

function openEditForm(item) {
  form.value = {
    ...buildEmptyForm(),
    ...item,
    phonenumber: item.phonenumber || item.userName || '',
    userName: item.phonenumber || item.userName || '',
    roleIds: Array.isArray(item.roleIds) ? item.roleIds : [],
    postIds: Array.isArray(item.postIds) ? item.postIds : []
  }
  formVisible.value = true
}

function closeForm() {
  if (saving.value) return
  formVisible.value = false
}

function handleLevelChange(event) {
  const index = Number(event.detail.value || 0)
  form.value.adminLevel = adminLevels[index]?.value || 'employee'
}

function handleStatusChange(event) {
  const index = Number(event.detail.value || 0)
  form.value.status = statusOptions[index]?.value || '0'
}

function validateForm() {
  const result = validateSystemUserForm(form.value)
  if (!result.valid) {
    proxy.$modal.msgError(result.message)
    return false
  }
  return true
}

async function submitForm() {
  if (!validateForm()) return
  saving.value = true
  const payload = buildSystemUserPayload(form.value)
  try {
    if (payload.userId) {
      await updateSystemUser(payload)
      proxy.$modal.showToast('修改成功')
    } else {
      await addSystemUser(payload)
      credentialText.value = buildCredentialText({
        phone: payload.phonenumber,
        password: payload.rawPassword
      })
      credentialVisible.value = true
      proxy.$modal.showToast('新增成功')
    }
    formVisible.value = false
    await loadUsers()
  } catch (error) {
    proxy.$modal.msgError(error?.msg || '保存失败')
  } finally {
    saving.value = false
  }
}

function toggleStatus(item) {
  const nextStatus = item.status === '0' ? '1' : '0'
  uni.showModal({
    title: '确认操作',
    content: `确认${nextStatus === '0' ? '启用' : '停用'}该用户吗？`,
    success: async ({ confirm }) => {
      if (!confirm) return
      try {
        await changeSystemUserStatus(item.userId, nextStatus)
        proxy.$modal.showToast('操作成功')
        loadUsers()
      } catch (error) {
        proxy.$modal.msgError(error?.msg || '操作失败')
      }
    }
  })
}

function confirmDelete(item) {
  uni.showModal({
    title: '删除用户',
    content: `确认删除 ${item.nickName || item.phonenumber || item.userName} 吗？`,
    success: async ({ confirm }) => {
      if (!confirm) return
      try {
        await deleteSystemUser(item.userId)
        proxy.$modal.showToast('删除成功')
        if (users.value.length === 1 && query.value.pageNum > 1) {
          query.value.pageNum -= 1
        }
        loadUsers()
      } catch (error) {
        proxy.$modal.msgError(error?.msg || '删除失败')
      }
    }
  })
}

function copyCredential() {
  uni.setClipboardData({
    data: credentialText.value,
    success: () => proxy.$modal.showToast('复制成功')
  })
}

onLoad(loadUsers)
onShow(loadUsers)
</script>

<style lang="scss" scoped>
.system-user-page {
  min-height: 100vh;
  background: #f5f8f7;
  padding: 24rpx;
  box-sizing: border-box;
}
.hero-card,
.search-card,
.create-card,
.list-card,
.dialog-card {
  background: #ffffff;
  border-radius: 28rpx;
  box-shadow: 0 16rpx 40rpx rgba(15, 118, 110, 0.08);
}
.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #ffffff;
}
.hero-title,
.create-title,
.section-title,
.dialog-title,
.user-name {
  display: block;
  font-weight: 700;
}
.hero-title { font-size: 38rpx; }
.hero-desc { display: block; margin-top: 12rpx; font-size: 24rpx; color: #d9fbf4; }
.hero-count { text-align: center; }
.hero-count-num { display: block; font-size: 42rpx; font-weight: 800; }
.hero-count-label { display: block; font-size: 22rpx; color: #d9fbf4; }
.search-card,
.create-card,
.list-card { margin-top: 24rpx; padding: 28rpx; }
.search-row { display: flex; gap: 16rpx; }
.search-input,
.form-input,
.picker-input,
.form-textarea {
  background: #f8fafc;
  border-radius: 18rpx;
  padding: 0 24rpx;
  min-height: 76rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}
.search-input { flex: 1; }
.search-btn,
.dialog-btn-primary {
  background: #0f766e;
  color: #ffffff;
}
.search-btn {
  width: 140rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-btn-text { color: #ffffff; font-size: 28rpx; }
.level-filter { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 22rpx; }
.level-chip {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 24rpx;
}
.level-chip.active { background: #ccfbf1; color: #0f766e; font-weight: 700; }
.create-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.create-title { font-size: 30rpx; color: #0f172a; }
.create-desc { display: block; margin-top: 8rpx; font-size: 24rpx; color: #64748b; }
.section-head,
.user-top,
.meta-row,
.action-row,
.dialog-header,
.dialog-btn-row,
.pager-row {
  display: flex;
  align-items: center;
}
.section-head,
.user-top,
.dialog-header,
.pager-row { justify-content: space-between; }
.section-title { font-size: 30rpx; color: #0f172a; }
.section-subtitle { font-size: 24rpx; color: #64748b; }
.state-wrap { padding: 48rpx 0; text-align: center; }
.empty-wrap { display: flex; flex-direction: column; align-items: center; gap: 16rpx; }
.empty-text { color: #94a3b8; font-size: 26rpx; }
.user-list { margin-top: 20rpx; }
.user-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
}
.user-item:last-child { border-bottom: none; }
.user-name { font-size: 30rpx; color: #0f172a; }
.user-phone { display: block; margin-top: 10rpx; font-size: 26rpx; color: #475569; }
.status-tag,
.level-tag {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}
.status-tag.enabled { background: #dcfce7; color: #15803d; }
.status-tag.disabled { background: #fee2e2; color: #b91c1c; }
.meta-row { margin-top: 14rpx; gap: 12rpx; }
.level-tag { background: #e0f2fe; color: #0369a1; }
.dept-text { color: #94a3b8; font-size: 24rpx; }
.action-row { justify-content: flex-end; gap: 14rpx; margin-top: 18rpx; }
.ghost-btn,
.danger-btn {
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
}
.ghost-btn { background: #f1f5f9; color: #0f766e; }
.danger-btn { background: #fee2e2; color: #b91c1c; }
.pager-row { margin-top: 20rpx; gap: 20rpx; }
.pager-btn { flex: 1; font-size: 26rpx; border-radius: 18rpx; background: #ecfdf5; color: #0f766e; }
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}
.dialog-mask {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.42);
}
.dialog-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx;
}
.dialog-card { padding: 32rpx; }
.dialog-title { font-size: 32rpx; color: #0f172a; }
.form-item { margin-top: 24rpx; }
.form-label { display: block; margin-bottom: 12rpx; color: #475569; font-size: 26rpx; }
.form-item picker { display: block; width: 100%; }
.picker-input {
  display: flex;
  align-items: center;
  width: 100%;
  line-height: 1;
}
.form-textarea { width: 100%; min-height: 140rpx; padding-top: 20rpx; }
.dialog-btn-row { gap: 18rpx; margin-top: 32rpx; }
.dialog-btn { flex: 1; border-radius: 18rpx; font-size: 28rpx; }
.dialog-btn-secondary { background: #f1f5f9; color: #334155; }
.credential-tip { display: block; margin-top: 20rpx; color: #64748b; font-size: 26rpx; line-height: 1.6; }
.credential-box {
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 18rpx;
  background: #f8fafc;
  color: #0f172a;
  font-size: 28rpx;
  line-height: 1.7;
  white-space: pre-line;
}
</style>
