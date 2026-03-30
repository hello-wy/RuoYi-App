import request from '@/utils/request'

// 展示讲师风采列表
export function listTutor(query) {
    return request({
        url: '/wxmini/growup/tutors/list',
        method: 'get',
        params: query
    })
}
export function getEnrollmentsList() {
    return request({
        url: `/wxmini/growup/enrollments/list`,
        method: 'get'
    })
}

export function getTotalEnrollments() {
    return request({
        url: `/wxmini/growup/enrollments/total`,
        method: 'get'
    })
}
