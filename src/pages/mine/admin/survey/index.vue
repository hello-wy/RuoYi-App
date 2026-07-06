<template>
  <view class="survey-page">
    <view class="summary-card">
      <view>
        <text class="summary-title">问卷管理</text>
        <text class="summary-subtitle">分发课程问卷并查看答题情况</text>
      </view>
      <view class="summary-count">
        <text class="count-value">{{ total }}</text>
        <text class="count-label">问卷数</text>
      </view>
    </view>

    <view class="filter-card">
      <view class="status-tabs">
        <view
          v-for="item in statusOptions"
          :key="item.key"
          class="status-tab"
          :class="{ active: status === item.value }"
          @click="switchStatus(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
      <view class="search-row">
        <view class="search-box">
          <uni-icons type="search" size="16" color="#94a3b8" />
          <input
            v-model="keyword"
            class="search-input"
            confirm-type="search"
            placeholder="搜索问卷标题"
            placeholder-class="search-placeholder"
            @confirm="handleSearch"
          />
        </view>
        <view class="search-btn" @click="handleSearch">搜索</view>
      </view>
    </view>

    <scroll-view
      class="survey-scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
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
        <text class="state-text">暂无问卷</text>
      </view>

      <view v-else class="survey-list">
        <view v-for="item in list" :key="item.formId" class="survey-card">
          <view class="card-top">
            <view class="card-main">
              <text class="survey-title">{{ item.title || '未命名问卷' }}</text>
            </view>
            <text class="status-tag" :class="Number(item.status) === 1 ? 'enabled' : 'disabled'">
              {{ Number(item.status) === 1 ? '启用' : '停用' }}
            </text>
          </view>

          <view class="stat-grid">
            <view class="stat-item">
              <text class="stat-value">{{ item.totalQuestions || 0 }}</text>
              <text class="stat-label">题数</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ item.sentCount || 0 }}</text>
              <text class="stat-label">发送</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ item.answeredCount || 0 }}</text>
              <text class="stat-label">作答</text>
            </view>
          </view>

          <view class="action-row">
            <button class="action-btn ghost" size="mini" @click="openContent(item)">内容</button>
            <button class="action-btn primary" size="mini" @click="openDistribute(item)">分发</button>
            <button class="action-btn ghost" size="mini" @click="openAssignments(item)">用户</button>
          </view>
        </view>

        <uni-load-more :status="loadMoreStatus" @clickLoadMore="loadMore" />
      </view>
    </scroll-view>

    <view v-if="contentVisible" class="dialog-overlay" @touchmove.stop.prevent>
      <view class="dialog-mask" @click="closePanels"></view>
      <view class="dialog-sheet">
        <view class="dialog-card">
          <view class="dialog-header">
            <view>
              <text class="dialog-title">问卷内容</text>
              <text class="dialog-subtitle">{{ currentSurvey.title || '' }}</text>
            </view>
            <view class="dialog-close" @click="closePanels">
              <uni-icons type="closeempty" size="18" color="#64748b" />
            </view>
          </view>
          <scroll-view class="panel-scroll" scroll-y>
            <text v-if="currentSurvey.description" class="survey-desc">{{ currentSurvey.description }}</text>
            <view v-for="question in currentSurvey.questions" :key="question.questionId" class="question-block">
              <view class="question-head">
                <text class="question-title">{{ question.questionNo }}. {{ question.content }}</text>
                <text class="type-tag">{{ getQuestionTypeLabel(question.questionType) }}</text>
              </view>
              <view v-if="question.options && question.options.length" class="option-list">
                <text v-for="option in question.options" :key="option.value" class="option-tag">{{ option.label }}</text>
              </view>
              <view v-if="question.children && question.children.length" class="child-list">
                <view v-for="child in question.children" :key="child.questionId" class="child-question">
                  <text class="child-title">{{ child.questionNo }}. {{ child.content }}</text>
                  <view class="option-list">
                    <text v-for="option in child.options" :key="option.value" class="option-tag">{{ option.label }}</text>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <view v-if="distributeVisible" class="dialog-overlay" @touchmove.stop.prevent>
      <view class="dialog-mask" @click="closePanels"></view>
      <view class="dialog-sheet">
        <view class="dialog-card">
          <view class="dialog-header">
            <view>
              <text class="dialog-title">分发问卷</text>
              <text class="dialog-subtitle">{{ currentSurvey.title || '' }}</text>
            </view>
            <view class="dialog-close" @click="closePanels">
              <uni-icons type="closeempty" size="18" color="#64748b" />
            </view>
          </view>

          <scroll-view class="panel-scroll" scroll-y>
            <view class="field-label">课程</view>
            <view class="search-row compact">
              <view class="search-box">
                <uni-icons type="search" size="16" color="#94a3b8" />
                <input v-model="lectureKeyword" class="search-input" placeholder="搜索课程" @confirm="searchLectures" />
              </view>
              <view class="search-btn" @click="searchLectures">搜索</view>
            </view>
            <view class="chip-list">
              <view
                v-for="item in lectureOptions"
                :key="item.id"
                class="select-chip"
                :class="{ active: distributeForm.lectureId === item.id }"
                @click="selectDistributeLecture(item)"
              >
                {{ item.name }}
              </view>
            </view>

            <view class="field-label with-space">用户</view>
            <view class="search-row compact">
              <view class="search-box">
                <uni-icons type="search" size="16" color="#94a3b8" />
                <input v-model="userKeyword" class="search-input" placeholder="手机号/真实姓名/昵称" @confirm="searchUsers(true)" />
              </view>
              <view class="search-btn" @click="searchUsers(true)">搜索</view>
            </view>
            <view v-if="userLoading && userList.length === 0" class="inner-state">
              <uni-load-more status="loading" />
            </view>
            <view v-else-if="userList.length === 0" class="inner-state">
              <text class="state-text">暂无用户</text>
            </view>
            <view v-else class="user-list">
              <view
                v-for="item in userList"
                :key="item.userInfoId"
                class="user-item"
                :class="{ active: isUserSelected(item.userInfoId) }"
                @click="toggleUser(item.userInfoId)"
              >
                <view>
                  <text class="user-name">{{ item.realName || item.userName || '未命名用户' }}</text>
                  <text class="user-meta">{{ item.phone || '未填写手机号' }}</text>
                </view>
                <uni-icons v-if="isUserSelected(item.userInfoId)" type="checkmarkempty" size="22" color="#0f766e" />
              </view>
              <button v-if="userList.length < userTotal" class="more-btn" size="mini" :disabled="userLoading" @click="searchUsers(false)">
                {{ userLoading ? '加载中...' : '加载更多用户' }}
              </button>
            </view>
          </scroll-view>

          <view class="dialog-btn-row">
            <button class="dialog-btn dialog-btn-secondary" @click="closePanels">取消</button>
            <button class="dialog-btn dialog-btn-primary" :disabled="submitting" @click="submitDistribute">
              {{ submitting ? '提交中...' : '确认分发' }}
            </button>
          </view>
        </view>
      </view>
    </view>

    <view v-if="assignmentVisible" class="dialog-overlay" @touchmove.stop.prevent>
      <view class="dialog-mask" @click="closePanels"></view>
      <view class="dialog-sheet tall">
        <view class="dialog-card">
          <view class="dialog-header">
            <view>
              <text class="dialog-title">分发用户</text>
              <text class="dialog-subtitle">{{ currentSurvey.title || '' }}</text>
            </view>
            <view class="dialog-close" @click="closePanels">
              <uni-icons type="closeempty" size="18" color="#64748b" />
            </view>
          </view>

          <view class="assignment-filter">
            <view class="search-row compact">
              <view class="search-box">
                <uni-icons type="search" size="16" color="#94a3b8" />
                <input v-model="assignmentQuery.keyword" class="search-input" placeholder="手机号/真实姓名/昵称" @confirm="loadAssignments(true)" />
              </view>
              <view class="search-btn" @click="loadAssignments(true)">搜索</view>
            </view>
            <view class="status-tabs small">
              <view
                v-for="item in assignmentStatusOptions"
                :key="item.key"
                class="status-tab"
                :class="{ active: assignmentQuery.status === item.value }"
                @click="switchAssignmentStatus(item.value)"
              >
                {{ item.label }}
              </view>
            </view>
            <view class="search-row compact">
              <view class="search-box">
                <uni-icons type="search" size="16" color="#94a3b8" />
                <input v-model="lectureKeyword" class="search-input" placeholder="搜索课程筛选" @confirm="searchLectures" />
              </view>
              <view class="search-btn" @click="searchLectures">搜索</view>
            </view>
            <view class="chip-list one-line">
              <view class="select-chip" :class="{ active: !assignmentQuery.lectureId }" @click="selectAssignmentLecture(null)">全部课程</view>
              <view
                v-for="item in lectureOptions"
                :key="item.id"
                class="select-chip"
                :class="{ active: assignmentQuery.lectureId === item.id }"
                @click="selectAssignmentLecture(item)"
              >
                {{ item.name }}
              </view>
            </view>
          </view>

          <scroll-view class="assignment-scroll" scroll-y @scrolltolower="loadMoreAssignments">
            <view v-if="assignmentLoading && assignmentList.length === 0" class="inner-state">
              <uni-load-more status="loading" />
            </view>
            <view v-else-if="assignmentList.length === 0" class="inner-state">
              <text class="state-text">暂无分发用户</text>
            </view>
            <view v-else class="assignment-list">
              <view v-for="item in assignmentList" :key="item.assignmentId" class="assignment-item" @click="goAssignmentDetail(item)">
                <view class="assignment-top">
                  <view>
                    <text class="user-name">{{ item.realName || item.userName || '未命名用户' }}</text>
                    <text class="user-meta">{{ item.phone || '未填写手机号' }}</text>
                  </view>
                  <text class="status-tag" :class="Number(item.status) === 1 ? 'enabled' : 'progress'">{{ item.statusLabel || getAssignmentStatusLabel(item.status) }}</text>
                </view>
                <view class="info-row">
                  <text class="info-label">课程</text>
                  <text class="info-value">{{ item.courseName || '--' }}</text>
                </view>
                <view class="info-row">
                  <text class="info-label">分发</text>
                  <text class="info-value">{{ item.assignedAt || '--' }}</text>
                </view>
                <view class="info-row">
                  <text class="info-label">提交</text>
                  <text class="info-value">{{ item.submittedAt || '--' }}</text>
                </view>
              </view>
              <uni-load-more :status="assignmentLoadMoreStatus" @clickLoadMore="loadMoreAssignments" />
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { distributeSurvey, getSurvey, listSurvey, listSurveyAssignments, listSurveyLectures, searchSurveyUsers } from '@/pages/mine/admin/_api/system/survey'
import { requireAdminAccess } from '../access'

const PAGE_SIZE = 10
const USER_PAGE_SIZE = 10
const ASSIGNMENT_PAGE_SIZE = 10

export default {
  data() {
    return {
      keyword: '',
      status: null,
      statusOptions: [
        { key: 'all', label: '全部', value: null },
        { key: 'enabled', label: '启用', value: 1 },
        { key: 'disabled', label: '停用', value: 0 }
      ],
      list: [],
      total: 0,
      pageNum: 1,
      loading: false,
      refreshing: false,
      finished: false,
      loadError: false,
      currentSurvey: {},
      contentVisible: false,
      distributeVisible: false,
      assignmentVisible: false,
      lectureKeyword: '',
      lectureOptions: [],
      lectureLoading: false,
      distributeForm: { lectureId: null, userInfoIds: [] },
      userKeyword: '',
      userList: [],
      userTotal: 0,
      userPageNum: 1,
      userLoading: false,
      submitting: false,
      assignmentQuery: { lectureId: null, status: null, keyword: '', pageNum: 1 },
      assignmentStatusOptions: [
        { key: 'all', label: '全部', value: null },
        { key: 'todo', label: '未提交', value: 0 },
        { key: 'done', label: '已提交', value: 1 }
      ],
      assignmentList: [],
      assignmentTotal: 0,
      assignmentLoading: false,
      assignmentFinished: false
    }
  },
  computed: {
    loadMoreStatus() {
      if (this.loading && this.list.length > 0) return 'loading'
      return this.finished ? 'noMore' : 'more'
    },
    assignmentLoadMoreStatus() {
      if (this.assignmentLoading && this.assignmentList.length > 0) return 'loading'
      return this.assignmentFinished ? 'noMore' : 'more'
    }
  },
  onLoad() {
    if (!requireAdminAccess(this)) return
    this.loadList(true)
  },
  onPullDownRefresh() {
    this.onRefresh()
  },
  methods: {
    async loadList(reset = false) {
      if (this.loading) return
      if (reset) {
        this.pageNum = 1
        this.list = []
        this.total = 0
        this.finished = false
        this.loadError = false
      }
      this.loading = true
      try {
        const params = {
          pageNum: this.pageNum,
          pageSize: PAGE_SIZE,
          title: this.keyword || undefined,
          status: this.status === null ? undefined : this.status
        }
        const res = await listSurvey(params)
        const rows = Array.isArray(res?.rows) ? res.rows : []
        this.list = reset ? rows : this.list.concat(rows)
        this.total = Number(res?.total || 0)
        this.finished = this.list.length >= this.total || rows.length === 0
        this.pageNum += 1
      } catch (error) {
        this.loadError = true
        console.error('加载问卷列表失败', error)
      } finally {
        this.loading = false
        this.refreshing = false
        uni.stopPullDownRefresh()
      }
    },
    handleSearch() {
      this.loadList(true)
    },
    switchStatus(status) {
      if (this.status === status) return
      this.status = status
      this.loadList(true)
    },
    onRefresh() {
      this.refreshing = true
      this.loadList(true)
    },
    loadMore() {
      if (!this.loading && !this.finished) this.loadList(false)
    },
    async openContent(row) {
      this.currentSurvey = await getSurvey(row.formId)
      this.contentVisible = true
    },
    async openDistribute(row) {
      this.currentSurvey = await getSurvey(row.formId)
      this.distributeForm = { lectureId: null, userInfoIds: [] }
      this.userKeyword = ''
      this.userList = []
      this.userTotal = 0
      this.userPageNum = 1
      this.distributeVisible = true
      this.searchLectures()
    },
    openAssignments(row) {
      this.currentSurvey = row
      this.assignmentQuery = { lectureId: null, status: null, keyword: '', pageNum: 1 }
      this.assignmentList = []
      this.assignmentTotal = 0
      this.assignmentFinished = false
      this.assignmentVisible = true
      this.searchLectures()
      this.loadAssignments(true)
    },
    closePanels() {
      this.contentVisible = false
      this.distributeVisible = false
      this.assignmentVisible = false
    },
    async searchLectures() {
      this.lectureLoading = true
      try {
        const res = await listSurveyLectures({ pageNum: 1, pageSize: 20, name: this.lectureKeyword || undefined })
        this.lectureOptions = res.rows || []
      } finally {
        this.lectureLoading = false
      }
    },
    selectDistributeLecture(item) {
      this.distributeForm.lectureId = item.id
    },
    selectAssignmentLecture(item) {
      this.assignmentQuery.lectureId = item ? item.id : null
      this.loadAssignments(true)
    },
    isUserSelected(userInfoId) {
      return this.distributeForm.userInfoIds.includes(userInfoId)
    },
    toggleUser(userInfoId) {
      const list = this.distributeForm.userInfoIds
      const index = list.indexOf(userInfoId)
      if (index >= 0) {
        list.splice(index, 1)
      } else {
        list.push(userInfoId)
      }
    },
    async searchUsers(reset = true) {
      if (this.userLoading) return
      if (reset) {
        this.userPageNum = 1
        this.userList = []
        this.userTotal = 0
      }
      this.userLoading = true
      try {
        const res = await searchSurveyUsers({
          pageNum: this.userPageNum,
          pageSize: USER_PAGE_SIZE,
          keyword: this.userKeyword || undefined
        })
        const rows = Array.isArray(res?.rows) ? res.rows : []
        this.userList = reset ? rows : this.userList.concat(rows)
        this.userTotal = Number(res?.total || 0)
        this.userPageNum += 1
      } finally {
        this.userLoading = false
      }
    },
    async submitDistribute() {
      if (!this.distributeForm.lectureId) {
        uni.showToast({ title: '请选择课程', icon: 'none' })
        return
      }
      if (!this.distributeForm.userInfoIds.length) {
        uni.showToast({ title: '请选择用户', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        const res = await distributeSurvey(this.currentSurvey.formId, this.distributeForm)
        const data = res?.data || {}
        uni.showToast({ title: `新增${data.createdCount || 0}人，跳过${data.skippedCount || 0}人`, icon: 'none' })
        this.distributeVisible = false
        this.loadList(true)
      } finally {
        this.submitting = false
      }
    },
    switchAssignmentStatus(status) {
      if (this.assignmentQuery.status === status) return
      this.assignmentQuery.status = status
      this.loadAssignments(true)
    },
    async loadAssignments(reset = false) {
      if (this.assignmentLoading || !this.currentSurvey.formId) return
      if (reset) {
        this.assignmentQuery.pageNum = 1
        this.assignmentList = []
        this.assignmentTotal = 0
        this.assignmentFinished = false
      }
      this.assignmentLoading = true
      try {
        const params = {
          pageNum: this.assignmentQuery.pageNum,
          pageSize: ASSIGNMENT_PAGE_SIZE,
          lectureId: this.assignmentQuery.lectureId || undefined,
          status: this.assignmentQuery.status === null ? undefined : this.assignmentQuery.status,
          keyword: this.assignmentQuery.keyword || undefined
        }
        const res = await listSurveyAssignments(this.currentSurvey.formId, params)
        const rows = Array.isArray(res?.rows) ? res.rows : []
        this.assignmentList = reset ? rows : this.assignmentList.concat(rows)
        this.assignmentTotal = Number(res?.total || 0)
        this.assignmentFinished = this.assignmentList.length >= this.assignmentTotal || rows.length === 0
        this.assignmentQuery.pageNum += 1
      } finally {
        this.assignmentLoading = false
      }
    },
    loadMoreAssignments() {
      if (!this.assignmentLoading && !this.assignmentFinished) this.loadAssignments(false)
    },
    goAssignmentDetail(item) {
      if (!item.assignmentId) return
      uni.navigateTo({ url: '/pages/mine/admin/survey/detail?assignmentId=' + item.assignmentId })
    },
    getAssignmentStatusLabel(status) {
      return Number(status) === 1 ? '已提交' : '未提交'
    },
    getQuestionTypeLabel(type) {
      const labels = {
        single: '单选',
        multiple: '多选',
        text: '文本',
        matrix_single: '矩阵'
      }
      return labels[type] || type || '题目'
    }
  }
}
</script>

<style lang="scss" scoped>
page {
  background: #f3fbf8;
}

.survey-page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f3fbf8;
  box-sizing: border-box;
}

.summary-card,
.filter-card,
.survey-card,
.state-box,
.dialog-card {
  border-radius: 28rpx;
  background: #fff;
  box-shadow: 0 14rpx 36rpx rgba(14, 148, 136, 0.08);
}

.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding: 34rpx 28rpx;
  background: #dff7f0;
}

.summary-title {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
  color: #0f766e;
}

.summary-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #5f857f;
}

.summary-count {
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.count-value {
  font-size: 44rpx;
  font-weight: 700;
  color: #0f766e;
}

.count-label {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #5f857f;
}

.filter-card {
  margin-top: 22rpx;
  padding: 24rpx;
}

.status-tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 18rpx;
}

.status-tabs.small {
  margin-top: 16rpx;
}

.status-tab {
  flex: 1;
  padding: 18rpx 0;
  border-radius: 999rpx;
  text-align: center;
  font-size: 26rpx;
  color: #5f857f;
  background: #f8fafc;
}

.status-tab.active {
  color: #fff;
  background: #0f766e;
  font-weight: 700;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.search-row.compact {
  margin-top: 12rpx;
}

.search-box {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
  height: 76rpx;
  padding: 0 20rpx;
  background: #fff;
  border-radius: 999rpx;
}

.search-row.compact .search-box {
  background: #f8fafc;
}

.search-input {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: #1f2937;
}

.search-placeholder {
  color: #94a3b8;
}

.search-btn {
  height: 76rpx;
  line-height: 76rpx;
  padding: 0 30rpx;
  border-radius: 999rpx;
  background: #0f766e;
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
}

.survey-scroll {
  height: calc(100vh - 390rpx);
  margin-top: 22rpx;
}

.survey-list,
.assignment-list,
.user-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-bottom: 40rpx;
}

.survey-card,
.assignment-item {
  padding: 26rpx 24rpx;
  border: 1rpx solid #d7f1eb;
}

.card-top,
.assignment-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.card-main {
  flex: 1;
  min-width: 0;
}

.survey-title,
.user-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
}

.user-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #64748b;
  word-break: break-all;
}

.status-tag,
.type-tag {
  flex-shrink: 0;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.status-tag.enabled {
  color: #16a34a;
  background: #dcfce7;
}

.status-tag.disabled {
  color: #64748b;
  background: #f1f5f9;
}

.status-tag.progress {
  color: #d97706;
  background: #fef3c7;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
  margin-top: 24rpx;
}

.stat-item {
  padding: 18rpx 10rpx;
  border-radius: 18rpx;
  background: #f8fafc;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #0f766e;
}

.stat-label {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #64748b;
}

.action-row,
.dialog-btn-row {
  display: flex;
  gap: 14rpx;
  margin-top: 22rpx;
}

.action-btn,
.dialog-btn,
.more-btn {
  margin: 0;
  border-radius: 999rpx;
  font-size: 26rpx;
}

.action-btn {
  flex: 1;
  height: 64rpx;
  line-height: 64rpx;
}

.action-btn.primary,
.dialog-btn-primary {
  background: #0f766e;
  color: #fff;
}

.action-btn.ghost,
.dialog-btn-secondary {
  background: #ecfdf5;
  color: #0f766e;
}

.state-box,
.inner-state {
  padding: 90rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.inner-state {
  padding: 50rpx 24rpx;
}

.state-text {
  font-size: 28rpx;
  color: #5f857f;
}

.retry-btn {
  margin-top: 20rpx;
}

.dialog-overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 99;
}

.dialog-mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
}

.dialog-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 82vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.dialog-sheet.tall {
  max-height: 90vh;
}

.dialog-card {
  padding: 26rpx 24rpx;
}

.dialog-sheet.tall .dialog-card {
  height: calc(90vh - 48rpx);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.dialog-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #0f172a;
}

.dialog-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #64748b;
}

.dialog-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-scroll {
  max-height: 58vh;
}

.assignment-scroll {
  flex: 1;
  min-height: 320rpx;
  margin-top: 16rpx;
}

.survey-desc {
  display: block;
  margin-bottom: 18rpx;
  font-size: 26rpx;
  color: #64748b;
  line-height: 1.6;
}

.question-block {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
}

.question-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.question-title,
.child-title {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.5;
}

.type-tag,
.option-tag {
  color: #0f766e;
  background: #ecfdf5;
}

.option-list,
.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 14rpx;
}

.chip-list.one-line {
  max-height: 128rpx;
  overflow: hidden;
}

.option-tag,
.select-chip {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
}

.select-chip {
  max-width: 100%;
  color: #64748b;
  background: #f1f5f9;
}

.select-chip.active {
  color: #fff;
  background: #0f766e;
}

.child-list {
  margin-top: 16rpx;
  padding-left: 18rpx;
  border-left: 4rpx solid #d7f1eb;
}

.child-question {
  margin-bottom: 14rpx;
}

.field-label {
  font-size: 28rpx;
  font-weight: 700;
  color: #0f172a;
}

.field-label.with-space {
  margin-top: 24rpx;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background: #f8fafc;
  border: 2rpx solid transparent;
}

.user-item.active {
  border-color: #0f766e;
  background: #ecfdf5;
}

.more-btn {
  height: 60rpx;
  line-height: 60rpx;
  color: #0f766e;
  background: #ecfdf5;
}

.dialog-btn-row {
  padding-top: 18rpx;
}

.dialog-btn {
  flex: 1;
  height: 76rpx;
  line-height: 76rpx;
}

.info-row {
  display: flex;
  gap: 18rpx;
  margin-top: 12rpx;
}

.info-label {
  width: 72rpx;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #94a3b8;
}

.info-value {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #334155;
  word-break: break-all;
}
</style>
