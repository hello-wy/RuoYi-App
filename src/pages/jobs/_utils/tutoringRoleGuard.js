import { normalizeUserType } from '@/utils/userType'

const COPY_MAP = {
  parent: {
    title: '身份提示',
    content: '当前不是家长身份，如果你是家长请先去切换家长身份。'
  },
  student: {
    title: '身份提示',
    content: '当前不是学生身份，如果你是学生请先去切换学生身份。'
  },
  merchant: {
    title: '身份提示',
    content: '当前不是商家身份，如果你是商家请先去切换商家身份。'
  }
}

export function shouldBlockUserTypeEntry(user = {}, expectedUserType) {
  if (!user?.token) {
    return false
  }

  return normalizeUserType(user.userType) !== expectedUserType
}

export function buildUserTypeGuardCopy(scene) {
  return COPY_MAP[scene] || COPY_MAP.parent
}
