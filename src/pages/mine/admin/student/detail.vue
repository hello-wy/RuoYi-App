<template>
  <scroll-view class="detail-page" scroll-y>
    <view class="hero-card">
      <text class="hero-name">{{ displayName }}</text>
      <text class="hero-type">{{ getUserTypeText(detail.userType) }}</text>
    </view>

    <view class="tab-card">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </view>
    </view>

    <view v-if="activeTab === 'basic'" class="profile-card">
      <view
        v-for="item in fieldList"
        :key="item.key"
        class="info-row"
        :class="{ 'is-multiline': item.multiline }"
      >
        <text class="info-label">{{ item.label }}</text>
        <text class="info-value" :class="{ multiline: item.multiline }">{{ formatValue(item.value) }}</text>
      </view>
    </view>

    <view v-else class="empty-card">
      <text class="empty-text">暂无内容</text>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStudentDetail } from '@/pages/mine/admin/_api/system/student'
import { buildProfileFields, getDisplayName, getUserTypeText } from './helpers'

const detail = ref({})
const activeTab = ref('basic')
const tabs = [
  { key: 'basic', label: '基本信息' },
  { key: 'school', label: '学籍信息' },
  { key: 'study', label: '学习情况' },
  { key: 'visit', label: '学员回访' },
  { key: 'profit', label: '盈利问卷' },
  { key: 'situation', label: '学员情况' }
]

const displayName = computed(() => getDisplayName(detail.value))
const fieldList = computed(() => buildProfileFields(detail.value))

async function loadDetail(id) {
  try {
    const res = await getStudentDetail(id)
    detail.value = res.data || {}
  } catch (error) {
    uni.showToast({ title: '学员详情不存在', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack({ delta: 1 })
    }, 600)
  }
}

function formatValue(value) {
  return value === null || value === undefined || value === '' ? '--' : value
}

onLoad((options) => {
  if (!options?.id) {
    uni.showToast({ title: '学员参数缺失', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack({ delta: 1 })
    }, 600)
    return
  }
  loadDetail(options.id)
})
</script>

<style lang="scss" scoped src="./detail.scss"></style>
