<template>
  <view class="panel">
    <view class="panel-head"><text class="panel-title">回访记录</text><button class="add-btn" size="mini" @click="openForm">新增回访</button></view>
    <view v-if="showForm" class="form-card">
      <view class="form-item"><text class="form-label">回访标题</text><input v-model="form.title" class="field-input" maxlength="200" placeholder="请输入回访标题" /></view>
      <view class="form-item"><text class="form-label">回访时间</text><view class="picker-row"><picker mode="date" :value="form.date" @change="setDate"><view class="picker-value">{{ form.date }}</view></picker><picker mode="time" :value="form.time" @change="setTime"><view class="picker-value">{{ form.time }}</view></picker></view></view>
      <view class="form-item"><text class="form-label">回访内容</text><textarea v-model="form.content" class="field-textarea" maxlength="4000" placeholder="请输入回访内容" auto-height /></view>
      <view class="form-actions"><button class="cancel-btn" size="mini" :disabled="saving" @click="closeForm">取消</button><button class="submit-btn" size="mini" :loading="saving" :disabled="saving" @click="submitRecord">保存</button></view>
    </view>
    <view v-if="loading" class="state-card"><uni-load-more status="loading" /></view>
    <view v-else-if="loadError" class="state-card"><text class="empty-text">回访记录加载失败</text><button class="retry-btn" size="mini" @click="loadRecords">重试</button></view>
    <view v-else-if="records.length === 0" class="state-card"><text class="empty-text">暂无回访记录</text></view>
    <view v-else class="record-list"><view v-for="record in records" :key="record.id" class="record-card"><view class="record-head"><text class="record-title">{{ record.title }}</text><text class="record-time">{{ record.followUpTime }}</text></view><text class="record-content">{{ record.content }}</text></view></view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { addStudentFollowUpRecord, listStudentFollowUpRecords } from '@/pages/mine/admin/_api/system/student'

defineOptions({ name: 'StudentFollowUpPanel' })

const props = defineProps({ studentId: { type: [Number, String], required: true } })
const records = ref([])
const loading = ref(false)
const loadError = ref(false)
const saving = ref(false)
const showForm = ref(false)
const form = ref(createFollowUpForm())

async function loadRecords() {
  if (loading.value) return
  loading.value = true
  loadError.value = false
  try {
    records.value = await listStudentFollowUpRecords(props.studentId)
  } catch (error) {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function openForm() {
  form.value = createFollowUpForm()
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

function setDate(event) {
  form.value.date = event.detail.value
}

function setTime(event) {
  form.value.time = event.detail.value
}

async function submitRecord() {
  const title = form.value.title.trim()
  const content = form.value.content.trim()
  if (!title || !content) {
    uni.showToast({ title: '请填写回访标题和内容', icon: 'none' })
    return
  }
  saving.value = true
  try {
    const res = await addStudentFollowUpRecord(props.studentId, { title, content, followUpTime: `${form.value.date} ${form.value.time}:00` })
    records.value = [res.data, ...records.value]
    closeForm()
    uni.showToast({ title: '新增成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.msg || '新增失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

function createFollowUpForm() {
  const now = new Date()
  return { title: '', content: '', date: formatDate(now), time: formatTime(now) }
}

function formatDate(date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((item) => String(item).padStart(2, '0')).join('-')
}

function formatTime(date) {
  return [date.getHours(), date.getMinutes()].map((item) => String(item).padStart(2, '0')).join(':')
}

onMounted(loadRecords)
</script>

<style lang="scss" scoped>
.panel { margin-top: 20rpx; }
.panel-head, .record-head, .form-actions { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
.panel-head, .form-card, .state-card, .record-list { padding: 28rpx; border-radius: 28rpx; background: #fff; box-shadow: 0 12rpx 36rpx rgba(15, 23, 42, .06); }
.panel-title { font-size: 34rpx; font-weight: 700; color: #201c34; }
.add-btn, .submit-btn, .retry-btn { margin: 0; border-radius: 999rpx; background: #7c6cff; color: #fff; }
.form-card, .state-card, .record-list { margin-top: 20rpx; }
.form-item + .form-item { margin-top: 22rpx; }
.form-label { display: block; margin-bottom: 12rpx; font-size: 27rpx; color: #64748b; }
.field-input, .field-textarea, .picker-value { box-sizing: border-box; border: 1rpx solid #ebe7f7; border-radius: 18rpx; background: #faf9ff; font-size: 28rpx; color: #201c34; }
.field-input, .picker-value { height: 82rpx; padding: 0 20rpx; }
.field-textarea { width: 100%; min-height: 160rpx; padding: 20rpx; line-height: 1.6; }
.picker-row { display: flex; gap: 16rpx; }
.picker-row picker { flex: 1; }
.picker-value { display: flex; align-items: center; }
.form-actions { margin-top: 26rpx; justify-content: flex-end; }
.cancel-btn { margin: 0; border-radius: 999rpx; color: #64748b; background: #f1f5f9; }
.state-card { display: flex; flex-direction: column; align-items: center; gap: 20rpx; }
.empty-text { font-size: 28rpx; color: #94a3b8; }
.record-card + .record-card { margin-top: 24rpx; padding-top: 24rpx; border-top: 1rpx solid #f0edf9; }
.record-title { flex: 1; font-size: 30rpx; font-weight: 600; color: #201c34; }
.record-time { flex: none; font-size: 23rpx; color: #94a3b8; }
.record-content { display: block; margin-top: 14rpx; font-size: 27rpx; line-height: 1.6; white-space: pre-wrap; color: #475569; }
</style>
