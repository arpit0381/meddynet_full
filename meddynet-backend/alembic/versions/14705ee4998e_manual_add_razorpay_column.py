"""Manual add razorpay column

Revision ID: 14705ee4998e
Revises: 32cfd36c611e
Create Date: 2026-04-04 13:21:11.033311

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



# revision identifiers, used by Alembic.
revision: str = '14705ee4998e'
down_revision: Union[str, None] = '32cfd36c611e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if column exists first to avoid error if it was partially created
    # But in Alembic, we usually just run the add_column
    op.add_column('labs', sa.Column('razorpay_account_id', sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column('labs', 'razorpay_account_id')
