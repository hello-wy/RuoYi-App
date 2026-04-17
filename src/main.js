import { createSSRApp } from 'vue'
import App from './App'
import store from './store' // store
import { install } from './plugins' // plugins
import './permission' // permission
import { useDict } from '@/utils/dict'
import { dictMixin } from '@/mixins/dict'
import DictTag from '@/components/dict-tag/DictTag.vue'
import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'

const shareContent = {
  title: '学优职傢 - 家教兼职与成长服务平台',
  path: '/pages/index'
}

const shareMixin = {
  onShareAppMessage() {
    return shareContent
  },
  onShareTimeline() {
    return shareContent
  }
}

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.config.globalProperties.useDict = useDict
  // 全局注册 dict mixin（自动处理 dicts 选项）
  app.mixin(dictMixin)
  app.mixin(shareMixin)
  // 全局注册 dict-tag 组件
  app.component('DictTag', DictTag)
  // 全局注册 uni-icons，确保小程序端能正确注入 usingComponents
  app.component('uni-icons', UniIcons)
  install(app)
  return {
    app
  }
}
