import logging
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import ConfigDict, BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.middleware.rbac import get_current_user
from app.models.blog import BlogPost

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/blog", tags=["blog"])

class BlogPostCreate(BaseModel):
    title: str = Field(..., max_length=200)
    slug: str = Field(..., max_length=250)
    content: str
    cover_image_url: str | None = None
    tags: str | None = None
    is_published: bool = False

class BlogPostUpdate(BaseModel):
    title: str | None = Field(None, max_length=200)
    slug: str | None = Field(None, max_length=250)
    content: str | None = None
    cover_image_url: str | None = None
    tags: str | None = None
    is_published: bool | None = None

class BlogPostResponse(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    content: str
    author_id: uuid.UUID | None
    author_name: str | None
    cover_image_url: str | None
    tags: str | None
    is_published: bool
    published_at: str | None
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)

def _check_admin(current_user: dict):
    if current_user.get("role") not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required")

@router.get("", response_model=List[BlogPostResponse])
async def list_blog_posts(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Public - list published blog posts."""
    result = await db.execute(
        select(BlogPost)
        .filter(BlogPost.is_published == True)  # noqa: E712
        .order_by(BlogPost.published_at.desc())
        .offset(skip)
        .limit(limit)
    )
    posts = result.scalars().all()
    
    return [
        BlogPostResponse(
            id=p.id,
            title=p.title,
            slug=p.slug,
            content=p.content,
            author_id=p.author_id,
            author_name=p.author_name,
            cover_image_url=p.cover_image_url,
            tags=p.tags,
            is_published=p.is_published,
            published_at=p.published_at.isoformat() if p.published_at else None,
            created_at=p.created_at.isoformat() if p.created_at else "",
            updated_at=p.updated_at.isoformat() if p.updated_at else ""
        ) for p in posts
    ]

@router.get("/admin/all", response_model=List[BlogPostResponse])
async def list_all_blog_posts(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin - list all blog posts (published & drafts)."""
    _check_admin(current_user)
    
    result = await db.execute(
        select(BlogPost)
        .order_by(BlogPost.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    posts = result.scalars().all()
    
    return [
        BlogPostResponse(
            id=p.id,
            title=p.title,
            slug=p.slug,
            content=p.content,
            author_id=p.author_id,
            author_name=p.author_name,
            cover_image_url=p.cover_image_url,
            tags=p.tags,
            is_published=p.is_published,
            published_at=p.published_at.isoformat() if p.published_at else None,
            created_at=p.created_at.isoformat() if p.created_at else "",
            updated_at=p.updated_at.isoformat() if p.updated_at else ""
        ) for p in posts
    ]

@router.get("/{slug}", response_model=BlogPostResponse)
async def get_blog_post(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Public - get a published blog post by slug."""
    result = await db.execute(select(BlogPost).filter(BlogPost.slug == slug, BlogPost.is_published == True))  # noqa: E712
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
        
    return BlogPostResponse(
        id=post.id,
        title=post.title,
        slug=post.slug,
        content=post.content,
        author_id=post.author_id,
        author_name=post.author_name,
        cover_image_url=post.cover_image_url,
        tags=post.tags,
        is_published=post.is_published,
        published_at=post.published_at.isoformat() if post.published_at else None,
        created_at=post.created_at.isoformat() if post.created_at else "",
        updated_at=post.updated_at.isoformat() if post.updated_at else ""
    )

@router.post("", response_model=BlogPostResponse, status_code=201)
async def create_blog_post(
    payload: BlogPostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin - create a new blog post."""
    _check_admin(current_user)
    
    dup = await db.execute(select(BlogPost).filter(BlogPost.slug == payload.slug))
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Post with slug {payload.slug} already exists")

    post = BlogPost(
        **payload.model_dump(),
        author_id=uuid.UUID(current_user["sub"]),
        author_name=current_user.get("email"),
        published_at=datetime.now(timezone.utc) if payload.is_published else None
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    
    return BlogPostResponse(
        id=post.id,
        title=post.title,
        slug=post.slug,
        content=post.content,
        author_id=post.author_id,
        author_name=post.author_name,
        cover_image_url=post.cover_image_url,
        tags=post.tags,
        is_published=post.is_published,
        published_at=post.published_at.isoformat() if post.published_at else None,
        created_at=post.created_at.isoformat() if post.created_at else "",
        updated_at=post.updated_at.isoformat() if post.updated_at else ""
    )

@router.patch("/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: str,
    payload: BlogPostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin - update a blog post."""
    _check_admin(current_user)
    
    result = await db.execute(select(BlogPost).filter(BlogPost.id == uuid.UUID(post_id)))
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    if payload.slug and payload.slug != post.slug:
        dup = await db.execute(select(BlogPost).filter(BlogPost.slug == payload.slug))
        if dup.scalar_one_or_none():
            raise HTTPException(status_code=409, detail=f"Post with slug {payload.slug} already exists")

    # Handle publish date logic
    if payload.is_published is True and post.is_published is False:
        post.published_at = datetime.now(timezone.utc)
    elif payload.is_published is False:
        post.published_at = None

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(post, field, value)

    await db.commit()
    await db.refresh(post)
    
    return BlogPostResponse(
        id=post.id,
        title=post.title,
        slug=post.slug,
        content=post.content,
        author_id=post.author_id,
        author_name=post.author_name,
        cover_image_url=post.cover_image_url,
        tags=post.tags,
        is_published=post.is_published,
        published_at=post.published_at.isoformat() if post.published_at else None,
        created_at=post.created_at.isoformat() if post.created_at else "",
        updated_at=post.updated_at.isoformat() if post.updated_at else ""
    )

@router.delete("/{post_id}", status_code=204)
async def delete_blog_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin - delete a blog post."""
    _check_admin(current_user)
    
    result = await db.execute(select(BlogPost).filter(BlogPost.id == uuid.UUID(post_id)))
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    await db.delete(post)
    await db.commit()
    return None
