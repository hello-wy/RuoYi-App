import request from '@/utils/request'

const TUTORING_STATUS_WAIT_SETTLEMENT = 2

export function bindTutor(parentId, tutorId) {
  return request({
    url: '/system/tutoring-admin/bindings',
    adminAuth: true,
    method: 'post',
    params: { parentId, tutorId }
  })
}

export function listTutoringSchedules(query = {}) {
  return request({
    url: '/system/tutoring-admin/schedules/list',
    adminAuth: true,
    method: 'get',
    params: query
  })
}

export function auditTutoringSchedule(scheduleId, data = {}) {
  return request({
    url: `/system/tutoring-admin/schedules/${scheduleId}/audit`,
    adminAuth: true,
    method: 'post',
    data: {
      targetStatus: TUTORING_STATUS_WAIT_SETTLEMENT,
      remark: '',
      ...data
    }
  })
}
