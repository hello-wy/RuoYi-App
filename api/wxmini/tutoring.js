import request from '@/utils/request'

// 教员库
export function listTutors(query) {
    return request({
        url: '/wxmini/tutoring/tutors/list',
        method: 'get',
        params: query
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