<template>
  <scroll-view class="dept-page" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="handleRefresh">
    <view class="hero-card">
      <view>
        <text class="hero-title">部门管理</text>
        <text class="hero-desc">地区按部门名称隔离，当前默认南京市</text>
      </view>
      <view class="hero-count">
        <text class="hero-count-num">{{ deptList.length }}</text>
        <text class="hero-count-label">部门</text>
      </view>
    </view>

    <view class="search-card">
      <view class="search-row">
        <input v-model="query.deptName" class="search-input" placeholder="搜索部门名称" confirm-type="search" @confirm="loadDepartments" />
        <view class="search-btn" @click="loadDepartments">
          <text class="search-btn-text">搜索</text>
        </view>
      </view>
    </view>

    <view class="create-card" @click="openCreateForm()">
      <view>
        <text class="create-title">新增部门</text>
        <text class="create-desc">新增地区或组织部门</text>
      </view>
      <uni-icons type="plusempty" size="24" color="#0f766e" />
    </view>

    <view class="list-card">
      <view class="section-head">
        <text class="section-title">部门列表</text>
        <text class="section-subtitle">{{ deptList.length }} 个</text>
      </view>

      <view v-if="loading" class="state-wrap">
        <uni-load-more status="loading" />
      </view>
      <view v-else-if="deptList.length === 0" class="state-wrap empty-wrap">
        <uni-icons type="folder-add-filled" size="40" color="#cbd5e1" />
        <text class="empty-text">暂无部门</text>
      </view>
      <view v-else class="dept-list">
        <view v-for="item in deptList" :key="item.deptId" class="dept-item">
          <view class="dept-main">
            <view class="dept-top">
              <text class="dept-name">{{ item.deptName }}</text>
              <text class="status-tag" :class="item.status === '0' ? 'enabled' : 'disabled'">{{ item.status === '0' ? '启用' : '停用' }}</text>
            </view>
            <text class="dept-meta">排序 {{ item.orderNum || 0 }} · {{ item.parentName || '顶级部门' }}</text>
            <text v-if="item.leader || item.phone" class="dept-meta">{{ item.leader || '未设负责人' }} {{ item.phone || '' }}</text>
          </view>
          <view class="action-row">
            <view class="ghost-btn" @click="openCreateForm(item)">新增下级</view>
            <view class="ghost-btn" @click="openEditForm(item)">修改</view>
            <view v-if="Number(item.parentId || 0) !== 0" class="danger-btn" @click="confirmDelete(item)">删除</view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>

  <view v-if="formVisible" class="dialog-overlay" @touchmove.stop.prevent>
    <view class="dialog-mask" @click="closeForm"></view>
    <view class="dialog-sheet">
      <view class="dialog-card">
        <view class="dialog-header">
          <text class="dialog-title">{{ form.deptId ? '修改部门' : '新增部门' }}</text>
          <view class="dialog-close" @click="closeForm">
            <uni-icons type="closeempty" size="18" color="#64748b" />
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">上级部门</text>
          <picker :range="parentOptions" range-key="text" :value="selectedParentIndex" @change="handleParentChange">
            <view class="picker-input">{{ selectedParentLabel }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">部门名称</text>
          <input v-model="form.deptName" class="form-input" placeholder="请输入部门名称" />
        </view>
        <view class="form-item">
          <text class="form-label">显示排序</text>
          <input v-model="form.orderNum" class="form-input" type="number" placeholder="请输入显示排序" />
        </view>
        <view class="form-item">
          <text class="form-label">负责人</text>
          <input v-model="form.leader" class="form-input" placeholder="请输入负责人" />
        </view>
        <view class="form-item">
          <text class="form-label">联系电话</text>
          <input v-model="form.phone" class="form-input" type="number" maxlength="11" placeholder="请输入联系电话" />
        </view>
        <view class="form-item">
          <text class="form-label">邮箱</text>
          <input v-model="form.email" class="form-input" placeholder="请输入邮箱" />
        </view>
        <view class="form-item">
          <text class="form-label">状态</text>
          <picker :range="statusOptions" range-key="label" :value="selectedStatusIndex" @change="handleStatusChange">
            <view class="picker-input">{{ selectedStatusLabel }}</view>
          </picker>
        </view>

        <view class="dialog-btn-row">
          <button class="dialog-btn dialog-btn-secondary" @click="closeForm">取消</button>
          <button class="dialog-btn dialog-btn-primary" :disabled="saving" @click="submitForm">{{ saving ? '保存中...' : '保存' }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { requireAdminAccess } from '@/pages/mine/admin/access'
import { addDept, deleteDept, listDept, listDeptExclude, updateDept } from '@/pages/mine/admin/_api/system/dept'

const { proxy } = getCurrentInstance()
const loading = ref(false)
const refreshing = ref(false)
const saving = ref(false)
const formVisible = ref(false)
const deptList = ref([])
const selectableDeptList = ref([])
const query = ref({ deptName: '' })
const form = ref(buildEmptyForm())
const statusOptions = [
  { label: '启用', value: '0' },
  { label: '停用', value: '1' }
]

const parentOptions = computed(() => [
  { value: 0, text: '顶级部门' },
  ...selectableDeptList.value
    .filter(item => item.status !== '1')
    .map(item => ({ value: item.deptId, text: item.deptName }))
])
const selectedParentIndex = computed(() => Math.max(0, parentOptions.value.findIndex(item => String(item.value) === String(form.value.parentId))))
const selectedParentLabel = computed(() => parentOptions.value[selectedParentIndex.value]?.text || '顶级部门')
const selectedStatusIndex = computed(() => Math.max(0, statusOptions.findIndex(item => item.value === form.value.status)))
const selectedStatusLabel = computed(() => statusOptions[selectedStatusIndex.value]?.label || '启用')

function buildEmptyForm(parentId = 0) {
  return {
    deptId: undefined,
    parentId,
    deptName: '',
    orderNum: 1,
    leader: '',
    phone: '',
    email: '',
    status: '0'
  }
}

function flattenDepartments(items = [], parentName = '') {
  return items.flatMap(item => {
    const current = { ...item, parentName }
    const children = Array.isArray(item.children) ? flattenDepartments(item.children, item.deptName) : []
    return [current, ...children]
  })
}

async function loadDepartments() {
  if (!requireAdminAccess(proxy)) return
  loading.value = true
  try {
    const res = await listDept({ deptName: query.value.deptName.trim() || undefined })
    deptList.value = flattenDepartments(res?.data || [])
    selectableDeptList.value = deptList.value
  } catch (error) {
    deptList.value = []
    selectableDeptList.value = []
    proxy.$modal.msgError(error?.msg || '加载部门失败')
  } finally {
    loading.value = false
    refreshing.value = false
    uni.stopPullDownRefresh()
  }
}

function handleRefresh() {
  refreshing.value = true
  loadDepartments()
}

function openCreateForm(parent) {
  selectableDeptList.value = deptList.value
  form.value = buildEmptyForm(parent?.deptId || 0)
  formVisible.value = true
}

async function openEditForm(item) {
  form.value = {
    ...buildEmptyForm(),
    ...item,
    orderNum: Number(item.orderNum || 0)
  }
  try {
    const res = await listDeptExclude(item.deptId)
    selectableDeptList.value = flattenDepartments(res?.data || [])
    formVisible.value = true
  } catch (error) {
    selectableDeptList.value = []
    proxy.$modal.msgError(error?.msg || '加载上级部门失败')
  }
}

function closeForm() {
  if (saving.value) return
  formVisible.value = false
}

function handleParentChange(event) {
  const index = Number(event.detail.value || 0)
  form.value.parentId = parentOptions.value[index]?.value || 0
}

function handleStatusChange(event) {
  const index = Number(event.detail.value || 0)
  form.value.status = statusOptions[index]?.value || '0'
}

function validateForm() {
  const deptName = String(form.value.deptName || '').trim()
  if (!deptName) {
    proxy.$modal.msgError('请输入部门名称')
    return false
  }
  if (deptName.length > 30) {
    proxy.$modal.msgError('部门名称长度不能超过30个字符')
    return false
  }
  if (String(form.value.phone || '').trim() && !/^1[3-9]\d{9}$/.test(String(form.value.phone).trim())) {
    proxy.$modal.msgError('请输入正确的联系电话')
    return false
  }
  return true
}

function buildPayload() {
  return {
    ...form.value,
    deptName: String(form.value.deptName || '').trim(),
    orderNum: Number(form.value.orderNum || 0),
    parentId: Number(form.value.parentId || 0),
    leader: String(form.value.leader || '').trim(),
    phone: String(form.value.phone || '').trim(),
    email: String(form.value.email || '').trim()
  }
}

async function submitForm() {
  if (!validateForm()) return
  saving.value = true
  try {
    const payload = buildPayload()
    if (payload.deptId) {
      await updateDept(payload)
      proxy.$modal.showToast('修改成功')
    } else {
      await addDept(payload)
      proxy.$modal.showToast('新增成功')
    }
    formVisible.value = false
    await loadDepartments()
  } catch (error) {
    proxy.$modal.msgError(error?.msg || '保存失败')
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  uni.showModal({
    title: '删除部门',
    content: `确认删除 ${item.deptName} 吗？`,
    success: async ({ confirm }) => {
      if (!confirm) return
      try {
        await deleteDept(item.deptId)
        proxy.$modal.showToast('删除成功')
        loadDepartments()
      } catch (error) {
        proxy.$modal.msgError(error?.msg || '删除失败')
      }
    }
  })
}

onLoad(loadDepartments)
onPullDownRefresh(loadDepartments)
</script>

<style lang="scss" scoped>
.dept-page {
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
.dept-name {
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
.picker-input {
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
.create-card,
.section-head,
.dept-top,
.action-row,
.dialog-header,
.dialog-btn-row {
  display: flex;
  align-items: center;
}
.create-card,
.section-head,
.dept-top,
.dialog-header { justify-content: space-between; }
.create-title { font-size: 30rpx; color: #0f172a; }
.create-desc { display: block; margin-top: 8rpx; font-size: 24rpx; color: #64748b; }
.section-title { font-size: 30rpx; color: #0f172a; }
.section-subtitle { font-size: 24rpx; color: #64748b; }
.state-wrap { padding: 48rpx 0; text-align: center; }
.empty-wrap { display: flex; flex-direction: column; align-items: center; gap: 16rpx; }
.empty-text { color: #94a3b8; font-size: 26rpx; }
.dept-list { margin-top: 20rpx; }
.dept-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
}
.dept-item:last-child { border-bottom: none; }
.dept-name { font-size: 30rpx; color: #0f172a; }
.dept-meta { display: block; margin-top: 10rpx; font-size: 24rpx; color: #64748b; }
.status-tag {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}
.status-tag.enabled { background: #dcfce7; color: #15803d; }
.status-tag.disabled { background: #fee2e2; color: #b91c1c; }
.action-row { justify-content: flex-end; gap: 14rpx; margin-top: 18rpx; }
.ghost-btn,
.danger-btn {
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
}
.ghost-btn { background: #f1f5f9; color: #0f766e; }
.danger-btn { background: #fee2e2; color: #b91c1c; }
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
.dialog-btn-row { gap: 18rpx; margin-top: 32rpx; }
.dialog-btn { flex: 1; border-radius: 18rpx; font-size: 28rpx; }
.dialog-btn-secondary { background: #f1f5f9; color: #334155; }
</style>
