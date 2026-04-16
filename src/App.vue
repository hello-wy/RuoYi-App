<script setup>
  import config from './config'
  import { getToken } from '@/utils/auth'
  import { useConfigStore, useLocationStore } from '@/store'
  import { onLaunch } from '@dcloudio/uni-app'
  import { findCityNodeByName } from '@/utils/pca'
  // #ifdef MP-WEIXIN
  import { setupMiniProgramUpdate } from '@/utils/update-manager'
  // #endif

  onLaunch(async () => {
    // #ifdef MP-WEIXIN
    setupMiniProgramUpdate()
    // #endif
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
