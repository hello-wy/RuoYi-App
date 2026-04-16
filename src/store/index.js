import { createPinia } from 'pinia'
import { useUserStore } from './modules/user'
import { useConfigStore } from './modules/config'
import { useLocationStore } from './modules/location'
import { useJobSignupOrderStore } from './modules/jobSignupOrder'

const pinia = createPinia()

export default pinia

export { useUserStore, useConfigStore, useLocationStore, useJobSignupOrderStore }
