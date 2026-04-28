# RuoYi-App AGENTS

## 1. 适用范围

本文件只描述 `RuoYi-App` 前端项目自身的组织方式和接入规则。
前后端联调规则以仓库根目录 `AGENTS.md` 为准。

## 2. 优先阅读顺序

处理前端任务时，按需读取：
1. 当前文件
2. `reference/` 下相关索引文档
3. 相关页面、组件、`api/`、`store/`、`utils/` 实现

普通页面改动不需要先全量阅读所有参考文档。

## 3. 目录职责

- `pages/`：页面入口与页面级交互编排
- `components/`：跨页面复用组件
- `api/`：接口封装与返回结构适配
- `store/`：跨页面共享状态
- `utils/`：请求、鉴权、存储等基础能力
- `plugins/`：全局挂载能力

## 4. 关键规则

- 新增页面时，路径与 `pages.json` 保持一致
- 所有后端请求统一走 `utils/request.js`
- 不在页面或组件中直接调用 `uni.request`
- 接口适配逻辑统一放在 `api/` 层
- 可复用 UI 和交互优先沉淀到 `components/`
- 跨页面共享状态再进入 `store/modules/`

## 5. 快速决策

- 新增页面：`pages/<domain>/...`，并同步 `pages.json`
- 新增接口：优先放 `api/system/` 或 `api/wxmini/`
- 通用交互：优先检查 `components/`、`plugins/`、`utils/`
- 查目录、组件、路由明细：直接看 `reference/`
