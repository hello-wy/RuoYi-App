export function setupMiniProgramUpdate({ uniApi = uni, logger = console } = {}) {
  if (typeof wx === 'undefined') {
    return
  }

  if (!wx.canIUse('getUpdateManager')) {
    uniApi.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用更新功能，请先升级微信。',
      showCancel: false
    })
    return
  }

  const updateManager = wx.getUpdateManager()

  updateManager.onCheckForUpdate((res) => {
    logger.log('是否有新版本：', res.hasUpdate)
  })

  updateManager.onUpdateReady(() => {
    uniApi.showModal({
      title: '版本更新',
      content: '检测到新版本，为了正常使用，请立即更新。',
      showCancel: false,
      success() {
        updateManager.applyUpdate()
      }
    })
  })

  updateManager.onUpdateFailed(() => {
    uniApi.showModal({
      title: '更新提示',
      content: '新版本下载失败，请退出小程序后重新打开。',
      showCancel: false
    })
  })
}
