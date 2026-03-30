# RuoYi-App Project Structure

## 顶层目录

- `App.vue`：应用根组件，启动时初始化配置、登录态和默认城市。
- `main.js`：应用入口，挂载 Pinia、字典能力、全局组件和插件。
- `pages.json`：页面注册与导航栏配置。
- `manifest.json`：多端构建配置。
- `config.js`：运行时全局配置，当前包含 `baseUrl` 和应用信息。
- `permission.js`：页面访问拦截与白名单规则。
- `uni.scss`：全局样式变量入口。

## 目录职责

- `api/`
  - `login.js`：登录、注册、验证码、用户信息。
  - `system/`：常规业务域接口。
  - `wxmini/`：小程序业务接口。
- `components/`
  - 跨页面业务组件与通用显示组件。
- `mixins/`
  - 字典相关混入。
- `pages/`
  - 页面文件，按业务域组织。
- `plugins/`
  - 全局挂载能力，当前包含 `$tab`、`$auth`、`$modal`。
- `static/`
  - 图片、字体、样式和地区静态数据。
- `store/`
  - Pinia 入口和模块。
- `utils/`
  - 请求、鉴权、存储、上传、校验、常量等工具。
- `uni_modules/`
  - uni-ui 和第三方 uni 模块。

## pages 业务分区

- `pages/common/`：公共页面和公共底部模块。
- `pages/growup/`：育见成长相关页面，包括课程、讲师、资料、二维码。
- `pages/guide/`：身份选择。
- `pages/jobs/`：兼职列表、详情、发布。
- `pages/mine/`：个人中心、资料、课程、钱包、设置。
- `pages/price/`：价格说明。
- `pages/salon/`：活动沙龙列表和详情。
- `pages/tutoring/`：家教供需相关页面，按 `parent` 与 `tutor` 分区。

## API 业务分区

- `api/system/enrollment.js`：学籍相关。
- `api/system/growup.js`：成长模块相关。
- `api/system/info.js`：信息/活动内容。
- `api/system/jobs.js`：兼职业务。
- `api/system/lectures.js`：讲座/课程。
- `api/system/material.js`：资料中心。
- `api/system/order.js`：订单相关。
- `api/system/parents.js`：家长/学员侧业务。
- `api/system/profile.js`：个人资料。
- `api/system/questionnaire.js`：问卷类业务。
- `api/system/tutors.js`：教员侧业务。
- `api/system/user.js`：用户相关。
- `api/system/wallet.js`：钱包业务。
- `api/wxmini/growup.js`：小程序成长相关。
- `api/wxmini/signin.js`：小程序签到相关。
- `api/wxmini/tutoring.js`：小程序家教业务。

## store 模块

- `store/modules/config.js`：应用配置。
- `store/modules/dict.js`：字典缓存。
- `store/modules/location.js`：当前城市与区县列表。
- `store/modules/user.js`：登录态、用户信息、角色权限。
