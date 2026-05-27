import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ReportUpload(BaseModel):
    booking_id: uuid.UUID

class ReportResponse(BaseModel):
    id: uuid.UUID
    booking_id: uuid.UUID
    lab_id: uuid.UUID
    uploaded_by_tech_id: Optional[uuid.UUID]
    cloud_url: str
    file_size_bytes: int
    is_abnormal: bool
    uploaded_at: datetime
    notified_at: Optional[datetime]

    class Config:
        from_attributes = True
