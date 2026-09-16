"""Add Coze workflow provider columns to the site config table."""

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncConnection


async def upgrade_add_coze_provider(connection: AsyncConnection) -> None:
    """Add coze_api_key / coze_workflow_id columns to apehub_web_site_config."""
    table = "apehub_web_site_config"

    def _column_names(sync_connection) -> set[str]:
        return {column["name"] for column in inspect(sync_connection).get_columns(table)}

    existing = await connection.run_sync(_column_names)
    additions = {
        "coze_api_key": "VARCHAR(512) NOT NULL DEFAULT ''",
        "coze_workflow_id": "VARCHAR(64) NOT NULL DEFAULT ''",
    }
    for column, definition in additions.items():
        if column not in existing:
            await connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {definition}"))
