---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: 'be509923-813c-4883-9fbf-51d89b858bda'
  PropagateID: 'be509923-813c-4883-9fbf-51d89b858bda'
  ReservedCode1: 'a339f9e3-1ca3-41b2-94d3-a78a9f241977'
  ReservedCode2: 'a339f9e3-1ca3-41b2-94d3-a78a9f241977'
---

# 插件生命周期

## 插件包结构

```text
my_plugin/
  __init__.py
  plugin.py          # PluginInterface 实现
  plugin.json        # name / display_name / version / entry
  api.py             # 可选：FastAPI 路由
  models.py          # 可选：插件 ORM 模型
  migrations/        # 可选：插件迁移
  frontend/          # 可选：插件 Vue 页面
  static/            # 可选：插件静态资源
```

插件名必须是合法 Python 包名。`plugin.json.entry` 应指向唯一入口类，例如 `plugin.MyPlugin`；不要在同一个包中放置多个未明确入口的 `PluginInterface` 实现。

## 运行时状态

```text
discovered → installing → active
                    └──→ failed
active ──disable──→ inactive
active ──uninstall→ removed
```

管理器使用锁保护同一插件的操作，并跟踪插件注册的路由、MCP 工具和事件监听器。停用时先调用插件的 `unregister()`，再移除可跟踪的运行时资源；启用时重新注册这些资源。

## Hook 责任

| Hook | 责任 |
| --- | --- |
| `on_load()` | 模块加载后的轻量初始化，不应依赖请求上下文 |
| `install()` | 建表、执行迁移、种子数据；必须可重复执行 |
| `register(app)` | 注册路由、静态目录、MCP 工具或事件 |
| `unregister(app)` | 主动释放插件创建的运行时资源 |
| `uninstall()` | 按明确策略删除插件拥有的数据和资源 |
| `on_unload()` | 清理进程内对象和缓存 |

## 菜单与页面契约

后台菜单的 `component` 必须和实际 Vue 文件一一对应。组件、菜单和权限标识必须作为同一个插件版本交付，不能注册规划中或占位页面。

## 完整实战：带菜单与 MCP 工具的插件

以下示例展示一个生产级插件的完整要素：命名空间、权限标识、菜单注册、MCP 工具声明。

```python
# my_plugin/plugin.py
from fastapi import APIRouter, Depends
from apeadmin.plugin import PluginInterface
from apeadmin.api.deps import get_current_user, require_permission

class MyPlugin(PluginInterface):
    name = "my_plugin"

    def install(self) -> None:
        # 建表、种子数据（必须可重复执行）
        pass

    def register(self, app) -> None:
        # 插件 API 使用自己的命名空间 /my-plugin
        router = APIRouter(prefix="/my-plugin", tags=["my_plugin"])

        @router.get("/hello", dependencies=[Depends(require_permission("my_plugin:hello:call"))])
        async def hello():
            return {"message": "hello from my_plugin"}

        app.include_router(router)

    def unregister(self, app) -> None:
        # 释放插件创建的运行时资源
        pass

    def uninstall(self) -> None:
        # 按明确策略删除插件数据和资源
        pass

    def on_unload(self) -> None:
        pass

    def register_mcp_tools(self) -> list[dict]:
        # MCP 工具声明权限标识，网关自动做 RBAC 过滤
        return [{
            "name": "my_plugin_hello",
            "description": "返回问候语",
            "required_permissions": ["my_plugin:hello:call"],
        }]
```

要点：

- 插件 API、菜单、数据表、权限标识统一使用 `my_plugin:` 命名空间，避免与核心或其他插件冲突。
- 后台接口使用 `require_permission("my_plugin:*")` 在服务端校验权限，前端 `v-permission` 只负责隐藏按钮。
- MCP 工具声明 `required_permissions` 后由网关统一过滤，工具内部无需重复校验。

## 升级与失败处理

升级前先停用旧版本，保留数据库和上传文件；新版本安装失败时恢复插件目录和运行时状态。迁移脚本必须提供向前兼容策略，不能依赖回滚数据库来撤销已经发布的数据。

> AI生成