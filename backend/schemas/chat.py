from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class ChatType(str, Enum):
    private = "private"
    group = "group"
    secret = "secret"

class ChatBase(BaseModel):
    name: Optional[str] = None
    type: ChatType
    is_whisper_space: bool = False

class ChatCreate(ChatBase):
    pass

class Chat(ChatBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: int

    class Config:
        from_attributes = True