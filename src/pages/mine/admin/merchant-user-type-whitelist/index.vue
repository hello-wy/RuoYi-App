<template>
  <scroll-view class="whitelist-page" scroll-y>
    <view class="whitelist-header">
      <view class="header-title">商家身份白名单</view>
      <view class="header-subtitle">录入实名与身份证一致的用户，允许其切换商家身份</view>
    </view>

    <view class="action-card">
      <button class="open-popup-btn" @click="openFormPopup">新增白名单</button>
    </view>

    <view class="list-card">
      <view class="list-head">
        <view>
          <text class="list-title">白名单记录</text>
          <text class="list-subtitle">共 {{ total }} 条</text>
        </view>
        <button class="refresh-btn" size="mini" :disabled="loading" @click="loadList">刷新</button>
      </view>

      <view v-if="loading && list.length === 0" class="state-box">
        <uni-load-more status="loading" />
      </view>
      <view v-else-if="list.length === 0" class="state-box">
        <text class="state-text">暂无白名单记录</text>
      </view>
      <view v-else class="record-list">
        <view v-for="item in list" :key="item.id" class="record-card">
          <view class="record-main">
            <view class="record-row">
              <text class="record-name">{{ item.realName || '未填写' }}</text>
              <text class="status-tag" :class="item.status === 1 ? 'status-enabled' : 'status-disabled'">
                {{ item.status === 1 ? '启用' : '停用' }}
              </text>
            </view>
            <text class="record-meta">身份证：{{ item.idCard || '未填写' }}</text>
            <text class="record-meta">备注：{{ item.remark || '无' }}</text>
            <text class="record-meta">创建人：{{ item.createBy || '未知' }}</text>
            <text class="record-meta">创建时间：{{ item.createTime || '未知' }}</text>
          </view>
          <button class="delete-btn" size="mini" :disabled="deletingId === item.id" @click="handleDelete(item)">
            {{ deletingId === item.id ? '删除中' : '删除' }}
          </button>
        </view>
      </view>
    </view>
  </scroll-view>

  <view v-if="showFormPopup" class="dialog-overlay" @touchmove.stop.prevent>
    <view class="dialog-mask" :class="{ 'dialog-mask--active': formPopupVisible }" @click="closeFormPopup"></view>
    <view class="dialog-sheet" :class="{ 'dialog-sheet--active': formPopupVisible }">
      <view class="dialog-card">
        <view class="dialog-header">
          <view>
            <text class="dialog-title">新增商家白名单</text>
            <text class="dialog-subtitle">请填写实名和身份证信息后提交</text>
          </view>
          <view class="dialog-close" @click="closeFormPopup">
            <uni-icons type="closeempty" size="18" color="#64748B" />
          </view>
        </view>

        <view class="form-card">
          <view class="form-item">
            <text class="label">真实姓名</text>
            <input v-model="form.realName" class="input" placeholder="请输入真实姓名" />
          </view>
          <view class="form-item">
            <text class="label">身份证号</text>
            <input v-model="form.idCard" class="input" placeholder="请输入18位身份证号" maxlength="18" />
          </view>
          <view class="form-item">
            <text class="label">备注</text>
            <textarea v-model="form.remark" class="textarea" placeholder="选填" maxlength="100" />
          </view>
          <button class="submit-btn" :loading="submitting" @click="handleSubmit">确认新增</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref, getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  addMerchantUserTypeWhitelist,
  deleteMerchantUserTypeWhitelist,
  listMerchantUserTypeWhitelist,
} from '@/api/system/merchantUserTypeWhitelist'
import { requireAdminAccess } from '../access'
import {
  buildMerchantUserTypeWhitelistPayload,
  validateMerchantUserTypeWhitelistForm,
} from '../merchant-user-type-whitelist.helpers'

const { proxy } = getCurrentInstance()
const submitting = ref(false)
const loading = ref(false)
const total = ref(0)
const list = ref([])
const deletingId = ref('')
const showFormPopup = ref(false)
const formPopupVisible = ref(false)
const form = reactive({
  realName: '',
  idCard: '',
  remark: '',
})

onLoad(() => {
  if (!requireAdminAccess(proxy)) {
    return
  }
  loadList()
})

function resetForm() {
  form.realName = ''
  form.idCard = ''
  form.remark = ''
}

function openFormPopup() {
  showFormPopup.value = true
  setTimeout(() => {
    formPopupVisible.value = true
  }, 16)
}

function closeFormPopup() {
  formPopupVisible.value = false
  setTimeout(() => {
    showFormPopup.value = false
    resetForm()
  }, 220)
}

async function loadList() {
  if (loading.value) {
    return
  }
  loading.value = true
  try {
    const res = await listMerchantUserTypeWhitelist({ pageNum: 1, pageSize: 100 })
    list.value = Array.isArray(res.rows) ? res.rows : []
    total.value = Number(res.total || list.value.length)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  const validation = validateMerchantUserTypeWhitelistForm(form)
  if (!validation.valid) {
    proxy.$modal.showToast(validation.message)
    return
  }
  submitting.value = true
  try {
    await addMerchantUserTypeWhitelist(buildMerchantUserTypeWhitelistPayload(form))
    proxy.$modal.showToast('新增成功')
    await loadList()
    closeFormPopup()
  } finally {
    submitting.value = false
  }
}

function handleDelete(item) {
  proxy.$modal.confirm(`确定删除${item.realName}的白名单记录吗？`).then(async () => {
    deletingId.value = item.id
    try {
      await deleteMerchantUserTypeWhitelist(item.id)
      proxy.$modal.showToast('删除成功')
      loadList()
    } finally {
      deletingId.value = ''
    }
  }).catch(() => {})
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
