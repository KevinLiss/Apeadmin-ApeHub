"""Add virtual download/install count columns to apehub_web_plugin.

- apehub_web_plugin.virtual_download_count : INTEGER NOT NULL DEFAULT 0
- apehub_web_plugin.virtual_install_count  : INTEGER NOT NULL DEFAULT 0

后台可设置的虚拟计数（冷启动展示用），前台展示时与真实计数合并显示。
All ALTERs are idempotent (column existence checked first) so re-runs are safe.
"""

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncConnection

# (table, column, ddl_type) pairs. SQLite/MySQL both accept INTEGER DEFAULT.
_ADD_COLUMNS = [
    ("apehub_web_plugin", "virtual_download_count", "INTEGER NOT NULL DEFAULT 0"),
    ("apehub_web_plugin", "virtual_install_count", "INTEGER NOT NULL DEFAULT 0"),
]


async def upgrade_virtual_counts(connection: AsyncConnection) -> None:
    """Add virtual count columns to the plugin table (idempotent)."""
    table = "apehub_web_plugin"

    def _has_table(sync_connection) -> bool:
        return inspect(sync_connection).has_table(table)

    exists = await connection.run_sync(_has_table)
    if not exists:
        return

    def _column_names(sync_connection) -> set[str]:
        return {col["name"] for col in inspect(sync_connection).get_columns(table)}

    existing = await connection.run_sync(_column_names)
    for _table, column, ddl in _ADD_COLUMNS:
        if column not in existing:
            await connection.execute(
                text(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}")
            )
