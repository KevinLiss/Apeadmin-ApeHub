"""Add published_at column to apehub_web_release for release publish time."""

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncConnection


async def upgrade_add_release_published_at(connection: AsyncConnection) -> None:
    """Add published_at to apehub_web_release if missing (idempotent)."""
    table = "apehub_web_release"

    def _has_table(sync_connection) -> bool:
        return inspect(sync_connection).has_table(table)

    exists = await connection.run_sync(_has_table)
    if not exists:
        return

    def _column_names(sync_connection) -> set[str]:
        return {column["name"] for column in inspect(sync_connection).get_columns(table)}

    existing = await connection.run_sync(_column_names)
    if "published_at" not in existing:
        await connection.execute(
            text(f"ALTER TABLE {table} ADD COLUMN published_at DATETIME NULL")
        )
