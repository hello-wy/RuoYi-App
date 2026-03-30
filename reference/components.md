# RuoYi-App Components

## 组件清单

- `components/AddressSearch/AddressSearch.vue`
  - 地址联想输入组件。
  - 负责根据输入内容查询建议地址，并向外抛出地址文本、经纬度和区域信息。

- `components/AreaPicker/AreaPicker.vue`
  - 省市区三级选择组件。
  - 依赖 `static/pca-code.json` 和 `location store`，用于统一地区选择和地区回填。

- `components/CategoryQuickSearch/CategoryQuickSearch.vue`
  - 首页快捷筛选组件。
  - 基于当前城市区县和 `sys_subject` 字典快速跳转到家教列表筛选结果。

- `components/data-list/data-list.vue`
  - 列表加载容器组件。
  - 统一处理首次加载、失败、空状态、分页加载和下拉刷新结束。

- `components/dict-tag/DictTag.vue`
  - 字典值展示组件。
  - 将字典值映射为带样式的标签，支持单值和多值。

- `components/LocationMap/LocationMap.vue`
  - 地图展示与导航组件。
  - 在有经纬度时展示地图并提供导航入口，在无经纬度时展示地址占位。

- `components/RealVerify/RealVerify.vue`
  - 实人认证交互组件。
  - 提供横幅或按钮两种入口，内置认证弹窗和表单校验。

- `components/ServiceGrid/ServiceGrid.vue`
  - 首页业务宫格组件。
  - 聚合首页核心业务入口并负责导航跳转。

- `components/TutoringFilterBar/TutoringFilterBar.vue`
  - 家教列表筛选栏组件。
  - 统一处理区域、科目、年级、授课方式筛选和重置动作。

- `components/uni-section/uni-section.vue`
  - 章节标题栏组件。
  - 用于页面区块标题、装饰和右侧扩展插槽展示。

## 组件协作规则

- 新组件优先以 `props + emits` 暴露接口，避免直接读写外部页面状态。
- 组件内部如依赖字典、地区、登录态，应在文档或代码入口处显式说明依赖来源。
- 页面专属且不会复用的局部片段，可以先保留在页面内；确认复用后再提取到 `components/`。
- 导航型组件可以持有明确路由，但表单、筛选、展示型组件不应耦合具体业务接口。
