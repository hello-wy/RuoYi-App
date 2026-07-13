<template>
  <view class="note-page">
    <view class="note-header">
      <view>
        <text class="note-title">课程笔记</text>
        <text class="note-subtitle">记录每一门已报名课程的学习心得</text>
      </view>
      <view class="create-button" @click="openCreateForm">
        <uni-icons type="plusempty" size="17" color="#ffffff" />
        <text>新建笔记</text>
      </view>
    </view>

    <scroll-view scroll-y class="note-scroll" refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="refreshNotes">
      <view v-if="loading" class="state-wrap">
        <uni-load-more status="loading" />
      </view>
      <view v-else-if="notes.length === 0" class="state-wrap empty-state">
        <uni-icons type="compose" size="48" color="#9BBAB3" />
        <text class="empty-title">还没有课程笔记</text>
        <text class="empty-text">点击右上角，为已报名课程记录学习收获</text>
      </view>
      <view v-else class="note-list">
        <view v-for="note in notes" :key="note.id" class="note-card">
          <view class="note-card-header">
            <view class="course-tag">
              <uni-icons type="calendar-filled" size="14" color="#0F9D8F" />
              <text>{{ note.courseName }}</text>
            </view>
            <text class="note-time">{{ formatTime(note.updateTime) }}</text>
          </view>
          <text class="note-content">{{ note.content }}</text>
          <view class="note-actions">
            <text class="note-action" @click="openEditForm(note)">编辑</text>
            <text class="note-action danger" @click="confirmDelete(note)">删除</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="formVisible" class="form-overlay" @touchmove.stop.prevent>
      <view class="form-mask" @click="closeForm" />
      <view class="form-sheet">
        <view class="form-header">
          <text class="form-title">{{ formTitle }}</text>
          <uni-icons type="closeempty" size="22" color="#64748B" @click="closeForm" />
        </view>
        <view class="form-field">
          <text class="field-label">关联课程</text>
          <picker :range="courseNames" :value="selectedCourseIndex" :disabled="isEditing" @change="changeCourse">
            <view class="course-picker" :class="{ disabled: isEditing }">
              <text>{{ selectedCourseName }}</text>
              <uni-icons type="right" size="15" color="#94A3B8" />
            </view>
          </picker>
        </view>
        <view class="form-field">
          <view class="content-label-row">
            <text class="field-label">笔记内容</text>
            <text class="content-count">{{ contentLength }}/{{ maxContentLength }}</text>
          </view>
          <textarea
            v-model="formContent"
            class="note-textarea"
            :maxlength="maxContentLength"
            placeholder="请输入纯文本笔记内容"
            placeholder-class="textarea-placeholder"
            auto-height
          />
        </view>
        <view class="form-actions">
          <view class="form-button secondary" @click="closeForm">取消</view>
          <view class="form-button primary" :class="{ disabled: !canSubmit || saving }" @click="saveNote">
            {{ saving ? '保存中' : '保存' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { listMyCourseOrders } from '@/api/wxmini/coursePay'
import {
  createMyCourseNote,
  deleteMyCourseNote,
  listMyCourseNotes,
  updateMyCourseNote
} from '@/api/wxmini/courseNote'
import {
  extractNoteCourses,
  isCourseNoteContentValid,
  MAX_COURSE_NOTE_LENGTH
} from './index.helpers'

const notes = ref([])
const courses = ref([])
const loading = ref(false)
const refreshing = ref(false)
const formVisible = ref(false)
const saving = ref(false)
const editingNoteId = ref(null)
const selectedCourseIndex = ref(0)
const formContent = ref('')

const maxContentLength = MAX_COURSE_NOTE_LENGTH
const isEditing = computed(() => editingNoteId.value !== null)
const formTitle = computed(() => (isEditing.value ? '编辑课程笔记' : '新建课程笔记'))
const courseNames = computed(() => courses.value.map(course => course.name))
const selectedCourse = computed(() => courses.value[selectedCourseIndex.value] || null)
const selectedCourseName = computed(() => selectedCourse.value?.name || '请选择课程')
const contentLength = computed(() => formContent.value.length)
const canSubmit = computed(() => Boolean(selectedCourse.value) && isCourseNoteContentValid(formContent.value))

onShow(loadData)

async function loadData() {
  loading.value = true
  try {
    const [noteList, orders] = await Promise.all([listMyCourseNotes(), listMyCourseOrders()])
    notes.value = noteList
    courses.value = extractNoteCourses(orders)
  } catch (error) {
    console.error('加载课程笔记失败', error)
    uni.showToast({ title: error?.msg || '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function refreshNotes() {
  refreshing.value = true
  await loadData()
  refreshing.value = false
}

function openCreateForm() {
  if (courses.value.length === 0) {
    uni.showToast({ title: '暂无已报名课程可记录笔记', icon: 'none' })
    return
  }
  editingNoteId.value = null
  selectedCourseIndex.value = 0
  formContent.value = ''
  formVisible.value = true
}

function openEditForm(note) {
  editingNoteId.value = note.id
  const index = courses.value.findIndex(course => String(course.id) === String(note.courseId))
  selectedCourseIndex.value = index >= 0 ? index : 0
  formContent.value = note.content
  formVisible.value = true
}

function closeForm() {
  if (saving.value) return
  formVisible.value = false
}

function changeCourse(event) {
  selectedCourseIndex.value = Number(event.detail.value)
}

async function saveNote() {
  if (!canSubmit.value || saving.value) return
  saving.value = true
  try {
    const content = formContent.value.trim()
    const note = isEditing.value
      ? await updateMyCourseNote(editingNoteId.value, { content })
      : await createMyCourseNote({ courseId: selectedCourse.value.id, content })
    replaceNote(note)
    formVisible.value = false
    uni.showToast({ title: '已保存', icon: 'success' })
  } catch (error) {
    console.error('保存课程笔记失败', error)
    uni.showToast({ title: error?.msg || '保存失败，请重试', icon: 'none' })
  } finally {
    saving.value = false
  }
}

function replaceNote(note) {
  const index = notes.value.findIndex(item => String(item.id) === String(note.id))
  if (index < 0) {
    notes.value = [note, ...notes.value]
    return
  }
  notes.value = notes.value.map(item => (String(item.id) === String(note.id) ? note : item))
}

function confirmDelete(note) {
  uni.showModal({
    title: '删除笔记',
    content: '删除后无法恢复，确定删除吗？',
    success: result => {
      if (result.confirm) deleteNote(note.id)
    }
  })
}

async function deleteNote(noteId) {
  try {
    await deleteMyCourseNote(noteId)
    notes.value = notes.value.filter(note => String(note.id) !== String(noteId))
    uni.showToast({ title: '已删除', icon: 'success' })
  } catch (error) {
    console.error('删除课程笔记失败', error)
    uni.showToast({ title: error?.msg || '删除失败，请重试', icon: 'none' })
  }
}

function formatTime(value) {
  if (!value) return ''
  return String(value).replace(/:00$/, '')
}
</script>

<style lang="scss" src="./index.scss"></style>
