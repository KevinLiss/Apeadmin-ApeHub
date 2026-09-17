---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '4ed500f3-2689-4709-9294-d46e4cb99178'
  PropagateID: '4ed500f3-2689-4709-9294-d46e4cb99178'
  ReservedCode1: 'ca4270ff-67f9-460c-9604-6da641ad48cc'
  ReservedCode2: 'ca4270ff-67f9-460c-9604-6da641ad48cc'
---

# Changelog

All notable changes to the ApeHub Web plugin are documented here.

## [1.13.1] — 2026-09-17

### Fixed
- 修复开发者更新插件名称时 `name` 被覆盖为 slug 的 bug（API `/developer/plugins/{id}`）：改名时同步重算 slug 并校验唯一性（冲突返回 409）
- 管理端虚拟计数/真实计数增加上限校验（`le=2_000_000_000`），防止灌入超大数值

## [1.13.0] — 2026-09-17

### Added
- 插件虚拟安装/下载数量功能：
  - 新增 `virtual_download_count` / `virtual_install_count` 字段，后台可独立设置虚拟展示数量
  - 前台公开接口展示合并数（真实 + 虚拟），不泄露虚拟字段明细
  - 后台管理接口保留真实数与虚拟数分开返回，便于运营核对
  - 前台插件列表按合并下载数排序
  - 数据库迁移 v0020：plugin 增加 `virtual_download_count` / `virtual_install_count` 列
- 后台插件编辑弹窗「基本信息」Tab 新增「虚拟展示数量」区域（含说明文字与实时合并数提示）

## [1.12.0] — 2026-09-16

### Added
- 双框架（Python/FastAPI + Go/Gin）支持：
  - 安装下载页新增 Python/Go 框架 Tab 切换，后台 Release 分类管理两类部署包
  - 技术文档按 Python/Go 分目录组织（`guide/python/`、`guide/go/`），管理后台分类按前两级目录区分并展示友好名称与文档计数
  - 插件管理新增语言（language）字段，插件提交与后台审核支持 Python/Go 标识
  - 数据库迁移 v0019：release 增加 `framework` 字段、plugin 增加 `language` 字段、doc/doc_category 增加 `framework` 字段
- Go 版（Gin）技术文档 7 篇（AI 初稿）：overview/quickstart/architecture/api/plugin-lifecycle/security/operations

### Changed
- Release 版本号按 framework 独立编排，`is_latest` 按 framework 计算
- VitePress 配置：sidebar 改双版本分组，nav 改 Python 版/Go 版/插件市场，`cleanUrls` 改为 `false`（兼容 FastAPI StaticFiles 无后缀回退缺失）
- 前端管理后台 Releases/Plugins/TechDocs/Docs 页面适配 framework/language 字段
- 官网静态页 download/releases-app/profile/profile-app/plugins/marketplace 适配框架筛选与徽章
- 静态资源版本号递增：releases-app.js v1.1.0、profile-app.js v2.7.0、marketplace.js v1.1.0

## [1.10.0] — 2026-09-03

### Added
- 接入 Coze 工作流作为第三个 AI Provider，仅用于「AI 补全」（代码→文档）功能
- 新增 `coze_api_key`（VARCHAR(512)）和 `coze_workflow_id` 配置字段
- 迁移 v0016：创建 Coze 相关数据库列
- 站点配置页新增 Coze 选项和配置区（API Key + 工作流 ID）
- Schema API 暴露 Coze 配置字段（写入时加密 API Key，读取时返回 `coze_configured` 布尔值）

### Changed
- AI Provider 下拉新增 `coze` 选项
- `ai_provider` 字段 pattern 校验增加 coze

### Notes
- Coze 工作流 API 端点：`https://api.coze.cn/v1/workflow/run`（非流式）
- Coze 不返回 token usage，usage 字段填 0
- 润色类功能（AI 优化文档/Changelog）继续走 DeepSeek 或千问，不走 Coze
- MySQL 兼容性：`coze_api_key` 列使用 VARCHAR(512) 而非 TEXT（MySQL 不允许 TEXT 列设默认值）

## [1.9.1] — 2026-09-03

### Fixed
- 修复收银台模式支付回调中 `pay_type` 硬编码问题，改为与配置联动

## [1.9.0] — 2026-09-03

### Added
- 收银台模式：前端调用 LemPay 收银台接口，由收银台展示可用支付渠道
- 支付回调回写实际支付渠道到订单记录
- 开发者收益 USDT 记账链路完整验证通过

### Changed
- 从预选支付渠道模式切换为收银台模式，前端无需维护渠道判断逻辑
- 商户后台开通新渠道后收银台自动展示，无需前端改动

## [1.8.0] — 2026-09-03

### Changed
- 人民币计价：插件价格改为人民币（¥），免费或最低 ¥3
- 订单金额仍为 CNY，开发者收益按 `usdt_cny_rate` 换算为 USDT 记账
- 支付渠道支持支付宝/微信/USDT 三通道
- 开发者收益与提现保持 USDT-TRC20 不变

### Added
- `usdt_cny_rate` 汇率配置项（默认 7.2）
- 迁移 v0015：人民币计价相关字段

## [1.7.0] — 2026-09-01

### Added
- 底座版本发布管理：管理员可上传/发布 ApeAdmin 底座安装包
- 公开下载页展示版本列表，支持下载计数
- 迁移 v0014：`apehub_web_release` 表

## [1.6.0] — 2026-08-31

### Added
- MCP 工具集成：插件可声明 MCP 工具清单，供 AI Agent 调用
- 插件市场搜索/详情 MCP 工具注册
- 迁移 v0013：`mcp_tools` JSON 字段

## [1.5.0] — 2026-08-31

### Added
- 主题模式切换（light/dark），公开站点读取站点配置作为默认主题
- 迁移 v0011：`theme_mode` 字段

## [1.4.0] — 2026-08-31

### Added
- 插件市场完整闭环：开发者上传包 → 安全 ZIP 检查 → DeepSeek 生成文档 → 版本审核 → 发布
- 永久购买授权、LemPay 支付回调、退款保护、结算账本
- TRC20 提现申请与管理员审核打款
- 多钱包支持：每用户可配置多个 USDT-TRC20 提现地址
- 迁移 v0007-v0010

## [1.3.0] — 2026-08-31

### Added
- 可配置公共导航菜单（CRUD、排序、启用/禁用）
- 可靠的安装统计（去重用户安装记录）
- 管理页面增强：包文件审查、状态流转、购买/安装/下载计数
- 迁移 v0006

## [1.2.2] — 2026-08-29

### Fixed
- 修复默认 Logo 路径引用旧的 `/apeui/assets/logo.png`，改为 `/apehub-web/assets/logo.png`
- 迁移 v0005

## [1.2.1] — 2026-08-29

### Added
- 默认静态资源：Logo 和 Hero 图片
- 迁移 v0004：仅更新空字段，不覆盖已配置的自定义图片

## [1.2.0] — 2026-08-28

### Added
- 邮箱验证码注册：一次性 6 位码，5 分钟过期，按邮箱和 IP 限流
- 验证码存储为 hash 摘要，消费后失效
- 迁移 v0003：`apehub_web_email_verification` 表

### Security
- 配置 API 永不返回 `mail_code`，空值更新时保留已有值

## [1.1.0] — 2026-08-28

### Changed
- 插件身份从旧 `apeui` 迁移到 `apehub_web`：API 前缀、静态路径、表名、权限标识全部替换
- 迁移 v0002：自动迁移旧 `apeui_*` 数据到 `apehub_web_*` 表，保留主键和外键引用

### Notes
- 迁移仅运行一次，不删除旧表
- 如目标表已有数据且旧表仍存在，迁移报错而非合并

## [1.0.0] — 2026-08-26

### Added
- 初始版本：产品首页、插件市场、技术文档、个人中心
- 管理后台：站点配置、内容管理、文档管理
- 迁移 v0001：全部初始表 + 种子数据

> AI生成