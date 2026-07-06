export const HOME_BANNER_ITEMS = Object.freeze([
  Object.freeze({
    imageSrc: 'https://zhiyujia.xyz/banners/banner1.png',
    alt: '家教兼职与成长服务平台'
  })
])

export function resolveHomeBannerAction(token) {
  return token ? { type: 'mine' } : { type: 'login' }
}
