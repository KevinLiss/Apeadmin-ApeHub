---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '71f6e5a0-2f40-4ece-983f-315f62ed3e60'
  PropagateID: '71f6e5a0-2f40-4ece-983f-315f62ed3e60'
  ReservedCode1: 'fbc32cd4-c4bb-421a-84b3-5e7680d6a75f'
  ReservedCode2: 'fbc32cd4-c4bb-421a-84b3-5e7680d6a75f'
---

# ApeHub Web — ApeAdmin 官网门户插件

> ApeAdmin 官方网站门户，以插件形式集成于 ApeAdmin 底座。提供产品展示、插件市场、技术文档、用户中心和开发者管理后台。

## 核心功能

### 公开网站（`/apehub-web`）

| 模块 | 说明 |
|------|------|
| 首页 | Hero 区、功能亮点、统计数据、CTA |
| 插件市场 | 浏览/搜索/筛选插件、详情页、在线购买 |
| 技术文档 | VitePress 构建的文档站（`/apehub-web/docs-portal/`） |
| 个人中心 | 用户资料、钱包余额、收入明细、提现管理 |
| 底座下载 | ApeAdmin 底座版本列表与安装包下载 |

### 管理后台（`/admin` 侧边栏 → ApeHub）

| 页面 | 路由 | 权限 | 功能 |
|------|------|------|------|
| 站点配置 | `apehub_web/admin/Config` | `apehub_web:config` | 站点信息、SEO、邮箱 SMTP、支付配置、AI Provider、主题 |
| 内容管理 | `apehub_web/admin/Content` | `apehub_web:content` | 首页 Hero/Features/Footer 内容区块编辑 |
| 文档管理 | `apehub_web/admin/Docs` | `apehub_web:docs` | 技术文档 CRUD、分类管理 |
| 插件管理 | `apehub_web/admin/Plugins` | `apehub_web:plugins` | 插件审核、版本发布、源码审查 |
| 订单管理 | `apehub_web/admin/Orders` | `apehub_web:orders` | 订单查看、退款处理 |
| 提现管理 | `apehub_web/admin/Withdrawals` | `apehub_web:withdrawals` | 提现审核、打款确认 |
| 用户管理 | `apehub_web/admin/Users` | `apehub_web:users` | 用户列表、开发者状态 |
| 技术文档 | `apehub_web/admin/TechDocs` | `apehub_web:tech_docs` | 服务器端 Markdown 文件在线编辑 |

### 开发者 API（`/api/v1/apehub-web`）

- **公开接口**：站点配置、内容、导航、文档、插件列表、底座下载
- **开发者接口**：插件 CRUD、版本管理、安装包上传、AI 文档生成、提交审核
- **管理接口**：插件审核/发布、订单管理、提现审核、用户管理、底座版本管理
- **用户接口**：钱包管理、提现申请、收入明细、账本记录
- **MCP 工具**：插件市场搜索/详情工具，供 AI Agent 调用

## 技术栈

- **后端**：Python / FastAPI / SQLAlchemy（异步）
- **前端**：Vue 3 / Vite / Element Plus（集成于 ApeAdmin 前端）
- **文档站**：VitePress（构建产物预置在 `static/docs-portal/`）
- **数据库**：SQLite（开发）/ MySQL（生产），所有表前缀 `apehub_web_`
- **AI Provider**：DeepSeek / 通义千问 / Coze 工作流（可选，用于代码→文档自动生成）

## 目录结构

```
apehub_web/
├── plugin.py              # 插件入口（安装/卸载/路由注册/MCP 注册）
├── plugin.json            # 插件元数据
├── api.py                 # 全部 RESTful API 路由
├── models.py              # SQLAlchemy ORM 模型（22 张表）
├── schemas.py             # Pydantic 请求/响应模型
├── services.py            # 业务逻辑（支付回调、结算等）
├── analysis.py            # AI 代码分析（DeepSeek/千问/Coze）
├── mcp_tools.py           # MCP 工具注册
├── seed.py                # 种子数据（导航、菜单、权限）
├── migrations/            # 数据库迁移（v0001–v0016）
├── frontend/              # Vue 前端源码（交付给 ApeAdmin 前端构建）
│   └── src/
│       ├── api/apehub_web.ts
│       └── views/apehub_web/admin/*.vue
├── static/                # 编译后的静态网站
│   ├── index.html         # 首页
│   ├── plugins.html       # 插件市场
│   ├── plugin-detail.html # 插件详情
│   ├── profile.html       # 个人中心
│   ├── docs.html          # 文档入口
│   ├── download.html      # 底座下载
│   └── docs-portal/       # VitePress 构建产物
├── docs-site/             # VitePress 源文件
└── UPGRADE.md             # 历史版本升级说明
```

## 安装

### 方式一：通过 ApeAdmin 后台安装

1. 进入 ApeAdmin 管理后台 → 插件管理
2. 上传 `apehub_web-x.x.x.zip` 安装包
3. 点击「安装」→ 插件自动执行数据库迁移和种子数据初始化
4. 安装完成后在侧边栏看到 ApeHub 菜单

### 方式二：手动放置（开发模式）

将本目录放入 ApeAdmin 的 `backend/src/plugins/builtin/` 下，重启后端服务，插件发现机制会自动加载。

### 前端集成

插件包含 Vue 前端源码，需将 `frontend/src/` 下的文件复制到 ApeAdmin 前端项目对应位置后构建：

```bash
# 复制前端文件到 ApeAdmin 前端
cp -r frontend/src/api/apehub_web.ts  /path/to/apeadmin/frontend/src/api/
cp -r frontend/src/views/apehub_web/  /path/to/apeadmin/frontend/src/views/

# 在 ApeAdmin 前端目录构建
cd /path/to/apeadmin/frontend
npm run build
```

详见 [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)。

## 配置

安装后进入 **管理后台 → ApeHub → 站点配置** 进行配置：

### 基础配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| 站点名称 | 网站显示名 | ApeHub |
| 站点 Logo | Logo 图片路径 | /apehub-web/assets/logo.png |
| 站点域名 | 独立域名（可选） | - |
| 主题模式 | light / dark | light |

### SEO 配置

SEO 标题、描述、关键词。

### 邮箱配置（SMTP）

用于用户注册邮箱验证码。配置 QQ 邮箱 SMTP：`mail_user` / `mail_code` / `mail_host` / `mail_port`。

### 支付配置（LemPay）

| 配置项 | 说明 |
|--------|------|
| LemPay 商户 ID | 支付平台分配的商户号 |
| LemPay 密钥 | 支付密钥（加密存储） |
| 支付渠道 | alipay / wxpay / usdt（收银台模式，按需展示） |
| 服务费率 | 平台抽成比例（默认 30%） |
| USDT 汇率 | CNY→USDT 换算汇率（默认 7.2） |
| 结算天数 | 收入冻结期（默认 7 天） |
| 退款天数 | 退款保护期（默认 7 天） |
| 最低提现 | 最低提现金额（默认 100 USDT） |

### AI Provider 配置

用于「AI 补全」功能（上传代码包 → 自动生成技术文档）。

| Provider | 用途 | 配置项 |
|----------|------|--------|
| DeepSeek | 代码分析 + 文档生成 + 润色 | API Key / Base URL / Model |
| 通义千问 | 代码分析 + 文档生成 + 润色 | API Key / Base URL / Model |
| Coze | 仅 AI 补全（代码→文档） | API Key / 工作流 ID |

> **说明**：Coze 仅用于「AI 补全」（代码→文档），润色类功能（AI 优化文档/Changelog）继续走 DeepSeek 或千问。

## 数据库表

共 22 张表，全部前缀 `apehub_web_`：

| 表名 | 说明 |
|------|------|
| `apehub_web_site_config` | 站点配置（单行） |
| `apehub_web_site_content` | 内容区块（hero/features/footer） |
| `apehub_web_navigation_item` | 导航菜单 |
| `apehub_web_email_verification` | 邮箱验证码 |
| `apehub_web_doc_category` | 文档分类 |
| `apehub_web_doc` | 技术文档 |
| `apehub_web_plugin` | 插件市场目录 |
| `apehub_web_plugin_version` | 插件版本（审核/发布流程） |
| `apehub_web_plugin_file` | 插件安装包/文档文件 |
| `apehub_web_plugin_media` | 插件轮播图/Logo |
| `apehub_web_plugin_demo` | 插件 Demo（H5/小程序/后台链接） |
| `apehub_web_plugin_installation` | 安装记录（统计） |
| `apehub_web_analysis_job` | AI 代码分析任务 |
| `apehub_web_plugin_review` | 审核历史记录 |
| `apehub_web_purchase_entitlement` | 永久购买授权 |
| `apehub_web_order` | 购买订单 |
| `apehub_web_income` | 收入分成记录 |
| `apehub_web_wallet` | USDT-TRC20 提现钱包 |
| `apehub_web_withdrawal` | 提现申请 |
| `apehub_web_payment_event` | 支付回调事件（幂等） |
| `apehub_web_ledger_entry` | 开发者余额账本（只追加） |
| `apehub_web_release` | ApeAdmin 底座版本发布包 |

## 插件生命周期

| 操作 | 行为 |
|------|------|
| **安装** | 执行数据库迁移 + 种子数据（导航、菜单、权限） |
| **启用** | 恢复侧边栏菜单 + 注册路由 |
| **禁用** | 隐藏菜单 + 注销路由，数据保留 |
| **卸载**（keep_data=true） | 移除运行时资源，保留数据表 |
| **卸载**（keep_data=false） | DROP 所有 `apehub_web_*` 表 |

安装是幂等的——重复安装不会重复创建数据。

## 权限

插件注册以下权限到 ApeAdmin RBAC 体系：

| 权限标识 | 说明 |
|----------|------|
| `apehub_web:config` | 站点配置 |
| `apehub_web:content` | 内容管理 |
| `apehub_web:docs` | 文档管理 |
| `apehub_web:tech_docs` | 技术文档编辑 |
| `apehub_web:plugins` | 插件审核管理 |
| `apehub_web:orders` | 订单管理 |
| `apehub_web:withdrawals` | 提现管理 |
| `apehub_web:users` | 用户管理 |

## 迁移版本

当前 Schema Version: **16**

| 版本 | 文件 | 说明 |
|------|------|------|
| v0001 | `v0001_initial.py` | 初始化全部表 + 种子数据 |
| v0002 | `v0002_migrate_apeui.py` | 旧 apeui 数据迁移 |
| v0003 | `v0003_email_verification.py` | 邮箱验证码表 |
| v0004 | `v0004_default_assets.py` | 默认 Logo/截图 |
| v0005 | `v0005_legacy_asset_path.py` | 修复旧资源路径 |
| v0006 | `v0006_navigation_and_installations.py` | 可配置导航 + 安装统计 |
| v0007 | `v0007_marketplace_foundation.py` | 插件市场基础（订单/收入/提现） |
| v0008 | `v0008_docs_portal.py` | VitePress 文档站 |
| v0009 | `v0009_plugin_detail_config.py` | 插件详情页配置 |
| v0010 | `v0010_multi_wallet.py` | 多钱包支持 |
| v0011 | `v0011_theme_mode.py` | 主题模式 |
| v0012 | `v0012_qwen_provider.py` | 通义千问 AI Provider |
| v0013 | `v0013_mcp_tools.py` | MCP 工具声明字段 |
| v0014 | `v0014_releases.py` | 底座版本发布管理 |
| v0015 | `v0015_cny_pricing.py` | 人民币计价 + 汇率换算 |
| v0016 | `v0016_coze_provider.py` | Coze 工作流 AI Provider |

## 开发

### 本地开发环境

```bash
# 启动 ApeAdmin 后端（自动加载插件）
cd /path/to/apeadmin/backend
python -m uvicorn src.main:app --reload --port 8000

# 启动 ApeAdmin 前端
cd /path/to/apeadmin/frontend
npm run dev
```

### 文档站构建

```bash
cd docs-site
npm install
npm run docs:build  # 产物输出到 docs-site/docs/.vitepress/dist/
```

### 打包

使用打包脚本生成安装包：

```bash
python package_apehub.py  # 生成 apehub_web-x.x.x.zip
```

## 线上部署

```bash
# 1. 同步代码到服务器
scp -r ./* root@apehub.finecv.cn:/www/wwwroot/apeadmin/src/plugins/builtin/apehub_web/

# 2. 执行数据库迁移
cd /www/wwwroot/apeadmin && .venv/bin/python -c "
import asyncio
from src.plugins.builtin.apehub_web.migrations import apply_migrations
asyncio.run(apply_migrations())
"

# 3. 清除 Python 缓存
find /www/wwwroot/apeadmin/src/plugins/builtin/apehub_web -name '__pycache__' -exec rm -rf {} +

# 4. 重启服务
systemctl restart apeadmin
```

## 许可证

随 ApeAdmin 主项目发布。

## 相关链接

- **ApeAdmin 底座**：[GitHub](https://github.com/KevinLiss/ApeAdmin)
- **线上环境**：[apehub.finecv.cn](https://apehub.finecv.cn)
- **管理后台**：[apehub.finecv.cn/admin](https://apehub.finecv.cn/admin)
- **历史升级说明**：[UPGRADE.md](UPGRADE.md)
- **前端集成说明**：[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
- **更新日志**：[CHANGELOG.md](CHANGELOG.md)