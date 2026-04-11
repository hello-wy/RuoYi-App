// 应用全局配置
const baseUrl = import.meta.env.VITE_APP_BASE_URL

export default {
  baseUrl,
  // 应用信息
  appInfo: {
    // 应用名称
    name: '智育傢',
    // 应用版本
    version: '1.2.0',
    // 应用logo
    logo: '/static/logo.png',
    // 官方网站
    // site_url: "https://zhiyujia.xyz",
    // 政策协议
    agreements: [
      {
        title: '隐私政策',
        url: 'https://zhiyujia.xyz/privacy-policy.html'
      },
      {
        title: '用户服务协议',
        url: 'https://zhiyujia.xyz/service-terms.html'
      }
    ]
  }
}
