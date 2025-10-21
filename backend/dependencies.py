from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from core.security import get_current_user_from_token, oauth2_scheme
from models.user import User

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    current_user_data = get_current_user_from_token(token)
    if current_user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == current_user_data["id"]).first()
    if user is None or not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or email not verified",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_current_admin(current_user = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user