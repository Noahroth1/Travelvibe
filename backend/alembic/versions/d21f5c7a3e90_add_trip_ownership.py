"""add trip ownership

Revision ID: d21f5c7a3e90
Revises: a8f2c44e91d3
Create Date: 2026-08-15
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d21f5c7a3e90"
down_revision: Union[str, Sequence[str], None] = "a8f2c44e91d3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Nullable preserves pre-auth development rows. Authenticated queries never
    # return them; browser-local trips are migrated into owned rows on sign-in.
    op.add_column("trips", sa.Column("owner_id", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_trips_owner_id"), "trips", ["owner_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_trips_owner_id"), table_name="trips")
    op.drop_column("trips", "owner_id")
