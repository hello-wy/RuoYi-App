<template>
  <view class="permission-page">
    <view class="hero-card">
      <view>
        <text class="hero-title">权限管理</text>
        <text class="hero-desc">选择系统用户，按业务分组配置可用功能</text>
      </view>
      <view class="hero-icon"><uni-icons type="locked-filled" size="28" color="#0f766e" /></view>
    </view>

    <view class="user-card">
      <view class="section-head">
        <view>
          <text class="section-title">选择用户</text>
          <text class="section-desc">搜索姓名、账号或手机号</text>
        </view>
        <text v-if="selectedUser" class="change-link" @click="openUserSheet">更换</text>
      </view>
      <view v-if="selectedUser" class="selected-user" @click="openUserSheet">
        <view class="avatar">{{ selectedUser.displayName.slice(0, 1) }}</view>
        <view class="user-main">
          <view class="user-title-row">
            <text class="user-name">{{ selectedUser.displayName }}</text>
            <text v-if="isReadOnly" class="protected-tag">只读</text>
          </view>
          <text class="user-meta">{{ selectedUser.account || '暂无账号' }} · {{ selectedUser.departmentName }}</text>
        </view>
        <uni-icons type="right" size="18" color="#94a3b8" />
      </view>
      <view v-else class="select-placeholder" @click="openUserSheet">
        <view class="placeholder-icon"><uni-icons type="personadd-filled" size="25" color="#0f766e" /></view>
        <view class="user-main">
          <text class="placeholder-title">选择要授权的用户</text>
          <text class="placeholder-desc">支持按关键词快速查找</text>
        </view>
        <uni-icons type="right" size="18" color="#94a3b8" />
      </view>
    </view>

    <view v-if="!selectedUser" class="empty-state">
      <uni-icons type="locked" size="48" color="#b6d9d2" />
      <text class="empty-title">请先选择用户</text>
      <text class="empty-desc">选择后即可查看并调整该用户的功能权限</text>
    </view>

    <view v-else-if="loadingDetail" class="state-card"><uni-load-more status="loading" /></view>

    <view v-else-if="detailError" class="state-card">
      <uni-icons type="info-filled" size="40" color="#ef4444" />
      <text class="state-title">权限加载失败</text>
      <text class="state-desc">{{ detailError }}</text>
      <button class="retry-btn" @click="loadSelectedUserPermissions">重新加载</button>
    </view>

    <template v-else>
      <view v-if="isReadOnly" class="readonly-notice">
        <uni-icons type="info" size="20" color="#92400e" />
        <text>{{ readOnlyReason }}</text>
      </view>

      <view v-if="groups.length === 0" class="state-card">
        <uni-icons type="list" size="42" color="#b6d9d2" />
        <text class="state-title">暂无可配置权限</text>
        <text class="state-desc">请确认后台已配置有效的功能权限</text>
        <button class="retry-btn" @click="loadCatalog">重新加载</button>
      </view>

      <view v-for="group in groups" :key="group.key" class="rule-card">
        <view class="group-head">
          <view class="group-copy">
            <text class="group-title">{{ group.name }}</text>
            <text v-if="group.description" class="group-desc">{{ group.description }}</text>
          </view>
          <switch
            class="group-switch"
            color="#0f9d8f"
            :checked="isGroupChecked(group)"
            :disabled="saving || isReadOnly || !hasEditablePermissions(group)"
            @change="toggleGroup(group, $event.detail.value)"
          />
        </view>
        <view class="rule-list">
          <view v-for="item in group.permissions" :key="item.id" class="rule-row">
            <view class="rule-copy">
              <view class="rule-title-row">
                <text class="rule-name">{{ item.name }}</text>
                <text v-if="!isGrantable(item)" class="delegate-tag">不可委派</text>
                <text v-if="isInherited(item.id)" class="inherited-tag">继承</text>
              </view>
              <text v-if="item.description || item.permission" class="rule-desc">{{ item.description || item.permission }}</text>
            </view>
            <switch
              color="#0f9d8f"
              :checked="isSelected(item.id)"
              :disabled="saving || isReadOnly || !isGrantable(item) || isInherited(item.id)"
              @change="togglePermission(item, $event.detail.value)"
            />
          </view>
        </view>
      </view>
    </template>

    <view v-if="selectedUser && !loadingDetail && !detailError && groups.length" class="footer-space"></view>
    <view v-if="selectedUser && !loadingDetail && !detailError && groups.length" class="save-bar">
      <view class="save-copy">
        <text class="save-status" :class="{ dirty }">{{ isReadOnly ? '系统保护账号' : dirty ? '有未保存修改' : '权限已同步' }}</text>
        <text class="save-count">已选 {{ selectedCount }} 项权限</text>
      </view>
      <button class="reload-btn" :disabled="saving" @click="handleReload">重载</button>
      <button class="save-btn" :disabled="!dirty || saving || isReadOnly" @click="handleSave">{{ saving ? '保存中' : '保存' }}</button>
    </view>

    <view v-if="userSheetVisible" class="sheet-overlay" @touchmove.stop.prevent>
      <view class="sheet-mask" @click="closeUserSheet"></view>
      <view class="user-sheet">
        <view class="sheet-handle"></view>
        <view class="sheet-head">
          <text class="sheet-title">选择系统用户</text>
          <view class="sheet-close" @click="closeUserSheet"><uni-icons type="closeempty" size="20" color="#64748b" /></view>
        </view>
        <view class="search-row">
          <uni-icons type="search" size="19" color="#94a3b8" />
          <input v-model="keyword" class="search-input" placeholder="姓名、账号或手机号" confirm-type="search" @confirm="searchUsers" />
          <text class="search-action" @click="searchUsers">搜索</text>
        </view>
        <scroll-view class="user-results" scroll-y @scrolltolower="loadMoreUsers">
          <view v-if="loadingUsers" class="sheet-state"><uni-load-more status="loading" /></view>
          <view v-else-if="userError" class="sheet-state">
            <text class="sheet-state-text">{{ userError }}</text>
            <text class="sheet-retry" @click="searchUsers">重试</text>
          </view>
          <view v-else-if="users.length === 0" class="sheet-state">
            <uni-icons type="person" size="38" color="#cbd5e1" />
            <text class="sheet-state-text">没有找到匹配用户</text>
          </view>
          <view v-else>
            <view v-for="user in users" :key="user.userId" class="result-row" @click="selectUser(user)">
              <view class="avatar small">{{ user.displayName.slice(0, 1) }}</view>
              <view class="user-main">
                <view class="user-title-row">
                  <text class="user-name">{{ user.displayName }}</text>
                  <text v-if="user.readOnly" class="protected-tag">超级管理员</text>
                </view>
                <text class="user-meta">{{ user.account || '暂无账号' }} · {{ user.departmentName }}</text>
              </view>
              <uni-icons type="right" size="17" color="#cbd5e1" />
            </view>
            <uni-load-more v-if="loadingMore || hasMoreUsers" :status="loadingMore ? 'loading' : 'more'" />
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onBackPress, onLoad } from '@dcloudio/uni-app'
import { requireAdminAccess } from '@/pages/mine/admin/access'
import { getPermissionCatalog, getUserPermissions, listPermissionUsers, updateUserPermissions } from '@/pages/mine/admin/_api/system/permission'
import { normalizePermissionCatalog, normalizePermissionUsers, normalizeUserPermissionDetail, samePermissionIds } from './helpers'

const { proxy } = getCurrentInstance()
const groups = ref([])
const users = ref([])
const selectedUser = ref(null)
const selectedIds = ref([])
const savedIds = ref([])
const inheritedIds = ref([])
const isReadOnly = ref(false)
const readOnlyReason = ref('')
const detailError = ref('')
const userError = ref('')
const keyword = ref('')
const pageNum = ref(1)
const total = ref(0)
const pageSize = 20
const loadingDetail = ref(false)
const loadingUsers = ref(false)
const loadingMore = ref(false)
const saving = ref(false)
const userSheetVisible = ref(false)
let userRequestGeneration = 0
let detailRequestGeneration = 0

const dirty = computed(() => !samePermissionIds(selectedIds.value, savedIds.value))
const hasMoreUsers = computed(() => users.value.length < total.value)
const selectedCount = computed(() => new Set([...selectedIds.value, ...inheritedIds.value]).size)

function isInherited(id) {
  return inheritedIds.value.includes(String(id))
}

function isSelected(id) {
  return isInherited(id) || selectedIds.value.includes(String(id))
}

function isGrantable(item) {
  return item.grantable !== false
}

function editablePermissions(group) {
  return group.permissions.filter(item => isGrantable(item) && !isInherited(item.id))
}

function hasEditablePermissions(group) {
  return !isReadOnly.value && editablePermissions(group).length > 0
}

function isGroupChecked(group) {
  const editable = editablePermissions(group)
  const permissions = editable.length > 0 ? editable : group.permissions
  return permissions.length > 0 && permissions.every(item => isSelected(item.id))
}

function togglePermission(item, enabled) {
  if (isReadOnly.value || !isGrantable(item) || isInherited(item.id)) return
  const value = String(item.id)
  const next = new Set(selectedIds.value)
  enabled ? next.add(value) : next.delete(value)
  selectedIds.value = [...next]
}

function toggleGroup(group, enabled) {
  if (isReadOnly.value) return
  const next = new Set(selectedIds.value)
  editablePermissions(group).forEach(item => enabled ? next.add(String(item.id)) : next.delete(String(item.id)))
  selectedIds.value = [...next]
}

async function loadCatalog() {
  if (!requireAdminAccess(proxy)) return
  try {
    const res = await getPermissionCatalog()
    groups.value = normalizePermissionCatalog(res).groups
  } catch (error) {
    groups.value = []
    proxy.$modal.msgError(error?.msg || '加载权限目录失败')
  }
}

function openUserSheet() {
  if (dirty.value) {
    confirmDiscard(() => {
      userSheetVisible.value = true
      if (!users.value.length) searchUsers()
    })
    return
  }
  userSheetVisible.value = true
  if (!users.value.length) searchUsers()
}

function closeUserSheet() {
  userSheetVisible.value = false
}

async function fetchUsers({ append = false, requestedPage = 1, generation }) {
  const loadingRef = append ? loadingMore : loadingUsers
  if ((append && loadingRef.value) || !requireAdminAccess(proxy)) return
  loadingRef.value = true
  userError.value = ''
  try {
    const res = await listPermissionUsers({
      pageNum: requestedPage,
      pageSize,
      keyword: keyword.value.trim() || undefined
    })
    if (generation !== userRequestGeneration) return
    const rows = normalizePermissionUsers(res)
    users.value = append ? [...users.value, ...rows] : rows
    pageNum.value = requestedPage
    total.value = Number(res.total ?? res.data?.total ?? users.value.length)
  } catch (error) {
    if (generation !== userRequestGeneration) return
    if (!append) users.value = []
    userError.value = error?.msg || '用户加载失败'
  } finally {
    if (generation === userRequestGeneration) loadingRef.value = false
  }
}

function searchUsers() {
  const generation = ++userRequestGeneration
  loadingUsers.value = false
  loadingMore.value = false
  pageNum.value = 1
  fetchUsers({ generation, requestedPage: 1 })
}

function loadMoreUsers() {
  if (!hasMoreUsers.value || loadingMore.value) return
  fetchUsers({ append: true, requestedPage: pageNum.value + 1, generation: userRequestGeneration })
}

function selectUser(user) {
  userSheetVisible.value = false
  selectedUser.value = user
  loadSelectedUserPermissions()
}

async function loadSelectedUserPermissions() {
  if (!selectedUser.value || !requireAdminAccess(proxy)) return
  const userId = selectedUser.value.userId
  const generation = ++detailRequestGeneration
  loadingDetail.value = true
  detailError.value = ''
  try {
    const res = await getUserPermissions(userId)
    if (generation !== detailRequestGeneration || selectedUser.value?.userId !== userId) return
    const detail = normalizeUserPermissionDetail(res)
    selectedIds.value = [...detail.permissionIds]
    savedIds.value = [...detail.permissionIds]
    inheritedIds.value = [...detail.inheritedPermissionIds]
    isReadOnly.value = selectedUser.value.readOnly || detail.readOnly
    readOnlyReason.value = isReadOnly.value
      ? (detail.readOnlyReason || '超级管理员权限由系统维护，不可修改')
      : ''
  } catch (error) {
    if (generation !== detailRequestGeneration || selectedUser.value?.userId !== userId) return
    selectedIds.value = []
    savedIds.value = []
    inheritedIds.value = []
    isReadOnly.value = false
    readOnlyReason.value = ''
    detailError.value = error?.msg || '无法加载该用户的权限'
  } finally {
    if (generation === detailRequestGeneration) loadingDetail.value = false
  }
}

function confirmDiscard(onConfirm) {
  if (!dirty.value) {
    onConfirm()
    return
  }
  uni.showModal({
    title: '放弃未保存修改？',
    content: '当前权限调整尚未保存，继续后修改将丢失。',
    confirmText: '放弃修改',
    confirmColor: '#dc2626',
    success: ({ confirm }) => confirm && onConfirm()
  })
}

function handleReload() {
  confirmDiscard(loadSelectedUserPermissions)
}

async function handleSave() {
  if (!dirty.value || saving.value || isReadOnly.value || !requireAdminAccess(proxy)) return
  const userId = selectedUser.value.userId
  const submittedIds = [...selectedIds.value]
  saving.value = true
  try {
    await updateUserPermissions(userId, submittedIds.map(id => Number(id)))
    savedIds.value = submittedIds
    proxy.$modal.showToast('权限保存成功，目标用户需重新登录')
    if (selectedUser.value?.userId === userId) await loadSelectedUserPermissions()
  } catch (error) {
    proxy.$modal.msgError(error?.msg || '权限保存失败，请重试')
  } finally {
    saving.value = false
  }
}

onBackPress(() => {
  if (!dirty.value) return false
  confirmDiscard(() => uni.navigateBack())
  return true
})

onLoad(async () => {
  if (!requireAdminAccess(proxy)) return
  await loadCatalog()
})
</script>

<style lang="scss" scoped src="./index.scss"></style>
