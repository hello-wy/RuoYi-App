<template>
  <scroll-view class="admin-container" scroll-y>
    <view class="admin-header">
      <view class="admin-title">管理后台</view>
      <view class="admin-subtitle">请选择要处理的运营事项</view>
    </view>

    <view class="admin-grid">
      <view
        v-for="item in actionItems"
        :key="item.key"
        class="admin-action"
        @click="item.onClick"
      >
        <text v-if="item.key === 'tutor-review' && pendingTutorReviewCount > 0" class="action-badge">
          {{ pendingTutorReviewCountText }}
        </text>
        <view class="action-icon">
          <uni-icons :type="item.icon" size="30" :color="item.iconColor" />
        </view>
        <text class="action-label">{{ item.label }}</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getPendingTutorReviewCount } from '@/api/system/tutors'
import { requireAdminAccess } from './access'

const { proxy } = getCurrentInstance()
const pendingTutorReviewCount = ref(0)

const pendingTutorReviewCountText = computed(() => {
  if (pendingTutorReviewCount.value > 99) {
    return '99+'
  }
  return String(pendingTutorReviewCount.value)
})

const actionItems = [
  {
    key: 'tutor-review',
    label: '教员审核',
    icon: 'checkbox-filled',
    iconColor: '#0f766e',
    onClick: handleTutorReview
  },
  {
    key: 'student-management',
    label: '学员管理',
    icon: 'person-filled',
    iconColor: '#0ea5a4',
    onClick: handleStudentManagement
  },
  {
    key: 'follow-up',
    label: '回访管理',
    icon: 'chatboxes-filled',
    iconColor: '#14b8a6',
    onClick: handleUnreadyFeature
  },
  {
    key: 'unassigned-students',
    label: '查看未分配学员',
    icon: 'search',
    iconColor: '#059669',
    onClick: handleUnreadyFeature
  },
  {
    key: 'profit-survey',
    label: '盈利问卷提醒',
    icon: 'notification-filled',
    iconColor: '#10b981',
    onClick: handleUnreadyFeature
  },
  {
    key: 'placeholder',
    label: '占位入口',
    icon: 'paperclip',
    iconColor: '#0f9d8f',
    onClick: handleUnreadyFeature
  }
]

function handleTutorReview() {
  proxy.$tab.navigateTo('/pages/mine/admin/tutor-review')
}

function handleStudentManagement() {
  proxy.$tab.navigateTo('/pages/mine/admin/student/index')
}

function handleUnreadyFeature() {
  proxy.$modal.showToast('功能未开发')
}

function validateAccess() {
  return requireAdminAccess(proxy)
}

async function loadPendingTutorReviewCount() {
  try {
    pendingTutorReviewCount.value = await getPendingTutorReviewCount()
  } catch (error) {
    console.error('加载教员审核待办数量失败', error)
  }
}

onLoad(() => {
  validateAccess()
})

onShow(() => {
  if (!validateAccess()) {
    return
  }
  loadPendingTutorReviewCount()
})
</script>

<style lang="scss" scoped src="./index.scss"></style>
