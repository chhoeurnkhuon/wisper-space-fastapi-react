from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from database import Base

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    type = Column(Enum('private', 'group', 'secret', name='chat_type'), nullable=False)
    is_whisper_space = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="owned_chats")
    members = relationship("ChatMember", back_populates="chat")
    messages = relationship("Message", back_populates="chat")

class ChatMember(Base):
    __tablename__ = "chat_members"

    chat_id = Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    joined_at = Column(DateTime, default=datetime.utcnow)

    chat = relationship("Chat", back_populates="members")
    user = relationship("User", back_populates="memberships")