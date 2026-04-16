import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listMyJobSignupOrders } from '@/api/wxmini/jobSignupPay'

const STORAGE_KEY = 'job_signup_orders_cache'

export const useJobSignupOrderStore = defineStore('jobSignupOrder', () => {
  const orders = ref([])
  const syncedAt = ref('')

  const hydrate = () => {
    const cache = uni.getStorageSync(STORAGE_KEY)
    if (cache && Array.isArray(cache.orders)) {
      orders.value = cache.orders
      syncedAt.value = cache.syncedAt || ''
    }
  }

  const persist = () => {
    uni.setStorageSync(STORAGE_KEY, {
      orders: orders.value,
      syncedAt: syncedAt.value
    })
  }

  const clear = () => {
    orders.value = []
    syncedAt.value = ''
    uni.removeStorageSync(STORAGE_KEY)
  }

  const refresh = async () => {
    const res = await listMyJobSignupOrders()
    orders.value = res.data || []
    syncedAt.value = new Date().toISOString()
    persist()
    return orders.value
  }

  const hasPaidOrder = (jobId) => {
    return orders.value.some(item => Number(item.jobId) === Number(jobId) && Number(item.status) === 1)
  }

  return {
    orders,
    syncedAt,
    hydrate,
    persist,
    clear,
    refresh,
    hasPaidOrder
  }
})
