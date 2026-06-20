import { describe, expect, test } from 'vitest'
import { HOME_BANNER_ITEMS } from './home-banner'

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
