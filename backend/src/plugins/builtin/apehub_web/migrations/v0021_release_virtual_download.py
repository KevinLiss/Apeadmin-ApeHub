"""Add virtual download count column to apehub_web_release.

- apehub_web_release.virtual_download_count : INTEGER NOT NULL DEFAULT 0

后台可设置的版本包虚拟下载量（冷启动展示用），前台展示时与真实下载计数合并显示。
All ALTERs are idempotent (column existence checked first) so re-runs are safe.
"""

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncConnection

_TABLE = "apehub_web_release"
_ADD_COLUMNS = [
    ("virtual_download_count", "INTEGER NOT NULL DEFAULT 0"),
]


async def upgrade_release_virtual_download(connection: AsyncConnection) -> None:
    """Add virtual_download_count column to the release table (idempotent)."""

    def _has_table(sync_connection) -> bool:
        return inspect(sync_connection).has_table(_TABLE)

    exists = await connection.run_sync(_has_table)
    if not exists:
        return

    def _column_names(sync_connection) -> set[str]:
        return {col["name"] for col in inspect(sync_connection).get_columns(_TABLE)}

    existing = await connection.run_sync(_column_names)
    for column, ddl in _ADD_COLUMNS:
        if column not in existing:
            await connection.execute(
                text(f"ALTER TABLE {_TABLE} ADD COLUMN {column} {ddl}")
            )
