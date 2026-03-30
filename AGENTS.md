# RuoYi-App AGENTS

## 1. 项目定位

`RuoYi-App` 是当前仓库中的 uni-app 前端子项目，技术栈以 `Vue 3 + Pinia + uni-app + uni-ui` 为主，面向 H5、APP、小程序多端复用。

本文件只描述前端项目自身的组织方式、组件化原则和页面接入规范。前后端如何联调，统一以仓库根目录 `AGENTS.md` 为准。

## 2. 参考文档

- 项目目录与职责：[reference/project-structure.md](/Users/wuyang/Documents/site/zhiyujia/RuoYi-App/reference/project-structure.md)
- 组件清单与用途：[reference/components.md](/Users/wuyang/Documents/site/zhiyujia/RuoYi-App/reference/components.md)
- 页面与路由索引：[reference/routes.md](/Users/wuyang/Documents/site/zhiyujia/RuoYi-App/reference/routes.md)

## 3. 目录职责

- `pages/`：页面入口，负责页面级视图、交互编排、路由参数解析和页面生命周期。
- `components/`：跨页面复用组件，负责局部 UI 和局部交互。
- `api/`：接口封装层，按业务域拆分，统一承接请求和返回结果适配。
- `store/`：Pinia 状态层，保存跨页面共享状态。
- `plugins/`：全局挂载能力，当前主要是 `$tab`、`$auth`、`$modal`。
- `utils/`：基础能力层，统一请求、鉴权、存储、校验、上传和错误处理。
- `static/`：静态资源与样式资源。
- `uni_modules/`：uni-ui 与第三方 uni 模块。

## 4. 组件化原则

- 页面只做页面级编排，不重复实现通用请求、鉴权、提示和跳转能力。
- 出现可复用的筛选条、卡片、选择器、弹窗时，优先抽到 `components/`。
- 组件对外只暴露最少必要输入输出，优先使用 `props + emits`。
- 组件内部不要直接耦合页面路径，除非该组件本身就是明确的业务导航组件。
- 可复用逻辑优先沉淀为组件、store 或工具，不要长期堆积在单个页面文件中。

## 5. 分层规则

### 页面层

- 新增页面时，文件路径必须与 `pages.json` 路由路径保持一一对应。
- 页面命名优先使用 `index.vue`、`list.vue`、`detail.vue`、`apply.vue`、`edit.vue` 等语义化名称。
- 路由参数统一通过页面 `onLoad(options)` 或等价方式读取。

### 接口层

- 所有后端请求统一走 `utils/request.js`，不要在页面或组件中直接调用 `uni.request`。
- `api/system/` 对应常规业务域接口，`api/wxmini/` 对应小程序侧专用接口。
- 新接口优先按业务域聚合，避免在一个文件里混放不相关资源。
- 接口返回结构适配统一放在 `api/` 层，不要散落到页面层。

### 状态层

- 跨页面共享状态进入 `store/modules/`，不要把共享状态分散写在多个页面里。
- 页面私有临时状态留在页面本身，不要为了统一而过度上移到 store。
- 当前共享状态主要包括 `user`、`config`、`location` 等模块。

### 基础能力层

- 字典能力沿用现有 `useDict`、`dictMixin`、`DictTag`。
- 权限跳转规则统一由 `permission.js` 处理，页面不要重复实现登录拦截。
- 城市和区县筛选统一复用 `location store + static/pca-code.json`。

## 6. 修改规则

- 新增业务页面时，最少同步检查 `pages/`、`pages.json`、`api/`、`store/` 是否都需要变更。
- 新增业务模块时，优先按“页面、接口、状态、组件”四层拆开，不要把所有逻辑塞进一个页面。
- 能复用现有 `components/`、`plugins/`、`utils/` 的能力时，不重复造轮子。
- 如需新增前端规范，先确认代码结构中已有对应落点，再补充到本文档。

## 7. 快速决策

- 想新增页面：放 `pages/<domain>/...`，并同步 `pages.json`。
- 想接新接口：优先放 `api/system/<domain>.js` 或 `api/wxmini/<domain>.js`。
- 想做跨页面共享：优先评估是否应进入 `store/modules/`。
- 想写通用交互：优先看 `components/`、`plugins/`、`utils/` 是否已有同类能力。
- 想查目录、组件、路由明细：直接看 `reference/` 文档。
