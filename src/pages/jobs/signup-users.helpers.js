/**
 * signup-users.vue 纯逻辑方法提取
 * 用于单元测试覆盖签到/审核状态映射与签到图片 URL 解析
 */

const ATTENDANCE_STATUS_CLASSES = {
  1: 'status-open',
  2: 'status-full',
  3: 'status-cancelled'
}

const AUDIT_STATUS_CLASSES = {
  1: 'status-open',
  2: 'status-end',
  3: 'status-cancelled'
}

/**
 * 根据签到状态返回对应的 CSS class
 * 1=已签到→status-open, 2=迟到→status-full, 3=已取消→status-cancelled, 其余→''
 */
export function getAttendanceClass(status) {
  return ATTENDANCE_STATUS_CLASSES[Number(status)] || ''
}

/**
 * 根据审核状态返回对应的 CSS class
 * 1=待审核→status-open, 2=已通过→status-end, 3=已驳回→status-cancelled, 0=未提交→''
 */
export function getAuditClass(status) {
  return AUDIT_STATUS_CLASSES[Number(status)] || ''
}

/**
 * 拼接签到图片完整 URL
 * - 已是 http(s) 开头的直接返回
 * - 相对路径拼接 baseUrl 前缀
 * - 空值返回空串
 */
export function resolveSignImage(url, baseUrl) {
  const normalizedPath = String(url || '').trim()
  if (!normalizedPath) return ''
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath
  const normalizedBase = String(baseUrl || '').replace(/\/+$/, '')
  const safePath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  return `${normalizedBase}${safePath}`
}
