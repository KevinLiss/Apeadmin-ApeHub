/* ApeHub i18n: frontend dictionary + language toggle + apply mechanism.
 *
 * Design:
 * - Static copy is translated via [data-i18n] attributes (textContent replacement).
 * - Dynamic copy (rendered by marketplace.js / plugin-detail-app.js / site-runtime.js)
 *   re-renders on language change through the window 'apeI18n.switch' event.
 * - Language preference: manual choice wins (localStorage 'ape-lang'); otherwise
 *   follow navigator.language (zh* -> zh, else en).
 */
(() => {
  const STORAGE_KEY = 'ape-lang';
  const state = { lang: 'zh' };

  /* ---------- dictionary ---------- */
  const dict = {
    zh: {
      /* nav & shared */
      'nav.home': '首页',
      'nav.plugins': '插件市场',
      'nav.docs': '技术文档',
      'nav.download': '安装下载',
      'nav.profile': '个人中心',
      'nav.login': '登录 / 注册',
      'nav.lang.aria': '切换语言',
      'nav.lang.title': '切换中英文',
      'nav.theme.aria': '切换主题',
      'nav.theme.title': '切换明暗主题',

      /* auth modal */
      'auth.login': '登录',
      'auth.login.sub': '登录你的账户以继续',
      'auth.welcome.back': '欢迎回来',
      'auth.welcome.new': '创建账户',
      'auth.register.sub': '注册一个新账户开始使用',
      'auth.codePlaceholder': '输入 6 位数字验证码',
      'auth.passwordPlaceholder': '至少 8 位密码',
      'auth.usernamePlaceholder': '3-50 个字符，字母/数字/下划线',
      'auth.toLogin': '去登录',

      /* index.html */
      'index.badge': '面向 AI 智能体场景',
      'index.hero.desc': 'ApeAdmin 基于 FastAPI + Vue3 打造，跳出传统后台设计思路，原生为 AI Agent 能力调用做适配。开箱即用、可插拔扩展，帮开发者快速搭建兼具业务管理与 AI 工具输出能力的应用。',
      'index.cta.primary': '浏览插件市场',
      'index.cta.secondary': '快速开始',
      'index.stat.plugins': '插件数量',
      'index.stat.downloads': '累计下载',
      'index.stat.downloads.unit': '次',
      'index.stat.openness': '开源协议',
      'index.stat.openness.value': 'MIT',
      'index.stat.projects': '支撑项目',
      'index.stat.projects.unit': '个',
      'index.stat.communities': '技术社区',
      'index.stat.users': '服务开发者',
      'index.stat.users.unit': '万+',
      'index.stat.roadmap': '版本迭代',
      'index.stat.roadmap.unit': '月',
      'index.bread.cta': '与 ApeAdmin 一起，把管理系统变成 AI 的工具',
      'index.bread.cta.sub': '开源 · 免费 · 面向智能体场景，立即体验或给项目点个 Star。',
      'index.bread.btn.primary': '立即体验',
      'index.bread.btn.secondary': 'GitHub',
      'index.footer.oss': '开源 · 免费 · 面向智能体场景',
      'index.footer.links.docs': '文档',
      'index.footer.links.market': '插件市场',
      'index.footer.links.download': '安装下载',
      'index.footer.copyright': '© 2026 ApeAdmin. All rights reserved.',

      /* plugins.html */
      'plugins.search.placeholder': '搜索插件名称 / 描述 / 标签',
      'plugins.search.btn': '搜索',
      'plugins.filter.all': '全部',
      'plugins.filter.python': 'Python 版',
      'plugins.filter.go': 'Go 版',
      'plugins.loadmore': '加载更多',
      'plugins.empty.title': '暂无符合条件的插件',
      'plugins.empty.sub': '试试切换其他分类或调整搜索关键词',
      'plugins.install': '安装',
      'plugins.download': '下载',
      'plugins.free': '免费',
      'plugins.noDesc': '暂无介绍',
      'plugins.title.tag': 'market',
      'plugins.title.text': '插件市场',
      'plugins.title': '插件<span class="grad">市场</span>',
      'plugins.title.desc': '发现、安装并管理 ApeAdmin 插件生态中的高质量插件。',
      'plugins.footer': '© 2026 ApeAdmin · 插件市场 · MIT License',

      /* plugin-detail.html */
      'detail.breadcrumb.market': '插件市场',
      'detail.breadcrumb.current': '插件详情',
      'detail.tag.featured': '⭐ 精选插件',
      'detail.tab.docs': '技术文档',
      'detail.tab.reviews': '用户评价',
      'detail.tab.qa': '常见问答',
      'detail.loading': '加载中…',
      'detail.error': '加载失败',
      'detail.noDocs': '暂无技术文档',
      'detail.retry': '重新加载',
      'detail.crumb.home': '首页',
      'detail.crumb.market': '插件市场',
      'detail.crumb.current': '插件详情',
      'detail.star.tag': '⭐ 精选插件',
      'detail.demo.btn': '🖥 立即体验 ▾',
      'detail.demo.h5': '📱 H5 在线体验',
      'detail.demo.pc': '💻 PC 后台体验',
      'detail.demo.api': '🔌 API 接口调试',
      'detail.demo.mcp': '🤖 MCP 工具调用',
      'detail.demo.none': '暂无在线 Demo',
      'detail.buy.btn': '🛒 立即购买',
      'detail.buy.title': '选择授权方案',
      'detail.buy.sub': '不同授权方案满足个人、团队与企业的使用需求，全部包含完整源码。',
      'detail.buy.loading': '正在加载插件授权信息',
      'detail.tab.intro': '📖 介绍',
      'detail.tab.docs': '📄 文档',
      'detail.tab.changelog': '📜 更新日志',
      'detail.intro.title': '插件<span class="em">介绍</span>',
      'detail.intro.desc': '了解这个插件的核心能力、技术特点与使用场景。',
      'detail.intro.features': '核心功能',
      'detail.intro.shots': '产品截图',
      'detail.intro.params': '技术参数',
      'detail.docs.title': '技术<span class="em">文档</span>',
      'detail.docs.desc': '插件的安装配置、接口说明与使用指南。',
      'detail.docs.install': '安装方式',
      'detail.changelog.title': '更新<span class="em">日志</span>',
      'detail.changelog.desc': '插件版本迭代记录与功能变更。',
      'detail.footer': '© 2026 ApeAdmin · 插件详情 · MIT License',
      'detail.float.contact': '客服咨询',
      'detail.float.docs': '帮助文档',
      'detail.float.top': '返回顶部',
      'detail.dl': '下载',
      'detail.author': '开发者',
      'detail.rating': '评分',
      'detail.version': '版本',
      'page.title.home': 'ApeAdmin · 面向 AI 智能体场景的开发框架',
      'page.title.plugins': 'ApeAdmin · 插件市场',
      'page.title.download': 'ApeAdmin · 安装下载',
      'page.title.detail': 'ApeAdmin · 插件详情',
      'page.title.profile': 'ApeHub - 个人中心',
      'detail.noDesc': '暂无介绍',
      'detail.category': '插件',
      'detail.loadFail': '插件无法加载',
      'detail.backMarket': '返回插件市场',
      'detail.noShots': '暂无产品截图',
      'detail.table.th.param': '参数',
      'detail.table.th.desc': '说明',
      'detail.table.version': '当前版本',
      'detail.table.compat': '兼容性',
      'detail.table.files': '文件数',
      'detail.table.risk': '静态风险级别',
      'detail.table.license': '授权',
      'detail.table.free': '免费开源，可自由下载使用',
      'detail.table.paid': '购买一次，永久获得该插件全部已发布版本',
      'detail.risk.none': '无风险',
      'detail.risk.low': '低',
      'detail.risk.medium': '中',
      'detail.risk.high': '高',
      'detail.risk.critical': '严重',
      'detail.risk.none.marked': '未标记',
      'detail.changelog.empty': '暂无版本记录',
      'detail.changelog.none': '无更新说明',
      'detail.feat.fallback.title': '插件能力',
      'detail.buy.full.title': '完整插件授权',
      'detail.buy.unit': ' 人民币 / 永久',
      'detail.buy.cta.paid': '前往支付',
      'detail.buy.cta.free': '下载当前版本',
      'detail.buy.payhint': '点击「前往支付」进入收银台，支持支付宝 / 微信 / USDT',
      'detail.buy.feature1': '当前已发布版本',
      'detail.buy.feature2': '后续发布版本',
      'detail.buy.feature3': '完整技术文档',
      'detail.free': '免费下载',
      'detail.buy.prefix': '购买 ',
      'detail.login.first': '请先登录或注册',
      'detail.noFile': '当前版本暂无可下载文件',
      'detail.dlFail': '下载失败',

      /* download.html */
      'download.title.tag': 'install',
      'download.title.text': '安装下载',
      'download.title.desc': '获取 ApeAdmin Python 版与 Go 版源码，快速启动你的项目。',
      'download.python.badge': 'Python 版 · FastAPI',
      'download.go.badge': 'Go 版 · Gin',
      'download.python.title': 'Python 版（FastAPI）',
      'download.go.title': 'Go 版（Gin）',
      'download.python.desc': '基于 FastAPI 与 Vue 3 的全功能管理平台，类型安全、异步数据层、插件体系完善。',
      'download.go.desc': '单二进制部署、GORM 数据访问、原生高并发、MCP 网关集成，适合追求性能的场景。',
      'download.python.git': 'GitHub 仓库',
      'download.go.git': 'GitHub 仓库',
      'download.python.doc': 'Python 技术文档',
      'download.go.doc': 'Go 技术文档',
      'download.license': 'MIT License · 开源免费',
      'download.python.note': '服务启动后访问管理后台，默认账号 admin，首次登录后请及时修改密码。',
      'download.go.note': '生产环境请修改 configs/config.yaml 中的 jwt.secret 并设置 debug=false。访问 http://localhost:8001，默认账号 admin / admin123。',
      'download.title': '安装<span class="grad">下载</span>',
      'download.footer': '© 2026 ApeAdmin · 安装下载 · MIT License',
      'download.latest.tag': '最新版本',
      'download.latest.download': '立即下载',
      'download.latest.viewall': '查看全部版本',
      'download.versions.title': '全部版本',
      'download.versions.sub': '包含历史版本与更新日志，可按需下载',
      'download.guide.title': '安装说明',
      'download.guide.sub': '三步完成部署',
      'download.guide.sub.fmt': '三步完成部署（{fw}）',
      'download.loading': '正在加载版本列表...',
      'download.empty': '暂无可用安装包，敬请期待',
      'download.noChangelog': '暂无更新日志',
      'download.notUploaded': '未上传安装包',
      'download.noFile': '未上传',
      'download.dl': '下载',
      'download.latest': '最新',
      'download.rLatestTag': '最新',
      'download.guide.python.step1.title': '下载安装包',
      'download.guide.python.step1.desc': '点击上方「立即下载」获取最新版 ZIP 安装包，也可在全部版本中选择历史版本。',
      'download.guide.python.step2.title': '上传到服务器',
      'download.guide.python.step2.desc': '将安装包上传至 ApeAdmin 服务器，然后在管理后台「系统管理 → 版本更新」中选择该 ZIP 包并一键更新。',
      'download.guide.python.step2.code': '# 也可通过命令行部署\npip install -r requirements.txt\npython -m uvicorn src.main:app --host 0.0.0.0 --port 80',
      'download.guide.python.step3.title': '完成部署',
      'download.guide.python.step3.desc': '服务启动后访问 admin 后台，默认账号 admin，首次登录后请及时修改密码。更多细节见 Python 技术文档。',
      'download.guide.go.step1.title': '下载安装包',
      'download.guide.go.step1.desc': '点击上方「立即下载」获取 Go 版 ZIP 安装包。Go 版为单二进制部署，无需 Python 运行时。',
      'download.guide.go.step2.title': '编译并启动',
      'download.guide.go.step2.desc': '将 ZIP 解压后，编译并运行单个可执行文件，默认端口 8001：',
      'download.guide.go.step3.title': '配置与访问',
      'download.guide.go.step3.desc': '生产环境请修改 configs/config.yaml 中的 jwt.secret 并设置 debug=false。访问 http://localhost:8001，默认账号 admin / admin123。更多细节见 Go 技术文档。',
      'download.installGuideSub': '三步完成部署（Python 版）',

      /* docs.html entry */
      'docs.entry.title': 'ApeHub 技术文档',
      'docs.entry.text': '正在前往 ApeHub 技术文档...',

      /* index.html nav / hero / sections (zh values match page defaults) */
      'index.nav.features': '核心特性',
      'index.nav.arch': '架构',
      'index.nav.mcp': 'MCP 网关',
      'index.hero.tag': '面向 AI 智能体场景的开源开发框架 · MIT License',
      'index.hero.h1': '让中后台管理，<br />为 <span class="grad">AI 智能体</span> 而生',
      'index.hero.cta.primary': '立即体验 →',
      'index.hero.cta.plugins': '插件市场',
      'index.hero.cta.docs': '技术文档',
      'index.hero.stat1.num': '快速开发',
      'index.hero.stat1.label': '3 分钟跑起来，CLI 一键生成',
      'index.hero.stat2.num': '专业架构',
      'index.hero.stat2.label': 'Fastapi/Gin + Vue3 前后端分离',
      'index.hero.stat3.num': '社区庞大',
      'index.hero.stat3.label': '插件市场持续沉淀生态',
      'index.hero.stat4.num': '适配 AI',
      'index.hero.stat4.label': 'MCP 网关原生对接 Agent',
      'index.gh.go': 'Go 版 (Gin)',
      'index.gh.py': 'Python 版 (FastAPI)',
      'index.features.title': '开箱即用的企业级能力',
      'index.features.desc': '底座提供权限、菜单、日志等基础设施，业务功能以插件形式独立开发与部署，同时通过 MCP 网关将管理能力暴露给 AI Agent 调用。',
      'index.f1.title': 'RBAC 权限体系',
      'index.f1.desc': '标准五表模型（用户/角色/菜单/部门），四层权限粒度，无限层级树形菜单，超管自动通配。',
      'index.f1.tag1': '四层权限',
      'index.f1.tag2': '菜单三类型',
      'index.f2.title': '插件化架构',
      'index.f2.desc': '插件以 Python 包开发，自动发现、热启用禁用、ZIP 一键安装，与底座完全解耦。Go 版同样支持插件化扩展。',
      'index.f3.title': 'MCP-SSE 网关',
      'index.f3.desc': '将底座与插件能力封装为标准 AI 工具，Agent 可调用、RBAC 过滤、自动审计。',
      'index.f4.title': 'AI 对话助手',
      'index.f4.desc': '多模型支持、流式 SSE 输出、Function Calling 工具调用循环，后台管理密钥加密存储。',
      'index.f4.tag.qwen': '通义千问',
      'index.f4.tag.glm': '智谱 GLM',
      'index.f5.title': '审计日志',
      'index.f5.desc': '全局请求唯一 ID 追踪、操作记录、请求耗时监控，每次 AI 工具调用自动留痕。',
      'index.f5.tag1': '链路追踪',
      'index.f5.tag2': '耗时监控',
      'index.f6.title': '可维护的管理平台底座',
      'index.f6.desc': '仪表盘、电商、应用中心、用户中心、组件示例五大模块，全部基于 Element Plus 重写。',
      'index.arch.title': '前后端分离 · 底座与插件解耦',
      'index.arch.desc': '单体应用架构 + 后端插件化扩展，双数据库驱动无缝切换，Redis 可选自动降级。',
      'index.arch.node1': '前端 Vue3',
      'index.arch.node1.sub': 'Vite 6 + TypeScript + Element Plus + Pinia',
      'index.arch.node2': 'FastAPI / Gin 底座',
      'index.arch.node2.sub': 'RBAC · 审计 · MCP 网关 · AI 对话 · 动态路由',
      'index.arch.node3': '业务插件',
      'index.arch.node3.sub': 'Python 包 / Go 模块 · 事件总线 · 可热插拔',
      'index.arch.note': '数据库：SQLite（开发零配置）↔ MySQL（生产）双驱动自动切换 · 缓存：Redis 缺失自动降级内存',
      'index.mcp.title': '把管理系统变成 AI 的工具',
      'index.mcp.desc': '通过 MCP-SSE 网关，将底座与插件的管理能力封装为标准化 AI 工具，实现传统业务系统与大模型智能体的无缝打通。',
      'index.mcp.left.title': '一条 <span class="grad">@mcp_manager.tool</span><br />让 Agent 直接接管系统',
      'index.mcp.left.desc': '插件只需几行代码即可向 MCP 网关注册工具。AI Agent 调用时自动进行 RBAC 过滤与审计，权限安全无缝延续。',
      'index.mcp.item1.title': '三原语支持',
      'index.mcp.item1.sub': 'Tools 工具调用 / Resources 资源读取 / Prompts 模板渲染',
      'index.mcp.item2.title': '自动 Schema',
      'index.mcp.item2.sub': '从函数签名自动推断 JSON Schema，无需手写',
      'index.mcp.item3.title': 'RBAC 过滤',
      'index.mcp.item3.sub': 'Agent 只能看到当前用户有权限调用的工具',
      'index.mcp.item4.title': '全程审计',
      'index.mcp.item4.sub': '每次工具调用自动记录请求、响应、耗时与调用者',
      'index.stack.title': '现代、稳健、可扩展',
      'index.stack.desc': '选型兼顾性能与开发效率，双数据库驱动与可选缓存让你在开发与生产间无缝切换。',
      'index.stack.backend': '后端',
      'index.stack.frontend': '前端',
      'index.stack.storage': '数据存储',
      'index.stack.redis': 'Redis 可选',
      'index.stack.charts': '图表',
      'index.stack.auth': '认证安全',
      'index.stack.keyenc': 'API Key 加密存储',
      'index.stack.protocol': 'AI 协议',
      'index.stack.model': 'AI 模型',
      'index.stack.platform': '平台',
      'index.plugin.title': '插件化 · 让业务独立生长',
      'index.plugin.desc': '插件间通过事件总线松耦合通信，支持 ZIP 上传安装，能力可路由注册、MCP 工具注册、事件监听。',
      'index.plugin.card1.title': '🔄 完整生命周期',
      'index.plugin.card1.desc': 'load → install → register → uninstall，支持热启用禁用，无需重启即可插拔业务模块。',
      'index.plugin.card1.ev': '监听 <b>USER_LOGIN</b> · <b>APP_STARTUP</b> · <b>DB_READY</b>',
      'index.plugin.card2.title': '📦 ZIP 一键安装',
      'index.plugin.card2.desc': '上传 ZIP 包自动导入插件，无需手动放置文件，菜单路由动态生成。',
      'index.plugin.card3.title': '🔗 能力开放',
      'index.plugin.card3.desc': '插件可注册自有路由、MCP 工具与事件监听器，实现能力级对外开放。',
      'index.start.title': '三分钟跑起来',
      'index.start.desc': '默认使用 SQLite 零配置启动，无需额外安装数据库。',
      'index.start.step1.title': '启动后端',
      'index.start.step1.desc': 'Python 版需 Python 3.11+，Go 版需 Go 1.21+，一行命令跑起后端服务。',
      'index.start.step2.title': '启动前端',
      'index.start.step2.desc': 'Node.js 18+，npm install 后 npm run dev，访问 localhost:5173。',
      'index.start.step3.title': '登录体验',
      'index.start.step3.desc': '使用默认账号 admin / admin123 登录，开始管理你的系统。',
      'index.cta.title': '开始构建你的 AI 中后台',
      'index.cta.desc': '开源 · 免费 · 面向智能体场景，立即体验或给项目点个 Star。',
      'index.cta.more': '了解更多',
      'index.footer.brand': '面向 AI 智能体场景的开发框架。以 FastAPI/Gin 异步服务、Vue 3 管理界面、RBAC 与可控插件机制支撑持续交付。',
      'index.footer.col1': '产品',
      'index.footer.col2': '开发',
      'index.footer.col3': '社区',
      'index.footer.quick': '快速开始',
      'index.footer.bottom1': '© 2026 ApeAdmin · 面向 AI 智能体场景的开发框架',
    },

    en: {
      /* nav & shared */
      'nav.home': 'Home',
      'nav.plugins': 'Marketplace',
      'nav.docs': 'Docs',
      'nav.download': 'Download',
      'nav.profile': 'Profile',
      'nav.login': 'Sign in / Register',
      'nav.lang.aria': 'Switch language',
      'nav.lang.title': 'Switch between Chinese and English',
      'nav.theme.aria': 'Toggle theme',
      'nav.theme.title': 'Toggle light/dark theme',

      /* auth modal */
      'auth.login': 'Sign in',
      'auth.login.sub': 'Sign in to continue',
      'auth.welcome.back': 'Welcome back',
      'auth.welcome.new': 'Create account',
      'auth.register.sub': 'Register a new account to get started',
      'auth.codePlaceholder': 'Enter the 6-digit verification code',
      'auth.passwordPlaceholder': 'At least 8 characters',
      'auth.usernamePlaceholder': '3-50 chars: letters / digits / underscores',
      'auth.toLogin': 'Sign in',

      /* index.html base */
      'index.badge': 'Built for AI agent scenarios',
      'index.hero.desc': 'ApeAdmin is built on FastAPI + Vue3, breaking away from traditional admin design and natively adapting to AI-agent capability calls. Batteries included, pluggable, and ready to help you ship apps that combine business management with AI tool output.',
      'index.cta.primary': 'Browse Marketplace',
      'index.cta.secondary': 'Quick Start',
      'index.stat.plugins': 'Plugins',
      'index.stat.downloads': 'Total downloads',
      'index.stat.downloads.unit': '',
      'index.stat.openness': 'License',
      'index.stat.openness.value': 'MIT',
      'index.stat.projects': 'Projects powered',
      'index.stat.projects.unit': '',
      'index.stat.communities': 'Communities',
      'index.stat.users': 'Developers',
      'index.stat.users.unit': '10k+',
      'index.stat.roadmap': 'Release cadence',
      'index.stat.roadmap.unit': 'mo',
      'index.bread.cta': 'Build admin systems that become AI tools',
      'index.bread.cta.sub': 'Open source · free · built for agent scenarios. Try it now or give the project a Star.',
      'index.bread.btn.primary': 'Try it now',
      'index.bread.btn.secondary': 'GitHub',
      'index.footer.oss': 'Open source · free · built for agent scenarios',
      'index.footer.links.docs': 'Docs',
      'index.footer.links.market': 'Marketplace',
      'index.footer.links.download': 'Download',
      'index.footer.copyright': '© 2026 ApeAdmin. All rights reserved.',

      /* plugins.html */
      'plugins.search.placeholder': 'Search plugin name / description / tags',
      'plugins.search.btn': 'Search',
      'plugins.filter.all': 'All',
      'plugins.filter.python': 'Python Edition',
      'plugins.filter.go': 'Go Edition',
      'plugins.loadmore': 'Load more',
      'plugins.empty.title': 'No plugins match your criteria',
      'plugins.empty.sub': 'Try another category or adjust your search keywords',
      'plugins.install': 'Install',
      'plugins.download': 'Download',
      'plugins.free': 'Free',
      'plugins.noDesc': 'No description',
      'plugins.title.tag': 'market',
      'plugins.title.text': 'Marketplace',
      'plugins.title': 'Plugin <span class="grad">Market</span>',
      'plugins.title.desc': 'Discover, install and manage high-quality plugins in the ApeHub ecosystem.',
      'plugins.footer': '© 2026 ApeAdmin · Marketplace · MIT License',

      /* plugin-detail.html */
      'detail.breadcrumb.market': 'Marketplace',
      'detail.breadcrumb.current': 'Plugin details',
      'detail.tag.featured': '⭐ Featured plugin',
      'detail.tab.docs': 'Docs',
      'detail.tab.reviews': 'Reviews',
      'detail.tab.qa': 'FAQ',
      'detail.loading': 'Loading…',
      'detail.error': 'Failed to load',
      'detail.noDocs': 'No documentation yet',
      'detail.retry': 'Retry',
      'detail.crumb.home': 'Home',
      'detail.crumb.market': 'Marketplace',
      'detail.crumb.current': 'Plugin details',
      'detail.star.tag': '⭐ Featured plugin',
      'detail.demo.btn': '🖥 Try now ▾',
      'detail.demo.h5': '📱 H5 demo',
      'detail.demo.pc': '💻 PC admin demo',
      'detail.demo.api': '🔌 API playground',
      'detail.demo.mcp': '🤖 MCP tools',
      'detail.demo.none': 'No online demo yet',
      'detail.buy.btn': '🛒 Buy now',
      'detail.buy.title': 'Choose a license plan',
      'detail.buy.sub': 'Plans for individuals, teams and enterprises — full source code included.',
      'detail.buy.loading': 'Loading plugin license info',
      'detail.tab.intro': '📖 Overview',
      'detail.tab.docs': '📄 Docs',
      'detail.tab.changelog': '📜 Changelog',
      'detail.intro.title': 'Plugin <span class="em">Overview</span>',
      'detail.intro.desc': 'Core capabilities, technical highlights and use cases for this plugin.',
      'detail.intro.features': 'Core features',
      'detail.intro.shots': 'Screenshots',
      'detail.intro.params': 'Technical specs',
      'detail.docs.title': 'Technical <span class="em">Docs</span>',
      'detail.docs.desc': 'Installation, configuration, API reference and usage guide.',
      'detail.docs.install': 'Installation',
      'detail.changelog.title': 'Update <span class="em">Log</span>',
      'detail.changelog.desc': 'Version history and feature changes.',
      'detail.footer': '© 2026 ApeAdmin · Plugin Details · MIT License',
      'detail.float.contact': 'Contact support',
      'detail.float.docs': 'Help docs',
      'detail.float.top': 'Back to top',
      'detail.dl': 'Downloads',
      'detail.author': 'Developer',
      'detail.rating': 'Rating',
      'detail.version': 'Version',
      'page.title.home': 'ApeAdmin · The dev framework built for AI agents',
      'page.title.plugins': 'ApeAdmin · Plugin Marketplace',
      'page.title.download': 'ApeAdmin · Install & Download',
      'page.title.detail': 'ApeAdmin · Plugin Details',
      'page.title.profile': 'ApeHub - Profile',
      'detail.noDesc': 'No description',
      'detail.category': 'plugin',
      'detail.loadFail': 'Failed to load plugin',
      'detail.backMarket': 'Back to marketplace',
      'detail.noShots': 'No screenshots yet',
      'detail.table.th.param': 'Parameter',
      'detail.table.th.desc': 'Description',
      'detail.table.version': 'Current version',
      'detail.table.compat': 'Compatibility',
      'detail.table.files': 'Files',
      'detail.table.risk': 'Static risk level',
      'detail.table.license': 'License',
      'detail.table.free': 'Free & open source — download and use freely',
      'detail.table.paid': 'One-time purchase grants all published versions of this plugin forever',
      'detail.risk.none': 'None',
      'detail.risk.low': 'Low',
      'detail.risk.medium': 'Medium',
      'detail.risk.high': 'High',
      'detail.risk.critical': 'Critical',
      'detail.risk.none.marked': 'Not marked',
      'detail.changelog.empty': 'No version records yet',
      'detail.changelog.none': 'No release notes',
      'detail.feat.fallback.title': 'Plugin capabilities',
      'detail.buy.full.title': 'Full plugin license',
      'detail.buy.unit': ' RMB / one-time',
      'detail.buy.cta.paid': 'Go to checkout',
      'detail.buy.cta.free': 'Download current version',
      'detail.buy.payhint': 'Click "Go to checkout" to open the cashier — Alipay / WeChat / USDT supported',
      'detail.buy.feature1': 'All published versions',
      'detail.buy.feature2': 'Future releases',
      'detail.buy.feature3': 'Full technical docs',
      'detail.free': 'Free download',
      'detail.buy.prefix': 'Buy ',
      'detail.login.first': 'Please sign in or register first',
      'detail.noFile': 'No downloadable file for the current version',
      'detail.dlFail': 'Download failed',

      /* download.html */
      'download.title.tag': 'install',
      'download.title.text': 'Install & Download',
      'download.title.desc': 'Get the ApeHub Python and Go edition source code to kick off your project.',
      'download.python.badge': 'Python Edition · FastAPI',
      'download.go.badge': 'Go Edition · Gin',
      'download.python.title': 'Python Edition (FastAPI)',
      'download.go.title': 'Go Edition (Gin)',
      'download.python.desc': 'Full-featured admin platform built on FastAPI and Vue 3 — type-safe, async data layer, mature plugin ecosystem.',
      'download.go.desc': 'Single-binary deployment, GORM data access, native high concurrency and MCP gateway integration for performance-critical scenarios.',
      'download.python.git': 'GitHub repository',
      'download.go.git': 'GitHub repository',
      'download.python.doc': 'Python docs',
      'download.go.doc': 'Go docs',
      'download.license': 'MIT License · free & open source',
      'download.python.note': 'After startup, open the admin panel. Default account: admin. Change the password after first login.',
      'download.go.note': 'In production, set jwt.secret in configs/config.yaml and debug=false. Visit http://localhost:8001 with admin / admin123.',
      'download.title': 'Install & <span class="grad">Download</span>',
      'download.footer': '© 2026 ApeAdmin · Install & Download · MIT License',
      'download.latest.tag': 'Latest release',
      'download.latest.download': 'Download now',
      'download.latest.viewall': 'View all releases',
      'download.versions.title': 'All releases',
      'download.versions.sub': 'Includes historical versions and changelogs — download as needed',
      'download.guide.title': 'Installation guide',
      'download.guide.sub': 'Deploy in three steps',
      'download.guide.sub.fmt': 'Deploy in three steps ({fw})',
      'download.loading': 'Loading release list...',
      'download.empty': 'No installable packages yet — stay tuned',
      'download.noChangelog': 'No changelog yet',
      'download.notUploaded': 'No package uploaded',
      'download.noFile': 'Not uploaded',
      'download.dl': 'Download',
      'download.latest': 'Latest',
      'download.rLatestTag': 'Latest',
      'download.guide.python.step1.title': 'Download the package',
      'download.guide.python.step1.desc': 'Click "Download now" above to get the latest ZIP package, or pick an older release from the list.',
      'download.guide.python.step2.title': 'Upload to your server',
      'download.guide.python.step2.desc': 'Upload the package to your ApeAdmin server, then in the admin panel go to "System → Version Update", select the ZIP and update with one click.',
      'download.guide.python.step2.code': '# or deploy via CLI\npip install -r requirements.txt\npython -m uvicorn src.main:app --host 0.0.0.0 --port 80',
      'download.guide.python.step3.title': 'Finish deployment',
      'download.guide.python.step3.desc': 'After startup, open the admin panel. Base account: admin. Change the password after first login. See the Python docs for details.',
      'download.guide.go.step1.title': 'Download the package',
      'download.guide.go.step1.desc': 'Click "Download now" to get the Go ZIP package. The Go edition deploys as a single binary — no Python runtime required.',
      'download.guide.go.step2.title': 'Build and run',
      'download.guide.go.step2.desc': 'Unzip, then build and run the single executable. Default port is 8001:',
      'download.guide.go.step3.title': 'Configure and access',
      'download.guide.go.step3.desc': 'In production, set jwt.secret in configs/config.yaml and debug=false. Visit http://localhost:8001 with admin / admin123. See the Go docs for details.',
      'download.installGuideSub': 'Deploy in three steps (Python edition)',

      /* docs.html entry */
      'docs.entry.title': 'ApeHub Technical Docs',
      'docs.entry.text': 'Heading to ApeHub Technical Docs...',

      /* content blocks (English overrides for admin-managed site content) */
      'content.hero.title': 'The admin framework built for AI agents',
      'content.hero.subtitle': 'An open-source dev framework for AI-agent scenarios · MIT License',
      'content.hero.body': 'ApeAdmin is built on FastAPI + Vue3, breaking away from traditional admin design and natively adapting to AI Agent capability calls. Batteries included, pluggable, and ready to help you ship apps that combine business management with AI tool output.',
      'content.architecture.title': 'Decoupled frontend & backend · core and plugins separated',
      'content.architecture.subtitle': 'Architecture',
      'content.architecture.body': 'Monolithic app architecture with backend plugin-based extension, dual database drivers with seamless switching, and optional Redis with automatic fallback.',
      'content.features.title': 'Enterprise-grade capabilities out of the box',
      'content.features.subtitle': 'Core Features',
      'content.features.body': 'The core provides infrastructure such as permissions, menus and logs; business features live as independently developed plugins, while the MCP gateway exposes admin capabilities to AI agents.',
      'content.mcp.title': 'Turn the admin system into AI tools',
      'content.mcp.subtitle': 'MCP Gateway',
      'content.mcp.body': 'Through the MCP-SSE gateway, admin capabilities of the core and plugins are wrapped as standardized AI tools, seamlessly bridging traditional business systems and LLM agents.',
      'content.plugin_eco.title': 'Plugin-based · let business grow independently',
      'content.plugin_eco.subtitle': 'Plugin Ecosystem',
      'content.plugin_eco.body': 'Plugins communicate loosely through the event bus, support ZIP upload installation, and can register routes, MCP tools and event listeners.',
      'content.techstack.title': 'Modern, robust, scalable',
      'content.techstack.subtitle': 'Tech Stack',
      'content.techstack.body': 'The stack balances performance and developer efficiency, with dual database drivers and optional caching to switch smoothly between development and production.',
      'content.quickstart.title': 'Up and running in three minutes',
      'content.quickstart.subtitle': 'Quick Start',
      'content.quickstart.body': 'SQLite zero-config startup by default — no extra database installation needed.',
      'content.cta.title': 'Start building your AI-ready admin',
      'content.cta.body': 'Open source · free · built for agent scenarios. Try it now or give the project a Star.',
      'content.footer.title': 'ApeAdmin',
      'content.footer.body': 'A development framework built for AI-agent scenarios, powered by FastAPI async services, a Vue 3 admin UI, RBAC and a controlled plugin mechanism for continuous delivery.',

      /* index.html (English) */
      'index.nav.features': 'Features',
      'index.nav.arch': 'Architecture',
      'index.nav.mcp': 'MCP Gateway',
      'index.hero.tag': 'Open-source dev framework for AI-agent scenarios · MIT License',
      'index.hero.h1': 'Admin panels, <br />rebuilt for <span class="grad">AI agents</span>',
      'index.hero.cta.primary': 'Get Started →',
      'index.hero.cta.plugins': 'Marketplace',
      'index.hero.cta.docs': 'Docs',
      'index.hero.stat1.num': 'Fast to build',
      'index.hero.stat1.label': 'Up in 3 minutes with one CLI command',
      'index.hero.stat2.num': 'Pro architecture',
      'index.hero.stat2.label': 'FastAPI/Gin + Vue3 decoupled stack',
      'index.hero.stat3.num': 'Growing ecosystem',
      'index.hero.stat3.label': 'Plugin marketplace keeps compounding',
      'index.hero.stat4.num': 'AI-ready',
      'index.hero.stat4.label': 'MCP gateway natively wired to agents',
      'index.gh.go': 'Go Edition (Gin)',
      'index.gh.py': 'Python Edition (FastAPI)',
      'index.features.title': 'Enterprise-grade capabilities out of the box',
      'index.features.desc': 'The core provides permissions, menus and logging as infrastructure, while business features ship as independently developed plugins — and the MCP gateway exposes admin capabilities to AI agents.',
      'index.f1.title': 'RBAC permission system',
      'index.f1.desc': 'Standard five-table model (users/roles/menus/departments), four-layer permission granularity, unlimited tree menus, superadmin wildcard.',
      'index.f1.tag1': '4-layer permissions',
      'index.f1.tag2': '3 menu types',
      'index.f2.title': 'Plugin architecture',
      'index.f2.desc': 'Plugins are developed as Python packages with auto-discovery, hot enable/disable and one-click ZIP install, fully decoupled from the core. The Go edition supports plugin extension too.',
      'index.f3.title': 'MCP-SSE gateway',
      'index.f3.desc': 'Wraps core and plugin capabilities as standard AI tools — callable by agents, RBAC-filtered and automatically audited.',
      'index.f4.title': 'AI chat assistant',
      'index.f4.desc': 'Multi-model support, streaming SSE output, Function Calling tool loops, and encrypted key storage in the admin panel.',
      'index.f4.tag.qwen': 'Qwen',
      'index.f4.tag.glm': 'GLM',
      'index.f5.title': 'Audit logs',
      'index.f5.desc': 'Global request ID tracing, operation records and latency monitoring — every AI tool call is logged automatically.',
      'index.f5.tag1': 'Tracing',
      'index.f5.tag2': 'Latency monitoring',
      'index.f6.title': 'Maintainable admin foundation',
      'index.f6.desc': 'Dashboard, e-commerce, app center, user center and component demos — five modules, all rebuilt on Element Plus.',
      'index.arch.title': 'Decoupled frontend & backend · core and plugins separated',
      'index.arch.desc': 'Monolithic app architecture with backend plugin extension, dual database drivers with seamless switching, and optional Redis with automatic fallback.',
      'index.arch.node1': 'Vue3 frontend',
      'index.arch.node1.sub': 'Vite 6 + TypeScript + Element Plus + Pinia',
      'index.arch.node2': 'FastAPI / Gin core',
      'index.arch.node2.sub': 'RBAC · Audit · MCP gateway · AI chat · Dynamic routing',
      'index.arch.node3': 'Business plugins',
      'index.arch.node3.sub': 'Python packages / Go modules · Event bus · Hot-pluggable',
      'index.arch.note': 'Databases: SQLite (zero-config dev) ↔ MySQL (production) with dual-driver auto switching · Cache: Redis falls back to memory when missing',
      'index.mcp.title': 'Turn the admin system into AI tools',
      'index.mcp.desc': 'Through the MCP-SSE gateway, admin capabilities of the core and plugins are wrapped as standardized AI tools, seamlessly bridging business systems and LLM agents.',
      'index.mcp.left.title': 'One <span class="grad">@mcp_manager.tool</span><br />lets an agent take over the system',
      'index.mcp.left.desc': 'A plugin registers tools to the MCP gateway in a few lines. Agent calls are RBAC-filtered and audited automatically, extending permission security seamlessly.',
      'index.mcp.item1.title': 'Three primitives',
      'index.mcp.item1.sub': 'Tools invocation / Resources reading / Prompts rendering',
      'index.mcp.item2.title': 'Auto schema',
      'index.mcp.item2.sub': 'JSON Schema inferred from function signatures — nothing to hand-write',
      'index.mcp.item3.title': 'RBAC filtering',
      'index.mcp.item3.sub': 'Agents only see tools the current user may call',
      'index.mcp.item4.title': 'Full audit trail',
      'index.mcp.item4.sub': 'Every tool call records request, response, latency and caller',
      'index.stack.title': 'Modern, robust, scalable',
      'index.stack.desc': 'The stack balances performance and developer efficiency, with dual database drivers and optional caching to switch smoothly between dev and production.',
      'index.stack.backend': 'Backend',
      'index.stack.frontend': 'Frontend',
      'index.stack.storage': 'Storage',
      'index.stack.redis': 'Redis optional',
      'index.stack.charts': 'Charts',
      'index.stack.auth': 'Auth & security',
      'index.stack.keyenc': 'Encrypted API keys',
      'index.stack.protocol': 'AI protocols',
      'index.stack.model': 'AI models',
      'index.stack.platform': 'Platforms',
      'index.plugin.title': 'Plugin-based · let business grow independently',
      'index.plugin.desc': 'Plugins communicate loosely through the event bus, support ZIP upload installation, and can register routes, MCP tools and event listeners.',
      'index.plugin.card1.title': '🔄 Full lifecycle',
      'index.plugin.card1.desc': 'load → install → register → uninstall, with hot enable/disable — plug business modules in without restarts.',
      'index.plugin.card1.ev': 'Listens to <b>USER_LOGIN</b> · <b>APP_STARTUP</b> · <b>DB_READY</b>',
      'index.plugin.card2.title': '📦 One-click ZIP install',
      'index.plugin.card2.desc': 'Upload a ZIP to import the plugin automatically — no manual file placement, menu routes generated dynamically.',
      'index.plugin.card3.title': '🔗 Capability open',
      'index.plugin.card3.desc': 'Plugins register their own routes, MCP tools and event listeners for capability-level openness.',
      'index.start.title': 'Up and running in three minutes',
      'index.start.desc': 'SQLite zero-config startup by default — no extra database installation needed.',
      'index.start.step1.title': 'Start the backend',
      'index.start.step1.desc': 'Python edition needs Python 3.11+, Go edition needs Go 1.21+ — one command brings the API up.',
      'index.start.step2.title': 'Start the frontend',
      'index.start.step2.desc': 'Node.js 18+, npm install then npm run dev, open localhost:5173.',
      'index.start.step3.title': 'Sign in and explore',
      'index.start.step3.desc': 'Sign in with the default admin / admin123 account and start managing your system.',
      'index.cta.title': 'Start building your AI-ready admin',
      'index.cta.desc': 'Open source · free · built for agent scenarios. Try it now or give the project a Star.',
      'index.cta.more': 'Learn more',
      'index.footer.brand': 'A development framework built for AI-agent scenarios, powered by FastAPI/Gin async services, a Vue 3 admin UI, RBAC and a controlled plugin mechanism for continuous delivery.',
      'index.footer.col1': 'Product',
      'index.footer.col2': 'Develop',
      'index.footer.col3': 'Community',
      'index.footer.quick': 'Quick start',
      'index.footer.bottom1': '© 2026 ApeAdmin · A development framework built for AI-agent scenarios',
    },
  };

  /* Plugin data English mapping (slug -> {display_name, description, tags}).
     Falls back to the original values when a slug is not mapped. */
  const pluginEn = {
    'ai_vision': {
      display_name: 'AI Vision',
      description: 'Event-driven vision algorithm management platform: category library → recognition events → tasks → alerts → sample training loop. Supports person/vehicle/open-flame recognition, RTSP and local video sources, pure CPU ONNX inference, ready to use out of the box.',
      tags: 'vision,video-source,ONNX,alerts',
    },
    'apehub_web': {
      display_name: 'ApeHub Website',
      description: 'Official website portal plugin for ApeAdmin: product introduction, plugin marketplace, technical docs and user center. Full website-building capability with content management, docs portal, plugin marketplace & trading, and user center modules.',
      tags: 'website,portal,marketplace,docs',
    },
    'aegis_agent': {
      display_name: 'AegisCode',
      description: 'AegisCode all-in-one plugin: Agent runtime (state-machine dialog loop, precise token metering, layered context management, budget/skills/MCP/security) + workspace (projects, files, sandbox execution, Git snapshots, member collaboration). Built for enterprise intranet Agentic Coding platforms, continuously executing planning, code changes, command runs, test validation, review, recovery and delivery around project workspaces.',
      tags: 'AI coding,Agent,AgenticCoding,workspace',
    },
    /* legacy dev-data slugs (kept for local compatibility) */
    'dashboard-plus': {
      display_name: 'Dashboard Plus',
      description: 'More powerful dashboard widgets and chart libraries for ApeAdmin.',
      tags: 'dashboard,charts,ECharts',
    },
    'aimeeting': {
      display_name: 'AI Meeting',
      description: 'Full-lifecycle meeting management with real-time transcription, speaker identification and streaming two-pass captions.',
      tags: 'meeting,AI,transcription',
    },
    'hermes-agent': {
      display_name: 'Hermes Agent',
      description: 'A powerful CLI agent shipped as an ApeAdmin plugin — thin client plus separate process bridged over WS/HTTP.',
      tags: 'agent,AI,CLI',
    },
    'ai-vision': {
      display_name: 'AI Vision',
      description: 'Vision algorithm management plugin: dataset, model and inference pipeline management.',
      tags: 'vision,AI,algorithm',
    },
  };

  /* Category English mapping */
  const categoryEn = {
    '工具': 'Tools',
    '电商': 'E-commerce',
    'AI': 'AI',
    '仪表盘': 'Dashboard',
    '系统增强': 'System',
    '全部': 'All',
    '开发工具': 'Dev Tools',
    'AI 能力': 'AI',
    '数据管理': 'Data',
    '系统运维': 'Ops',
    'UI 增强': 'UI',
    '业务应用': 'Business',
  };

  /* ---------- core ---------- */
  function detectLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'zh';
    return /^zh/i.test(nav) ? 'zh' : 'en';
  }

  function t(key) {
    const table = dict[state.lang] || dict.zh;
    return Object.prototype.hasOwnProperty.call(table, key) ? table[key]
      : (Object.prototype.hasOwnProperty.call(dict.zh, key) ? dict.zh[key] : key);
  }

  function applyI18n(scope) {
    const root = scope || document;
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const text = t(el.getAttribute('data-i18n'));
      if (text === '') return; // empty translation leaves original untouched
      el.textContent = text;
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const text = t(el.getAttribute('data-i18n-placeholder'));
      if (text === '') return;
      el.setAttribute('placeholder', text);
    });
    root.querySelectorAll('[data-i18n-title]').forEach(el => {
      const text = t(el.getAttribute('data-i18n-title'));
      if (text === '') return;
      el.setAttribute('title', text);
    });
    root.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const text = t(el.getAttribute('data-i18n-aria'));
      if (text === '') return;
      el.setAttribute('aria-label', text);
    });
    root.querySelectorAll('[data-i18n-html]').forEach(el => {
      const text = t(el.getAttribute('data-i18n-html'));
      if (text === '') return;
      el.innerHTML = text;
    });
    document.documentElement.setAttribute('lang', state.lang === 'zh' ? 'zh-CN' : 'en');
  }

  function translatePluginField(item, field, fallback) {
    if (state.lang !== 'en') return fallback;
    const mapping = pluginEn[item?.slug] || pluginEn[item?.name] || {};
    return mapping[field] || fallback;
  }

  function translateCategory(name) {
    if (state.lang !== 'en') return name;
    return categoryEn[name] || name;
  }

  function updateLangButtons() {
    document.querySelectorAll('#langToggle').forEach(btn => {
      btn.textContent = state.lang === 'zh' ? '中' : 'EN';
      btn.setAttribute('aria-label', t('nav.lang.aria'));
      btn.setAttribute('title', t('nav.lang.title'));
    });
    document.querySelectorAll('#themeToggle').forEach(btn => {
      btn.setAttribute('aria-label', t('nav.theme.aria'));
      btn.setAttribute('title', t('nav.theme.title'));
    });
  }

  function setLang(lang, opts = {}) {
    if (lang !== 'zh' && lang !== 'en') lang = 'zh';
    const changed = state.lang !== lang;
    state.lang = lang;
    if (opts.persist !== false) localStorage.setItem(STORAGE_KEY, lang);
    applyI18n();
    updateLangButtons();
    if (changed) window.dispatchEvent(new CustomEvent('apeI18n.switch', { detail: { lang } }));
  }

  /* ---------- boot ---------- */
  state.lang = detectLanguage();
  applyI18n();
  document.addEventListener('DOMContentLoaded', () => { applyI18n(); updateLangButtons(); });
  // auth-shell modal is injected dynamically: translate after injection
  window.addEventListener('apeAuthModalOpened', () => setTimeout(() => applyI18n(), 50));

  // Use event delegation so the toggle works regardless of when
  // site-runtime.js injects #langToggle (it is created after DOMContentLoaded).
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('#langToggle');
    if (btn) setLang(state.lang === 'zh' ? 'en' : 'zh');
  });

  /* ---------- exports ---------- */
  window.apeI18n = {
    get lang() { return state.lang; },
    t, applyI18n, setLang, updateLangButtons,
    translatePluginField, translateCategory,
    dict,
  };
})();
