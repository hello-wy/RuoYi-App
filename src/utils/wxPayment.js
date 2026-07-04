export function requestWxPayment(payParam = {}) {
  if (!payParam.timeStamp || !payParam.nonceStr || !(payParam.packageValue || payParam.package) || !payParam.paySign) {
    throw new Error('支付参数不完整')
  }
  return uni.requestPayment({
    provider: 'wxpay',
    appId: payParam.appId || payParam.appid,
    timeStamp: payParam.timeStamp,
    nonceStr: payParam.nonceStr,
    package: payParam.packageValue || payParam.package,
    signType: payParam.signType || 'RSA',
    paySign: payParam.paySign
  })
}
