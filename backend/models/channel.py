from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from database import Base

class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", back_populates="channels")
    subscribers = relationship("ChannelSubscriber", back_populates="channel")

class ChannelSubscriber(Base):
    __tablename__ = "channel_subscribers"

    channel_id = Column(Integer, ForeignKey("channels.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow)

    channel = relationship("Channel", back_populates="subscribers")
    user = relationship("User")