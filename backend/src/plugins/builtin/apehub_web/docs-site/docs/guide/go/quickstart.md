# 本地运行

## 环境要求

- Go 1.21 或更高版本
- Node.js 18 或更高版本
- Git
- 开发环境可直接使用 SQLite；生产环境建议使用 MySQL

## 启动后端

```bash
# 编译
go build -o bin/server ./cmd/server

# 运行（默认读取 configs/config.yaml）
./bin/server

# 或直接 go run
go run cmd/server/main.go
```

后端默认监听 `http://127.0.0.1:8001`。启动时会初始化核心表、种子菜单并加载启用的插件。

环境变量覆盖配置（`GA_` 前缀）：

```bash
GA_APP_PORT=8001 GA_APP_DEBUG=true go run cmd/server/main.go
```

## 启动前端

```bash
cd frontend
npm install
npm run dev
```

开发服务器运行在 `http://localhost:5173`，通过 Vite 代理访问后端 API。

## 配置说明

核心配置项见 `configs/config.yaml`，关键字段：

```yaml
app:
  port: 8001
  debug: true
  spa_dir: frontend/dist
database:
  type: sqlite          # 或 mysql
  max_open_conns: 50
jwt:
  secret: change-me-in-production
  expire_minutes: 1440
  refresh_expire_days: 7
cors:
  origins: localhost:5173,8000
mcp:
  timeout: 30
  max_concurrency: 10
```

## 默认体验路径

1. 使用 admin / admin123 登录管理台。
2. 确认插件管理中目标插件为启用状态。
3. 刷新动态菜单，确认插件页面可访问。
4. 在 MCP 面板试用工具调用。

生产部署时不要使用默认密码，不要把密钥提交到代码仓库。