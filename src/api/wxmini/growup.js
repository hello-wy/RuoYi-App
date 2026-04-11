import request from '@/utils/request'

//获得最近所有课程
export function listCourse(query) {
    return request({
        url: '/wxmini/growup/courses',
        method: 'get',
        params: query
    })
}


// 展示讲师风采列表
export function listTutor(query) {
    return request({
        url: '/wxmini/growup/tutors/list',
        method: 'get',
        params: query
    })
}

export function getCourse(id) {
    return request({
        url: `/wxmini/growup/courses/${id}`,
        method: 'get'
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

