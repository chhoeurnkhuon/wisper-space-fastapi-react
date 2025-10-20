from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class MessageBase(BaseModel):
    content: str
    is_whisper: bool = False
    self_destruct_timer: int = 0
    reply_to_id: Optional[int] = None
    attachments: Optional[List[Dict]] = None

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    chat_id: int
    sender_id: int
    timestamp: datetime
    updated_at: datetime
    is_edited: bool = False
    reactions: Optional[Dict] = None

    class Config:
        from_attributes = True