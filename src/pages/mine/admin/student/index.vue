<template>
  <view class="student-page">
    <view class="summary-wrap">
      <view class="summary-stat">
        <text class="summary-side-value">{{ boundTotal }}</text>
        <text class="summary-side-label">已绑定数量</text>
      </view>
      <view class="summary-main">
        <view class="summary-circle">
          <text class="summary-value">{{ allTotal }}</text>
        </view>
        <text class="summary-label">全部学员数</text>
      </view>
      <view class="summary-stat">
        <text class="summary-side-value">{{ unboundTotal }}</text>
        <text class="summary-side-label">未绑定数量</text>
      </view>
    </view>

    <view class="manage-card">
      <view class="manage-head">
        <view class="manage-title-wrap">
          <text class="toolbar-title">学员管理</text>
          <text class="toolbar-subtitle">共 {{ total }} 位学员</text>
        </view>
      </view>

      <view class="filter-card">
        <view class="assignment-tabs">
          <view
            v-for="item in assignmentOptions"
            :key="item.value"
            class="assignment-chip"
            :class="{ active: assignmentStatus === item.value }"
            @click="selectAssignmentStatus(item.value)"
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
              placeholder="搜索学员姓名/手机号"
              placeholder-class="search-placeholder"
              @confirm="handleSearch"
            />
          </view>
          <view class="search-btn" @click="handleSearch">搜索</view>
        </view>
      </view>

      <scroll-view
        class="student-scroll"
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
          <text class="state-text">{{ emptyText }}</text>
        </view>

        <view v-else class="student-list">
          <view
            v-for="item in list"
            :key="item.id"
            class="student-card"
            @click="goDetail(item.id)"
          >
            <view class="student-main">
              <view class="student-top">
                <view class="student-info">
                  <view class="student-title-row">
                    <text class="student-name">{{ item.displayName || getStudentDisplayName(item) || '未命名用户' }}</text>
                    <text class="assignment-tag" :class="item.bound ? 'bound' : 'unbound'">{{ item.bound ? '已绑定' : '未绑定' }}</text>
                  </view>
                  <text class="student-meta">实名：{{ item.realName || getStudentRealName(item) || '未填写' }}</text>
                  <text class="student-meta">手机号：{{ item.phone || '未填写' }}</text>
                </view>
                <view class="card-right">
                  <view class="card-type-row">
                    <text class="type-tag">{{ item.userTypeLabel || getUserTypeText(item.userType) }}</text>
                    <uni-icons type="right" size="16" color="#cbd5e1" />
                  </view>
                  <view class="action-row">
                    <button
                      v-if="item.canBind"
                      class="action-btn primary"
                      size="mini"
                      @click.stop="openBindPanel(item)"
                    >
                      {{ item.bound ? '改绑' : '绑定' }}
                    </button>
                    <button
                      v-if="item.canClaim"
                      class="action-btn ghost"
                      size="mini"
                      :disabled="claimingId === item.id"
                      @click.stop="confirmSelfClaim(item)"
                    >
                      {{ claimingId === item.id ? '认领中' : '自认领' }}
                    </button>
                  </view>
                </view>
              </view>
              <view v-if="isSuperAdmin" class="info-block">
                <view class="info-line">
                  <text class="info-label">归属部门</text>
                  <text class="info-value">{{ item.ownerDeptName || '未分配' }}</text>
                </view>
                <view class="info-line">
                  <text class="info-label">绑定员工</text>
                  <text class="info-value">{{ formatBoundStaff(item) }}</text>
                </view>
                <view v-if="item.boundDeptName || item.boundUserAdminLevelLabel" class="info-line">
                  <text class="info-label">员工信息</text>
                  <text class="info-value">{{ formatBoundStaffMeta(item) }}</text>
                </view>
              </view>
            </view>
          </view>

          <uni-load-more :status="loadMoreStatus" @clickLoadMore="loadMore" />
        </view>
      </scroll-view>
    </view>

    <view v-if="bindPanelVisible" class="dialog-overlay" @touchmove.stop.prevent>
      <view class="dialog-mask" @click="closeBindPanel"></view>
      <view class="dialog-sheet">
        <view class="dialog-card">
          <view class="dialog-header">
            <view>
              <text class="dialog-title">{{ bindPanelTitle }}</text>
              <text class="dialog-subtitle">{{ bindPanelSubtitle }}</text>
            </view>
            <view class="dialog-close" @click="closeBindPanel">
              <uni-icons type="closeempty" size="18" color="#64748b" />
            </view>
          </view>

          <view class="candidate-search-row">
            <view class="candidate-search-box">
              <uni-icons type="search" size="16" color="#94a3b8" />
              <input
                v-model="candidateKeyword"
                class="search-input"
                confirm-type="search"
                placeholder="搜索员工手机号/昵称"
                placeholder-class="search-placeholder"
                @confirm="searchCandidates(true)"
              />
            </view>
            <view class="candidate-search-btn" @click="searchCandidates(true)">搜索</view>
          </view>

          <view v-if="candidateLoading && candidates.length === 0" class="candidate-state">
            <uni-load-more status="loading" />
          </view>
          <view v-else-if="candidates.length === 0" class="candidate-state">
            <text class="state-text">暂无可绑定员工</text>
          </view>
          <scroll-view v-else class="candidate-list" scroll-y>
            <view
              v-for="item in candidates"
              :key="item.sysUserId"
              class="candidate-item"
              :class="{ active: selectedCandidate && selectedCandidate.sysUserId === item.sysUserId }"
              @click="selectCandidate(item)"
            >
              <view class="candidate-main">
                <text class="candidate-name">{{ item.displayName }}</text>
                <text class="candidate-phone">{{ item.phone || '未填写手机号' }}</text>
                <view class="candidate-meta">
                  <text class="level-tag">{{ item.adminLevelLabel }}</text>
                  <text class="dept-text">{{ item.deptName || '未分配部门' }}</text>
                </view>
              </view>
              <uni-icons
                v-if="selectedCandidate && selectedCandidate.sysUserId === item.sysUserId"
                type="checkmarkempty"
                size="22"
                color="#0f766e"
              />
            </view>
          </scroll-view>

          <view class="dialog-btn-row">
            <button class="dialog-btn dialog-btn-secondary" @click="closeBindPanel">取消</button>
            <button
              class="dialog-btn dialog-btn-primary"
              :disabled="binding || !selectedCandidate"
              @click="confirmBind"
            >
              {{ binding ? '提交中...' : '确认绑定' }}
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { bindStudentStaff, listStudents, searchStudentStaffCandidates } from '@/pages/mine/admin/_api/system/student'
import { getAdminRoles } from '@/utils/auth'
import { requireAdminAccess } from '../access'
import { createInitialListState, getStudentDisplayName, getStudentRealName, getUserTypeText } from './helpers'

const PAGE_SIZE = 10
const CANDIDATE_PAGE_SIZE = 20
const ASSIGNMENT_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '已绑定', value: 'bound' },
  { label: '未绑定', value: 'unbound' }
]

export default {
  data() {
    return {
      ...createInitialListState(),
      refreshing: false,
      assignmentOptions: ASSIGNMENT_OPTIONS,
      bindPanelVisible: false,
      currentStudent: null,
      candidateKeyword: '',
      candidates: [],
      candidateLoading: false,
      selectedCandidate: null,
      binding: false,
      claimingId: ''
    }
  },
  computed: {
    loadMoreStatus() {
      if (this.loading && this.list.length > 0) {
        return 'loading'
      }
      return this.finished ? 'noMore' : 'more'
    },
    isSuperAdmin() {
      return getAdminRoles().includes('admin')
    },
    emptyText() {
      if (this.keyword) {
        return '未搜索到相关学员'
      }
      if (this.assignmentStatus === 'bound') {
        return '暂无已绑定学员'
      }
      if (this.assignmentStatus === 'unbound') {
        return '暂无未绑定学员'
      }
      return '暂无学员数据'
    },
    bindPanelTitle() {
      return this.currentStudent?.bound ? '改绑负责员工' : '绑定负责员工'
    },
    bindPanelSubtitle() {
      return this.currentStudent?.displayName || this.currentStudent?.realName || '当前学员'
    }
  },
  onLoad(options = {}) {
    if (!requireAdminAccess(this)) {
      return
    }
    this.pageSize = PAGE_SIZE
    if (['all', 'bound', 'unbound'].includes(options.assignmentStatus)) {
      this.assignmentStatus = options.assignmentStatus
    }
    this.loadList(true)
  },
  onPullDownRefresh() {
    this.onRefresh()
  },
  methods: {
    getUserTypeText,
    getStudentDisplayName,
    getStudentRealName,
    buildKeywordParams() {
      const keyword = (this.keyword || '').trim()
      if (!keyword) {
        return {}
      }
      const digits = keyword.replace(/[\s-]/g, '')
      if (/^\d{3,}$/.test(digits)) {
        return { phone: digits }
      }
      return { realName: keyword }
    },
    buildListParams() {
      return {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        ...this.buildKeywordParams(),
        assignmentStatus: this.assignmentStatus || 'all'
      }
    },
    async loadList(reset = false) {
      if (this.loading) {
        return
      }
      if (reset) {
        this.pageNum = 1
        this.list = []
        this.total = 0
        this.finished = false
        this.loadError = false
      }
      this.loading = true
      try {
        const res = await listStudents(this.buildListParams())
        const rows = Array.isArray(res.rows) ? res.rows : []
        this.list = reset ? rows : this.list.concat(rows)
        this.total = Number(res.total || 0)
        if (reset) {
          await this.loadSummaryTotals()
        }
        const hasMore = this.list.length < this.total && rows.length > 0
        this.finished = !hasMore
        this.pageNum += 1
        this.loadError = false
      } catch (error) {
        this.loadError = true
      } finally {
        this.loading = false
        this.refreshing = false
        uni.stopPullDownRefresh()
      }
    },
    async loadSummaryTotals() {
      const baseParams = {
        pageNum: 1,
        pageSize: 1,
        ...this.buildKeywordParams()
      }
      try {
        const [allRes, boundRes, unboundRes] = await Promise.all([
          listStudents({ ...baseParams, assignmentStatus: 'all' }),
          listStudents({ ...baseParams, assignmentStatus: 'bound' }),
          listStudents({ ...baseParams, assignmentStatus: 'unbound' })
        ])
        this.allTotal = Number(allRes.total || 0)
        this.boundTotal = Number(boundRes.total || 0)
        this.unboundTotal = Number(unboundRes.total || 0)
      } catch (error) {
        this.allTotal = this.assignmentStatus === 'all' ? this.total : this.allTotal
        this.boundTotal = this.assignmentStatus === 'bound' ? this.total : this.boundTotal
        this.unboundTotal = this.assignmentStatus === 'unbound' ? this.total : this.unboundTotal
      }
    },
    handleSearch() {
      this.loadList(true)
    },
    selectAssignmentStatus(value) {
      if (this.assignmentStatus === value) {
        return
      }
      this.assignmentStatus = value
      this.loadList(true)
    },
    onRefresh() {
      this.refreshing = true
      this.loadList(true)
    },
    loadMore() {
      if (this.loading || this.finished) {
        return
      }
      this.loadList(false)
    },
    goDetail(id) {
      uni.navigateTo({ url: '/pages/mine/admin/student/detail?id=' + id })
    },
    formatBoundStaff(item) {
      if (!item.bound) {
        return '未绑定'
      }
      const name = item.boundUserDisplayName || item.boundUserName || item.boundUserNickName || item.boundUserPhone
      const phone = item.boundUserPhone && item.boundUserPhone !== name ? `（${item.boundUserPhone}）` : ''
      return `${name || '未命名员工'}${phone}`
    },
    formatBoundStaffMeta(item) {
      return [item.boundUserAdminLevelLabel, item.boundDeptName].filter(Boolean).join(' / ') || '-'
    },
    openBindPanel(item) {
      this.currentStudent = item
      this.candidateKeyword = item.boundUserPhone || item.boundUserName || ''
      this.candidates = []
      this.selectedCandidate = null
      this.bindPanelVisible = true
      this.searchCandidates(true)
    },
    closeBindPanel() {
      if (this.binding) return
      this.bindPanelVisible = false
      this.currentStudent = null
      this.selectedCandidate = null
      this.candidates = []
      this.candidateKeyword = ''
    },
    async searchCandidates(reset = false) {
      if (this.candidateLoading) {
        return
      }
      if (reset) {
        this.candidates = []
        this.selectedCandidate = null
      }
      this.candidateLoading = true
      try {
        const res = await searchStudentStaffCandidates({
          pageNum: 1,
          pageSize: CANDIDATE_PAGE_SIZE,
          keyword: this.candidateKeyword || undefined
        })
        this.candidates = Array.isArray(res.rows) ? res.rows : []
      } catch (error) {
        this.candidates = []
        uni.showToast({ title: error?.msg || error?.message || '加载员工失败', icon: 'none' })
      } finally {
        this.candidateLoading = false
      }
    },
    selectCandidate(item) {
      this.selectedCandidate = item
    },
    async confirmBind() {
      if (!this.currentStudent || !this.selectedCandidate) {
        return
      }
      this.binding = true
      try {
        await bindStudentStaff(this.currentStudent.id, this.selectedCandidate.sysUserId)
        uni.showToast({ title: '绑定成功', icon: 'success' })
        this.bindPanelVisible = false
        this.currentStudent = null
        this.selectedCandidate = null
        this.candidates = []
        this.candidateKeyword = ''
        await this.loadList(true)
      } catch (error) {
        uni.showToast({ title: error?.msg || error?.message || '绑定失败', icon: 'none' })
      } finally {
        this.binding = false
      }
    },
    confirmSelfClaim(item) {
      uni.showModal({
        title: '自认领学员',
        content: `确认认领 ${item.displayName || item.realName || '该学员'} 吗？`,
        confirmColor: '#0f766e',
        success: async ({ confirm }) => {
          if (!confirm) return
          await this.selfClaim(item)
        }
      })
    },
    async selfClaim(item) {
      this.claimingId = item.id
      try {
        await bindStudentStaff(item.id)
        uni.showToast({ title: '认领成功', icon: 'success' })
        await this.loadList(true)
      } catch (error) {
        uni.showToast({ title: error?.msg || error?.message || '认领失败', icon: 'none' })
      } finally {
        this.claimingId = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
