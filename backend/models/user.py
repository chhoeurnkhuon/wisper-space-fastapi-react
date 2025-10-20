from sqlalchemy import Column, Integer, String, Enum, Index, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('user', 'admin', name='user_role'), default='user', nullable=False)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(255))
    profile_image = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)

    owned_chats = relationship("Chat", back_populates="owner")
    messages = relationship("Message", back_populates="sender")
    memberships = relationship("ChatMember", back_populates="user")
    channels = relationship("Channel", back_populates="creator")