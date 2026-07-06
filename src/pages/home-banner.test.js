import { describe, expect, test } from 'vitest'
import { HOME_BANNER_ITEMS, resolveHomeBannerAction } from './home-banner'

describe('HOME_BANNER_ITEMS', () => {
  test('uses the nginx banners static image', () => {
    expect(HOME_BANNER_ITEMS).toEqual([
      {
        imageSrc: 'https://zhiyujia.xyz/banners/banner1.png',
        alt: '家教兼职与成长服务平台'
      }
    ])
  })
})

describe('resolveHomeBannerAction', () => {
  test('opens login popup without a token', () => {
    expect(resolveHomeBannerAction('')).toEqual({ type: 'login' })
  })

  test('routes to mine page with a token', () => {
    expect(resolveHomeBannerAction('user-token')).toEqual({ type: 'mine' })
  })
})
