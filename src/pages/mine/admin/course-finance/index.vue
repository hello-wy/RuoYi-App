<template>
  <view class="finance-page">
    <view class="actions-card">
      <view><view class="page-title">课程财务流水</view><view class="page-subtitle">收入与提现均需关联课程、用户和员工</view></view>
      <button v-if="canCreateManual" class="primary-btn" size="mini" @click="openForm">新增记录</button>
    </view>

    <scroll-view class="list-scroll" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="refresh" @scrolltolower="loadMore">
      <view v-if="loading && !records.length" class="state-box"><uni-load-more status="loading" /></view>
      <view v-else-if="!records.length" class="state-box">暂无课程财务记录</view>
      <view v-else class="record-list">
        <view v-for="item in records" :key="item.id" class="record-card">
          <view class="card-top"><text class="record-type">{{ recordType(item.recordType) }}</text><text :class="item.recordType === 'WITHDRAWAL' ? 'withdrawal' : 'income'">¥{{ money(item.amount) }}</text></view>
          <view class="course-name">{{ item.courseName || '课程已删除' }}</view>
          <view class="card-row"><text>{{ item.wxminiUserName || '未命名用户' }} {{ item.wxminiUserPhone || '' }}</text><text>{{ item.employeeName || '未命名员工' }} {{ item.employeePhone || '' }}</text></view>
          <view class="card-row muted"><text>{{ item.occurredAt || '-' }}</text><text>{{ item.reason || '' }}</text></view>
        </view>
        <uni-load-more :status="loadMoreStatus" />
      </view>
    </scroll-view>

    <view v-if="formVisible" class="dialog-overlay" @touchmove.stop.prevent>
      <view class="dialog-mask" @click="closeForm"></view>
      <view class="dialog-sheet">
        <view class="dialog-card">
          <view class="dialog-header"><view><view class="dialog-title">新增课程财务记录</view><view class="dialog-subtitle">提现将扣减所选员工可用返现</view></view><view class="dialog-close" @click="closeForm"><uni-icons type="closeempty" size="18" color="#64748b" /></view></view>
          <scroll-view class="form-scroll" scroll-y>
            <view class="field-label">记录类型</view>
            <picker :range="types" range-key="label" @change="form.recordType = types[$event.detail.value].value"><view class="picker-input">{{ selectedTypeLabel }}</view></picker>

            <view class="field-label">课程</view>
            <RemoteSearchSelect v-model="courseKeyword" :options="courseOptions" :loading="courseSearching" placeholder="输入课程名称检索" empty-text="暂无匹配课程" @input="form.course = null" @search="searchCourses" @select="selectCourse" @clear="form.course = null" />

            <view class="field-label">微信用户</view>
            <RemoteSearchSelect v-model="wxminiUserKeyword" :options="wxminiUserOptions" :loading="wxminiUserSearching" placeholder="姓名或手机号检索" empty-text="暂无匹配用户" @input="form.wxminiUser = null" @search="searchWxminiUsers" @select="selectWxminiUser" @clear="form.wxminiUser = null" />

            <view class="field-label">员工</view>
            <RemoteSearchSelect v-model="employeeKeyword" :options="employeeOptions" :loading="employeeSearching" placeholder="姓名或手机号检索" empty-text="暂无匹配员工" @input="form.employee = null" @search="searchEmployees" @select="selectEmployee" @clear="form.employee = null" />

            <view class="field-label">金额{{ form.course ? `（不超过 ¥${money(form.course.coursePrice)}）` : '' }}</view>
            <input v-model="form.amount" class="text-input" type="digit" placeholder="请输入金额" />
            <view class="field-label">原因</view>
            <input v-model="form.reason" class="text-input" placeholder="请输入原因" />
          </scroll-view>
          <view class="dialog-btn-row"><button class="dialog-btn secondary" :disabled="submitting" @click="closeForm">取消</button><button class="dialog-btn primary" :disabled="submitting" @click="submitForm">{{ submitting ? '保存中...' : '保存' }}</button></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import RemoteSearchSelect from '@/components/RemoteSearchSelect/RemoteSearchSelect.vue'
import { getAdminRoles } from '@/utils/auth'
import { listLectures } from '@/api/system/lectures'
import { listMiniUsers } from '../_api/system/miniUser'
import { listSystemUsers } from '../_api/system/user'
import { requireAdminAccess } from '../access'
import { createCourseFinanceManualRecord, listCourseFinanceManualRecords } from '../_api/system/courseFinance'

const { proxy } = getCurrentInstance()
const PAGE_SIZE = 20
const roles = getAdminRoles()
const canCreateManual = roles.includes('admin') || roles.includes('national_general_manager')
const records = ref([])
const total = ref(0)
const pageNum = ref(1)
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const formVisible = ref(false)
const submitting = ref(false)
const courseKeyword = ref('')
const wxminiUserKeyword = ref('')
const employeeKeyword = ref('')
const courseOptions = ref([])
const wxminiUserOptions = ref([])
const employeeOptions = ref([])
const courseSearching = ref(false)
const wxminiUserSearching = ref(false)
const employeeSearching = ref(false)
let courseRequest = 0
let wxminiUserRequest = 0
let employeeRequest = 0
const types = [{ label: '收入', value: 'INCOME' }, { label: '提现', value: 'WITHDRAWAL' }]
const emptyForm = () => ({ recordType: 'INCOME', course: null, wxminiUser: null, employee: null, amount: '', reason: '' })
const form = ref(emptyForm())

const selectedTypeLabel = computed(() => types.find(item => item.value === form.value.recordType)?.label || '请选择类型')
const loadMoreStatus = computed(() => loading.value && records.value.length ? 'loading' : (finished.value ? 'noMore' : 'more'))
function money(value) { return Number(value || 0).toFixed(2) }
function recordType(value) { return value === 'WITHDRAWAL' ? '提现' : '收入' }
function employeeLabel(item) { return item.nickName || item.userName || '未命名员工' }
function selectCourse(option) { form.value.course = option.raw }
function selectWxminiUser(option) { form.value.wxminiUser = option.raw }
function selectEmployee(option) { form.value.employee = option.raw }
function openForm() { form.value = emptyForm(); courseKeyword.value = ''; wxminiUserKeyword.value = ''; employeeKeyword.value = ''; courseOptions.value = []; wxminiUserOptions.value = []; employeeOptions.value = []; formVisible.value = true }
function closeForm() { if (!submitting.value) formVisible.value = false }

async function searchCourses(keyword = courseKeyword.value.trim()) {
  const requestId = ++courseRequest
  courseSearching.value = true
  try {
    const res = await listLectures({ pageNum: 1, pageSize: 20, name: keyword || undefined })
    if (requestId === courseRequest) courseOptions.value = (Array.isArray(res?.rows) ? res.rows : []).map(item => ({ label: `${item.name}（售价 ¥${money(item.coursePrice)}）`, value: item.id, raw: item }))
  } catch (error) { if (requestId === courseRequest) proxy.$modal.showToast(error?.msg || '课程搜索失败') } finally { if (requestId === courseRequest) courseSearching.value = false }
}
async function searchWxminiUsers(keyword = wxminiUserKeyword.value.trim()) {
  const requestId = ++wxminiUserRequest
  wxminiUserSearching.value = true
  try {
    const result = await listMiniUsers({ pageNum: 1, pageSize: 20, keyword: keyword || undefined })
    if (requestId === wxminiUserRequest) wxminiUserOptions.value = result.rows.map(item => ({ label: `${item.displayName} ${item.phone || ''}`.trim(), value: item.userId, raw: item }))
  } catch (error) { if (requestId === wxminiUserRequest) proxy.$modal.showToast(error?.msg || '用户搜索失败') } finally { if (requestId === wxminiUserRequest) wxminiUserSearching.value = false }
}
async function searchEmployees(keyword = employeeKeyword.value.trim()) {
  const requestId = ++employeeRequest
  employeeSearching.value = true
  try {
    const res = await listSystemUsers({ pageNum: 1, pageSize: 20, userName: keyword || undefined, phonenumber: keyword || undefined })
    if (requestId === employeeRequest) employeeOptions.value = (Array.isArray(res?.rows) ? res.rows : []).map(item => ({ label: `${employeeLabel(item)} ${item.phonenumber || ''}`.trim(), value: item.userId, raw: item }))
  } catch (error) { if (requestId === employeeRequest) proxy.$modal.showToast(error?.msg || '员工搜索失败') } finally { if (requestId === employeeRequest) employeeSearching.value = false }
}
async function loadRecords(reset = false) {
  if (loading.value || (!reset && finished.value)) return
  if (reset) { pageNum.value = 1; records.value = []; finished.value = false }
  loading.value = true
  try {
    const result = await listCourseFinanceManualRecords({ pageNum: pageNum.value, pageSize: PAGE_SIZE })
    records.value.push(...result.rows)
    total.value = result.total
    finished.value = records.value.length >= total.value || result.rows.length < PAGE_SIZE
    if (!finished.value) pageNum.value++
  } catch (error) { proxy.$modal.showToast(error?.msg || '加载财务记录失败') } finally { loading.value = false; refreshing.value = false }
}
function refresh() { refreshing.value = true; loadRecords(true) }
function loadMore() { loadRecords() }
async function submitForm() {
  const amount = Number(form.value.amount)
  if (!form.value.course || !form.value.wxminiUser?.userId || !form.value.employee?.userId || !amount || amount <= 0 || !form.value.reason.trim()) return proxy.$modal.showToast('请完整填写课程、用户、员工、金额和原因')
  if (amount > Number(form.value.course.coursePrice || 0)) return proxy.$modal.showToast('金额不能超过课程售价')
  submitting.value = true
  try {
    await createCourseFinanceManualRecord({ recordType: form.value.recordType, courseId: form.value.course.id, wxminiUserId: form.value.wxminiUser.userId, employeeUserId: form.value.employee.userId, amount, reason: form.value.reason.trim() })
    formVisible.value = false
    proxy.$modal.showToast('财务记录已保存')
    loadRecords(true)
  } catch (error) { proxy.$modal.showToast(error?.msg || '保存失败') } finally { submitting.value = false }
}

onLoad(async () => { if (requireAdminAccess(proxy)) await loadRecords(true) })
</script>

<style lang="scss" scoped>
.finance-page { min-height: 100vh; padding: 20rpx; box-sizing: border-box; background: #f1f5f9; }.actions-card,.record-card { margin-bottom: 20rpx; padding: 24rpx; box-sizing: border-box; border-radius: 16rpx; background: #fff; }.actions-card,.card-top,.card-row,.search-row,.option-item,.dialog-header,.dialog-btn-row { display:flex; align-items:center; justify-content:space-between; gap:16rpx; }.page-title,.dialog-title { color:#0f172a;font-size:30rpx;font-weight:600; }.page-subtitle,.dialog-subtitle,.muted { margin-top:8rpx;color:#94a3b8;font-size:22rpx; }.primary-btn,.minor-btn { margin:0; }.primary-btn,.dialog-btn.primary { color:#fff;background:#0f766e; }.list-scroll { height:calc(100vh - 190rpx); }.state-box { padding:80rpx 0;text-align:center;color:#94a3b8; }.record-type { font-size:29rpx;font-weight:600;color:#0f172a; }.income { color:#0f766e;font-size:30rpx;font-weight:600; }.withdrawal { color:#dc2626;font-size:30rpx;font-weight:600; }.course-name { margin-top:16rpx;color:#334155;font-size:27rpx; }.card-row { margin-top:10rpx;color:#64748b;font-size:23rpx; }.dialog-overlay { position:fixed;z-index:99;inset:0; }.dialog-mask { position:absolute;inset:0;background:rgba(15,23,42,.48); }.dialog-sheet { position:absolute;right:0;bottom:0;left:0; }.dialog-card { max-height:90vh;padding:28rpx;border-radius:28rpx 28rpx 0 0;background:#fff; }.dialog-close { padding:8rpx; }.form-scroll { max-height:1120rpx;margin-top:20rpx; }.field-label { margin:22rpx 0 12rpx;color:#334155;font-size:25rpx;font-weight:600; }.search-row { padding:0 14rpx;border:1rpx solid #e2e8f0;border-radius:10rpx;background:#f8fafc; }.search-input,.text-input,.picker-input { min-height:72rpx;flex:1;font-size:26rpx; }.search-btn { color:#0f766e;font-size:25rpx; }.picker-input,.text-input { display:flex;align-items:center;padding:0 18rpx;box-sizing:border-box;border:1rpx solid #e2e8f0;border-radius:10rpx;background:#f8fafc; }.selected-item { margin-top:12rpx;padding:14rpx;border-radius:8rpx;background:#ecfdf5;color:#047857;font-size:24rpx; }.option-item { margin-top:10rpx;padding:16rpx;border-bottom:1rpx solid #f1f5f9;color:#475569;font-size:24rpx; }.option-item.active { color:#0f766e;background:#f0fdfa; }.dialog-btn-row { margin-top:24rpx; }.dialog-btn { flex:1;margin:0; }.secondary { color:#334155;background:#e2e8f0; }
</style>
