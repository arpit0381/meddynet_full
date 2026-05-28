import uuid
from datetime import datetime
from typing import Optional

from pydantic import ConfigDict, BaseModel


class ReviewCreate(BaseModel):
    lab_id: uuid.UUID
    rating: float
    comment: Optional[str] = None


class ReviewResponse(ReviewCreate):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
