<template>
  <view class="audit-page">
    <view class="audit-header">
      <view class="header-title">签到审核</view>
      <view class="header-subtitle">按兼职岗位审核已支付报名人员签到材料</view>
    </view>

    <view class="filter-bar">
      <view class="search-bar-inline">
        <input
          class="search-input"
          v-model="jobSearchKeyword"
          placeholder="输入岗位名称搜索"
          confirm-type="search"
          @focus="onJobFocus"
          @input="onJobInput"
          @confirm="onJobSearch"
        />
        <view class="search-btn" @click="onJobSearch">搜索</view>
      </view>
      <view v-if="jobDropdownVisible && jobOptions.length > 0" class="job-dropdown">
        <scroll-view class="job-dropdown-scroll" scroll-y>
          <view
            v-for="(item, index) in jobOptions"
            :key="item.value"
            class="job-result-item"
            :class="{ active: index === jobActiveIndex }"
            @click="onSelectJob(index)"
          >
            <text class="job-result-title">{{ item.label }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
    <view v-if="jobDropdownVisible" class="dropdown-overlay" @click="closeJobDropdown"></view>
    <view v-if="selectedJobId" class="selected-job-bar">
      <text class="selected-job-text">{{ selectedJobLabel }}</text>
      <text class="selected-job-clear" @click="clearSelectedJob">清除</text>
    </view>

    <scroll-view class="scroll-area" scroll-y @scrolltolower="loadMoreRecords">
      <view v-if="!selectedJobId" class="state-box">
        <text class="state-text">请搜索并选择兼职岗位</text>
      </view>

      <view v-else-if="loading && records.length === 0" class="state-box">
        <uni-load-more status="loading" />
      </view>

      <view v-else-if="records.length === 0" class="state-box">
        <text class="state-text">暂无已支付报名人员</text>
      </view>

      <view v-else class="card-list">
        <view v-for="item in records" :key="item.id || item.orderNo" class="audit-card">
          <view class="card-top">
            <text class="user-name">{{ item.userName || item.displayName || '未知用户' }}</text>
            <text class="status-tag" :class="getStatus(item).type">{{ getStatus(item).label }}</text>
          </view>

          <view class="info-list">
            <view class="info-row">
              <text class="info-label">订单号</text>
              <text class="info-value">{{ item.orderNo || '-' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">提交时间</text>
              <text class="info-value">{{ item.submitTime || item.signTime || '-' }}</text>
            </view>
            <view v-if="item.auditTime" class="info-row">
              <text class="info-label">审核时间</text>
              <text class="info-value">{{ item.auditTime }}</text>
            </view>
          </view>

          <view v-if="getMaterialUrls(item).length > 0" class="material-list">
            <image
              v-for="url in getMaterialUrls(item)"
              :key="url"
              class="material-image"
              :src="url"
              mode="aspectFill"
              @click="previewMaterial(item, url)"
            />
          </view>
          <view v-else class="empty-material">未提交签到材料</view>

          <view v-if="canAudit(item)" class="card-bottom">
            <button class="audit-btn reject" @click="handleAudit(item, 2)">拒绝</button>
            <button class="audit-btn approve" @click="handleAudit(item, 1)">通过</button>
          </view>
        </view>

        <uni-load-more :status="loadMoreStatus" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { listJobSignAuditRecords, auditJobSignRecord } from '@/api/system/jobSignAudit'
import { listJobs } from '@/api/system/jobs'
import { requireAdminAccess } from '../access'
import {
  buildJobSignAuditActionLabel,
  buildJobSignAuditStatus,
  canAuditJobSignRecord,
  getJobSignAuditMaterialUrls,
} from '../job-sign-audit.helpers'

const { proxy } = getCurrentInstance()

const jobOptions = ref([])
const jobSearchKeyword = ref('')
const selectedJobId = ref(null)
const selectedJobLabel = ref('')
const records = ref([])
const loading = ref(false)
const pageNum = ref(1)
const total = ref(0)
const loadMoreStatus = ref('more')
const jobDropdownVisible = ref(false)
const jobActiveIndex = ref(-1)
let searchTimer = null

const PAGE_SIZE = 20

function validateAccess() {
  return requireAdminAccess(proxy)
}

onLoad(() => {
  validateAccess()
})

async function fetchJobOptions(keyword) {
  try {
    const params = {
      pageNum: 1,
      pageSize: 20,
      orderByColumn: 'work_date',
      isAsc: 'desc'
    }
    if (keyword) params.titleLike = keyword
    const res = await listJobs(params)
    const rows = res.rows || []
    jobOptions.value = rows.map(j => ({
      label: `${j.title} (${j.workDate || ''})`,
      value: j.id
    }))
    jobDropdownVisible.value = true
  } catch (e) {
    console.error('搜索岗位列表失败', e)
  }
}

function onJobSearch() {
  fetchJobOptions(jobSearchKeyword.value.trim())
}

function onJobFocus() {
  if (selectedJobId.value) return
  if (jobOptions.value.length > 0) {
    jobDropdownVisible.value = true
  } else {
    fetchJobOptions(jobSearchKeyword.value.trim())
  }
}

function onJobInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchJobOptions(jobSearchKeyword.value.trim())
  }, 300)
}

function closeJobDropdown() {
  jobDropdownVisible.value = false
}

function onSelectJob(index) {
  selectedJobId.value = jobOptions.value[index].value
  selectedJobLabel.value = jobOptions.value[index].label
  jobOptions.value = []
  jobDropdownVisible.value = false
  loadRecords(true)
}

function clearSelectedJob() {
  selectedJobId.value = null
  selectedJobLabel.value = ''
  records.value = []
  jobSearchKeyword.value = ''
  jobDropdownVisible.value = false
}

async function loadRecords(reset) {
  if (reset) {
    pageNum.value = 1
    records.value = []
  }
  if (!selectedJobId.value) return
  loading.value = true
  try {
    const res = await listJobSignAuditRecords({
      jobId: selectedJobId.value,
      pageNum: pageNum.value,
      pageSize: PAGE_SIZE
    })
    const rows = res.rows || []
    if (reset) {
      records.value = rows
    } else {
      records.value.push(...rows)
    }
    total.value = Number(res.total || 0)
    loadMoreStatus.value = records.value.length >= total.value ? 'noMore' : 'more'
  } catch (e) {
    console.error('加载签到审核列表失败', e)
  } finally {
    loading.value = false
  }
}

function loadMoreRecords() {
  if (loadMoreStatus.value === 'noMore') return
  pageNum.value++
  loadRecords(false)
}

function getStatus(item) {
  return buildJobSignAuditStatus(item)
}

function getMaterialUrls(item) {
  return getJobSignAuditMaterialUrls(item)
}

function canAudit(item) {
  return canAuditJobSignRecord(item)
}

function previewMaterial(item, current) {
  uni.previewImage({
    current,
    urls: getMaterialUrls(item)
  })
}

function handleAudit(item, auditStatus) {
  uni.showModal({
    title: '确认审核',
    content: `确定${buildJobSignAuditActionLabel(auditStatus)} ${item.userName || item.displayName || '该用户'} 的签到材料吗？`,
    confirmColor: auditStatus === 1 ? '#0f766e' : '#dc2626',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await auditJobSignRecord(item.id || item.recordId, auditStatus)
        proxy.$modal.showToast('审核成功')
        loadRecords(true)
      } catch (e) {
        if (e !== '500') {
          proxy.$modal.showToast('审核失败: ' + (e.message || e || '未知错误'))
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
