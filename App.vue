<script setup>
  import config from './config'
  import { getToken } from '@/utils/auth'
  import { useConfigStore, useLocationStore } from '@/store'
  import { onLaunch } from '@dcloudio/uni-app'
  import pcaData from '@/static/pca-code.json'

  onLaunch(() => {
    initApp()
    getAreas("南京市",pcaData)
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

  function getAreas(cityName, data) {
    // 找到城市节点（{ text, value, children }）传给 setCity
    const allCities = data.flatMap(province => province.children)
    const cityNode = allCities.find(city => city.text === cityName)

    if (cityNode) {
      useLocationStore().setCity(cityNode)
    }
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
