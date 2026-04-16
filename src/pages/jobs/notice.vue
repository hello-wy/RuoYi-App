<template>
  <NoticeConfirm
    title="兼职报名须知"
    :sections="noticeSections"
    agreement-text="我已阅读并同意《兼职报名须知》《支付说明》和《退款说明》"
    confirm-text="我同意并支付报名费"
    @confirm="handleConfirm"
  />
</template>

<script>
import NoticeConfirm from '@/components/NoticeConfirm/index.vue'
import { createJobSignupOrder, queryJobSignupOrder } from '@/api/wxmini/jobSignupPay'
import { useJobSignupOrderStore } from '@/store'

const noticeSections = [
  {
    title: '兼职报名须知',
    content: '报名成功后请按岗位要求准时到岗，如无法参加请提前联系发布方。报名资格以支付成功且名额未满为准。'
  },
  {
    title: '支付说明',
    content: '本期兼职报名费固定为50元，由后端统一计算。支付完成后系统将自动确认报名结果。'
  },
  {
    title: '退款说明',
    content: '若支付完成时岗位名额已满，系统将自动发起退款并返回详情页提示，退款状态以订单查询结果为准。'
  }
]

export default {
  components: { NoticeConfirm },
  data() {
    return {
      jobId: '',
      paying: false,
      noticeSections
    }
  },
  onLoad(options) {
    this.jobId = options.id || options.jobId || ''
  },
  methods: {
    async handleConfirm() {
      if (this.paying || !this.jobId) return
      this.paying = true
      const orderStore = useJobSignupOrderStore()
      try {
        const res = await createJobSignupOrder({ jobId: Number(this.jobId) })
        const payload = res.data || res
        const payParam = payload.payParam || {}
        await uni.requestPayment({
          provider: 'wxpay',
          timeStamp: payParam.timeStamp,
          nonceStr: payParam.nonceStr,
          package: payParam.packageValue,
          signType: 'RSA',
          paySign: payParam.paySign
        })
        await this.pollOrder(payload.orderNo)
        await orderStore.refresh().catch(() => {})
      } catch (e) {
        uni.showToast({ title: e?.msg || '支付未完成', icon: 'none' })
      } finally {
        this.paying = false
      }
    },
    async pollOrder(orderNo) {
      for (let i = 0; i < 6; i++) {
        const res = await queryJobSignupOrder(orderNo)
        const order = res.data || res
        if (Number(order.status) === 1) {
          uni.showToast({ title: '报名成功', icon: 'success' })
          setTimeout(() => {
            uni.redirectTo({ url: `/pages/jobs/detail?id=${this.jobId}` })
          }, 600)
          return
        }
        if (Number(order.status) === 2 || Number(order.status) === 3) {
          uni.showToast({ title: '名额已满，已自动退款', icon: 'none' })
          setTimeout(() => {
            uni.redirectTo({ url: `/pages/jobs/detail?id=${this.jobId}` })
          }, 800)
          return
        }
        await new Promise(resolve => setTimeout(resolve, 800))
      }
      uni.showToast({ title: '支付结果确认中，请稍后查看', icon: 'none' })
    }
  }
}
</script>
