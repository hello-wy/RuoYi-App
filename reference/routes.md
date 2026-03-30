# RuoYi-App Routes

## 首页与认证

- `pages/index`：首页，聚合城市选择、服务宫格、分类速查和底部模块。
- `pages/login`：登录页，当前支持一键手机号、微信、手机号、账号密码等多模式登录。
- `pages/register`：注册页。
- `pages/guide/index`：身份选择页。

## 我的

- `pages/mine/index`：个人中心首页。
- `pages/mine/enrollment/index`：我的学籍。
- `pages/mine/wallet/index`：我的钱包。
- `pages/mine/course/list`：已报课程。
- `pages/mine/avatar/index`：修改头像。
- `pages/mine/info/index`：个人信息。
- `pages/mine/info/edit`：编辑资料。
- `pages/mine/pwd/index`：修改密码。
- `pages/mine/setting/index`：应用设置。
- `pages/mine/help/index`：常见问题。
- `pages/mine/about/index`：关于我们。

## 育见成长

- `pages/growup/index`：成长首页。
- `pages/growup/detail`：课程或活动详情。
- `pages/growup/qrcode/index`：二维码页。
- `pages/growup/tutor/list`：讲师列表。
- `pages/growup/tutor/detail`：讲师详情。
- `pages/growup/material/list`：资料中心。
- `pages/growup/course/notice`：报名须知。
- `pages/growup/course/enroll`：课程报名。
- `pages/growup/course/pay`：订单支付。

## 家教

- `pages/tutoring/parent/list`：家长/学员需求列表。
- `pages/tutoring/parent/detail`：家长/学员需求详情。
- `pages/tutoring/parent/apply`：请家教发布页。
- `pages/tutoring/tutor/list`：教员列表。
- `pages/tutoring/tutor/detail`：教员详情。
- `pages/tutoring/tutor/apply`：做家教申请页。

## 兼职与活动

- `pages/jobs/list`：兼职广场。
- `pages/jobs/detail`：兼职详情。
- `pages/jobs/apply`：发布兼职。
- `pages/salon/list`：活动沙龙列表。
- `pages/salon/detail`：沙龙详情。

## 其他公共页面

- `pages/price/list`：价格说明。
- `pages/common/webview/index`：网页容器页。
- `pages/common/textview/index`：文本容器页。
- `pages/common/about/contact`：联系我们。
- `pages/common/about/company`：公司介绍。
- `pages/common/about/disclaimer`：免责声明。
- `pages/common/about/privacy`：隐私政策。

## 路由协作规则

- 新页面必须先补 `pages.json`，再落地对应页面文件。
- 页面路径按业务域组织，不要把不同业务混在同一路径层级。
- 详情页、列表页、编辑页、申请页尽量沿用现有命名，保证检索和协作一致性。
