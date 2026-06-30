<script setup>
  import config from './config'
  import { getToken } from '@/utils/auth'
  import { useConfigStore, useLocationStore } from '@/store'
  import { onLaunch } from '@dcloudio/uni-app'
  import { findCityNodeByName } from '@/utils/pca'
  // #ifdef MP-WEIXIN
  import { setupMiniProgramUpdate } from '@/utils/update-manager'
  // #endif

  onLaunch(async (options) => {
    // #ifdef MP-WEIXIN
    setupMiniProgramUpdate()
    // #endif

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
      if (inviteCode) {
        uni.setStorageSync('pendingInviteCode', inviteCode)
        console.log('App launch: pendingInviteCode detected and saved:', inviteCode)
      }
    }

    initApp()
    const cityNode = await findCityNodeByName('南京市')
    if (cityNode) {
      useLocationStore().setCity(cityNode)
    }
  })

  // 初始化应用
  function initApp() {
    // 初始化应用配置
    initConfig()
    // 检查用户登录状态
    checkLogin()
  }

  function initConfig() {
    useConfigStore().setConfig(config)
  }

  function checkLogin() {
    if (!getToken()) {
      uni.reLaunch({ url: '/pages/mine/index' })
    }
  }
</script>

<style lang="scss">
  @import '@/static/scss/index.scss'
</style>
