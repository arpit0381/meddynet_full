"""Update Report Model for Cloudinary

Revision ID: 002_update_report_model
Revises: 001_initial_baseline
Create Date: 2026-04-01 18:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "002_update_report_model"
down_revision = "001_initial_baseline"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adding missing columns to 'reports' table for Cloudinary transition
    # Model fields: booking_id, lab_id, tech_id, cloud_url, cloud_path, file_size_bytes, is_abnormal

    # 1. Drop old file_url, is_analyzed
    op.drop_column("reports", "file_url")
    op.drop_column("reports", "is_analyzed")

    # 2. Add new columns
    op.add_column(
        "reports",
        sa.Column(
            "lab_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("labs.id"),
            nullable=True,
        ),
    )
    op.add_column(
        "reports",
        sa.Column(
            "uploaded_by_tech_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("technicians.id"),
            nullable=True,
        ),
    )
    op.add_column("reports", sa.Column("cloud_url", sa.Text(), nullable=False))
    op.add_column(
        "reports", sa.Column("cloud_path", sa.String(length=200), nullable=False)
    )
    op.add_column(
        "reports",
        sa.Column("file_size_bytes", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "reports", sa.Column("is_abnormal", sa.Boolean(), server_default="false")
    )
    op.add_column(
        "reports", sa.Column("notified_at", sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("reports", "notified_at")
    op.drop_column("reports", "is_abnormal")
    op.drop_column("reports", "file_size_bytes")
    op.drop_column("reports", "cloud_path")
    op.drop_column("reports", "cloud_url")
    op.drop_column("reports", "uploaded_by_tech_id")
    op.drop_column("reports", "lab_id")
    op.add_column(
        "reports", sa.Column("is_analyzed", sa.Boolean(), server_default="false")
    )
    op.add_column(
        "reports", sa.Column("file_url", sa.String(length=500), nullable=False)
    )
