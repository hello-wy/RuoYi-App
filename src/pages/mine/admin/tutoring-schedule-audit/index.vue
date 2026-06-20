<template>
  <view class="audit-page">
    <view class="audit-header">
      <view class="header-title">家教签到审核</view>
      <view class="header-subtitle">审核家长已确认的家教课时，审核通过后进入待结算</view>
    </view>

    <scroll-view
      class="scroll-area"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshList"
      @scrolltolower="loadMore"
    >
      <view v-if="loading && list.length === 0" class="state-box">
        <uni-load-more status="loading" />
      </view>

      <view v-else-if="loadError && list.length === 0" class="state-box">
        <text class="state-text">加载失败，请重试</text>
        <button class="retry-btn" size="mini" @click="loadList(true)">重试</button>
      </view>

      <view v-else-if="list.length === 0" class="state-box">
        <text class="state-text">暂无待管理员审核课表</text>
      </view>

      <view v-else class="card-list">
        <view v-for="item in list" :key="item.id" class="audit-card">
          <view class="card-top">
            <text class="card-title">{{ item.parentName || '未命名家教需求' }}</text>
            <text class="status-tag" :class="getStatus(item).type">{{ getStatus(item).label }}</text>
          </view>

          <view class="info-list">
            <view class="info-row">
              <text class="info-label">教员</text>
              <text class="info-value">{{ item.tutorName || '-' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">订单号</text>
              <text class="info-value">{{ item.orderNo || '-' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">上课时间</text>
              <text class="info-value">{{ formatTime(item) || '-' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">家长确认</text>
              <text class="info-value">{{ item.confirmTime || '-' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">结算金额</text>
              <text class="amount-value">{{ formatAmount(item) }}</text>
            </view>
          </view>

          <button
            v-if="canAudit(item)"
            class="audit-btn approve"
            :disabled="actionLoading"
            @click="handleAudit(item)"
          >
            通过审核
          </button>
        </view>

        <uni-load-more :status="loadMoreStatus" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { auditTutoringSchedule, listTutoringSchedules } from '@/pages/mine/admin/_api/system/tutoringAdmin'
import {
  buildTutoringAuditStatus,
  canAuditTutoringSchedule,
  formatScheduleAmount,
  formatScheduleTime,
  normalizeTutoringScheduleRows
} from '../tutoring-schedule-audit.helpers'
import { requireAdminAccess } from '../access'

const PAGE_SIZE = 20
const WAIT_PARENT_CONFIRM_STATUS = 1
const DEFAULT_AUDIT_REMARK = '确认课时无误，进入待结算'

const { proxy } = getCurrentInstance()
const list = ref([])
const total = ref(0)
const pageNum = ref(1)
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const loadError = ref(false)
const actionLoading = ref(false)

const loadMoreStatus = computed(() => {
  if (loading.value && list.value.length > 0) return 'loading'
  return finished.value ? 'noMore' : 'more'
})

onLoad(() => {
  if (!requireAdminAccess(proxy)) return
  loadList(true)
})

onPullDownRefresh(() => {
  refreshList()
})

function getStatus(item) {
  return buildTutoringAuditStatus(item)
}

function canAudit(item) {
  return canAuditTutoringSchedule(item)
}

function formatTime(item) {
  return formatScheduleTime(item)
}

function formatAmount(item) {
  return formatScheduleAmount(item)
}

async function loadList(reset = false) {
  if (loading.value) return
  resetListState(reset)
  loading.value = true
  try {
    const res = await listTutoringSchedules({
      pageNum: pageNum.value,
      pageSize: PAGE_SIZE,
      status: WAIT_PARENT_CONFIRM_STATUS,
      confirmed: true
    })
    const rows = normalizeTutoringScheduleRows(Array.isArray(res.rows) ? res.rows : [])
    appendRows(reset, rows, Number(res.total || 0))
  } catch (error) {
    loadError.value = true
  } finally {
    loading.value = false
    refreshing.value = false
    uni.stopPullDownRefresh()
  }
}

function resetListState(reset) {
  if (!reset) return
  list.value = []
  total.value = 0
  pageNum.value = 1
  finished.value = false
  loadError.value = false
}

function appendRows(reset, rows, nextTotal) {
  list.value = reset ? rows : list.value.concat(rows)
  total.value = nextTotal
  finished.value = list.value.length >= total.value || rows.length === 0
  pageNum.value += 1
  loadError.value = false
}

function refreshList() {
  refreshing.value = true
  loadList(true)
}

function loadMore() {
  if (loading.value || finished.value) return
  loadList(false)
}

function handleAudit(item) {
  if (actionLoading.value || !item.id) return
  uni.showModal({
    title: '通过审核',
    content: '确认该课时无误并进入待结算吗？',
    confirmColor: '#0f766e',
    success: ({ confirm }) => {
      if (confirm) submitAudit(item.id)
    }
  })
}

async function submitAudit(id) {
  actionLoading.value = true
  try {
    await auditTutoringSchedule(id, { remark: DEFAULT_AUDIT_REMARK })
    uni.showToast({ title: '审核通过', icon: 'success' })
    await loadList(true)
  } catch (error) {
    uni.showToast({ title: error?.msg || '审核失败，请重试', icon: 'none' })
  } finally {
    actionLoading.value = false
  }
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
