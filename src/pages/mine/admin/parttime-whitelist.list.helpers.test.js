import { describe, expect, test } from 'vitest'
import { buildParttimeWhitelistListQuery, createParttimeWhitelistListState } from './parttime-whitelist.list.helpers'

describe('parttime whitelist list helpers', () => {
  test('creates initial list state', () => {
    expect(createParttimeWhitelistListState()).toEqual({
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
    })
  })

  test('builds trimmed query params and omits empty values', () => {
    expect(buildParttimeWhitelistListQuery({
      pageNum: 2,
      pageSize: 20,
      realName: ' 张三 ',
      idCard: ' ',
    })).toEqual({
      pageNum: 2,
      pageSize: 20,
      realName: '张三',
    })
  })

  test('normalizes id card search to uppercase', () => {
    expect(buildParttimeWhitelistListQuery({
      pageNum: 1,
      pageSize: 10,
      idCard: ' 11010519900101123x '
    })).toEqual({
      pageNum: 1,
      pageSize: 10,
      idCard: '11010519900101123X'
    })
  })
})
