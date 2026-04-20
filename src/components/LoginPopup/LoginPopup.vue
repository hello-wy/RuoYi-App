<template>
  <view v-if="isVisible" class="login-overlay" @touchmove.stop.prevent>
    <!-- 遮罩层 -->
    <view
      class="login-overlay__mask"
      :class="{ 'login-overlay__mask--active': showContent }"
      @click="handleMaskClick"
    ></view>
    <!-- 弹出内容 -->
    <view
      class="login-overlay__content"
      :class="{ 'login-overlay__content--active': showContent }"
    >
      <view class="login-popup">
        <view class="popup-handle"></view>
        <view class="popup-header">
          <view>
            <text class="popup-title">登录后继续使用完整服务</text>
            <text class="popup-subtitle"></text>
          </view>
          <uni-icons type="closeempty" size="20" color="#64748b" @click="close"></uni-icons>
        </view>

        <view class="mode-switch">
          <view
            v-for="item in modeOptions"
            :key="item.value"
            class="mode-item"
            :class="{ active: activeMode === item.value }"
            @click="setMode(item.value)"
          >
            <uni-icons :type="item.icon" size="16" :color="activeMode === item.value ? '#0f766e' : '#64748b'"></uni-icons>
            <text class="mode-text">{{ item.label }}</text>
          </view>
        </view>

        <view v-if="activeMode === 'realtimePhone'" class="panel panel-primary">
          <text class="panel-tag">推荐</text>
          <text class="panel-title">手机号快捷登录</text>
          <!-- #ifdef MP-WEIXIN -->
          <button
            v-if="realtimePhoneSupported"
            class="primary-btn realtime-btn"
            open-type="getRealtimePhoneNumber"
            @getrealtimephonenumber="handleRealtimePhoneLogin"
          >
            手机号快捷登录
          </button>
          <button
            v-else
            class="primary-btn realtime-btn"
            @click="handleRealtimePhoneUnsupported"
          >
            手机号快捷登录
          </button>
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <button
            class="primary-btn realtime-btn"
            @click="handleRealtimePhoneUnsupported"
          >
            手机号快捷登录
          </button>
          <!-- #endif -->
        </view>

        <view v-else-if="activeMode === 'wechat'" class="panel">
          <text class="panel-title">微信授权登录</text>
          <button class="primary-btn wechat-btn" @click="handleWechatLogin">
            微信授权登录
          </button>
        </view>

        <view v-else class="panel">
          <text class="panel-title">账号密码登录</text>
          <view class="input-item">
            <input
              class="input"
              :value="loginForm.username"
              maxlength="30"
              placeholder="请输入账号"
              @input="updateLoginField('username', $event.detail.value)"
            />
          </view>
          <view class="input-item">
            <input
              class="input"
              :value="loginForm.password"
              maxlength="20"
              password
              placeholder="请输入密码"
              @input="updateLoginField('password', $event.detail.value)"
            />
          </view>
          <view v-if="captchaEnabled" class="input-item captcha-row">
            <input
              class="input"
              :value="loginForm.code"
              maxlength="4"
              placeholder="请输入验证码"
              type="number"
              @input="updateLoginField('code', $event.detail.value)"
            />
            <image class="captcha-img" :src="codeUrl" @click="getCode"></image>
          </view>
          <button class="primary-btn account-btn" @click="handleAccountLogin">
            账号登录
          </button>
          <view v-if="register" class="register-row">
            <text class="muted-text">没有账号？</text>
            <text class="link-text" @click="handleUserRegister">立即注册</text>
          </view>
        </view>

        <view class="agreement">
          <view class="agreement-checkbox" @click="toggleAgreement" :class="{ shake: isShaking }">
            <view class="checkbox-wrapper">
              <view v-if="agreedToTerms" class="checkbox-checked">
                <uni-icons type="checkmarkempty" size="14" color="#fff"></uni-icons>
              </view>
              <view v-else class="checkbox-unchecked"></view>
            </view>
            <view class="agreement-text">
              <text class="muted-text">我已阅读并同意</text>
              <template v-for="(agreement, index) in agreements" :key="agreement.title || index">
                <text v-if="index > 0" class="muted-text">和</text>
                <text class="link-text" @click.stop="openAgreement(index)">《{{ agreement.title }}》</text>
              </template>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'
import { getCodeImg } from '@/api/login'
import { useConfigStore, useUserStore } from '@/store'

const isProd = import.meta.env.PROD

const modeOptions = [
  { label: '手机号快捷登录', value: 'realtimePhone', icon: 'phone' },{ label: '账号登录', value: 'account', icon: 'person' },
  ...(!isProd ? [{ label: '微信登录', value: 'wechat', icon: 'weixin' }] : []),
]

const DEFAULT_MODE = 'realtimePhone'
const ACCOUNT_MODE = 'account'
const DEFAULT_LOGIN_FORM = Object.freeze({
  username: '',
  password: '',
  code: '',
  uuid: ''
})

const props = defineProps({
  register: {
    type: Boolean,
    default: false
  },
  defaultMode: {
    type: String,
    default: DEFAULT_MODE
  },
  autoOpen: {
    type: Boolean,
    default: false
  },
  accountSuccessUrl: {
    type: String,
    default: '/pages/index'
  },
  wechatSuccessUrl: {
    type: String,
    default: '/pages/guide/index'
  },
  realtimePhoneSuccessUrl: {
    type: String,
    default: '/pages/guide/index'
  },
  initialLoginForm: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'success'])

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const configStore = useConfigStore()
const globalConfig = configStore.config || {}
const agreements = (globalConfig && globalConfig.appInfo && globalConfig.appInfo.agreements) || []
const isVisible = ref(false)
const showContent = ref(false)
const activeMode = ref(props.defaultMode)
const codeUrl = ref('')
const captchaEnabled = ref(true)
const realtimePhoneSupported = ref(false)
const loginForm = ref(createLoginForm(props.initialLoginForm))
const agreedToTerms = ref(false)
const isShaking = ref(false)
const agreementTitlesText = agreements.map(item => item.title).join('和')

watch(() => props.defaultMode, (value) => {
  const nextMode = value || DEFAULT_MODE
  activeMode.value = nextMode
  if (nextMode === ACCOUNT_MODE && !codeUrl.value) {
    getCode()
  }
})

watch(() => props.autoOpen, (value) => {
  if (value) {
    open(props.defaultMode)
  } else {
    close()
  }
})

watch(() => props.initialLoginForm, (value) => {
  loginForm.value = createLoginForm(value)
})

function updateLoginField(field, value) {
  loginForm.value = {
    ...loginForm.value,
    [field]: value
  }
}

function setMode(mode) {
  activeMode.value = mode
  if (mode === ACCOUNT_MODE && !codeUrl.value) {
    getCode()
  }
}

function open(mode = activeMode.value) {
  setMode(mode)
  isVisible.value = true
  // 等 DOM 渲染完成后再触发动画，否则 transition 不生效
  nextTick(() => {
    setTimeout(() => {
      showContent.value = true
    }, 30)
  })
}

function close() {
  showContent.value = false
  // 等关闭动画结束后再移除 DOM
  setTimeout(() => {
    isVisible.value = false
  }, 300)
  emit('close')
}

function handleMaskClick() {
  close()
}

function toggleAgreement() {
  agreedToTerms.value = !agreedToTerms.value
}

function checkAgreement() {
  if (!agreedToTerms.value) {
    isShaking.value = true
    proxy.$modal.msgError(`请先阅读并同意${agreementTitlesText}`)
    setTimeout(() => {
      isShaking.value = false
    }, 500)
    return false
  }
  return true
}

function createLoginForm(initialLoginForm = {}) {
  return {
    ...DEFAULT_LOGIN_FORM,
    ...initialLoginForm
  }
}

function openAgreement(index) {
  const site = agreements[index]
  if (!site || !site.url) {
    proxy.$modal.msgError('协议配置缺失')
    return
  }
  proxy.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
}

function handleUserRegister() {
  proxy.$tab.redirectTo('/pages/register')
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (!captchaEnabled.value) {
      codeUrl.value = ''
      loginForm.value = { ...loginForm.value, code: '', uuid: '' }
      return
    }
    codeUrl.value = `data:image/gif;base64,${res.img}`
    loginForm.value = { ...loginForm.value, uuid: res.uuid }
  })
}

function handleAccountLogin() {
  if (!checkAgreement()) {
    return
  }

  if (!loginForm.value.username) {
    proxy.$modal.msgError('请输入账号')
    return
  }
  if (!loginForm.value.password) {
    proxy.$modal.msgError('请输入密码')
    return
  }
  if (captchaEnabled.value && !loginForm.value.code) {
    proxy.$modal.msgError('请输入验证码')
    return
  }
  withLoading('登录中，请耐心等待...', async () => {
    await userStore.login(loginForm.value)
    await userStore.getInfo()
    finishLogin('account')
  }).catch(() => {
    if (captchaEnabled.value) {
      getCode()
    }
  })
}

function handleRealtimePhoneUnsupported() {
  proxy.$modal.msgError('当前微信环境不支持手机号实时验证登录，请使用微信登录或账号密码登录')
}

function handleRealtimePhoneLogin(event) {
  if (!checkAgreement()) {
    return
  }

  // #ifndef MP-WEIXIN
  handleRealtimePhoneUnsupported()
  return
  // #endif

  const phoneCode = event && event.detail ? event.detail.code : undefined
  if (!phoneCode) {
    proxy.$modal.msgError(resolvePhoneDeniedMessage(event && event.detail ? event.detail.errMsg : undefined))
    return
  }
  withLoading('微信手机号验证中，请稍候...', async () => {
    const appid = resolveRequiredWxAppId()
    const code = await requestWxLoginCode()
    const profile = await userStore.resolveWxPhoneLogin({ appid, code, phoneCode })
    finishLogin('realtimePhone', profile)
  }).catch(showRuntimeMessage)
}

function handleWechatLogin() {
  if (!checkAgreement()) {
    return
  }

  // #ifndef MP-WEIXIN
  proxy.$modal.msgError('微信登录仅支持微信小程序环境')
  return
  // #endif

  withLoading('微信授权中，请稍候...', async () => {
    const appid = resolveRequiredWxAppId()
    const code = await requestWxLoginCode()
    const profile = await userStore.resolveWxLogin(appid, code)
    finishLogin('wechat', profile)
  }).catch(showRuntimeMessage)
}

function finishLogin(mode, payload = null) {
  close()
  emit('success', { mode, payload })
  const targetUrl = resolveSuccessUrl(mode)
  if (targetUrl) {
    proxy.$tab.reLaunch(targetUrl)
  }
}

function resolveSuccessUrl(mode) {
  if (mode === 'account') {
    return props.accountSuccessUrl
  }
  if (mode === 'wechat') {
    return props.wechatSuccessUrl
  }
  return props.realtimePhoneSuccessUrl
}

function resolvePhoneDeniedMessage(errMsg = '') {
  if (errMsg.includes('deny') || errMsg.includes('cancel')) {
    return '你已取消微信手机号授权，无法完成快捷登录'
  }
  return '未获取到微信手机号验证凭证，请重新授权'
}

function showRuntimeMessage(error) {
  if (!error || typeof error === 'string') {
    return
  }
  if (error.message) {
    proxy.$modal.msgError(error.message)
  }
}

function resolveRequiredWxAppId() {
  const appid = resolveWxAppId()
  if (!appid) {
    throw new Error('未获取到小程序 AppID，请检查当前运行环境')
  }
  return appid
}

function resolveWxAppId() {
  // #ifdef MP-WEIXIN
  const accountInfo = uni.getAccountInfoSync ? uni.getAccountInfoSync() : null
  return accountInfo && accountInfo.miniProgram ? accountInfo.miniProgram.appId : ''
  // #endif
  return ''
}

async function requestWxLoginCode() {
  try {
    const loginRes = await uni.login({ provider: 'weixin' })
    if (!loginRes.code) {
      throw new Error('未获取到微信登录凭证，请稍后重试')
    }
    return loginRes.code
  } catch (error) {
    throw new Error((error && error.errMsg) || '获取微信登录凭证失败，请稍后重试')
  }
}

async function withLoading(message, task) {
  proxy.$modal.loading(message)
  try {
    await task()
  } finally {
    proxy.$modal.closeLoading()
  }
}

function detectRealtimePhoneSupport() {
  // #ifdef MP-WEIXIN
  if (typeof wx === 'undefined' || typeof wx.canIUse !== 'function') {
    return false
  }
  return wx.canIUse('button.open-type.getRealtimePhoneNumber')
  // #endif
  return false
}

onMounted(() => {
  realtimePhoneSupported.value = detectRealtimePhoneSupport()
  if (props.autoOpen) {
    nextTick(() => {
      open(props.defaultMode)
    })
  }
})

defineExpose({
  close,
  open,
  setMode,
  isVisible
})
</script>

<style lang="scss" scoped>
@import './login-popup.scss';
</style>
