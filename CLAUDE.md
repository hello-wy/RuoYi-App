# CLAUDE.md

## Project Overview

`RuoYi-App` 是智育傢的 uni-app 前端子项目，技术栈为 `Vue 3 + Pinia + uni-app`。

## Work In This Project

- 前端任务优先看 `RuoYi-App/AGENTS.md`
- 接口联调或契约确认时，再结合仓库根目录 `AGENTS.md`
- 不必为普通页面修改先阅读整套联调文档

## Key Entry Points

- 页面路由：`pages.json`
- 接口配置：`config.js`
- 请求封装：`utils/request.js`
- 页面目录：`pages/`
- 组件目录：`components/`
- 状态目录：`store/modules/`
- 接口目录：`api/`

## Auth

- `/wxmini/**` 请求默认使用 `Wx-Authorization`
- 其他管理类接口默认使用 `Authorization`

## Common Rules

- 所有请求统一走 `utils/request.js`
- 接口返回结构适配统一放在 `api/` 层
- 页面负责编排，通用 UI 优先抽到 `components/`
- 跨页面共享状态放入 `store/modules/`
