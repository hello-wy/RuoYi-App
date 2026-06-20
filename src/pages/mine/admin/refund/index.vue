<template>
  <view class="refund-page">
    <view class="refund-header">
      <view class="header-title">退款管理</view>
      <view class="header-subtitle">管理兼职日结定金、沙龙活动与课程退款</view>
    </view>

    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'job' }"
        @click="switchTab('job')"
      >
        兼职日结
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'salon' }"
        @click="switchTab('salon')"
      >
        沙龙活动
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'course' }"
        @click="switchTab('course')"
      >
        课程订单
      </view>
    </view>

    <view v-if="activeTab === 'job'">
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

      <scroll-view class="scroll-area" scroll-y @scrolltolower="loadMoreJobOrders">
        <view v-if="!selectedJobId" class="state-box">
          <text class="state-text">请搜索并选择兼职岗位</text>
        </view>

        <view v-else-if="jobLoading && jobOrders.length === 0" class="state-box">
          <uni-load-more status="loading" />
        </view>

        <view v-else-if="jobOrders.length === 0" class="state-box">
          <text class="state-text">暂无订单</text>
        </view>

        <view v-else class="card-list">
          <view v-for="item in jobOrders" :key="item.orderNo" class="order-card">
            <view class="card-top">
              <text class="user-name">{{ item.userName || '未知用户' }}</text>
              <text v-if="item.status === 3" class="status-tag refunded">已退款</text>
              <text v-else class="status-tag" :class="getJobAuditStatus(item).type">{{ getJobAuditStatus(item).label }}</text>
            </view>

            <view class="info-list">
              <view class="info-row">
                <text class="info-label">金额</text>
                <text class="info-value">{{ item.amount }} 元</text>
              </view>
              <view class="info-row">
                <text class="info-label">支付时间</text>
                <text class="info-value">{{ item.payTime || '-' }}</text>
              </view>
              <view v-if="item.auditRemark" class="info-row">
                <text class="info-label">审核说明</text>
                <text class="info-value">{{ item.auditRemark }}</text>
              </view>
              <view v-if="item.refundTime" class="info-row">
                <text class="info-label">退款时间</text>
                <text class="info-value">{{ item.refundTime }}</text>
              </view>
            </view>

            <view class="card-bottom">
              <button
                v-if="item.status === 1 && canRefundJobOrder(item)"
                class="refund-btn"
                @click="handleJobRefund(item)"
              >
                退款
              </button>
            </view>
          </view>

          <uni-load-more :status="jobLoadMoreStatus" />
        </view>
      </scroll-view>
    </view>

    <view v-if="activeTab === 'salon'">
      <view class="search-bar">
        <input
          class="search-input"
          v-model="keyword"
          placeholder="输入订单号或姓名搜索"
          confirm-type="search"
          @confirm="onSearch"
        />
        <view class="search-btn" @click="onSearch">搜索</view>
      </view>

      <scroll-view class="scroll-area-with-search" scroll-y @scrolltolower="loadMoreSalonOrders">
        <view v-if="salonLoading && salonOrders.length === 0" class="state-box">
          <uni-load-more status="loading" />
        </view>

        <view v-else-if="salonOrders.length === 0" class="state-box">
          <text class="state-text">暂无订单</text>
        </view>

        <view v-else class="card-list">
          <view v-for="item in salonOrders" :key="item.orderNo" class="order-card">
            <view class="card-top">
              <text class="user-name">{{ item.title || '沙龙活动' }}</text>
              <text
                v-if="item.status === 'REFUNDED'"
                class="status-tag refunded"
              >
                已退款
              </text>
              <text
                v-else-if="item.status === 'REFUNDING'"
                class="status-tag refunding"
              >
                退款中
              </text>
              <text v-else class="status-tag paid">已支付</text>
            </view>

            <view class="info-list">
              <view class="info-row">
                <text class="info-label">订单号</text>
                <text class="info-value">{{ item.orderNo }}</text>
              </view>
              <view class="info-row">
                <text class="info-label">支付人</text>
                <text class="info-value">{{ item.userName || '-' }}</text>
              </view>
              <view class="info-row">
                <text class="info-label">金额</text>
                <text class="info-value">{{ item.amount }} 元</text>
              </view>
              <view class="info-row">
                <text class="info-label">支付时间</text>
                <text class="info-value">{{ item.payTime || '-' }}</text>
              </view>
              <view v-if="item.refundTime" class="info-row">
                <text class="info-label">退款时间</text>
                <text class="info-value">{{ item.refundTime }}</text>
              </view>
            </view>

            <view class="card-bottom">
              <button
                v-if="item.status === 'PAID'"
                class="refund-btn"
                @click="handleSalonRefund(item)"
              >
                退款
              </button>
            </view>
          </view>

          <uni-load-more :status="salonLoadMoreStatus" />
        </view>
      </scroll-view>
    </view>

    <view v-if="activeTab === 'course'">
      <view class="search-bar">
        <input
          class="search-input"
          v-model="courseKeyword"
          placeholder="输入课程、订单号或姓名搜索"
          confirm-type="search"
          @confirm="onCourseSearch"
        />
        <view class="search-btn" @click="onCourseSearch">搜索</view>
      </view>

      <scroll-view class="scroll-area-with-search" scroll-y @scrolltolower="loadMoreCourseOrders">
        <view v-if="courseLoading && courseOrders.length === 0" class="state-box">
          <uni-load-more status="loading" />
        </view>

        <view v-else-if="courseOrders.length === 0" class="state-box">
          <text class="state-text">暂无课程订单</text>
        </view>

        <view v-else class="card-list">
          <view v-for="item in courseOrders" :key="item.orderNo" class="order-card">
            <view class="card-top">
              <text class="user-name">{{ item.userName || item.name || '未知用户' }}</text>
              <text class="status-tag" :class="getCourseStatus(item.status).type">
                {{ getCourseStatus(item.status).label }}
              </text>
            </view>

            <view class="info-list">
              <view class="info-row">
                <text class="info-label">课程</text>
                <text class="info-value">{{ item.courseName || item.title || '-' }}</text>
              </view>
              <view class="info-row">
                <text class="info-label">订单号</text>
                <text class="info-value">{{ item.orderNo }}</text>
              </view>
              <view class="info-row">
                <text class="info-label">金额</text>
                <text class="info-value">{{ item.amount }} 元</text>
              </view>
              <view class="info-row">
                <text class="info-label">签到时间</text>
                <text class="info-value">{{ item.signTime || '-' }}</text>
              </view>
              <view v-if="item.refundTime" class="info-row">
                <text class="info-label">退款时间</text>
                <text class="info-value">{{ item.refundTime }}</text>
              </view>
            </view>

            <view class="card-bottom">
              <button
                v-if="Number(item.status) === 2"
                class="refund-btn"
                @click="handleCourseRefund(item)"
              >
                退款
              </button>
            </view>
          </view>

          <uni-load-more :status="courseLoadMoreStatus" />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { listJobs } from '@/pages/mine/admin/_api/system/jobs'
import {
  listCourseRefundOrders,
  listJobRefundOrders,
  listSalonRefundOrders,
  refundCourseOrder,
  refundJobOrder,
  refundSalonOrder
} from '@/pages/mine/admin/_api/system/refund'
import { buildAttendanceAuditStatus, canRefundJobOrder } from '@/pages/mine/admin/_utils/jobSchedule'
import { requireAdminAccess } from '../access'

const { proxy } = getCurrentInstance()

const activeTab = ref('job')
const keyword = ref('')

const jobOptions = ref([])
const jobSearchKeyword = ref('')
const selectedJobId = ref(null)
const selectedJobLabel = ref('')
const jobOrders = ref([])
const jobLoading = ref(false)
const jobPageNum = ref(1)
const jobTotal = ref(0)
const jobLoadMoreStatus = ref('more')
const jobDropdownVisible = ref(false)
const jobActiveIndex = ref(-1)
let searchTimer = null

const salonOrders = ref([])
const salonLoading = ref(false)
const salonPageNum = ref(1)
const salonTotal = ref(0)
const salonLoadMoreStatus = ref('more')
const courseKeyword = ref('')
const courseOrders = ref([])
const courseLoading = ref(false)
const coursePageNum = ref(1)
const courseTotal = ref(0)
const courseLoadMoreStatus = ref('more')

const PAGE_SIZE = 20

function validateAccess() {
  return requireAdminAccess(proxy)
}

onLoad(() => {
  if (!validateAccess()) {
    return
  }
  loadSalonOrders(true)
})

function getJobAuditStatus(item) {
  return buildAttendanceAuditStatus(item)
}

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
  loadJobOrders(true)
}

function clearSelectedJob() {
  selectedJobId.value = null
  selectedJobLabel.value = ''
  jobOrders.value = []
  jobSearchKeyword.value = ''
  jobDropdownVisible.value = false
}

function switchTab(tab) {
  if (activeTab.value === tab) return
  activeTab.value = tab
  if (tab === 'salon' && salonOrders.value.length === 0) {
    loadSalonOrders(true)
  }
  if (tab === 'course' && courseOrders.value.length === 0) {
    loadCourseOrders(true)
  }
}

function onSearch() {
  loadSalonOrders(true)
}

function onCourseSearch() {
  loadCourseOrders(true)
}

async function loadJobOrders(reset) {
  if (reset) {
    jobPageNum.value = 1
    jobOrders.value = []
  }
  if (!selectedJobId.value) return
  jobLoading.value = true
  try {
    const res = await listJobRefundOrders({
      jobId: selectedJobId.value,
      pageNum: jobPageNum.value,
      pageSize: PAGE_SIZE
    })
    const rows = res.rows || []
    if (reset) {
      jobOrders.value = rows
    } else {
      jobOrders.value.push(...rows)
    }
    jobTotal.value = Number(res.total || 0)
    jobLoadMoreStatus.value = jobOrders.value.length >= jobTotal.value ? 'noMore' : 'more'
  } catch (e) {
    console.error('加载兼职退款列表失败', e)
  } finally {
    jobLoading.value = false
  }
}

function loadMoreJobOrders() {
  if (jobLoadMoreStatus.value === 'noMore') return
  jobPageNum.value++
  loadJobOrders(false)
}

async function loadSalonOrders(reset) {
  if (reset) {
    salonPageNum.value = 1
    salonOrders.value = []
  }
  salonLoading.value = true
  try {
    const params = {
      pageNum: salonPageNum.value,
      pageSize: PAGE_SIZE
    }
    if (keyword.value.trim()) {
      params.keyword = keyword.value.trim()
    }
    const res = await listSalonRefundOrders(params)
    const rows = res.rows || []
    if (reset) {
      salonOrders.value = rows
    } else {
      salonOrders.value.push(...rows)
    }
    salonTotal.value = Number(res.total || 0)
    salonLoadMoreStatus.value = salonOrders.value.length >= salonTotal.value ? 'noMore' : 'more'
  } catch (e) {
    console.error('加载沙龙退款列表失败', e)
  } finally {
    salonLoading.value = false
  }
}

function loadMoreSalonOrders() {
  if (salonLoadMoreStatus.value === 'noMore') return
  salonPageNum.value++
  loadSalonOrders(false)
}

async function loadCourseOrders(reset) {
  if (reset) {
    coursePageNum.value = 1
    courseOrders.value = []
  }
  courseLoading.value = true
  try {
    const params = {
      pageNum: coursePageNum.value,
      pageSize: PAGE_SIZE
    }
    if (courseKeyword.value.trim()) params.keyword = courseKeyword.value.trim()
    const res = await listCourseRefundOrders(params)
    const rows = res.rows || []
    if (reset) {
      courseOrders.value = rows
    } else {
      courseOrders.value.push(...rows)
    }
    courseTotal.value = Number(res.total || 0)
    courseLoadMoreStatus.value = courseOrders.value.length >= courseTotal.value ? 'noMore' : 'more'
  } catch (e) {
    console.error('加载课程退款列表失败', e)
    proxy.$modal.showToast('加载课程退款列表失败')
  } finally {
    courseLoading.value = false
  }
}

function loadMoreCourseOrders() {
  if (courseLoadMoreStatus.value === 'noMore') return
  coursePageNum.value++
  loadCourseOrders(false)
}

function getCourseStatus(status) {
  const map = {
    0: { label: '待支付', type: 'pending' },
    1: { label: '已支付待签到', type: 'paid' },
    2: { label: '已签到', type: 'paid' },
    3: { label: '已退款', type: 'refunded' },
    4: { label: '已取消', type: 'refunding' }
  }
  return map[Number(status)] || { label: '未知状态', type: 'refunding' }
}

function handleJobRefund(item) {
  uni.showModal({
    title: '确认退款',
    content: `确定为 ${item.userName || '该用户'} 退款 ${item.amount} 元定金吗？`,
    confirmColor: '#0f766e',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await refundJobOrder(item.orderNo)
        proxy.$modal.showToast('退款成功')
        loadJobOrders(true)
      } catch (e) {
        if (e !== '500') {
          proxy.$modal.showToast('退款失败: ' + (e.message || e || '未知错误'))
        }
      }
    }
  })
}

function handleSalonRefund(item) {
  uni.showModal({
    title: '确认退款',
    content: `确定为该沙龙订单退款 ${item.amount} 元吗？`,
    confirmColor: '#0f766e',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await refundSalonOrder(item.orderNo)
        proxy.$modal.showToast('退款成功')
        loadSalonOrders(true)
      } catch (e) {
        if (e !== '500') {
          proxy.$modal.showToast('退款失败: ' + (e.message || e || '未知错误'))
        }
      }
    }
  })
}

function handleCourseRefund(item) {
  uni.showModal({
    title: '确认退款',
    content: `确定为 ${item.userName || item.name || '该用户'} 的课程订单退款 ${item.amount} 元吗？`,
    confirmColor: '#0f766e',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await refundCourseOrder(item.orderNo)
        proxy.$modal.showToast('退款成功')
        loadCourseOrders(true)
      } catch (e) {
        proxy.$modal.showToast('退款失败: ' + (e.message || e.msg || e || '未知错误'))
      }
    }
  })
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
