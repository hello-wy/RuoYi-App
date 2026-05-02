import request from '@/utils/request'

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

export function getJobSignupUsers(jobId, query = {}) {
  return request({
    url: `/wxmini/jobs/${jobId}/signup-users`,
    method: 'get',
    params: query
  })
}
