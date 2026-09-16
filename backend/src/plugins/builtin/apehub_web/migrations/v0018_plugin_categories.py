"""Add the admin-managed plugin marketplace category table."""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

# Default categories mirror the previous hardcoded front-end pills.
DEFAULT_CATEGORIES = [
    ("开发工具", "面向开发场景的相关插件"),
    ("AI 能力", "提供 AI 相关功能的插件"),
    ("数据管理", "数据处理、数据管理相关的插件"),
    ("系统运维", "面向系统运维场景的插件"),
    ("UI 增强", "优化增强界面交互、界面表现的插件"),
    ("业务应用", "对应各类业务场景的功能插件"),
]

# SQLite and MySQL use different AUTO_INCREMENT syntax; build DDL by dialect.
_DDL_TEMPLATE = """CREATE TABLE IF NOT EXISTS apehub_web_plugin_category (
    id {pk} PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)"""


async def upgrade_add_plugin_categories(connection: AsyncConnection) -> None:
    """Create apehub_web_plugin_category and seed the default categories."""
    dialect = connection.dialect.name
    pk_clause = "INTEGER" if dialect == "sqlite" else "INT AUTO_INCREMENT"
    await connection.execute(text(_DDL_TEMPLATE.format(pk=pk_clause)))
    # Ensure a unique index on name; check existence first (MySQL lacks IF NOT EXISTS for indexes).
    if dialect == "mysql":
        idx_exists = await connection.execute(text(
            "SELECT COUNT(*) FROM information_schema.statistics "
            "WHERE table_schema = DATABASE() AND table_name = 'apehub_web_plugin_category' "
            "AND index_name = 'ux_apehub_web_plugin_category_name'"
        ))
        if (idx_exists.scalar() or 0) == 0:
            await connection.execute(text(
                "ALTER TABLE apehub_web_plugin_category ADD UNIQUE INDEX ux_apehub_web_plugin_category_name (name)"
            ))
    existing = await connection.execute(text("SELECT COUNT(*) FROM apehub_web_plugin_category"))
    if (existing.scalar() or 0) == 0:
        now = "NOW()" if dialect == "mysql" else "CURRENT_TIMESTAMP"
        for index, (name, description) in enumerate(DEFAULT_CATEGORIES, start=1):
            await connection.execute(
                text(
                    f"INSERT INTO apehub_web_plugin_category (name, description, sort, enabled, created_at, updated_at) "
                    f"VALUES (:name, :description, :sort, 1, {now}, {now})"
                ),
                {"name": name, "description": description, "sort": index},
            )