"""Initial Migration

Revision ID: 001_initial_baseline
Revises:
Create Date: 2026-04-01 16:45:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "001_initial_baseline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Users Table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("phone", sa.String(length=15), nullable=False, unique=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=True, unique=True),
        sa.Column("blood_group", sa.String(length=5), nullable=True),
        sa.Column("dob", sa.Date(), nullable=True),
        sa.Column("gender", sa.String(length=10), nullable=True),
        sa.Column("role", sa.String(length=20), server_default="user"),
        sa.Column("hashed_password", sa.String(length=255), nullable=True),
        sa.Column("profile_image_url", sa.String(length=500), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")
        ),
    )

    # 2. Labs Table
    op.create_table(
        "labs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("license_number", sa.String(length=50), nullable=False, unique=True),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("city", sa.String(length=50), nullable=False),
        sa.Column("lat", sa.Float(), nullable=True),
        sa.Column("lng", sa.Float(), nullable=True),
        sa.Column("is_verified", sa.Boolean(), server_default="false"),
        sa.Column("sample_collection_fee", sa.Integer(), server_default="0"),
        sa.Column("platform_commission_pct", sa.Float(), server_default="10.0"),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")
        ),
    )

    # 3. Lab Tests Table
    op.create_table(
        "lab_tests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "lab_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("labs.id", ondelete="CASCADE"),
        ),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(length=50), nullable=True),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("discount_price", sa.Integer(), nullable=True),
        sa.Column("preparation", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
    )

    # 4. Technicians Table
    op.create_table(
        "technicians",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("city", sa.String(length=50), nullable=False),
        sa.Column("vehicle_type", sa.String(length=20), nullable=True),
        sa.Column("current_lat", sa.Float(), nullable=True),
        sa.Column("current_lng", sa.Float(), nullable=True),
        sa.Column("is_available", sa.Boolean(), server_default="true"),
    )

    # 5. Bookings Table
    op.create_table(
        "bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("lab_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("labs.id")),
        sa.Column(
            "tech_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("technicians.id"),
            nullable=True,
        ),
        sa.Column("type", sa.String(length=25), nullable=False),
        sa.Column("status", sa.String(length=25), server_default="pending"),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("patient_name", sa.String(length=100), nullable=False),
        sa.Column("patient_phone", sa.String(length=15), nullable=False),
        sa.Column("total_amount", sa.Integer(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")
        ),
    )

    # 6. Reports Table
    op.create_table(
        "reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "booking_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("bookings.id", ondelete="CASCADE"),
        ),
        sa.Column("file_url", sa.String(length=500), nullable=False),
        sa.Column(
            "uploaded_at", sa.DateTime(timezone=True), server_default=sa.text("now()")
        ),
        sa.Column("is_analyzed", sa.Boolean(), server_default="false"),
    )


def downgrade() -> None:
    op.drop_table("reports")
    op.drop_table("bookings")
    op.drop_table("technicians")
    op.drop_table("lab_tests")
    op.drop_table("labs")
    op.drop_table("users")
