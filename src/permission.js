import { getToken } from '@/utils/auth'

// 页面白名单
const whiteList = [
  '/pages/register',
  '/pages/common/webview/index',
  '/pages/index',
  '/pages/tutoring/parent/list',
  '/pages/tutoring/tutor/list',
  '/pages/lectures/list',
  '/pages/jobs/list',
  '/pages/guide/index',
  '/pages/personality/start',
  '/pages/mine/index',
]

// 检查地址白名单
function checkWhite(url) {
  const path = url.split('?')[0]
  return whiteList.indexOf(path) !== -1
}

// 页面跳转验证拦截器
let list = ["navigateTo", "redirectTo", "reLaunch", "switchTab"]
list.forEach(item => {
  uni.addInterceptor(item, {
    invoke(to) {
      // 未登录用户允许访问白名单页面，其他页面通过 LoginPopup 组件处理登录
      if (checkWhite(to.url)) {
        return true
      }
      // 已登录用户可以访问所有页面
      if (getToken()) {
        return true
      }
      // 未登录用户访问非白名单页面，允许通过（页面内会使用 LoginPopup 处理登录）
      return true
    },
    fail(err) {
      console.log(err)
    }
  })
})
