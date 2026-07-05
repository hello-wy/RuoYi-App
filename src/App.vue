<script setup>
  import config from './config'
  import { getToken } from '@/utils/auth'
  import { bindReferral } from '@/api/wxmini/referral'
  import { useConfigStore, useLocationStore } from '@/store'
  import { onLaunch, onShow } from '@dcloudio/uni-app'
  import { findCityNodeByName } from '@/utils/pca'
  // #ifdef MP-WEIXIN
  import { setupMiniProgramUpdate } from '@/utils/update-manager'
  // #endif

  let bindingPendingInviteCode = false

  onLaunch(async (options) => {
    // #ifdef MP-WEIXIN
    setupMiniProgramUpdate()
    // #endif

    saveInviteCodeFromOptions(options)

    initApp(options)
    bindPendingInviteCodeIfLoggedIn()
    const cityNode = await findCityNodeByName('南京市')
    if (cityNode) {
      useLocationStore().setCity(cityNode)
    }
  })

  onShow((options) => {
    saveInviteCodeFromOptions(options)
    bindPendingInviteCodeIfLoggedIn()
  })

  function saveInviteCodeFromOptions(options) {
    // 解析分销邀请码并存入本地缓存
    if (options && options.query) {
      let inviteCode = options.query.inviteCode
      if (!inviteCode && options.query.scene) {
        try {
          const scene = decodeURIComponent(options.query.scene)
          if (scene.includes('inviteCode=')) {
            const match = scene.match(/inviteCode=([^&]+)/)
            if (match) {
              inviteCode = match[1]
            }
          } else {
            inviteCode = scene
          }
        } catch (e) {
          console.error('Failed to parse WeChat scene param:', e)
        }
      }
      inviteCode = String(inviteCode || '').trim()
      if (inviteCode) {
        uni.setStorageSync('pendingInviteCode', inviteCode)
        console.log('pendingInviteCode detected and saved:', inviteCode)
      }
    }
  }

  function bindPendingInviteCodeIfLoggedIn() {
    const inviteCode = String(uni.getStorageSync('pendingInviteCode') || '').trim()
    if (!getToken() || !inviteCode || bindingPendingInviteCode) {
      return
    }
    bindingPendingInviteCode = true
    bindReferral(inviteCode).then(() => {
      uni.removeStorageSync('pendingInviteCode')
    }).catch(error => {
      const message = error?.msg || error?.message || error?.errMsg || ''
      if (['已经被邀请过了', '邀请码不能为空', '邀请码无效', '不能绑定自己的邀请码'].includes(message)) {
        uni.removeStorageSync('pendingInviteCode')
      }
    }).finally(() => {
      bindingPendingInviteCode = false
    })
  }

  // 初始化应用
  function initApp(options) {
    // 初始化应用配置
    initConfig()
    // 检查用户登录状态
    checkLogin(options)
  }

  function initConfig() {
    useConfigStore().setConfig(config)
  }

  function checkLogin(options) {
    if (getToken() || isShareLandingPage(options?.path)) {
      return
    }
    uni.reLaunch({ url: '/pages/mine/index' })
  }

  function isShareLandingPage(path) {
    return ['pages/growup/detail', 'pages/salon/detail'].includes(path)
  }
</script>

<style lang="scss">
  @import '@/static/scss/index.scss'
</style>
