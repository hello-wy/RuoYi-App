import request from '@/utils/request'

// ==================== 课程 ====================

// 获取我的课程列表
export function listMyCourses(query) {
    return request({
        url: '/system/growup/course/my',
        method: 'get',
        params: query
    })
}

// 获取全部课程列表
export function listCourses(query) {
    return request({
        url: '/system/growup/course/list',
        method: 'get',
        params: query
    })
}

// 获取课程详情
export function getCourse(id) {
    return request({
        url: '/system/growup/course/' + id,
        method: 'get'
    })
}

// 课程签到
export function signInCourse(id) {
    return request({
        url: '/system/growup/course/' + id + '/signIn',
        method: 'post'
    })
}

// ==================== 资料中心 ====================

// 获取资料列表
export function listMaterials(query) {
    return request({
        url: '/system/growup/material/list',
        method: 'get',
        params: query
    })
}

// ==================== 讲师 ====================

// 获取讲师风采列表
export function listTutorShowcase(query) {
    return request({
        url: '/system/growup/tutor/showcase',
        method: 'get',
        params: query
    })
}

// ==================== 沙龙活动 ====================

// 获取沙龙活动列表
export function listSalons(query) {
    return request({
        url: '/system/growup/salon/list',
        method: 'get',
        params: query
    })
}

// 获取沙龙活动详情
export function getSalon(id) {
    return request({
        url: '/system/growup/salon/' + id,
        method: 'get'
    })
}

// 报名沙龙活动
export function joinSalon(id) {
    return request({
        url: '/system/growup/salon/' + id + '/join',
        method: 'post'
    })
}

// ==================== 课程报名 ====================

// 获取课程报名须知
export function getCourseNotice(id) {
    return request({
        url: '/system/growup/course/' + id + '/notice',
        method: 'get'
    })
}

// 报名课程
export function enrollCourse(id, data) {
    return request({
        url: '/system/growup/course/' + id + '/enroll',
        method: 'post',
        data: data
    })
}

// 获取课程已报名学员列表
export function getCourseEnrolledUsers(id, query) {
    return request({
        url: '/system/growup/course/' + id + '/enrolled',
        method: 'get',
        params: query
    })
}

// ==================== 问卷 ====================

// 获取问卷活动列表
export function listSurveys(query) {
    return request({
        url: '/system/growup/survey/list',
        method: 'get',
        params: query
    })
}

// 获取问卷详情
export function getSurvey(id) {
    return request({
        url: '/system/growup/survey/' + id,
        method: 'get'
    })
}
