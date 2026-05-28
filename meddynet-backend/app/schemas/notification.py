import uuid
from datetime import datetime

from pydantic import ConfigDict, BaseModel


class NotificationResponse(BaseModel):
    id: uuid.UUID
    title: str
    body: str
    type: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
