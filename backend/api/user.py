from fastapi import APIRouter, Depends, HTTPException
from schemas.user import UserCreate, User as UserOut, Token
from dependencies import get_db, get_current_admin
from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserBase

router = APIRouter()

@router.get("/", response_model=list[UserOut])
def get_all_users(db: Session = Depends(get_db), _=Depends(get_current_admin)):
    return db.query(User).all()

@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(user_id: int, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_update: UserBase, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, values in user_update.dict(exclude_unset=True).items():
        db.commit()
        db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return