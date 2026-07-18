"""add destination travel metadata

Revision ID: 7e51b9d3a120
Revises: c6ea02d5caec
Create Date: 2026-07-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "7e51b9d3a120"
down_revision: Union[str, Sequence[str], None] = "c6ea02d5caec"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "destinations",
        sa.Column("best_time", sa.String(length=100), nullable=True),
    )
    op.add_column(
        "destinations",
        sa.Column("visit_duration", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "destinations",
        sa.Column("budget_level", sa.String(length=3), nullable=True),
    )
    op.add_column(
        "destinations",
        sa.Column(
            "vibes",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )


def downgrade() -> None:
    op.drop_column("destinations", "vibes")
    op.drop_column("destinations", "budget_level")
    op.drop_column("destinations", "visit_duration")
    op.drop_column("destinations", "best_time")
