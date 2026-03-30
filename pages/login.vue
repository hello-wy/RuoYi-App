<template>
  <view class="login-page">
    <view class="hero">
      <image class="logo" :src="globalConfig.appInfo.logo" mode="aspectFit"></image>
      <view class="hero-text">
        <text class="title">欢迎登录</text>
        <text class="subtitle">请选择登录方式继续</text>
      </view>
    </view>

    <view class="mode-switch">
      <view class="mode-item" :class="{ active: loginMode === 'oneclick' }" @click="switchMode('oneclick')">一键手机号</view>
      <view class="mode-item" :class="{ active: loginMode === 'wechat' }" @click="switchMode('wechat')">微信登录</view>
      <view class="mode-item" :class="{ active: loginMode === 'phone' }" @click="switchMode('phone')">手机号登录</view>
      <view class="mode-item" :class="{ active: loginMode === 'account' }" @click="switchMode('account')">账号登录</view>
    </view>

    <view class="panel" v-if="loginMode === 'oneclick'">
      <text class="panel-title">本机手机号一键登录</text>
      <text class="panel-desc">默认推荐，授权后可快速完成登录</text>
      <button class="primary-btn" @click="handleOneClickLogin">立即一键登录</button>
    </view>

    <view class="panel" v-else-if="loginMode === 'wechat'">
      <text class="panel-title">微信授权登录</text>
      <text class="panel-desc">微信账号快捷登录</text>
      <button class="primary-btn wechat-btn" @click="handleWechatLogin">微信授权登录</button>
    </view>

    <view class="panel" v-else-if="loginMode === 'phone'">
      <text class="panel-title">手机号登录</text>
      <view class="input-item">
        <input v-model="phoneForm.phone" class="input" type="number" maxlength="11" placeholder="请输入手机号" />
      </view>
      <view class="input-item">
        <input v-model="phoneForm.smsCode" class="input" type="number" maxlength="6" placeholder="请输入短信验证码" />
      </view>
      <button class="primary-btn" @click="handlePhoneLogin">手机号登录</button>
    </view>

    <view class="panel" v-else>
      <text class="panel-title">账号密码登录</text>
      <view class="input-item">
        <input v-model="loginForm.username" class="input" type="text" placeholder="请输入账号" maxlength="30" />
      </view>
      <view class="input-item">
        <input v-model="loginForm.password" type="password" class="input" placeholder="请输入密码" maxlength="20" />
      </view>
      <view class="input-item captcha-row" v-if="captchaEnabled">
        <input v-model="loginForm.code" type="number" class="input" placeholder="请输入验证码" maxlength="4" />
        <image :src="codeUrl" @click="getCode" class="captcha-img"></image>
      </view>
      <button @click="handleLogin" class="primary-btn">账号登录</button>
      <view class="reg" v-if="register">
        <text class="text-grey1">没有账号？</text>
        <text @click="handleUserRegister" class="text-blue">立即注册</text>
      </view>
    </view>

    <view class="agreement">
      <text class="text-grey1">登录即代表同意</text>
      <text @click="handleUserAgrement" class="text-blue">《用户协议》</text>
      <text @click="handlePrivacy" class="text-blue">《隐私协议》</text>
    </view>
     
  </view>
</template>

<script setup>
  import { ref, getCurrentInstance } from "vue"
  import { getToken, setToken } from '@/utils/auth'
  import { getCodeImg } from '@/api/login'
  import { useConfigStore, useUserStore } from '@/store'
  import { onLoad } from '@dcloudio/uni-app'

  const { proxy } = getCurrentInstance()
  const globalConfig = useConfigStore().config
  const loginMode = ref('oneclick')
  const codeUrl = ref("")
  // 验证码开关
  const captchaEnabled = ref(true)
  // 用户注册开关
  const register = ref(false)
  const phoneForm = ref({
    phone: "",
    smsCode: ""
  })
  const loginForm = ref({
    username: "admin",
    password: "admin123",
    code: "",
    uuid: ""
  })

  function switchMode(mode) {
    loginMode.value = mode
    if (mode === 'account' && captchaEnabled.value && !codeUrl.value) {
      getCode()
    }
  }

  // 用户注册
  function handleUserRegister() {
    proxy.$tab.redirectTo(`/pages/register`)
  }

  // 隐私协议
  function handlePrivacy() {
    let site = globalConfig.appInfo.agreements[0]
    proxy.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
  }

  // 用户协议
  function handleUserAgrement() {
    let site = globalConfig.appInfo.agreements[1]
    proxy.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
  }

  // 获取图形验证码
  function getCode() {
    getCodeImg().then(res => {
      captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
        if (captchaEnabled.value) {
          codeUrl.value = 'data:image/gif;base64,' + res.img
          loginForm.value.uuid = res.uuid
        }
    })
  }

  // 登录方法
  async function handleLogin() {
    if (loginForm.value.username === "") {
      proxy.$modal.msgError("请输入账号")
    } else if (loginForm.value.password === "") {
      proxy.$modal.msgError("请输入密码")
    } else if (loginForm.value.code === "" && captchaEnabled.value) {
      proxy.$modal.msgError("请输入验证码")
    } else {
      proxy.$modal.loading("登录中，请耐心等待...")
      pwdLogin()
    }
  }

  function handleOneClickLogin() {
    proxy.$modal.msg("当前版本暂未接入运营商一键登录，请使用微信登录或账号登录")
  }

  function handlePhoneLogin() {
    if (!/^1\d{10}$/.test(phoneForm.value.phone)) {
      proxy.$modal.msgError("请输入正确的手机号")
      return
    }
    if (!phoneForm.value.smsCode) {
      proxy.$modal.msgError("请输入短信验证码")
      return
    }
    proxy.$modal.msg("手机号验证码登录接口暂未接入，请先使用微信登录或账号登录")
  }

  function resolveWxAppId() {
    // #ifdef MP-WEIXIN
    const accountInfo = uni.getAccountInfoSync ? uni.getAccountInfoSync() : null
    return accountInfo?.miniProgram?.appId || 'wx4c21998d0c65f24b'
    // #endif
    return ''
  }

  async function handleWechatLogin() {
    // #ifndef MP-WEIXIN
    proxy.$modal.msgError('微信登录仅支持微信小程序环境')
    return
    // #endif

    proxy.$modal.loading('微信授权中，请稍候...')

    const loginRes = await uni.login({ provider: 'weixin' })
    const code = loginRes.code
    const appid = resolveWxAppId()
    useUserStore().resolveWxLogin(appid, code).then(() => {
      proxy.$modal.closeLoading()

      proxy.$tab.reLaunch('/pages/guide/index')

    }).catch(() => {
      proxy.$modal.closeLoading()
      proxy.$modal.msgError('微信登录失败')
    })

  }

  // 密码登录 管理员登录
  async function pwdLogin() {
    useUserStore().login(loginForm.value).then(() => {
      proxy.$modal.closeLoading()
      useUserStore().getInfo().then(res => {
        proxy.$tab.reLaunch('/pages/index')
      })
    }).catch(() => {
      if (captchaEnabled.value) {
        getCode()
      }
    })
  }

  onLoad(() => {
    if (getToken()) {
      proxy.$tab.reLaunch('/pages/index')
    }
  })

  getCode()
</script>

<style lang="scss" scoped>
  page {
    background-color: #f5f7fb;
  }

  .login-page {
    width: 100%;
    min-height: 100vh;
    padding: 40rpx 32rpx;
    box-sizing: border-box;

    .hero {
      display: flex;
      align-items: center;
      margin-bottom: 28rpx;

      .logo {
        width: 110rpx;
        height: 110rpx;
        border-radius: 16rpx;
        margin-right: 20rpx;
      }

      .hero-text {
        display: flex;
        flex-direction: column;

        .title {
          font-size: 40rpx;
          font-weight: 700;
          color: #1f2937;
        }

        .subtitle {
          margin-top: 8rpx;
          font-size: 24rpx;
          color: #6b7280;
        }
      }
    }

    .mode-switch {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14rpx;
      margin-bottom: 24rpx;

      .mode-item {
        height: 70rpx;
        border-radius: 16rpx;
        background: #ffffff;
        border: 2rpx solid #e5e7eb;
        font-size: 24rpx;
        color: #4b5563;
        display: flex;
        align-items: center;
        justify-content: center;

        &.active {
          border-color: #3b82f6;
          color: #2563eb;
          background: #eff6ff;
        }
      }
    }

    .panel {
      background: #ffffff;
      border-radius: 24rpx;
      padding: 30rpx;
      border: 2rpx solid #ebedf0;

      .panel-title {
        display: block;
        font-size: 30rpx;
        font-weight: 600;
        color: #111827;
        margin-bottom: 10rpx;
      }

      .panel-desc {
        display: block;
        font-size: 24rpx;
        color: #6b7280;
        margin-bottom: 28rpx;
      }

      .input-item {
        margin-bottom: 18rpx;
        background-color: #f6f8fb;
        height: 88rpx;
        border-radius: 18rpx;
        border: 2rpx solid #eef1f5;
        display: flex;
        align-items: center;
        padding: 0 20rpx;

        .input {
          width: 100%;
          font-size: 28rpx;
          color: #111827;
        }
      }

      .captcha-row {
        justify-content: space-between;

        .captcha-img {
          width: 180rpx;
          height: 62rpx;
          border-radius: 12rpx;
          margin-left: 20rpx;
        }
      }

      .primary-btn {
        width: 100%;
        height: 88rpx;
        line-height: 88rpx;
        border-radius: 44rpx;
        border: none;
        background: #2563eb;
        color: #ffffff;
        font-size: 30rpx;
        font-weight: 600;
        margin-top: 14rpx;

        &::after {
          border: none;
        }
      }

      .wechat-btn {
        background: #16a34a;
      }

      .reg {
        margin-top: 18rpx;
        text-align: center;
      }
    }

    .agreement {
      margin-top: 36rpx;
      text-align: center;
      font-size: 24rpx;
    }
  }

  .text-blue {
    color: #2563eb;
    margin: 0 4rpx;
  }

  .text-grey1 {
    color: #6b7280;
  }
</style>
