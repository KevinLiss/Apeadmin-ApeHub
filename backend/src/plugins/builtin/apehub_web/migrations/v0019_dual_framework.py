"""Add dual-framework support columns: release.framework, plugin.language, doc.framework.

- apehub_web_release.framework   : 'python' | 'go' (default 'python')
- apehub_web_plugin.language     : 'python' | 'go' (default 'python')
- apehub_web_doc_category.framework / apehub_web_doc.framework : 'python' | 'go' (default 'python')

Existing rows are backfilled to 'python' (legacy behavior). All ALTERs are
idempotent (column existence checked first) so re-runs are safe.
"""

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncConnection

# (table, column, ddl_type) triples. SQLite/MySQL both accept VARCHAR(n) DEFAULT.
_ADD_COLUMNS = [
    ("apehub_web_release", "framework", "VARCHAR(20) NOT NULL DEFAULT 'python'"),
    ("apehub_web_plugin", "language", "VARCHAR(20) NOT NULL DEFAULT 'python'"),
    ("apehub_web_doc_category", "framework", "VARCHAR(20) NOT NULL DEFAULT 'python'"),
    ("apehub_web_doc", "framework", "VARCHAR(20) NOT NULL DEFAULT 'python'"),
]


async def upgrade_dual_framework(connection: AsyncConnection) -> None:
    """Add framework/language columns to release, plugin and doc tables (idempotent)."""
    for table, column, ddl in _ADD_COLUMNS:
        def _has_table(sync_connection) -> bool:
            return inspect(sync_connection).has_table(table)

        exists = await connection.run_sync(_has_table)
        if not exists:
            continue

        def _column_names(sync_connection) -> set[str]:
            return {col["name"] for col in inspect(sync_connection).get_columns(table)}

        existing = await connection.run_sync(_column_names)
        if column not in existing:
            await connection.execute(
                text(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}")
            )