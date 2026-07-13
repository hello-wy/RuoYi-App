export function getUserTypeText(value) {
  if (Number(value) === 0) return '家长'
  if (Number(value) === 1) return '学生'
  if (Number(value) === 2) return '商家'
  if (Number(value) === 3) return '兼职'
  return '未知'
}

export function getGenderText(value) {
  if (value === 0 || value === '0') return '男'
  if (value === 1 || value === '1') return '女'
  if (value === 2 || value === '2') return '未知'
  return ''
}

export function getDisplayName(detail = {}) {
  return detail.realName || detail.realname || detail.nickName || detail.userName || detail.username || ''
}

export function getStudentDisplayName(student = {}) {
  return student.realName || student.realname || student.userName || student.username || ''
}

export function getStudentRealName(student = {}) {
  return student.realName || student.realname || ''
}

export function buildProfileFields(detail = {}) {
  const baseFields = [
    { key: 'realName', label: '姓名', value: detail.realName },
    { key: 'nickName', label: '昵称', value: detail.nickName },
    { key: 'gender', label: '性别', value: getGenderText(detail.gender) },
    { key: 'birthday', label: '生日', value: detail.birthday },
    { key: 'phone', label: '手机号码', value: detail.phone },
    { key: 'userType', label: '用户类型', value: getUserTypeText(detail.userType) }
  ]

  if (Number(detail.userType) === 3) {
    return [
      ...baseFields,
      { key: 'age', label: '年龄', value: detail.age }
    ]
  }

  if (Number(detail.userType) !== 2) {
    return baseFields
  }

  return [
    ...baseFields,
    { key: 'companyName', label: '公司名称', value: detail.companyName },
    { key: 'companyAddress', label: '公司地址', value: detail.companyAddress },
    { key: 'companyPosition', label: '公司职务', value: detail.companyPosition },
    { key: 'industry', label: '所属行业', value: detail.industry },
    { key: 'workYears', label: '工作年限', value: detail.workYears },
    { key: 'personalIntro', label: '个人简介', value: detail.personalIntro, multiline: true }
  ]
}

export function normalizeEnrollmentSummary(data = {}) {
  const groups = Array.isArray(data.groups) ? data.groups : []
  return {
    total: Number(data.total || 0),
    remain: Number(data.remain || 0),
    usedCount: Number(data.usedCount || 0),
    sharedCount: Number(data.sharedCount || 0),
    groups: groups.map((group, groupIndex) => {
      const items = Array.isArray(group.items) ? group.items : []
      return {
        key: group.lectureName || `group-${groupIndex}`,
        lectureName: group.lectureName || '未命名课程',
        total: Number(group.total || 0),
        remain: Number(group.remain || 0),
        usedCount: Number(group.usedCount || 0),
        sharedCount: Number(group.sharedCount || 0),
        items: items.map((item, index) => ({
          ...item,
          key: item.id || `${groupIndex}-${index}`,
          lectureName: item.lectureName || group.lectureName || '未命名课程',
          total: Number(item.total || 0),
          remain: Number(item.remain || 0),
          usedCount: Number(item.usedCount || 0),
          sharedCount: Number(item.sharedCount || 0),
          availableShareCount: Number(item.availableShareCount ?? item.remain ?? 0)
        }))
      }
    })
  }
}

export function formatShortDate(value) {
  if (!value) return '--'
  const text = String(value)
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return `${match[1]}.${match[2]}.${match[3]}`
  return text
}

export function createInitialListState() {
  return {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    assignmentStatus: 'all',
    list: [],
    total: 0,
    allTotal: 0,
    boundTotal: 0,
    unboundTotal: 0,
    loading: false,
    finished: false,
    loadError: false
  }
}
