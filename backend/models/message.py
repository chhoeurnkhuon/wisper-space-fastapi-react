from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, JSON, Index
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_edited = Column(Boolean, default=False)
    is_whisper = Column(Boolean, default=False)
    self_destruct_timer = Column(Integer, default=0)
    reply_to_id = Column(Integer, ForeignKey("messages.id"))
    reactions = Column(JSON)
    attachments = Column(JSON)

    chat = relationship("Chat", back_populates="messages")
    sender = relationship("User", back_populates="messages")
    reply_to = relationship("Message", remote_side=[id])
    read_receipts = relationship("ReadReceipt", back_populates="message")

class ReadReceipt(Base):
    __tablename__ = "read_receipts"

    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    read_at = Column(DateTime, default=datetime.utcnow)

    message = relationship("Message", back_populates="read_receipts")
    user = relationship("User")