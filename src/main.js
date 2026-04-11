import { createSSRApp } from 'vue'
import App from './App'
import store from './store' // store
import { install } from './plugins' // plugins
import './permission' // permission
import { useDict } from '@/utils/dict'
import { dictMixin } from '@/mixins/dict'
import DictTag from '@/components/dict-tag/DictTag.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.config.globalProperties.useDict = useDict
  // 全局注册 dict mixin（自动处理 dicts 选项）
  app.mixin(dictMixin)
  // 全局注册 dict-tag 组件
  app.component('DictTag', DictTag)
  install(app)
  return {
    app
  }
}
