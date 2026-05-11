export function createParttimeWhitelistListState() {
  return {
    pageNum: 1,
    pageSize: 10,
    realName: '',
    idCard: '',
    list: [],
    total: 0,
    loading: false,
    finished: false,
    loadError: false,
    refreshing: false,
  }
}

export function buildParttimeWhitelistListQuery(state = {}) {
  const realName = String(state.realName || '').trim()
  const idCard = String(state.idCard || '').trim().toUpperCase()
  return {
    pageNum: Number(state.pageNum || 1),
    pageSize: Number(state.pageSize || 10),
    ...(realName ? { realName } : {}),
    ...(idCard ? { idCard } : {}),
  }
}
