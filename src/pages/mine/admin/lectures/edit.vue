<template>
  <view class="lecture-edit-page">
    <view class="page-header"><view class="page-title">{{ form.id ? '编辑课程' : '新增课程' }}</view><view class="page-desc">课程名称匹配已有模板时，可自动带入课程配置。</view></view>
    <view class="edit-card">
      <view class="section-title">课程排期</view>
      <view class="field-label">课程名称</view>
      <input v-model="form.name" class="field-input" placeholder="请输入课程名称" @blur="applySelectedTemplate" />
      <view v-if="templates.length" class="template-row"><text class="template-label">已有模板</text><picker :range="templateNames" @change="selectTemplate"><view class="template-picker">选择模板自动填充 <uni-icons type="right" size="14" color="#8b87a3" /></view></picker></view>

      <view class="field-label">开课时间</view>
      <view class="date-row"><picker mode="date" :value="form.startDate" @change="setField('startDate', $event.detail.value)"><view class="picker-box">{{ form.startDate || '选择日期' }}</view></picker><picker mode="time" :value="form.startTime" @change="setField('startTime', $event.detail.value)"><view class="picker-box">{{ form.startTime || '选择时间' }}</view></picker></view>
      <view class="field-label">结束时间</view>
      <view class="date-row"><picker mode="date" :value="form.endDate" @change="setField('endDate', $event.detail.value)"><view class="picker-box">{{ form.endDate || '选择日期' }}</view></picker><picker mode="time" :value="form.endTime" @change="setField('endTime', $event.detail.value)"><view class="picker-box">{{ form.endTime || '选择时间' }}</view></picker></view>
      <view class="field-label">上课地址</view><input v-model="form.location" class="field-input" placeholder="请输入上课地址" />
      <view class="field-label">经纬度（选填）</view><input v-model="form.geo" class="field-input" placeholder="例如 118.80,32.05" />

      <view class="section-title spaced">课程配置</view>
      <view class="field-label">讲师 ID（选填）</view><input v-model="form.speaker" class="field-input" placeholder="多个 ID 用逗号分隔" />
      <view class="field-label">课程全价（选填）</view><input v-model="form.coursePrice" type="digit" class="field-input" placeholder="请输入课程全价" />
      <view class="field-label">报名费（选填）</view><input v-model="form.registrationFee" type="digit" class="field-input" placeholder="请输入报名费" />
      <view class="field-label">保证金（选填）</view><input v-model="form.deposit" type="digit" class="field-input" placeholder="请输入保证金" />
      <view class="switch-row"><text>是否需要学籍</text><switch :checked="form.requiresEnrollment" color="#5b4fd8" @change="form.requiresEnrollment = $event.detail.value" /></view>
      <view class="field-label">封面目录 ID（选填）</view><input v-model="form.coverId" type="number" class="field-input" placeholder="请输入已存在的封面目录 ID" />
      <image v-if="form.coverId && !coverFailed" class="cover-preview" :src="coverSrc" mode="aspectFill" @error="coverFailed = true" />
      <view class="field-label">课程详情（选填）</view><textarea v-model="form.detail" class="field-textarea" placeholder="请输入课程详情" />
    </view>
    <view class="submit-bar"><button class="submit-btn" :disabled="submitting" @click="handleSubmit">{{ submitting ? '保存中...' : '保存课程' }}</button></view>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import config from '@/config'
import { addLectures, getLectures, listLectureTemplates, updateLectures } from '@/api/system/lectures'
import { getLectureImageSrc } from '@/utils/lecture-cover'
import { requireAdminAccess } from '../access'
import { applyLectureTemplate, buildLecturePayload, createLectureForm, normalizeLectureForm, validateLecturePayload } from './helpers'

const { proxy } = getCurrentInstance()
const form = ref(createLectureForm())
const templates = ref([])
const submitting = ref(false)
const coverFailed = ref(false)
const templateNames = computed(() => templates.value.map(item => item.name || '未命名课程'))
const coverSrc = computed(() => getLectureImageSrc({ baseUrl: config.baseUrl, lecture: { id: form.value.id, coverId: form.value.coverId }, fileName: 'cover.webp' }))

function setField(field, value) { form.value[field] = value }
function applyTemplate(template) {
  if (!template) return
  form.value = applyLectureTemplate(form.value, template)
  coverFailed.value = false
  proxy.$modal.showToast('已应用课程模板')
}
function applySelectedTemplate() { applyTemplate(templates.value.find(item => item.name === form.value.name)) }
function selectTemplate(event) {
  const template = templates.value[Number(event.detail.value)]
  if (!template) return
  form.value.name = template.name || ''
  applyTemplate(template)
}
async function loadDetail(id) {
  const res = await getLectures(id)
  form.value = normalizeLectureForm(res.data || {})
}
async function handleSubmit() {
  if (submitting.value) return
  const payload = buildLecturePayload(form.value)
  const errorMessage = validateLecturePayload(payload)
  if (errorMessage) { uni.showToast({ title: errorMessage, icon: 'none' }); return }
  submitting.value = true
  try {
    if (form.value.id) await updateLectures(payload)
    else await addLectures(payload)
    proxy.$modal.msgSuccess('保存成功')
    setTimeout(() => uni.navigateBack(), 300)
  } finally { submitting.value = false }
}
onLoad(async (options) => {
  if (!requireAdminAccess(proxy)) return
  const tasks = [listLectureTemplates()]
  if (options?.id) tasks.push(getLectures(options.id))
  const results = await Promise.all(tasks)
  templates.value = Array.isArray(results[0]?.data) ? results[0].data : []
  if (options?.id) form.value = normalizeLectureForm(results[1]?.data || {})
})
</script>

<style lang="scss" scoped>
page { background: #f5f7ff; }.lecture-edit-page { min-height: 100vh; padding: 26rpx 24rpx 190rpx; background: #f5f7ff; }.page-header { margin-bottom: 22rpx; padding: 26rpx; border-radius: 24rpx; background: linear-gradient(135deg, rgba(124,108,255,.15), rgba(13,148,136,.1)); }.page-title { font-size: 38rpx; font-weight: 700; color: #241f3f; }.page-desc { margin-top: 10rpx; color: #6f6a86; font-size: 25rpx; line-height: 1.6; }.edit-card { padding: 28rpx 24rpx; border-radius: 24rpx; background: #fff; box-shadow: 0 12rpx 30rpx rgba(43,53,106,.08); }.section-title { font-size: 32rpx; font-weight: 700; color: #241f3f; }.spaced { margin-top: 44rpx; }.field-label { margin-top: 24rpx; font-size: 27rpx; color: #5f5a75; }.field-input, .field-textarea, .picker-box { box-sizing: border-box; width: 100%; margin-top: 12rpx; padding: 0 20rpx; border: 1px solid #e7e5f2; border-radius: 16rpx; background: #faf9ff; font-size: 28rpx; color: #241f3f; }.field-input, .picker-box { height: 84rpx; line-height: 84rpx; }.date-row { display: flex; gap: 16rpx; }.date-row picker { flex: 1; min-width: 0; }.picker-box { overflow: hidden; margin-top: 12rpx; white-space: nowrap; text-overflow: ellipsis; color: #5f5a75; }.template-row, .switch-row { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; margin-top: 18rpx; }.template-label { color: #77728a; font-size: 24rpx; }.template-picker { display: flex; align-items: center; gap: 8rpx; padding: 12rpx 0; color: #5b4fd8; font-size: 25rpx; }.switch-row { padding-top: 28rpx; color: #5f5a75; font-size: 28rpx; }.field-textarea { min-height: 200rpx; padding-top: 18rpx; line-height: 1.6; }.cover-preview { width: 100%; height: 260rpx; margin-top: 16rpx; border-radius: 18rpx; background: #f1f0fa; }.submit-bar { position: fixed; right: 0; bottom: 0; left: 0; padding: 20rpx 24rpx 36rpx; background: linear-gradient(180deg, transparent, #f5f7ff 30%); }.submit-btn { height: 88rpx; line-height: 88rpx; border: 0; border-radius: 999rpx; color: #fff; font-size: 30rpx; font-weight: 600; background: #5b4fd8; }.submit-btn[disabled] { opacity: .7; }
</style>
