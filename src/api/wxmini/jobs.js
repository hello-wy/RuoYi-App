import request from '@/utils/request'
import upload from '@/utils/upload'

export function listWxJobs(query) {
  return request({
    url: '/wxmini/jobs/list',
    method: 'get',
    params: query
  })
}

export function getJobPublishDefaults() {
  return request({
    url: '/wxmini/jobs/mine/defaults',
    method: 'get'
  })
}

export function addWxJob(data) {
  return request({
    url: '/wxmini/jobs',
    method: 'post',
    data
  })
}

export function getMyJobSchedules() {
  return request({
    url: '/wxmini/jobs/schedules/my',
    method: 'get'
  })
}

export function getMyPublishedJobs() {
  return request({
    url: '/wxmini/jobs/mine/published',
    method: 'get'
  })
}

export function getJobSignupUsers(jobId, query = {}) {
  return request({
    url: `/wxmini/jobs/${jobId}/signup-users`,
    method: 'get',
    params: query
  })
}

export function uploadJobAttendanceImage(filePath) {
  return upload({
    url: '/wxmini/common/uploadJobSignImage',
    filePath,
    name: 'file',
    showError: false
  })
}

export function submitJobAttendanceImage(jobId, signImageUrl) {
  return request({
    url: `/wxmini/jobs/${jobId}/sign-in`,
    method: 'post',
    data: { signImageUrl }
  })
}

export function updateMerchantJobStatus(jobId, data) {
  return request({
    url: `/wxmini/jobs/${jobId}/status`,
    method: 'post',
    data
  })
}
