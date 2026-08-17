"""add user state

Revision ID: e42a781cb6f1
Revises: d21f5c7a3e90
Create Date: 2026-08-15
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "e42a781cb6f1"
down_revision: Union[str, Sequence[str], None] = "d21f5c7a3e90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_states",
        sa.Column("owner_id", sa.String(length=255), nullable=False),
        sa.Column("saved_order", postgresql.JSONB(), nullable=False),
        sa.Column("notes", postgresql.JSONB(), nullable=False),
        sa.Column("been_there", postgresql.JSONB(), nullable=False),
        sa.Column("recently_viewed", postgresql.JSONB(), nullable=False),
        sa.Column("dark_mode", sa.Integer(), nullable=False),
        sa.Column("layout_mode", sa.String(length=10), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("owner_id"),
    )


def downgrade() -> None:
    op.drop_table("user_states")
