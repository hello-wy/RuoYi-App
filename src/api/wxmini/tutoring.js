import request from '@/utils/request'
import upload from '@/utils/upload'

// 教员库
export function listTutors(query) {
    return request({
        url: '/wxmini/tutoring/tutors/list',
        method: 'get',
        params: query
    })
}

export function getTutors(id) {
    return request({
        url: '/wxmini/tutoring/tutors/' + id,
        method: 'get'
    })
}

export function addTutors(data) {
    return request({
        url: '/wxmini/tutoring/apply',
        method: 'post',
        data: data
    })
}

// 获取当前登录教员自己的信息
export function getMyTutor() {
    return request({
        url: '/wxmini/tutoring/mine',
        method: 'get'
    })
}

export function updateMyTutor(data) {
    return request({
        url: '/wxmini/tutoring/mine/update',
        method: 'post',
        data: data
    })
}

// 家教单
export function listParents(query) {
    return request({
        url: '/wxmini/tutoring/parents/list',
        method: 'get',
        params: query
    })
}

export function getParents(id) {
    return request({
        url: '/system/parents/' + id,
        method: 'get'
    })
}

export function addParents(data) {
    return request({
        url: '/wxmini/tutoring/parents',
        method: 'post',
        data: data
    })
}

export function uploadTutorCertification(filePath) {
    return upload({
        url: '/wxmini/common/uploadCertification',
        filePath,
        name: 'file'
    })
}

export function uploadTutorAvatar(filePath) {
    return upload({
        url: '/wxmini/common/uploadAvatar',
        filePath,
        name: 'file'
    })
}
