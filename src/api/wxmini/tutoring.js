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

export function verifyRealNameByWechatPay(data) {
    return request({
        url: '/wxmini/tutoring/real-verify/verify',
        method: 'post',
        data
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
        url: '/wxmini/tutoring/parents/' + id,
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

export function getMyParentDemandDetail() {
    return request({
        url: '/wxmini/tutoring/parents/mine/detail',
        method: 'get'
    })
}

export function updateMyParentDemand(id, data) {
    return request({
        url: '/wxmini/tutoring/parents/' + id,
        method: 'put',
        data
    })
}

export function deleteMyParentDemand(id) {
    return request({
        url: '/wxmini/tutoring/parents/' + id,
        method: 'delete'
    })
}

export function listServiceAddresses() {
    return request({
        url: '/wxmini/address/list',
        method: 'get'
    }).then(res => {
        const list = Array.isArray(res?.data) ? res.data : []
        return {
            ...res,
            data: list.map(item => ({
                id: item.id,
                contactName: item.contactName || '',
                contactPhone: item.contactPhone || '',
                region: item.region || '',
                location: item.location || '',
                geo: item.geo || '',
                addressDetail: item.addressDetail || '',
                doorplate: item.doorplate || '',
                isDefault: Number(item.isDefault || 0),
                remark: item.remark || ''
            }))
        }
    })
}

export function addServiceAddress(data) {
    return request({
        url: '/wxmini/address',
        method: 'post',
        data
    })
}

export function updateServiceAddress(id, data) {
    return request({
        url: '/wxmini/address/' + id,
        method: 'put',
        data
    })
}

export function deleteServiceAddress(id) {
    return request({
        url: '/wxmini/address/' + id,
        method: 'delete'
    })
}

export function setDefaultServiceAddress(id) {
    return request({
        url: '/wxmini/address/' + id + '/default',
        method: 'put'
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
