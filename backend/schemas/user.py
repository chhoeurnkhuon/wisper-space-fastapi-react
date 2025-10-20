from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    user = "user"
    admin = "admin"

class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str]
    role: Optional[UserRole] = UserRole.user

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class VerifyToken(BaseModel):
    token: str