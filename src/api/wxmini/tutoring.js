import request from '@/utils/request'

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
        url: '/system/tutors/' + id,
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