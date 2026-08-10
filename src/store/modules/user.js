import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useJobSignupOrderStore } from './jobSignupOrder'
import config from '@/config'
import storage from '@/utils/storage'
import constant from '@/utils/constant'
import { isHttp, isEmpty } from "@/utils/validate"
import { getInfo, login, logout, wxminiLogin } from '@/api/login'
import { bindReferral } from '@/api/wxmini/referral'
import { getTotalEnrollments } from '@/api/wxmini/growup'
import { getToken, removeAdminRoles, removeAdminToken, removeToken, setAdminRoles, setAdminToken, setToken } from '@/utils/auth'
import { EMPTY_USER_TYPE, hasUserType, normalizeUserType } from '@/utils/userType'
import { shouldEnableRegularMineFeatures } from '@/utils/admin'
import { resolveUserDisplayName } from '@/utils/userDisplay'
import { createAdminSessionSnapshot } from './user.helpers'
import defAva from '@/static/images/profile.png'

const baseUrl = config.baseUrl
const PHONE_CODE_REQUIRED_MESSAGE = '需要手机号授权后继续登录'
let bindingPendingInviteCode = false

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const id = ref(storage.get(constant.id))
  const name = ref(storage.get(constant.name))
  const avatar = ref(storage.get(constant.avatar))
  const roles = ref(storage.get(constant.roles))
  const permissions = ref(storage.get(constant.permissions))
  const enrollment = ref(storage.get(constant.enrollment))
  const phone = ref(storage.get(constant.phone))
  const sessionKey = ref(storage.get(constant.sessionKey))
  const userType = ref(normalizeUserType(storage.get(constant.userType)))

  const SET_TOKEN = (val) => {
    token.value = val
  }
  const SET_ID = (val) => {
    id.value = val
    storage.set(constant.id, val)
  }
  const SET_NAME = (val) => {
    name.value = val
    storage.set(constant.name, val)
  }
  const SET_AVATAR = (val) => {
    avatar.value = val
    storage.set(constant.avatar, val)
  }
  const SET_ROLES = (val) => {
    roles.value = val
    storage.set(constant.roles, val)
  }
  const SET_PERMISSIONS = (val) => {
    permissions.value = val
    storage.set(constant.permissions, val)
  }
  const SET_ENROLLMENT = (val) => {
    enrollment.value = val
    storage.set(constant.enrollment, val)
  }
  const SET_PHONE = (val) => {
    phone.value = val
    storage.set(constant.phone, val)
  }
  const SET_SESSION_KEY = (val) => {
    sessionKey.value = val
    storage.set(constant.sessionKey, val)
  }
  const SET_USER_TYPE = (val) => {
    const normalizedValue = normalizeUserType(val)
    userType.value = normalizedValue
    storage.set(constant.userType, normalizedValue)
  }

  const resolveAvatar = (avatarUrl) => {
    if (isHttp(avatarUrl)) {
      return avatarUrl
    }
    return isEmpty(avatarUrl) ? defAva : baseUrl + avatarUrl
  }

  const syncEnrollment = () => {
    if (!shouldEnableRegularMineFeatures(token.value, roles.value)) {
      return
    }
    getTotalEnrollments().then(res => {
      SET_ENROLLMENT(res.data)
    })
  }

  const resolveUserTypeValue = (primary, fallback = EMPTY_USER_TYPE) => {
    return hasUserType(primary) ? primary : fallback
  }

  const applyWxSession = async (profile) => {
    const jobSignupOrderStore = useJobSignupOrderStore()
    setToken(profile.apiToken)
    SET_TOKEN(profile.apiToken)
    SET_ROLES(['ROLE_DEFAULT'])
    SET_PERMISSIONS([])
    SET_SESSION_KEY(profile.sessionKey || '')
    SET_USER_TYPE(profile.userType)
    SET_PHONE(profile.phone || '')
    SET_ID(profile.userId || '')
    SET_NAME(resolveUserDisplayName(profile))
    SET_AVATAR(resolveAvatar(profile.avatarUrl || profile.avatar || ''))
    syncEnrollment()
    jobSignupOrderStore.refresh().catch(() => {})
    return profile
  }

  const clearPendingInviteCode = () => {
    uni.removeStorageSync('pendingInviteCode')
  }

  const bindPendingInviteCode = async () => {
    const inviteCode = String(uni.getStorageSync('pendingInviteCode') || '').trim()
    if (!getToken() || !inviteCode || bindingPendingInviteCode) {
      return
    }
    bindingPendingInviteCode = true
    try {
      await bindReferral(inviteCode)
      clearPendingInviteCode()
    } catch {
    } finally {
      bindingPendingInviteCode = false
    }
  }

  const applyWxSessionAndBindReferral = async (profile) => {
    const result = await applyWxSession(profile)
    await bindPendingInviteCode()
    return result
  }

  const buildWxProfile = (loginData, phoneData = {}) => ({
    apiToken: loginData.apiToken || '',
    sessionKey: phoneData.sessionKey || loginData.sessionKey || '',
    openId: phoneData.openId || loginData.openId || '',
    userId: phoneData.userId || loginData.userId || '',
    userName: phoneData.userName || loginData.userName || '',
    realName: phoneData.realName || loginData.realName || '',
    userType: resolveUserTypeValue(phoneData.userType, loginData.userType),
    phone: phoneData.phone || phoneData.phoneNumber || loginData.phone || '',
    avatarUrl: phoneData.avatarUrl || loginData.avatarUrl || loginData.avatar || '',
    needPhoneCode: Boolean(loginData.needPhoneCode)
  })

  const buildPhoneCodeRequiredError = (loginData = {}) => {
    const error = new Error(PHONE_CODE_REQUIRED_MESSAGE)
    error.needPhoneCode = true
    error.loginData = loginData
    return error
  }

  const assertWxLoginReady = (loginData = {}) => {
    if (loginData.needPhoneCode) {
      throw buildPhoneCodeRequiredError(loginData)
    }
    if (!loginData.apiToken) {
      throw new Error('未获取到微信登录态')
    }
  }

  const resetProfileState = () => {
    SET_TOKEN('')
    SET_ID('')
    SET_NAME('')
    SET_AVATAR('')
    SET_ROLES([])
    SET_PERMISSIONS([])
    SET_ENROLLMENT('')
    SET_PHONE('')
    SET_SESSION_KEY('')
    SET_USER_TYPE('')
  }

  const updateWxProfileState = (profile = {}) => {
    if (Object.prototype.hasOwnProperty.call(profile, 'userType')) {
      SET_USER_TYPE(profile.userType)
    }
    if (Object.prototype.hasOwnProperty.call(profile, 'phone')) {
      SET_PHONE(profile.phone || '')
    }
    if (Object.prototype.hasOwnProperty.call(profile, 'realName')
      || Object.prototype.hasOwnProperty.call(profile, 'phone')) {
      SET_NAME(resolveUserDisplayName(profile))
    } else if (Object.prototype.hasOwnProperty.call(profile, 'displayName')) {
      SET_NAME(profile.displayName || '')
    }
  }

  const syncAdminSession = () => {
    const adminSession = createAdminSessionSnapshot(token.value, roles.value)
    if (!adminSession) {
      return
    }
    setAdminToken(adminSession.token)
    setAdminRoles(adminSession.roles)
  }

  // 登录
  const loginAction = (userInfo) => {
    const username = userInfo.username.trim()
    const password = userInfo.password
    const code = userInfo.code
    const uuid = userInfo.uuid
    return new Promise((resolve, reject) => {
      login(username, password, code, uuid).then(res => {
        setToken(res.token)
        SET_TOKEN(res.token)
        SET_ROLES(['admin'])
        SET_PERMISSIONS([])
        SET_USER_TYPE('')
        syncAdminSession()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }

  const resolveWxLogin = (appid, code) => {
    return new Promise((resolve, reject) => {
      wxminiLogin(appid, code).then(async res => {
        try {
          const loginData = res.data || {}
          assertWxLoginReady(loginData)
          const result = await applyWxSessionAndBindReferral(buildWxProfile(loginData))
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  const resolveWxPhoneLogin = ({ appid, code, phoneCode }) => {
    return new Promise((resolve, reject) => {
      wxminiLogin(appid, code, phoneCode).then(async loginRes => {
        try {
          const loginData = loginRes.data || {}
          assertWxLoginReady(loginData)
          const result = await applyWxSessionAndBindReferral(buildWxProfile(loginData))
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  // 获取用户信息
  const getInfoAction = () => {
    return new Promise((resolve, reject) => {
      getInfo().then(res => {
        const user = res.user
        const avatar = resolveAvatar(user.avatar || "")
        const userid = (isEmpty(user) || isEmpty(user.userId)) ? "" : user.userId
        const username = (isEmpty(user) || isEmpty(user.userName)) ? "" : user.userName
        const phoneNumber = (isEmpty(user) || isEmpty(user.phonenumber)) ? "" : user.phonenumber
        const accountType = (isEmpty(user) || !hasUserType(user.userType)) ? "" : user.userType
        if (res.roles && res.roles.length > 0) {
          SET_ROLES(res.roles)
          SET_PERMISSIONS(res.permissions)
        } else {
          SET_ROLES(['ROLE_DEFAULT'])
        }

        SET_ENROLLMENT(res.user.enrollment)
        SET_PHONE(phoneNumber)
        SET_SESSION_KEY('')
        SET_USER_TYPE(accountType)
        SET_ID(userid)
        SET_NAME(resolveUserDisplayName({
          realName: user.realName,
          phone: phoneNumber
        }) || username)
        SET_AVATAR(avatar)
        syncAdminSession()
        resolve(res)
      }).catch(error => {
        reject(error)
      })
    })
  }

  // 退出系统
  const logOutAction = () => {
    const jobSignupOrderStore = useJobSignupOrderStore()
    return new Promise((resolve, reject) => {
      logout(token.value).then(() => {
        resetProfileState()
        removeToken()
        removeAdminToken()
        removeAdminRoles()
        storage.clean()
        jobSignupOrderStore.clear()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }

  return {
    token,
    id,
    name,
    avatar,
    roles,
    enrollment,
    phone,
    sessionKey,
    userType,
    permissions,
    SET_NAME,
    SET_AVATAR,
    SET_ROLES,
    SET_PERMISSIONS,
    SET_ENROLLMENT,
    SET_PHONE,
    SET_SESSION_KEY,
    SET_USER_TYPE,
    updateWxProfileState,
    login: loginAction,
    getInfo: getInfoAction,
    logOut: logOutAction,
    bindPendingInviteCode,
    resolveWxLogin: resolveWxLogin,
    resolveWxPhoneLogin
  }
})
