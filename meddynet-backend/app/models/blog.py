import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, String, Text, Uuid

from app.database import Base


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    slug = Column(String(250), unique=True, index=True, nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Uuid(as_uuid=True), nullable=True)  # Can join with users if needed
    author_name = Column(String(100), nullable=True)
    cover_image_url = Column(Text, nullable=True)
    tags = Column(String(200), nullable=True)  # comma separated tags
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
