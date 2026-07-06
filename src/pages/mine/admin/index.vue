<template>
  <scroll-view class="admin-container" scroll-y>
    <view v-if="!hasAdminAccess" class="bind-card">
      <view class="bind-title">管理员登录</view>
      <view class="bind-desc">请输入后台管理端账号密码登录管理后台。</view>
      <view class="bind-form">
        <input
          class="bind-input"
          :value="bindForm.username"
          placeholder="请输入管理员账号"
          @input="updateBindField('username', $event.detail.value)"
        />
        <input
          class="bind-input"
          :value="bindForm.password"
          password
          placeholder="请输入管理员密码"
          @input="updateBindField('password', $event.detail.value)"
        />
        <button class="bind-btn" :disabled="binding" @click="handleBindAdmin">登录并进入</button>
      </view>
    </view>

    <template v-else>
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
    </template>
  </scroll-view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getPendingTutorReviewCount } from '@/pages/mine/admin/_api/system/tutors'
import { adminLogin, getAdminInfo } from '@/pages/mine/admin/_api/system/auth'
import { setAdminToken, setAdminRoles } from '@/utils/auth'
import { isAdminUser } from './access'

const { proxy } = getCurrentInstance()
const pendingTutorReviewCount = ref(0)
const hasAdminAccess = ref(isAdminUser())
const binding = ref(false)
const bindForm = ref({
  username: '',
  password: ''
})

const pendingTutorReviewCountText = computed(() => {
  if (pendingTutorReviewCount.value > 99) {
    return '99+'
  }
  return String(pendingTutorReviewCount.value)
})

const actionItems = [
  {
    key: 'system-user',
    label: '系统用户',
    icon: 'staff-filled',
    iconColor: '#0f766e',
    onClick: handleSystemUser
  },
  {
    key: 'department',
    label: '部门管理',
    icon: 'folder-add-filled',
    iconColor: '#0d9488',
    onClick: handleDepartmentManagement
  },
  {
    key: 'tutor-review',
    label: '教员审核',
    icon: 'checkbox-filled',
    iconColor: '#0f766e',
    onClick: handleTutorReview
  },
  {
    key: 'job-sign-audit',
    label: '签到审核',
    icon: 'checkmarkempty',
    iconColor: '#0d9488',
    onClick: handleJobSignAudit
  },
  {
    key: 'parttime-whitelist',
    label: '兼职白名单',
    icon: 'personadd-filled',
    iconColor: '#0d9488',
    onClick: handleParttimeWhitelist
  },
  {
    key: 'merchant-user-type-whitelist',
    label: '商家白名单',
    icon: 'shop',
    iconColor: '#059669',
    onClick: handleMerchantUserTypeWhitelist
  },
  {
    key: 'student-management',
    label: '学员管理',
    icon: 'person-filled',
    iconColor: '#0ea5a4',
    onClick: handleStudentManagement
  },
  {
    key: 'personality-test',
    label: '性格测试',
    icon: 'paperplane-filled',
    iconColor: '#7c3aed',
    onClick: handlePersonalityTest
  },
  {
    key: 'tutoring-bindings',
    label: '家教订单',
    icon: 'person-filled',
    iconColor: '#0f766e',
    onClick: handleTutoringBindings
  },
  {
    key: 'tutoring-schedule-audit',
    label: '家教签到审核',
    icon: 'compose',
    iconColor: '#2563eb',
    onClick: handleTutoringScheduleAudit
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
    onClick: handleUnassignedStudents
  },
  {
    key: 'profit-survey',
    label: '问卷管理',
    icon: 'notification-filled',
    iconColor: '#10b981',
    onClick: handleSurveyManagement
  },
  {
    key: 'refund',
    label: '退款管理',
    icon: 'undo-filled',
    iconColor: '#0f9d8f',
    onClick: handleRefundManagement
  },
  {
    key: 'referral',
    label: '邀请管理',
    icon: 'flag-filled',
    iconColor: '#f59e0b',
    onClick: handleReferralManagement
  }
]

function handleSystemUser() {
  proxy.$tab.navigateTo('/pages/mine/admin/system-user/index')
}

function handleDepartmentManagement() {
  proxy.$tab.navigateTo('/pages/mine/admin/department/index')
}

function handleTutorReview() {
  proxy.$tab.navigateTo('/pages/mine/admin/tutor-review')
}

function handleJobSignAudit() {
  proxy.$tab.navigateTo('/pages/mine/admin/job-sign-audit/index')
}

function handleParttimeWhitelist() {
  proxy.$tab.navigateTo('/pages/mine/admin/parttime-whitelist/index')
}

function handleMerchantUserTypeWhitelist() {
  proxy.$tab.navigateTo('/pages/mine/admin/merchant-user-type-whitelist/index')
}

function handleStudentManagement() {
  proxy.$tab.navigateTo('/pages/mine/admin/student/index')
}

function handleUnassignedStudents() {
  proxy.$tab.navigateTo('/pages/mine/admin/student/index?assignmentStatus=unbound')
}

function handlePersonalityTest() {
  proxy.$tab.navigateTo('/pages/mine/admin/personality-test/index')
}

function handleSurveyManagement() {
  proxy.$tab.navigateTo('/pages/mine/admin/survey/index')
}

function handleTutoringBindings() {
  proxy.$tab.navigateTo('/pages/mine/admin/tutoring-bindings/index')
}

function handleTutoringScheduleAudit() {
  proxy.$tab.navigateTo('/pages/mine/admin/tutoring-schedule-audit/index')
}

function handleRefundManagement() {
  proxy.$tab.navigateTo('/pages/mine/admin/refund/index')
}

function handleReferralManagement() {
  proxy.$tab.navigateTo('/pages/mine/admin/referral/index')
}

function handleUnreadyFeature() {
  proxy.$modal.showToast('功能未开发')
}

function updateBindField(field, value) {
  bindForm.value = {
    ...bindForm.value,
    [field]: value
  }
}

function applyAdminSession(token, roles) {
  if (!token) {
    return false
  }
  setAdminToken(token)
  setAdminRoles(roles || [])
  hasAdminAccess.value = isAdminUser()
  return hasAdminAccess.value
}

async function handleBindAdmin() {
  if (!bindForm.value.username) {
    proxy.$modal.msgError('请输入管理员账号')
    return
  }
  if (!bindForm.value.password) {
    proxy.$modal.msgError('请输入管理员密码')
    return
  }
  binding.value = true
  proxy.$modal.loading('正在登录...')
  try {
    const loginRes = await adminLogin(bindForm.value.username, bindForm.value.password)
    const token = loginRes.token
    if (!token) {
      proxy.$modal.msgError('登录失败，未获取到 token')
      return
    }

    setAdminToken(token)

    const infoRes = await getAdminInfo()
    const roles = infoRes.roles || []

    if (!applyAdminSession(token, roles)) {
      proxy.$modal.msgError('登录成功，但未获取到管理员权限')
      return
    }
    bindForm.value = { username: '', password: '' }
    await loadPendingTutorReviewCount()
    proxy.$modal.showToast('登录成功')
  } catch (error) {
    setAdminToken('')
    setAdminRoles([])
    proxy.$modal.msgError(error?.msg || error?.message || '登录失败')
  } finally {
    binding.value = false
    proxy.$modal.closeLoading()
  }
}

async function validateAccess() {
  const isAccessGranted = isAdminUser()
  hasAdminAccess.value = isAccessGranted
  return isAccessGranted
}

async function loadPendingTutorReviewCount() {
  try {
    pendingTutorReviewCount.value = await getPendingTutorReviewCount()
  } catch (error) {
    console.error('加载教员审核待办数量失败', error)
  }
}

onLoad(async () => {
  if (await validateAccess()) {
    loadPendingTutorReviewCount()
  }
})

onShow(async () => {
  if (!await validateAccess()) {
    return
  }
  loadPendingTutorReviewCount()
})
</script>

<style lang="scss" scoped src="./index.scss"></style>
